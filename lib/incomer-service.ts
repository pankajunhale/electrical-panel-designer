import { prisma } from "./prisma";
import {
  CreateIncomerDto,
  UpdateIncomerDto,
  IncomerDto,
} from "../dto/incomer.dto";
import { revalidatePath } from "next/cache";

export class IncomerService {
  /**
   * Convert Prisma incomer to DTO format
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private convertToDto(incomer: any): IncomerDto {
    return {
      ...incomer,
      ampereRating: incomer.ampereRating ? Number(incomer.ampereRating) : null,
    };
  }

  /**
   * Create a new incomer
   */
  async create(data: CreateIncomerDto, userId: string): Promise<IncomerDto> {
    const incomer = await prisma.incomer.create({
      data: {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    revalidatePath("/cp/incomers");
    return this.convertToDto(incomer);
  }

  /**
   * Get all incomers with optional filtering
   */
  async findAll(params?: {
    panelId?: string;
    skip?: number;
    take?: number;
    includeDeleted?: boolean;
  }): Promise<IncomerDto[]> {
    const {
      panelId,
      skip = 0,
      take = 50,
      includeDeleted = false,
    } = params || {};

    const incomers = await prisma.incomer.findMany({
      where: {
        ...(panelId && { panelId }),
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });

    return incomers.map((incomer) => this.convertToDto(incomer));
  }

  /**
   * Get incomer by ID
   */
  async findById(id: string): Promise<IncomerDto | null> {
    const incomer = await prisma.incomer.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    return incomer ? this.convertToDto(incomer) : null;
  }

  /**
   * Get incomers by panel ID
   */
  async findByPanelId(panelId: string): Promise<IncomerDto[]> {
    const incomers = await prisma.incomer.findMany({
      where: {
        panelId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return incomers.map((incomer) => this.convertToDto(incomer));
  }

  /**
   * Update incomer by ID
   */
  async update(
    id: string,
    data: UpdateIncomerDto,
    userId: string
  ): Promise<IncomerDto> {
    const incomer = await prisma.incomer.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
        version: { increment: 1 },
      },
    });

    revalidatePath("/cp/incomers");
    return this.convertToDto(incomer);
  }

  /**
   * Soft delete incomer by ID
   */
  async delete(id: string, userId: string): Promise<IncomerDto> {
    const incomer = await prisma.incomer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
        version: { increment: 1 },
      },
    });

    revalidatePath("/cp/incomers");
    return this.convertToDto(incomer);
  }

  /**
   * Hard delete incomer by ID
   */
  async hardDelete(id: string): Promise<IncomerDto> {
    const incomer = await prisma.incomer.delete({
      where: { id },
    });

    revalidatePath("/cp/incomers");
    return this.convertToDto(incomer);
  }

  /**
   * Restore soft deleted incomer
   */
  async restore(id: string, userId: string): Promise<IncomerDto> {
    const incomer = await prisma.incomer.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedBy: userId,
        version: { increment: 1 },
      },
    });

    revalidatePath("/cp/incomers");
    return this.convertToDto(incomer);
  }

  /**
   * Check if incomer name is unique within a panel
   */
  async isNameUnique(
    name: string,
    panelId: string,
    excludeId?: string
  ): Promise<boolean> {
    const existingIncomer = await prisma.incomer.findFirst({
      where: {
        name,
        panelId,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return !existingIncomer;
  }

  /**
   * Get incomer count by panel
   */
  async countByPanel(panelId: string): Promise<number> {
    return await prisma.incomer.count({
      where: {
        panelId,
        deletedAt: null,
      },
    });
  }
}
