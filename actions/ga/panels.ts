"use server";

import { panelsSchema, type PanelsFormData } from "@/schema/ga/panels";
import { PanelService } from "@/lib/panel-service";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { getAllProjects } from "./projects";
import { getAllPanelLocations } from "./panel-locations";
import { Project } from "@/dto/project.dto";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  success: boolean;
  data?: PanelsFormData;
};

export async function submitPanels(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Check authentication
    const user = await requireAuth();

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      voltageLevel: formData.get("voltageLevel") as string,
      width: formData.get("width") as string,
      height: formData.get("height") as string,
      depth: formData.get("depth") as string,
      locationId: formData.get("locationId") as string,
      frontViewUrl: formData.get("frontViewUrl") as string,
      rearViewUrl: formData.get("rearViewUrl") as string,
      status: formData.get("status") as string,
      projectId: formData.get("projectId") as string,
    };

    // Validate form data
    const validatedFields = panelsSchema.safeParse(data);

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

    // Prepare data for panel service
    const panelData = {
      name: validatedData.name,
      description: validatedData.description || undefined,
      voltageLevel: validatedData.voltageLevel,
      width: validatedData.width ? parseInt(validatedData.width) : undefined,
      height: validatedData.height ? parseInt(validatedData.height) : undefined,
      depth: validatedData.depth ? parseInt(validatedData.depth) : undefined,
      locationId: validatedData.locationId || undefined,
      frontViewUrl: validatedData.frontViewUrl || undefined,
      rearViewUrl: validatedData.rearViewUrl || undefined,
      status: validatedData.status,
      projectId: validatedData.projectId,
      createdBy: user.id,
    };

    // Create panel using service
    const result = await PanelService.createPanel(panelData);

    if (!result.success) {
      // Handle specific error types
      if (result.error === "Panel name must be unique within the project") {
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
    revalidatePath("/cp/panels");

    return {
      errors: {},
      message: result.message,
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error("Error in submitPanels:", error);

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
      message: "Failed to create panel",
      success: false,
    };
  }
}

export async function updatePanel(
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
      voltageLevel: formData.get("voltageLevel") as string,
      width: formData.get("width") as string,
      height: formData.get("height") as string,
      depth: formData.get("depth") as string,
      locationId: formData.get("locationId") as string,
      frontViewUrl: formData.get("frontViewUrl") as string,
      rearViewUrl: formData.get("rearViewUrl") as string,
      status: formData.get("status") as string,
      projectId: formData.get("projectId") as string,
    };

    // Validate form data
    const validatedFields = panelsSchema.safeParse(data);

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
    const currentPanel = await PanelService.getPanelById(id);
    if (!currentPanel.success) {
      return {
        errors: {
          general: ["Panel not found"],
        },
        message: "Panel not found",
        success: false,
      };
    }

    // Prepare data for panel service
    const panelData = {
      name: validatedData.name,
      description: validatedData.description || undefined,
      voltageLevel: validatedData.voltageLevel,
      width: validatedData.width ? parseInt(validatedData.width) : undefined,
      height: validatedData.height ? parseInt(validatedData.height) : undefined,
      depth: validatedData.depth ? parseInt(validatedData.depth) : undefined,
      locationId: validatedData.locationId || undefined,
      frontViewUrl: validatedData.frontViewUrl || undefined,
      rearViewUrl: validatedData.rearViewUrl || undefined,
      status: validatedData.status,
      projectId: validatedData.projectId,
      updatedBy: user.id,
    };

    // Update panel using service
    const result = await PanelService.updatePanel(
      id,
      panelData,
      currentPanel.data.version
    );

    if (!result.success) {
      // Handle specific error types
      if (result.error === "Panel name must be unique within the project") {
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
    revalidatePath("/cp/panels");

    return {
      errors: {},
      message: result.message,
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error("Error in updatePanel:", error);

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
      message: "Failed to update panel",
      success: false,
    };
  }
}

export async function deletePanel(id: string): Promise<ActionState> {
  try {
    // Check authentication
    const user = await requireAuth();

    // Delete panel using service
    const result = await PanelService.deletePanel(id, user.id);

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
    revalidatePath("/cp/panels");

    return {
      errors: {},
      message: result.message,
      success: true,
    };
  } catch (error) {
    console.error("Error in deletePanel:", error);

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
      message: "Failed to delete panel",
      success: false,
    };
  }
}

export async function getAllPanels(projectId?: string) {
  try {
    const result = await PanelService.getAllPanels(projectId);
    return result;
  } catch (error) {
    console.error("Error getting panels:", error);
    return {
      success: false,
      message: "Failed to retrieve panels",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getPanelById(id: string) {
  try {
    const result = await PanelService.getPanelById(id);
    return result;
  } catch (error) {
    console.error("Error getting panel:", error);
    return {
      success: false,
      message: "Failed to retrieve panel",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function searchPanels(search: string, projectId?: string) {
  try {
    const result = await PanelService.searchPanels(search, projectId);
    return result;
  } catch (error) {
    console.error("Error searching panels:", error);
    return {
      success: false,
      message: "Failed to search panels",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// New actions for dropdown data
export async function getProjectsForDropdown() {
  try {
    const result: {
      success: boolean;
      message: string;
      error?: string;
      data?: { projects: Project[] } | null;
    } = await getAllProjects();
    return result;
  } catch (error) {
    console.error("Error getting projects for dropdown:", error);
    return {
      success: false,
      message: "Failed to retrieve projects",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getLocationsForDropdown() {
  try {
    const result = await getAllPanelLocations();
    return result;
  } catch (error) {
    console.error("Error getting locations for dropdown:", error);
    return {
      success: false,
      message: "Failed to retrieve locations",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
