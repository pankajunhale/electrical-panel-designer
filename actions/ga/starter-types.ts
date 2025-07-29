"use server";

import {
  starterTypesSchema,
  type StarterTypesFormData,
} from "@/schema/ga/starter-types";
import { StarterTypeService } from "@/lib/starter-type-service";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  success: boolean;
  data?: StarterTypesFormData;
};

export async function submitStarterTypes(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Check authentication
    const user = await requireAuth();

    const data = {
      name: formData.get("name") as string,
    };

    // Validate form data
    const validatedFields = starterTypesSchema.safeParse(data);

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

    // Prepare data for starter type service
    const starterTypeData = {
      name: validatedData.name,
      createdBy: user.id,
    };

    // Create starter type using service
    const result = await StarterTypeService.createStarterType(starterTypeData);

    if (!result.success) {
      // Handle specific error types
      if (result.error === "Starter type name must be unique") {
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
    revalidatePath("/cp/starter-types");

    return {
      errors: {},
      message: result.message,
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error("Error in submitStarterTypes:", error);

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
      message: "Failed to create starter type",
      success: false,
    };
  }
}

export async function updateStarterType(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Check authentication
    const user = await requireAuth();

    const data = {
      name: formData.get("name") as string,
    };

    // Validate form data
    const validatedFields = starterTypesSchema.safeParse(data);

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
    const currentStarterType = await StarterTypeService.getStarterTypeById(id);
    if (!currentStarterType.success) {
      return {
        errors: {
          general: ["Starter type not found"],
        },
        message: "Starter type not found",
        success: false,
      };
    }

    // Prepare data for starter type service
    const starterTypeData = {
      name: validatedData.name,
      updatedBy: user.id,
    };

    // Update starter type using service
    const result = await StarterTypeService.updateStarterType(
      id,
      starterTypeData,
      currentStarterType.data.version
    );

    if (!result.success) {
      // Handle specific error types
      if (result.error === "Starter type name must be unique") {
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
    revalidatePath("/cp/starter-types");

    return {
      errors: {},
      message: result.message,
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error("Error in updateStarterType:", error);

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
      message: "Failed to update starter type",
      success: false,
    };
  }
}

export async function deleteStarterType(id: string): Promise<ActionState> {
  try {
    // Check authentication
    const user = await requireAuth();

    // Delete starter type using service
    const result = await StarterTypeService.deleteStarterType(id, user.id);

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
    revalidatePath("/cp/starter-types");

    return {
      errors: {},
      message: result.message,
      success: true,
    };
  } catch (error) {
    console.error("Error in deleteStarterType:", error);

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
      message: "Failed to delete starter type",
      success: false,
    };
  }
}

export async function getAllStarterTypes() {
  try {
    const result = await StarterTypeService.getAllStarterTypes();
    return result;
  } catch (error) {
    console.error("Error getting starter types:", error);
    return {
      success: false,
      message: "Failed to retrieve starter types",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getStarterTypeById(id: string) {
  try {
    const result = await StarterTypeService.getStarterTypeById(id);
    return result;
  } catch (error) {
    console.error("Error getting starter type:", error);
    return {
      success: false,
      message: "Failed to retrieve starter type",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function searchStarterTypes(search: string) {
  try {
    const result = await StarterTypeService.searchStarterTypes(search);
    return result;
  } catch (error) {
    console.error("Error searching starter types:", error);
    return {
      success: false,
      message: "Failed to search starter types",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
