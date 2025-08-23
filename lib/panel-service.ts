/* eslint-disable */
// @ts-nocheck
import { prisma } from "./prisma";
import { nanoid } from "nanoid";

export interface PanelCreateInput {
  name: string;
  description?: string;
  voltageLevel: string;
  width?: number;
  height?: number;
  depth?: number;
  locationId?: string;
  frontViewUrl?: string;
  rearViewUrl?: string;
  status: string;
  projectId: string;
  createdBy: string;
}

export interface PanelUpdateInput {
  name?: string;
  description?: string;
  voltageLevel?: string;
  width?: number;
  height?: number;
  depth?: number;
  locationId?: string;
  frontViewUrl?: string;
  rearViewUrl?: string;
  status?: string;
  projectId?: string;
  updatedBy: string;
}

export interface PanelWithRelations {
  id: string;
  name: string;
  description: string | null;
  voltageLevel: string | null;
  width: number | null;
  height: number | null;
  depth: number | null;
  locationId: string | null;
  frontViewUrl: string | null;
  rearViewUrl: string | null;
  status: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  version: number;
  _count?: {
    feeders: number;
    slConfigs: number;
    equipmentData: number;
  };
}

export interface SimpleResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}

export class PanelService {
  // Create a new panel
  static async createPanel(data: PanelCreateInput): Promise<SimpleResponse> {
    try {
      const panel = await prisma.panel.create({
        data: {
          id: nanoid(),
          name: data.name,
          description: data.description,
          voltageLevel: data.voltageLevel,
          width: data.width,
          height: data.height,
          depth: data.depth,
          locationId: data.locationId,
          frontViewUrl: data.frontViewUrl,
          rearViewUrl: data.rearViewUrl,
          status: data.status,
          projectId: data.projectId,
          createdBy: data.createdBy,
          version: 1,
        },
      });

      return {
        success: true,
        message: "Panel created successfully",
        data: panel,
      };
    } catch (error) {
      console.error("Error creating panel:", error);

      // Handle unique constraint violation
      if (
        error.code === "P2002" &&
        error.meta?.target?.includes("panels_name_project_unique")
      ) {
        return {
          success: false,
          message: "A panel with this name already exists in this project",
          error: "Panel name must be unique within the project",
        };
      }

      return {
        success: false,
        message: "Failed to create panel",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get all panels (no pagination)
  static async getAllPanels(projectId?: string): Promise<SimpleResponse> {
    try {
      const where: any = { deletedAt: null };
      if (projectId) {
        where.projectId = projectId;
      }

      const panels = await prisma.panel.findMany({
        where,
        include: {
          _count: {
            select: {
              feeders: true,
              slConfigs: true,
              equipmentData: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return {
        success: true,
        message: "Panels retrieved successfully",
        data: panels,
      };
    } catch (error) {
      console.error("Error getting panels:", error);
      return {
        success: false,
        message: "Failed to retrieve panels",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get panel by ID
  static async getPanelById(id: string): Promise<SimpleResponse> {
    try {
      const panel = await prisma.panel.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              feeders: true,
              slConfigs: true,
              equipmentData: true,
            },
          },
        },
      });

      if (!panel) {
        return {
          success: false,
          message: "Panel not found",
        };
      }

      return {
        success: true,
        message: "Panel retrieved successfully",
        data: panel,
      };
    } catch (error) {
      console.error("Error getting panel:", error);
      return {
        success: false,
        message: "Failed to retrieve panel",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Update panel
  static async updatePanel(
    id: string,
    data: PanelUpdateInput,
    currentVersion: number
  ): Promise<SimpleResponse> {
    try {
      const panel = await prisma.panel.update({
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
        message: "Panel updated successfully",
        data: panel,
      };
    } catch (error) {
      console.error("Error updating panel:", error);

      if (error.code === "P2025") {
        return {
          success: false,
          message: "Panel not found or version conflict",
        };
      }

      // Handle unique constraint violation
      if (
        error.code === "P2002" &&
        error.meta?.target?.includes("panels_name_project_unique")
      ) {
        return {
          success: false,
          message: "A panel with this name already exists in this project",
          error: "Panel name must be unique within the project",
        };
      }

      return {
        success: false,
        message: "Failed to update panel",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Soft delete panel
  static async deletePanel(
    id: string,
    deletedBy: string
  ): Promise<SimpleResponse> {
    try {
      await prisma.panel.update({
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
        message: "Panel deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting panel:", error);
      return {
        success: false,
        message: "Failed to delete panel",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Restore deleted panel
  static async restorePanel(
    id: string,
    restoredBy: string
  ): Promise<SimpleResponse> {
    try {
      await prisma.panel.update({
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
        message: "Panel restored successfully",
      };
    } catch (error) {
      console.error("Error restoring panel:", error);
      return {
        success: false,
        message: "Failed to restore panel",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Search panels by name
  static async searchPanels(
    search: string,
    projectId?: string
  ): Promise<SimpleResponse> {
    try {
      const where: any = {
        name: {
          contains: search,
          mode: "insensitive",
        },
        deletedAt: null,
      };

      if (projectId) {
        where.projectId = projectId;
      }

      const panels = await prisma.panel.findMany({
        where,
        include: {
          _count: {
            select: {
              feeders: true,
              slConfigs: true,
              equipmentData: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return {
        success: true,
        message: "Panels search completed",
        data: panels,
      };
    } catch (error) {
      console.error("Error searching panels:", error);
      return {
        success: false,
        message: "Failed to search panels",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
