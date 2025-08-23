import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreateFeederLayoutDto {
  feederId: string;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  viewType?: string | null;
  createdBy?: string | null;
}

export interface UpdateFeederLayoutDto {
  id: string;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  viewType?: string | null;
  updatedBy?: string | null;
}

export interface FeederLayoutDto {
  id: string;
  feederId: string;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  viewType?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  version: number;
}

export class FeederLayoutService {
  /**
   * Create a new feeder layout
   */
  static async create(data: CreateFeederLayoutDto): Promise<FeederLayoutDto> {
    const feederLayout = await prisma.feederLayout.create({
      data: {
        feederId: data.feederId,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        viewType: data.viewType,
        createdBy: data.createdBy,
      },
    });

    revalidatePath("/cp/feeder-layouts");
    return feederLayout;
  }

  /**
   * Get all feeder layouts
   */
  static async findAll(): Promise<FeederLayoutDto[]> {
    return await prisma.feederLayout.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Get feeder layout by ID
   */
  static async findById(id: string): Promise<FeederLayoutDto | null> {
    return await prisma.feederLayout.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  /**
   * Get feeder layouts by feeder ID
   */
  static async findByFeederId(feederId: string): Promise<FeederLayoutDto[]> {
    return await prisma.feederLayout.findMany({
      where: {
        feederId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Update a feeder layout
   */
  static async update(data: UpdateFeederLayoutDto): Promise<FeederLayoutDto> {
    const feederLayout = await prisma.feederLayout.update({
      where: {
        id: data.id,
      },
      data: {
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        viewType: data.viewType,
        updatedBy: data.updatedBy,
        updatedAt: new Date(),
        version: {
          increment: 1,
        },
      },
    });

    revalidatePath("/cp/feeder-layouts");
    return feederLayout;
  }

  /**
   * Delete a feeder layout (soft delete)
   */
  static async delete(id: string, deletedBy?: string): Promise<void> {
    await prisma.feederLayout.update({
      where: {
        id,
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

    revalidatePath("/cp/feeder-layouts");
  }

  /**
   * Create default feeder layouts for all existing feeders
   * This method will loop through all feeders and create a default layout for each one
   */
  static async createDefaultLayoutsForAllFeeders(createdBy?: string): Promise<{
    success: boolean;
    message: string;
    createdCount: number;
    totalFeeders: number;
  }> {
    try {
      // Get all existing feeders
      const feeders = await prisma.feeder.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      const totalFeeders = feeders.length;
      let createdCount = 0;

      // Check which feeders already have layouts
      const feedersWithLayouts = await prisma.feederLayout.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          feederId: true,
        },
      });

      const feedersWithLayoutsSet = new Set(
        feedersWithLayouts.map((fl) => fl.feederId)
      );

      // Create default layouts for feeders that don't have layouts yet
      for (const feeder of feeders) {
        if (!feedersWithLayoutsSet.has(feeder.id)) {
          await prisma.feederLayout.create({
            data: {
              feederId: feeder.id,
              x: 0, // Default position
              y: 0, // Default position
              width: 100, // Default width
              height: 50, // Default height
              viewType: "front", // Default view type
              createdBy: createdBy,
            },
          });
          createdCount++;
        }
      }

      revalidatePath("/cp/feeder-layouts");

      return {
        success: true,
        message: `Successfully created ${createdCount} default feeder layouts out of ${totalFeeders} total feeders.`,
        createdCount,
        totalFeeders,
      };
    } catch (error) {
      console.error("Error creating default feeder layouts:", error);
      return {
        success: false,
        message: "Failed to create default feeder layouts.",
        createdCount: 0,
        totalFeeders: 0,
      };
    }
  }

  /**
   * Get statistics about feeder layouts
   */
  static async getStatistics(): Promise<{
    totalLayouts: number;
    totalFeeders: number;
    feedersWithLayouts: number;
    feedersWithoutLayouts: number;
  }> {
    const [totalLayouts, totalFeeders, feedersWithLayouts] = await Promise.all([
      prisma.feederLayout.count({
        where: {
          deletedAt: null,
        },
      }),
      prisma.feeder.count({
        where: {
          deletedAt: null,
        },
      }),
      prisma.feederLayout.groupBy({
        by: ["feederId"],
        where: {
          deletedAt: null,
        },
        _count: {
          feederId: true,
        },
      }),
    ]);

    const feedersWithLayoutsCount = feedersWithLayouts.length;
    const feedersWithoutLayouts = totalFeeders - feedersWithLayoutsCount;

    return {
      totalLayouts,
      totalFeeders,
      feedersWithLayouts: feedersWithLayoutsCount,
      feedersWithoutLayouts,
    };
  }

  /**
   * Get feeders with their layouts for a specific panel
   * This is used for gridstack.js rendering
   */
  static async getFeedersWithLayoutsByPanelId(panelId: string): Promise<
    {
      id: string;
      description: string | null;
      ratingKw?: number | null;
      ratingHp?: number | null;
      incomerRating?: number | null;
      contactorRating?: number | null;
      controlOperation?: string | null;
      wiringMaterial?: string | null;
      cablesBusBars?: string | null;
      quantity: number | null;
      starterTypeId?: string | null;
      feederTypeId?: string | null;
      feederTypeName?: string | null;
      breakerTypeId?: string | null;
      layout: {
        id: string;
        x?: number | null;
        y?: number | null;
        width?: number | null;
        height?: number | null;
        viewType?: string | null;
      } | null;
    }[]
  > {
    const feeders = await prisma.feeder.findMany({
      where: {
        panelId,
        deletedAt: null,
      },
      select: {
        id: true,
        description: true,
        ratingKw: true,
        ratingHp: true,
        incomerRating: true,
        contactorRating: true,
        controlOperation: true,
        wiringMaterial: true,
        cablesBusBars: true,
        quantity: true,
        starterTypeId: true,
        feederTypeId: true,
        breakerTypeId: true,
        feederType: {
          select: {
            name: true,
          },
        },
        feederLayouts: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            x: true,
            y: true,
            width: true,
            height: true,
            viewType: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return feeders.map((feeder) => ({
      id: feeder.id,
      description: feeder.description,
      ratingKw: feeder.ratingKw ? Number(feeder.ratingKw) : null,
      ratingHp: feeder.ratingHp ? Number(feeder.ratingHp) : null,
      incomerRating: feeder.incomerRating ? Number(feeder.incomerRating) : null,
      contactorRating: feeder.contactorRating
        ? Number(feeder.contactorRating)
        : null,
      controlOperation: feeder.controlOperation,
      wiringMaterial: feeder.wiringMaterial,
      cablesBusBars: feeder.cablesBusBars,
      quantity: feeder.quantity,
      starterTypeId: feeder.starterTypeId,
      feederTypeId: feeder.feederTypeId,
      feederTypeName: feeder.feederType?.name || null,
      breakerTypeId: feeder.breakerTypeId,
      layout: feeder.feederLayouts[0] || null,
    }));
  }

  /**
   * Update feeder layout positions for gridstack
   */
  static async updateFeederLayoutPositions(
    panelId: string,
    layouts: Array<{
      feederId: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>,
    updatedBy?: string
  ): Promise<void> {
    for (const layout of layouts) {
      await prisma.feederLayout.updateMany({
        where: {
          feederId: layout.feederId,
          feeder: {
            panelId,
          },
        },
        data: {
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height,
          updatedBy,
          updatedAt: new Date(),
          version: {
            increment: 1,
          },
        },
      });
    }

    revalidatePath("/cp/feeder-layouts");
  }
}
