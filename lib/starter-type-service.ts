/* eslint-disable */
// @ts-nocheck
import { prisma } from "./prisma";
import { nanoid } from "nanoid";

export interface StarterTypeCreateInput {
  name: string;
  createdBy: string;
}

export interface StarterTypeUpdateInput {
  name?: string;
  updatedBy: string;
}

export interface StarterTypeWithRelations {
  id: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  version: number;
  _count?: {
    feeders: number;
    equipmentData: number;
  };
}

export interface SimpleResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}

export class StarterTypeService {
  // Create a new starter type
  static async createStarterType(
    data: StarterTypeCreateInput
  ): Promise<SimpleResponse> {
    try {
      const starterType = await prisma.starterType.create({
        data: {
          id: nanoid(),
          name: data.name,
          createdBy: data.createdBy,
          version: 1,
        },
      });

      return {
        success: true,
        message: "Starter type created successfully",
        data: starterType,
      };
    } catch (error) {
      console.error("Error creating starter type:", error);

      // Handle unique constraint violation
      if (error.code === "P2002" && error.meta?.target?.includes("name")) {
        return {
          success: false,
          message: "A starter type with this name already exists",
          error: "Starter type name must be unique",
        };
      }

      return {
        success: false,
        message: "Failed to create starter type",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get all starter types (no pagination)
  static async getAllStarterTypes(): Promise<SimpleResponse> {
    try {
      const starterTypes = await prisma.starterType.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              feeders: true,
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
        message: "Starter types retrieved successfully",
        data: starterTypes,
      };
    } catch (error) {
      console.error("Error getting starter types:", error);
      return {
        success: false,
        message: "Failed to retrieve starter types",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get starter type by ID
  static async getStarterTypeById(id: string): Promise<SimpleResponse> {
    try {
      const starterType = await prisma.starterType.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              feeders: true,
              equipmentData: true,
            },
          },
        },
      });

      if (!starterType) {
        return {
          success: false,
          message: "Starter type not found",
        };
      }

      return {
        success: true,
        message: "Starter type retrieved successfully",
        data: starterType,
      };
    } catch (error) {
      console.error("Error getting starter type:", error);
      return {
        success: false,
        message: "Failed to retrieve starter type",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Update starter type
  static async updateStarterType(
    id: string,
    data: StarterTypeUpdateInput,
    currentVersion: number
  ): Promise<SimpleResponse> {
    try {
      const starterType = await prisma.starterType.update({
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
        message: "Starter type updated successfully",
        data: starterType,
      };
    } catch (error) {
      console.error("Error updating starter type:", error);

      if (error.code === "P2025") {
        return {
          success: false,
          message: "Starter type not found or version conflict",
        };
      }

      // Handle unique constraint violation
      if (error.code === "P2002" && error.meta?.target?.includes("name")) {
        return {
          success: false,
          message: "A starter type with this name already exists",
          error: "Starter type name must be unique",
        };
      }

      return {
        success: false,
        message: "Failed to update starter type",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Soft delete starter type
  static async deleteStarterType(
    id: string,
    deletedBy: string
  ): Promise<SimpleResponse> {
    try {
      await prisma.starterType.update({
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
        message: "Starter type deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting starter type:", error);
      return {
        success: false,
        message: "Failed to delete starter type",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Restore deleted starter type
  static async restoreStarterType(
    id: string,
    restoredBy: string
  ): Promise<SimpleResponse> {
    try {
      await prisma.starterType.update({
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
        message: "Starter type restored successfully",
      };
    } catch (error) {
      console.error("Error restoring starter type:", error);
      return {
        success: false,
        message: "Failed to restore starter type",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Search starter types by name
  static async searchStarterTypes(search: string): Promise<SimpleResponse> {
    try {
      const starterTypes = await prisma.starterType.findMany({
        where: {
          name: {
            contains: search,
            mode: "insensitive",
          },
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              feeders: true,
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
        message: "Starter types search completed",
        data: starterTypes,
      };
    } catch (error) {
      console.error("Error searching starter types:", error);
      return {
        success: false,
        message: "Failed to search starter types",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
