/* eslint-disable */
// @ts-nocheck
import { prisma } from "./prisma";
import { nanoid } from "nanoid";
import type {
  ClientCreateInput,
  ClientUpdateInput,
  ClientQueryInput,
  ClientFiltersInput,
  ClientSortInput,
  ClientWithRelations,
  ClientWithStats,
  ClientListResponse,
  ClientStatistics,
  ClientServiceResponse,
  ClientListServiceResponse,
  ClientStatsServiceResponse,
  ServiceResponse,
} from "../dto/client.dto";

export class ClientService {
  // Create a new client
  static async createClient(
    data: ClientCreateInput
  ): Promise<ClientServiceResponse> {
    try {
      const client = await prisma.client.create({
        data: {
          id: nanoid(),
          name: data.name,
          address: data.address,
          contactEmail: data.contactEmail,
          contactNumber: data.contactNumber,
          userId: data.userId,
          teamId: data.teamId,
          createdBy: data.createdBy,
          version: 1,
        },
        include: {
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
          projects: {
            select: {
              id: true,
              name: true,
              createdAt: true,
            },
            where: {
              deletedAt: null,
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

      return {
        success: true,
        data: client,
        message: "Client created successfully",
      };
    } catch (error) {
      console.error("Error creating client:", error);
      return {
        success: false,
        data: null,
        message: "Failed to create client",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get client by ID
  static async getClientById(id: string): Promise<ClientServiceResponse> {
    try {
      const client = await prisma.client.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
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
          projects: {
            select: {
              id: true,
              name: true,
              createdAt: true,
            },
            where: {
              deletedAt: null,
            },
            orderBy: {
              createdAt: "desc",
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

      if (!client) {
        return {
          success: false,
          data: null,
          message: "Client not found",
        };
      }

      return {
        success: true,
        data: client,
        message: "Client retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting client:", error);
      return {
        success: false,
        data: null,
        message: "Failed to retrieve client",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get clients with pagination and filtering
  static async getClients(
    query: ClientQueryInput,
    filters?: ClientFiltersInput,
    sort?: ClientSortInput
  ): Promise<ClientListServiceResponse> {
    try {
      const { page = 1, limit = 10, teamId, userId, search } = query;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        deletedAt: null,
      };

      if (teamId) where.teamId = teamId;
      if (userId) where.userId = userId;

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { contactEmail: { contains: search, mode: "insensitive" } },
          { contactNumber: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ];
      }

      if (filters) {
        if (filters.teamId) where.teamId = filters.teamId;
        if (filters.userId) where.userId = filters.userId;
        if (filters.dateFrom || filters.dateTo) {
          where.createdAt = {};
          if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
          if (filters.dateTo) where.createdAt.lte = filters.dateTo;
        }
        if (filters.hasProjects !== undefined) {
          if (filters.hasProjects) {
            where.projects = { some: { deletedAt: null } };
          } else {
            where.projects = { none: {} };
          }
        }
      }

      // Build orderBy clause
      let orderBy: any = { createdAt: "desc" };
      if (sort) {
        const { sortBy = "createdAt", sortOrder = "desc" } = sort;
        if (sortBy === "projectCount") {
          orderBy = { projects: { _count: sortOrder } };
        } else {
          orderBy = { [sortBy]: sortOrder };
        }
      }

      // Execute queries in parallel
      const [clients, totalCount] = await Promise.all([
        prisma.client.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
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
            projects: {
              select: {
                id: true,
                name: true,
                createdAt: true,
              },
              where: {
                deletedAt: null,
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
            _count: {
              select: {
                projects: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        }),
        prisma.client.count({ where }),
      ]);

      // Transform to ClientWithStats
      const clientsWithStats: ClientWithStats[] = clients.map((client) => ({
        ...client,
        projectCount: client._count.projects,
        projectStats: {
          active: client.projects.filter((p) => p.createdAt).length, // Simplified
          completed: 0, // Would need status field
          draft: 0, // Would need status field
        },
      }));

      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;

      const response: ClientListResponse = {
        clients: clientsWithStats,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasMore,
        },
      };

      return {
        success: true,
        data: response,
        message: "Clients retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting clients:", error);
      return {
        success: false,
        data: null,
        message: "Failed to retrieve clients",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Update client
  static async updateClient(
    id: string,
    data: ClientUpdateInput,
    currentVersion: number
  ): Promise<ClientServiceResponse> {
    try {
      const client = await prisma.client.update({
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
        include: {
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
          projects: {
            select: {
              id: true,
              name: true,
              createdAt: true,
            },
            where: {
              deletedAt: null,
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

      return {
        success: true,
        data: client,
        message: "Client updated successfully",
      };
    } catch (error) {
      console.error("Error updating client:", error);
      if (error.code === "P2025") {
        return {
          success: false,
          data: null,
          message: "Client not found or version conflict",
        };
      }
      return {
        success: false,
        data: null,
        message: "Failed to update client",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Soft delete client
  static async deleteClient(
    id: string,
    deletedBy: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      await prisma.client.update({
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
        data: true,
        message: "Client deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting client:", error);
      return {
        success: false,
        data: false,
        message: "Failed to delete client",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Restore deleted client
  static async restoreClient(
    id: string,
    restoredBy: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      await prisma.client.update({
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
        data: true,
        message: "Client restored successfully",
      };
    } catch (error) {
      console.error("Error restoring client:", error);
      return {
        success: false,
        data: false,
        message: "Failed to restore client",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get clients by team
  static async getClientsByTeam(
    teamId: string
  ): Promise<ClientListServiceResponse> {
    return this.getClients({ teamId, page: 1, limit: 100 });
  }

  // Get clients by user
  static async getClientsByUser(
    userId: string
  ): Promise<ClientListServiceResponse> {
    return this.getClients({ userId, page: 1, limit: 100 });
  }

  // Search clients
  static async searchClients(
    search: string,
    teamId?: string,
    limit: number = 10
  ): Promise<ClientListServiceResponse> {
    return this.getClients({ search, teamId, page: 1, limit });
  }

  // Get client statistics
  static async getClientStats(
    teamId?: string
  ): Promise<ClientStatsServiceResponse> {
    try {
      const where: any = { deletedAt: null };
      if (teamId) where.teamId = teamId;

      const [
        totalClients,
        totalProjects,
        clientsWithProjects,
        topClientsByProjects,
        recentClientsCount,
      ] = await Promise.all([
        // Total clients
        prisma.client.count({ where }),

        // Total projects
        prisma.project.count({
          where: {
            deletedAt: null,
            ...(teamId && { teamId }),
          },
        }),

        // Clients with projects
        prisma.client.count({
          where: {
            ...where,
            projects: { some: { deletedAt: null } },
          },
        }),

        // Top clients by project count
        prisma.client.findMany({
          where,
          include: {
            _count: {
              select: {
                projects: {
                  where: { deletedAt: null },
                },
              },
            },
          },
          orderBy: {
            projects: { _count: "desc" },
          },
          take: 5,
        }),

        // Recent clients (last 30 days)
        prisma.client.count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      const averageProjectsPerClient =
        totalClients > 0 ? totalProjects / totalClients : 0;

      const stats: ClientStatistics = {
        totalClients,
        totalProjects,
        clientsWithProjects,
        averageProjectsPerClient:
          Math.round(averageProjectsPerClient * 100) / 100,
        topClientsByProjects: topClientsByProjects.map((client) => ({
          id: client.id,
          name: client.name,
          projectCount: client._count.projects,
        })),
        recentClientsCount,
      };

      return {
        success: true,
        data: stats,
        message: "Client statistics retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting client stats:", error);
      return {
        success: false,
        data: null,
        message: "Failed to retrieve client statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
