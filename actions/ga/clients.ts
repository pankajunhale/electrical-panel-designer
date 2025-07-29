"use server";

import { clientsSchema, type ClientsFormData } from "@/schema/ga/clients";
import { ClientService } from "@/lib/client-service";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  success: boolean;
  data?: ClientsFormData;
};

export async function submitClients(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  console.log("submitClients called with formData:", formData);
  try {
    // Check authentication
    const user = await requireAuth();
    console.log(user);
    const data = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      contactEmail: formData.get("contactEmail") as string,
      contactNumber: formData.get("contactNumber") as string,
    };

    console.log("Extracted data from formData:", data);

    // Validate form data
    const validatedFields = clientsSchema.safeParse(data);

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

    // Prepare data for client service
    // Extract user_id and team_id from authentication token
    const clientData = {
      name: validatedData.name,
      address: validatedData.address,
      contactEmail: validatedData.contactEmail,
      contactNumber: validatedData.contactNumber,
      userId: user.id, // Always use authenticated user's ID
      teamId: user.teams?.[0]?.id, // Use first team from user's teams
      createdBy: user.id,
    };

    // Create client using service
    const result = await ClientService.createClient(clientData);

    if (!result.success) {
      // Handle specific error types
      if (result.error === "Email address must be unique") {
        return {
          errors: {
            contactEmail: [result.error],
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
    revalidatePath("/cp/clients");
    revalidatePath("/cp/projects");

    return {
      errors: {},
      message: result.message,
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error("Error in submitClients:", error);

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
      message: "Failed to create client",
      success: false,
    };
  }
}
