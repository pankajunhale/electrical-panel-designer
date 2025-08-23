"use server";

import { incomersSchema, type IncomersFormData } from "@/schema/ga/incomers";
import { IncomerService } from "@/lib/incomer-service";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  success: boolean;
  data?: IncomersFormData;
};

export async function submitIncomers(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Check authentication
    const user = await requireAuth();

    const data = {
      name: formData.get("name") as string,
      ampereRating: formData.get("ampereRating")
        ? parseFloat(formData.get("ampereRating") as string)
        : null,
      panelId: formData.get("panelId") as string,
    };

    // Validate form data
    const validatedFields = incomersSchema.safeParse(data);

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

    // Check if name is unique within the panel
    const incomerService = new IncomerService();
    const isNameUnique = await incomerService.isNameUnique(
      validatedData.name,
      validatedData.panelId
    );
    if (!isNameUnique) {
      return {
        errors: {
          name: ["Incomer name must be unique within the panel"],
        },
        message: "Incomer name must be unique within the panel",
        success: false,
      };
    }

    // Create incomer using service
    const result = await incomerService.create(validatedData, user.id);
    if (!result) {
      return {
        errors: {
          general: ["Failed to create incomer"],
        },
        message: "Failed to create incomer",
        success: false,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/cp/incomers");

    return {
      errors: {},
      message: "Incomer created successfully",
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error("Error in submitIncomers:", error);

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
      message: "Failed to create incomer",
      success: false,
    };
  }
}

export async function updateIncomer(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Check authentication
    const user = await requireAuth();

    const data = {
      name: formData.get("name") as string,
      ampereRating: formData.get("ampereRating")
        ? parseFloat(formData.get("ampereRating") as string)
        : null,
      panelId: formData.get("panelId") as string,
    };

    // Validate form data
    const validatedFields = incomersSchema.safeParse(data);

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

    // Check if name is unique within the panel (excluding current incomer)
    const incomerService = new IncomerService();
    const isNameUnique = await incomerService.isNameUnique(
      validatedData.name,
      validatedData.panelId,
      id
    );
    if (!isNameUnique) {
      return {
        errors: {
          name: ["Incomer name must be unique within the panel"],
        },
        message: "Incomer name must be unique within the panel",
        success: false,
      };
    }

    // Update incomer using service
    const result = await incomerService.update(id, validatedData, user.id);
    if (!result) {
      return {
        errors: {
          general: ["Failed to update incomer"],
        },
        message: "Failed to update incomer",
        success: false,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/cp/incomers");

    return {
      errors: {},
      message: "Incomer updated successfully",
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error("Error in updateIncomer:", error);

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
      message: "Failed to update incomer",
      success: false,
    };
  }
}

export async function deleteIncomer(id: string): Promise<ActionState> {
  try {
    // Check authentication
    const user = await requireAuth();

    // Delete incomer using service
    const incomerService = new IncomerService();
    const result = await incomerService.delete(id, user.id);

    if (!result) {
      return {
        errors: {
          general: ["Failed to delete incomer"],
        },
        message: "Failed to delete incomer",
        success: false,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/cp/incomers");

    return {
      errors: {},
      message: "Incomer deleted successfully",
      success: true,
    };
  } catch (error) {
    console.error("Error in deleteIncomer:", error);

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
      message: "Failed to delete incomer",
      success: false,
    };
  }
}

export async function getAllIncomers() {
  try {
    const incomerService = new IncomerService();
    const incomers = await incomerService.findAll();
    return {
      success: true,
      data: incomers,
    };
  } catch (error) {
    console.error("Error getting incomers:", error);
    return {
      success: false,
      message: "Failed to retrieve incomers",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getIncomerById(id: string) {
  try {
    const incomerService = new IncomerService();
    const incomer = await incomerService.findById(id);
    if (!incomer) {
      return {
        success: false,
        message: "Incomer not found",
        error: "Incomer not found",
      };
    }
    return {
      success: true,
      data: incomer,
    };
  } catch (error) {
    console.error("Error getting incomer:", error);
    return {
      success: false,
      message: "Failed to retrieve incomer",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getIncomersByPanel(panelId: string) {
  try {
    const incomerService = new IncomerService();
    const incomers = await incomerService.findByPanelId(panelId);
    return {
      success: true,
      data: incomers,
    };
  } catch (error) {
    console.error("Error getting incomers by panel:", error);
    return {
      success: false,
      message: "Failed to retrieve incomers by panel",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
