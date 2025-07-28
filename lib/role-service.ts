/* eslint-disable */
// @ts-nocheck
import { prisma } from "./prisma";
import { nanoid } from "nanoid";

export interface RoleCreateInput {
  name: string;
  createdBy: string;
}

export interface RoleUpdateInput {
  name?: string;
  updatedBy: string;
}

export interface RoleQueryInput {
  search?: string;
}

// Simple response type
export interface SimpleResponse {
  success: boolean;
  message: string;
  error?: string;
}

export class RoleService {
  // Create a new role
  static async createRole(data: RoleCreateInput): Promise<SimpleResponse> {
    try {
      await prisma.role.create({
        data: {
          id: nanoid(),
          name: data.name,
          createdBy: data.createdBy,
          version: 1,
        },
      });

      return {
        success: true,
        message: "Role created successfully",
      };
    } catch (error) {
      console.error("Error creating role:", error);

      // Handle unique constraint violation
      if (error.code === "P2002") {
        return {
          success: false,
          message: "Role name already exists",
        };
      }

      return {
        success: false,
        message: "Failed to create role",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Update role
  static async updateRole(
    id: string,
    data: RoleUpdateInput,
    currentVersion: number
  ): Promise<SimpleResponse> {
    try {
      await prisma.role.update({
        where: {
          id,
          version: currentVersion,
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
        message: "Role updated successfully",
      };
    } catch (error) {
      console.error("Error updating role:", error);

      if (error.code === "P2025") {
        return {
          success: false,
          message: "Role not found or version conflict",
        };
      }

      // Handle unique constraint violation
      if (error.code === "P2002") {
        return {
          success: false,
          message: "Role name already exists",
        };
      }

      return {
        success: false,
        message: "Failed to update role",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Soft delete role
  static async deleteRole(
    id: string,
    deletedBy: string
  ): Promise<SimpleResponse> {
    try {
      await prisma.role.update({
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
        message: "Role deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting role:", error);

      if (error.code === "P2025") {
        return {
          success: false,
          message: "Role not found",
        };
      }

      return {
        success: false,
        message: "Failed to delete role",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get role by ID
  static async fetchById(id: string) {
    try {
      const role = await prisma.role.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          updatedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              users: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      if (!role) {
        return {
          success: false,
          data: null,
          message: "Role not found",
        };
      }

      return {
        success: true,
        data: role,
        message: "Role retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting role:", error);
      return {
        success: false,
        data: null,
        message: "Failed to retrieve role",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get all roles (no pagination as requested)
  static async fetchAll(query?: RoleQueryInput) {
    try {
      const where: any = {
        deletedAt: null,
      };

      if (query?.search) {
        where.name = {
          contains: query.search,
          mode: "insensitive",
        };
      }

      const roles = await prisma.role.findMany({
        where,
        orderBy: {
          name: "asc",
        },
        include: {
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          updatedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              users: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        data: roles,
        message: "Roles retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting roles:", error);
      return {
        success: false,
        data: null,
        message: "Failed to retrieve roles",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Restore deleted role (bonus method)
  static async restoreRole(
    id: string,
    restoredBy: string
  ): Promise<SimpleResponse> {
    try {
      await prisma.role.update({
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
        message: "Role restored successfully",
      };
    } catch (error) {
      console.error("Error restoring role:", error);

      if (error.code === "P2025") {
        return {
          success: false,
          message: "Role not found",
        };
      }

      return {
        success: false,
        message: "Failed to restore role",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
