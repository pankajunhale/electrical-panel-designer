"use server";

import {
  panelLocationsSchema,
  type PanelLocationsFormData,
} from "@/schema/ga/panel-locations";
import { PanelLocationService } from "@/lib/panel-location-service";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  success: boolean;
  data?: PanelLocationsFormData;
};

export async function submitPanelLocations(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Check authentication
    const user = await requireAuth();

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    };

    // Validate form data
    const validatedFields = panelLocationsSchema.safeParse(data);

    if (!validatedFields.success) {
      const fieldErrors: Record<string, string[]> = {};

      // Convert the field errors to the expected format
      Object.entries(validatedFields.error.flatten().fieldErrors).forEach(
        ([key, value]) => {
          fieldErrors[key] = (value as string[]) || [];
        }
      );

      return {
        errors: fieldErrors,
        message: "Invalid fields.",
        success: false,
      };
    }

    const validatedData = validatedFields.data;

    // Prepare data for panel location service
    const panelLocationData = {
      name: validatedData.name || "", // Ensure name is not undefined
      description: validatedData.description || undefined,
      teamId: user.teams?.[0]?.id, // Use first team from user's teams
      createdBy: user.id,
    };

    // Create panel location using service
    const result = await PanelLocationService.createPanelLocation(
      panelLocationData
    );

    if (!result.success) {
      // Handle specific error types
      if (
        result.error === "Panel location name must be unique within the team"
      ) {
        return {
          errors: {
            name: [result.error],
          },
          message: result.message,
          success: false,
        };
      }

      return {
        errors: {
          general: [result.error || result.message],
        },
        message: result.message,
        success: false,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/cp/panel-locations");

    return {
      errors: {},
      message: result.message,
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error("Error in submitPanelLocations:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return {
        errors: {
          auth: ["Please log in to continue"],
        },
        message: "Authentication required",
        success: false,
      };
    }

    return {
      errors: {
        general: ["An unexpected error occurred"],
      },
      message: "Failed to create panel location",
      success: false,
    };
  }
}

export async function updatePanelLocation(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Check authentication
    const user = await requireAuth();

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    };

    // Validate form data
    const validatedFields = panelLocationsSchema.safeParse(data);

    if (!validatedFields.success) {
      const fieldErrors: Record<string, string[]> = {};

      // Convert the field errors to the expected format
      Object.entries(validatedFields.error.flatten().fieldErrors).forEach(
        ([key, value]) => {
          fieldErrors[key] = (value as string[]) || [];
        }
      );

      return {
        errors: fieldErrors,
        message: "Invalid fields.",
        success: false,
      };
    }

    const validatedData = validatedFields.data;

    // Get current version for optimistic locking
    const currentPanelLocation =
      await PanelLocationService.getPanelLocationById(id);
    if (!currentPanelLocation.success) {
      return {
        errors: {
          general: ["Panel location not found"],
        },
        message: "Panel location not found",
        success: false,
      };
    }

    // Prepare data for panel location service
    const panelLocationData = {
      name: validatedData.name,
      description: validatedData.description,
      teamId: user.teams?.[0]?.id, // Use first team from user's teams
      updatedBy: user.id,
    };

    // Update panel location using service
    const result = await PanelLocationService.updatePanelLocation(
      id,
      panelLocationData,
      currentPanelLocation.data.version
    );

    if (!result.success) {
      // Handle specific error types
      if (
        result.error === "Panel location name must be unique within the team"
      ) {
        return {
          errors: {
            name: [result.error],
          },
          message: result.message,
          success: false,
        };
      }

      return {
        errors: {
          general: [result.error || result.message],
        },
        message: result.message,
        success: false,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/cp/panel-locations");

    return {
      errors: {},
      message: result.message,
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error("Error in updatePanelLocation:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return {
        errors: {
          auth: ["Please log in to continue"],
        },
        message: "Authentication required",
        success: false,
      };
    }

    return {
      errors: {
        general: ["An unexpected error occurred"],
      },
      message: "Failed to update panel location",
      success: false,
    };
  }
}

export async function deletePanelLocation(id: string): Promise<ActionState> {
  try {
    // Check authentication
    const user = await requireAuth();

    // Delete panel location using service
    const result = await PanelLocationService.deletePanelLocation(id, user.id);

    if (!result.success) {
      return {
        errors: {
          general: [result.error || result.message],
        },
        message: result.message,
        success: false,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/cp/panel-locations");

    return {
      errors: {},
      message: result.message,
      success: true,
    };
  } catch (error) {
    console.error("Error in deletePanelLocation:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return {
        errors: {
          auth: ["Please log in to continue"],
        },
        message: "Authentication required",
        success: false,
      };
    }

    return {
      errors: {
        general: ["An unexpected error occurred"],
      },
      message: "Failed to delete panel location",
      success: false,
    };
  }
}

export async function getAllPanelLocations(teamId?: string) {
  try {
    const result = await PanelLocationService.getAllPanelLocations(teamId);
    return result;
  } catch (error) {
    console.error("Error getting panel locations:", error);
    return {
      success: false,
      message: "Failed to retrieve panel locations",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getPanelLocationById(id: string) {
  try {
    const result = await PanelLocationService.getPanelLocationById(id);
    return result;
  } catch (error) {
    console.error("Error getting panel location:", error);
    return {
      success: false,
      message: "Failed to retrieve panel location",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function searchPanelLocations(search: string, teamId?: string) {
  try {
    const result = await PanelLocationService.searchPanelLocations(
      search,
      teamId
    );
    return result;
  } catch (error) {
    console.error("Error searching panel locations:", error);
    return {
      success: false,
      message: "Failed to search panel locations",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
