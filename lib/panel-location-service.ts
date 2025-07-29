/* eslint-disable */
// @ts-nocheck
import { prisma } from "./prisma";
import { nanoid } from "nanoid";

export interface PanelLocationCreateInput {
  name: string;
  description?: string;
  teamId?: string;
  createdBy: string;
}

export interface PanelLocationUpdateInput {
  name?: string;
  description?: string;
  teamId?: string;
  updatedBy: string;
}

export interface PanelLocationWithRelations {
  id: string;
  name: string | null;
  description: string | null;
  teamId: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  version: number;
  _count?: {
    panels: number;
  };
}

export interface SimpleResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}

export class PanelLocationService {
  // Create a new panel location
  static async createPanelLocation(
    data: PanelLocationCreateInput
  ): Promise<SimpleResponse> {
    try {
      const panelLocation = await prisma.panelLocation.create({
        data: {
          id: nanoid(),
          name: data.name,
          description: data.description,
          teamId: data.teamId,
          createdBy: data.createdBy,
          version: 1,
        },
      });

      return {
        success: true,
        message: "Panel location created successfully",
        data: panelLocation,
      };
    } catch (error) {
      console.error("Error creating panel location:", error);

      // Handle unique constraint violation
      if (
        error.code === "P2002" &&
        error.meta?.target?.includes("panel_locations_name_team_unique")
      ) {
        return {
          success: false,
          message:
            "A panel location with this name already exists in your team",
          error: "Panel location name must be unique within the team",
        };
      }

      return {
        success: false,
        message: "Failed to create panel location",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get all panel locations (no pagination)
  static async getAllPanelLocations(teamId?: string): Promise<SimpleResponse> {
    try {
      const where: any = { deletedAt: null };
      if (teamId) {
        where.teamId = teamId;
      }

      const panelLocations = await prisma.panelLocation.findMany({
        where,
        include: {
          _count: {
            select: {
              panels: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return {
        success: true,
        message: "Panel locations retrieved successfully",
        data: panelLocations,
      };
    } catch (error) {
      console.error("Error getting panel locations:", error);
      return {
        success: false,
        message: "Failed to retrieve panel locations",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get panel location by ID
  static async getPanelLocationById(id: string): Promise<SimpleResponse> {
    try {
      const panelLocation = await prisma.panelLocation.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              panels: true,
            },
          },
        },
      });

      if (!panelLocation) {
        return {
          success: false,
          message: "Panel location not found",
        };
      }

      return {
        success: true,
        message: "Panel location retrieved successfully",
        data: panelLocation,
      };
    } catch (error) {
      console.error("Error getting panel location:", error);
      return {
        success: false,
        message: "Failed to retrieve panel location",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Update panel location
  static async updatePanelLocation(
    id: string,
    data: PanelLocationUpdateInput,
    currentVersion: number
  ): Promise<SimpleResponse> {
    try {
      const panelLocation = await prisma.panelLocation.update({
        where: {
          id,
          version: currentVersion, // Optimistic locking
          deletedAt: null,
        },
        data: {
          ...data,
          updatedAt: new Date(),
          version: {
            increment: 1,
          },
        },
      });

      return {
        success: true,
        message: "Panel location updated successfully",
        data: panelLocation,
      };
    } catch (error) {
      console.error("Error updating panel location:", error);

      if (error.code === "P2025") {
        return {
          success: false,
          message: "Panel location not found or version conflict",
        };
      }

      // Handle unique constraint violation
      if (
        error.code === "P2002" &&
        error.meta?.target?.includes("panel_locations_name_team_unique")
      ) {
        return {
          success: false,
          message:
            "A panel location with this name already exists in your team",
          error: "Panel location name must be unique within the team",
        };
      }

      return {
        success: false,
        message: "Failed to update panel location",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Soft delete panel location
  static async deletePanelLocation(
    id: string,
    deletedBy: string
  ): Promise<SimpleResponse> {
    try {
      await prisma.panelLocation.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          updatedBy: deletedBy,
          updatedAt: new Date(),
          version: {
            increment: 1,
          },
        },
      });

      return {
        success: true,
        message: "Panel location deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting panel location:", error);
      return {
        success: false,
        message: "Failed to delete panel location",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Restore deleted panel location
  static async restorePanelLocation(
    id: string,
    restoredBy: string
  ): Promise<SimpleResponse> {
    try {
      await prisma.panelLocation.update({
        where: {
          id,
          deletedAt: { not: null },
        },
        data: {
          deletedAt: null,
          updatedBy: restoredBy,
          updatedAt: new Date(),
          version: {
            increment: 1,
          },
        },
      });

      return {
        success: true,
        message: "Panel location restored successfully",
      };
    } catch (error) {
      console.error("Error restoring panel location:", error);
      return {
        success: false,
        message: "Failed to restore panel location",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Search panel locations by name
  static async searchPanelLocations(
    search: string,
    teamId?: string
  ): Promise<SimpleResponse> {
    try {
      const where: any = {
        name: {
          contains: search,
          mode: "insensitive",
        },
        deletedAt: null,
      };

      if (teamId) {
        where.teamId = teamId;
      }

      const panelLocations = await prisma.panelLocation.findMany({
        where,
        include: {
          _count: {
            select: {
              panels: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return {
        success: true,
        message: "Panel locations search completed",
        data: panelLocations,
      };
    } catch (error) {
      console.error("Error searching panel locations:", error);
      return {
        success: false,
        message: "Failed to search panel locations",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
