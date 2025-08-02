"use server";

import { FeederLayoutService } from "@/lib/feeder-layout-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface FeederLayoutImportResult {
  success: boolean;
  message: string;
  createdCount: number;
  totalFeeders: number;
  statistics?: {
    totalLayouts: number;
    totalFeeders: number;
    feedersWithLayouts: number;
    feedersWithoutLayouts: number;
  };
}

/**
 * Import default feeder layouts for all existing feeders
 * This action will loop through all feeders and create a default layout for each one
 */
export async function importDefaultFeederLayouts(): Promise<FeederLayoutImportResult> {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    const createdBy = session?.user?.id;

    // Create default layouts for all feeders
    const result = await FeederLayoutService.createDefaultLayoutsForAllFeeders(
      createdBy
    );

    // Get updated statistics
    const statistics = await FeederLayoutService.getStatistics();

    return {
      ...result,
      statistics,
    };
  } catch (error) {
    console.error("Error importing default feeder layouts:", error);
    return {
      success: false,
      message: "Failed to import default feeder layouts. Please try again.",
      createdCount: 0,
      totalFeeders: 0,
    };
  }
}

/**
 * Get feeder layout statistics
 */
export async function getFeederLayoutStatistics(): Promise<{
  totalLayouts: number;
  totalFeeders: number;
  feedersWithLayouts: number;
  feedersWithoutLayouts: number;
}> {
  try {
    return await FeederLayoutService.getStatistics();
  } catch (error) {
    console.error("Error getting feeder layout statistics:", error);
    return {
      totalLayouts: 0,
      totalFeeders: 0,
      feedersWithLayouts: 0,
      feedersWithoutLayouts: 0,
    };
  }
}

/**
 * Create a single feeder layout
 */
export async function createFeederLayout(data: {
  feederId: string;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  viewType?: string | null;
}): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    const session = await getServerSession(authOptions);
    const createdBy = session?.user?.id;

    const feederLayout = await FeederLayoutService.create({
      ...data,
      createdBy,
    });

    return {
      success: true,
      message: "Feeder layout created successfully!",
      data: feederLayout,
    };
  } catch (error) {
    console.error("Error creating feeder layout:", error);
    return {
      success: false,
      message: "Failed to create feeder layout. Please try again.",
    };
  }
}

/**
 * Update a feeder layout
 */
export async function updateFeederLayout(data: {
  id: string;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  viewType?: string | null;
}): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    const session = await getServerSession(authOptions);
    const updatedBy = session?.user?.id;

    const feederLayout = await FeederLayoutService.update({
      ...data,
      updatedBy,
    });

    return {
      success: true,
      message: "Feeder layout updated successfully!",
      data: feederLayout,
    };
  } catch (error) {
    console.error("Error updating feeder layout:", error);
    return {
      success: false,
      message: "Failed to update feeder layout. Please try again.",
    };
  }
}

/**
 * Delete a feeder layout
 */
export async function deleteFeederLayout(id: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    const deletedBy = session?.user?.id;

    await FeederLayoutService.delete(id, deletedBy);

    return {
      success: true,
      message: "Feeder layout deleted successfully!",
    };
  } catch (error) {
    console.error("Error deleting feeder layout:", error);
    return {
      success: false,
      message: "Failed to delete feeder layout. Please try again.",
    };
  }
}

/**
 * Get all feeder layouts
 */
export async function getAllFeederLayouts(): Promise<{
  success: boolean;
  message: string;
  data?: any[];
}> {
  try {
    const feederLayouts = await FeederLayoutService.findAll();

    return {
      success: true,
      message: "Feeder layouts retrieved successfully!",
      data: feederLayouts,
    };
  } catch (error) {
    console.error("Error getting feeder layouts:", error);
    return {
      success: false,
      message: "Failed to get feeder layouts. Please try again.",
    };
  }
}

/**
 * Get feeder layouts by feeder ID
 */
export async function getFeederLayoutsByFeederId(feederId: string): Promise<{
  success: boolean;
  message: string;
  data?: any[];
}> {
  try {
    const feederLayouts = await FeederLayoutService.findByFeederId(feederId);

    return {
      success: true,
      message: "Feeder layouts retrieved successfully!",
      data: feederLayouts,
    };
  } catch (error) {
    console.error("Error getting feeder layouts by feeder ID:", error);
    return {
      success: false,
      message: "Failed to get feeder layouts. Please try again.",
    };
  }
}

/**
 * Get feeders with their layouts for a specific panel
 * This is used for gridstack.js rendering
 */
export async function getFeedersWithLayoutsByPanelId(panelId: string): Promise<{
  success: boolean;
  message: string;
  data?: any[];
}> {
  try {
    const feedersWithLayouts =
      await FeederLayoutService.getFeedersWithLayoutsByPanelId(panelId);

    return {
      success: true,
      message: "Feeders with layouts retrieved successfully!",
      data: feedersWithLayouts,
    };
  } catch (error) {
    console.error("Error getting feeders with layouts by panel ID:", error);
    return {
      success: false,
      message: "Failed to get feeders with layouts. Please try again.",
    };
  }
}

/**
 * Update feeder layout positions for gridstack
 */
export async function updateFeederLayoutPositions(
  panelId: string,
  layouts: Array<{
    feederId: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    const updatedBy = session?.user?.id;

    await FeederLayoutService.updateFeederLayoutPositions(
      panelId,
      layouts,
      updatedBy
    );

    return {
      success: true,
      message: "Feeder layout positions updated successfully!",
    };
  } catch (error) {
    console.error("Error updating feeder layout positions:", error);
    return {
      success: false,
      message: "Failed to update feeder layout positions. Please try again.",
    };
  }
}
