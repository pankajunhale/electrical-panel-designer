"use server";

import {
  equipmentTypesSchema,
  type EquipmentTypesFormData,
} from "@/schema/ga/equipment-types";
import { EquipmentTypeService } from "@/lib/equipment-type-service";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  success: boolean;
  data?: EquipmentTypesFormData;
};

export async function submitEquipmentTypes(
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
    const validatedFields = equipmentTypesSchema.safeParse(data);

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

    // Prepare data for equipment type service
    const equipmentTypeData = {
      name: validatedData.name,
      description: validatedData.description,
      createdBy: user.id,
    };

    // Create equipment type using service
    const result = await EquipmentTypeService.createEquipmentType(
      equipmentTypeData
    );

    if (!result.success) {
      // Handle specific error types
      if (result.error === "Equipment type name must be unique") {
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
    revalidatePath("/cp/equipment-types");

    return {
      errors: {},
      message: result.message,
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error("Error in submitEquipmentTypes:", error);

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
      message: "Failed to create equipment type",
      success: false,
    };
  }
}

export async function updateEquipmentType(
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
    const validatedFields = equipmentTypesSchema.safeParse(data);

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
    const currentEquipmentType =
      await EquipmentTypeService.getEquipmentTypeById(id);
    if (!currentEquipmentType.success) {
      return {
        errors: {
          general: ["Equipment type not found"],
        },
        message: "Equipment type not found",
        success: false,
      };
    }

    // Prepare data for equipment type service
    const equipmentTypeData = {
      name: validatedData.name,
      description: validatedData.description,
      updatedBy: user.id,
    };

    // Update equipment type using service
    const result = await EquipmentTypeService.updateEquipmentType(
      id,
      equipmentTypeData,
      currentEquipmentType.data.version
    );

    if (!result.success) {
      // Handle specific error types
      if (result.error === "Equipment type name must be unique") {
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
    revalidatePath("/cp/equipment-types");

    return {
      errors: {},
      message: result.message,
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error("Error in updateEquipmentType:", error);

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
      message: "Failed to update equipment type",
      success: false,
    };
  }
}

export async function deleteEquipmentType(id: string): Promise<ActionState> {
  try {
    // Check authentication
    const user = await requireAuth();

    // Delete equipment type using service
    const result = await EquipmentTypeService.deleteEquipmentType(id, user.id);

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
    revalidatePath("/cp/equipment-types");

    return {
      errors: {},
      message: result.message,
      success: true,
    };
  } catch (error) {
    console.error("Error in deleteEquipmentType:", error);

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
      message: "Failed to delete equipment type",
      success: false,
    };
  }
}

export async function getAllEquipmentTypes() {
  try {
    const result = await EquipmentTypeService.getAllEquipmentTypes();
    return result;
  } catch (error) {
    console.error("Error getting equipment types:", error);
    return {
      success: false,
      message: "Failed to retrieve equipment types",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getEquipmentTypeById(id: string) {
  try {
    const result = await EquipmentTypeService.getEquipmentTypeById(id);
    return result;
  } catch (error) {
    console.error("Error getting equipment type:", error);
    return {
      success: false,
      message: "Failed to retrieve equipment type",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function searchEquipmentTypes(search: string) {
  try {
    const result = await EquipmentTypeService.searchEquipmentTypes(search);
    return result;
  } catch (error) {
    console.error("Error searching equipment types:", error);
    return {
      success: false,
      message: "Failed to search equipment types",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
