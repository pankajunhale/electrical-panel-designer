/* eslint-disable */
// @ts-nocheck
import { prisma } from "./prisma";
import { nanoid } from "nanoid";

export interface ProjectCreateInput {
  name: string;
  description?: string;
  clientId?: string;
  userId?: string;
  teamId?: string;
  createdBy: string;
}

export interface ProjectUpdateInput {
  name?: string;
  description?: string;
  clientId?: string | null;
  userId?: string | null;
  teamId?: string | null;
  updatedBy: string;
}

export interface ProjectQueryInput {
  teamId?: string;
  userId?: string;
  clientId?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ProjectFiltersInput {
  teamId?: string;
  userId?: string;
  clientId?: string;
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasActivePanels?: boolean;
}

export interface ProjectSortInput {
  sortBy?: "name" | "createdAt" | "updatedAt" | "clientName" | "panelCount";
  sortOrder?: "asc" | "desc";
}

// Simple response type
export interface SimpleResponse {
  success: boolean;
  message: string;
  error?: string;
}

export class ProjectService {
  // Create a new project
  static async createProject(
    data: ProjectCreateInput
  ): Promise<SimpleResponse> {
    try {
      await prisma.project.create({
        data: {
          id: nanoid(),
          name: data.name,
          description: data.description,
          clientId: data.clientId,
          userId: data.userId,
          teamId: data.teamId,
          createdBy: data.createdBy,
          version: 1,
        },
      });

      return {
        success: true,
        message: "Project created successfully",
      };
    } catch (error) {
      console.error("Error creating project:", error);

      // Handle unique constraint violation
      if (
        error.code === "P2002" &&
        error.meta?.target?.includes("projects_name_team_unique")
      ) {
        return {
          success: false,
          message: "A project with this name already exists in your team",
          error: "Project name must be unique within the team",
        };
      }

      return {
        success: false,
        message: "Failed to create project",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Update project
  static async updateProject(
    id: string,
    data: ProjectUpdateInput,
    currentVersion: number
  ): Promise<SimpleResponse> {
    try {
      await prisma.project.update({
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
        message: "Project updated successfully",
      };
    } catch (error) {
      console.error("Error updating project:", error);
      if (error.code === "P2025") {
        return {
          success: false,
          message: "Project not found or version conflict",
        };
      }
      return {
        success: false,
        message: "Failed to update project",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Soft delete project
  static async deleteProject(
    id: string,
    deletedBy: string
  ): Promise<SimpleResponse> {
    try {
      await prisma.project.update({
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
        message: "Project deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting project:", error);
      return {
        success: false,
        message: "Failed to delete project",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Restore deleted project
  static async restoreProject(
    id: string,
    restoredBy: string
  ): Promise<SimpleResponse> {
    try {
      await prisma.project.update({
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
        message: "Project restored successfully",
      };
    } catch (error) {
      console.error("Error restoring project:", error);
      return {
        success: false,
        message: "Failed to restore project",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get project by ID (returns project data)
  static async getProjectById(id: string) {
    try {
      const project = await prisma.project.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          client: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
          panels: {
            select: {
              id: true,
              status: true,
            },
          },
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
        },
      });

      if (!project) {
        return {
          success: false,
          data: null,
          message: "Project not found",
        };
      }

      return {
        success: true,
        data: project,
        message: "Project retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting project:", error);
      return {
        success: false,
        data: null,
        message: "Failed to retrieve project",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get projects with pagination and filtering (returns project list)
  static async getProjects(
    query: ProjectQueryInput,
    filters?: ProjectFiltersInput,
    sort?: ProjectSortInput
  ) {
    try {
      const { page = 1, limit = 10, teamId, userId, clientId, search } = query;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
      };

      if (teamId) where.teamId = teamId;
      if (userId) where.userId = userId;
      if (clientId) where.clientId = clientId;

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      if (filters) {
        if (filters.teamId) where.teamId = filters.teamId;
        if (filters.userId) where.userId = filters.userId;
        if (filters.clientId) where.clientId = filters.clientId;
        if (filters.dateFrom || filters.dateTo) {
          where.createdAt = {};
          if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
          if (filters.dateTo) where.createdAt.lte = filters.dateTo;
        }
        if (filters.hasActivePanels !== undefined) {
          if (filters.hasActivePanels) {
            where.panels = { some: { deletedAt: null } };
          } else {
            where.panels = { none: {} };
          }
        }
      }

      let orderBy: any = { createdAt: "desc" };
      if (sort) {
        const { sortBy = "createdAt", sortOrder = "desc" } = sort;
        if (sortBy === "panelCount") {
          orderBy = { panels: { _count: sortOrder } };
        } else {
          orderBy = { [sortBy]: sortOrder };
        }
      }

      const [projects, totalCount] = await Promise.all([
        prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            client: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
              },
            },
            panels: {
              select: {
                id: true,
                status: true,
              },
            },
            _count: {
              select: {
                panels: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        }),
        prisma.project.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;

      return {
        success: true,
        data: {
          projects,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasMore,
          },
        },
        message: "Projects retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting projects:", error);
      return {
        success: false,
        data: null,
        message: "Failed to retrieve projects",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
