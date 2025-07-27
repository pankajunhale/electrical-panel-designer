import { prisma } from "./prisma";

// Example interface for a project
export interface Project {
  id?: string;
  name: string;
  description?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  clientId?: number | null;
  userId?: number | null;
}

// Example interface for equipment data
export interface EquipmentData {
  id?: number;
  panelId: number;
  serialNumber: number;
  description: string;
  ratingKw?: number;
  ratingHp?: number;
  starterTypeId?: number;
  quantity?: number;
  totalLoadKw?: number;
  equipmentTypeId?: number;
  createdAt?: Date;
}

export class DatabaseService {
  // Project operations
  static async getAllProjects(): Promise<Project[]> {
    return prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async getProjectById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
    });
  }

  static async createProject(project: Project): Promise<string> {
    const result = await prisma.project.create({
      data: {
        name: project.name,
        description: project.description,
      },
    });
    return result.id;
  }

  static async updateProject(
    id: string,
    project: Partial<Project>
  ): Promise<boolean> {
    await prisma.project.update({
      where: { id },
      data: {
        name: project.name,
        description: project.description,
        updatedAt: new Date(),
      },
    });
    return true;
  }

  static async deleteProject(id: string): Promise<boolean> {
    await prisma.project.delete({
      where: { id },
    });
    return true;
  }
}
