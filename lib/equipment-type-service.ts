/* eslint-disable */
// @ts-nocheck
import { prisma } from "./prisma";
import { nanoid } from "nanoid";

export interface EquipmentTypeCreateInput {
  name: string;
  description?: string;
  createdBy: string;
}

export interface EquipmentTypeUpdateInput {
  name?: string;
  description?: string;
  updatedBy: string;
}

export interface EquipmentTypeWithRelations {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  version: number;
  _count?: {
    equipmentData: number;
  };
}

export interface SimpleResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}

export class EquipmentTypeService {
  // Create a new equipment type
  static async createEquipmentType(
    data: EquipmentTypeCreateInput
  ): Promise<SimpleResponse> {
    try {
      const equipmentType = await prisma.equipmentType.create({
        data: {
          id: nanoid(),
          name: data.name,
          description: data.description,
          createdBy: data.createdBy,
          version: 1,
        },
      });

      return {
        success: true,
        message: "Equipment type created successfully",
        data: equipmentType,
      };
    } catch (error) {
      console.error("Error creating equipment type:", error);

      // Handle unique constraint violation
      if (error.code === "P2002" && error.meta?.target?.includes("name")) {
        return {
          success: false,
          message: "An equipment type with this name already exists",
          error: "Equipment type name must be unique",
        };
      }

      return {
        success: false,
        message: "Failed to create equipment type",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get all equipment types (no pagination)
  static async getAllEquipmentTypes(): Promise<SimpleResponse> {
    try {
      const equipmentTypes = await prisma.equipmentType.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
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
        message: "Equipment types retrieved successfully",
        data: equipmentTypes,
      };
    } catch (error) {
      console.error("Error getting equipment types:", error);
      return {
        success: false,
        message: "Failed to retrieve equipment types",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get equipment type by ID
  static async getEquipmentTypeById(id: string): Promise<SimpleResponse> {
    try {
      const equipmentType = await prisma.equipmentType.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              equipmentData: true,
            },
          },
        },
      });

      if (!equipmentType) {
        return {
          success: false,
          message: "Equipment type not found",
        };
      }

      return {
        success: true,
        message: "Equipment type retrieved successfully",
        data: equipmentType,
      };
    } catch (error) {
      console.error("Error getting equipment type:", error);
      return {
        success: false,
        message: "Failed to retrieve equipment type",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Update equipment type
  static async updateEquipmentType(
    id: string,
    data: EquipmentTypeUpdateInput,
    currentVersion: number
  ): Promise<SimpleResponse> {
    try {
      const equipmentType = await prisma.equipmentType.update({
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
        message: "Equipment type updated successfully",
        data: equipmentType,
      };
    } catch (error) {
      console.error("Error updating equipment type:", error);

      if (error.code === "P2025") {
        return {
          success: false,
          message: "Equipment type not found or version conflict",
        };
      }

      // Handle unique constraint violation
      if (error.code === "P2002" && error.meta?.target?.includes("name")) {
        return {
          success: false,
          message: "An equipment type with this name already exists",
          error: "Equipment type name must be unique",
        };
      }

      return {
        success: false,
        message: "Failed to update equipment type",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Soft delete equipment type
  static async deleteEquipmentType(
    id: string,
    deletedBy: string
  ): Promise<SimpleResponse> {
    try {
      await prisma.equipmentType.update({
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
        message: "Equipment type deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting equipment type:", error);
      return {
        success: false,
        message: "Failed to delete equipment type",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Restore deleted equipment type
  static async restoreEquipmentType(
    id: string,
    restoredBy: string
  ): Promise<SimpleResponse> {
    try {
      await prisma.equipmentType.update({
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
        message: "Equipment type restored successfully",
      };
    } catch (error) {
      console.error("Error restoring equipment type:", error);
      return {
        success: false,
        message: "Failed to restore equipment type",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Search equipment types by name
  static async searchEquipmentTypes(search: string): Promise<SimpleResponse> {
    try {
      const equipmentTypes = await prisma.equipmentType.findMany({
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
        message: "Equipment types search completed",
        data: equipmentTypes,
      };
    } catch (error) {
      console.error("Error searching equipment types:", error);
      return {
        success: false,
        message: "Failed to search equipment types",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
