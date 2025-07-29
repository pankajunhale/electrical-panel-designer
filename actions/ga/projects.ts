"use server";

import { projectsSchema, type ProjectsFormData } from "@/schema/ga/projects";
import { ProjectService } from "@/lib/project-service";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  success: boolean;
  data?: ProjectsFormData;
};

export async function submitProjects(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Check authentication
    const user = await requireAuth();

    const data = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      client_id: formData.get("client_id")
        ? Number(formData.get("client_id"))
        : undefined,
    };

    // Validate form data
    const validatedFields = projectsSchema.safeParse(data);

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

    // Prepare data for project service
    // Extract user_id and team_id from authentication token
    const projectData = {
      name: validatedData.name,
      description: validatedData.description,
      clientId: validatedData.client_id?.toString(),
      userId: user.id, // Always use authenticated user's ID
      teamId: user.teams?.[0]?.id, // Use first team from user's teams
      createdBy: user.id,
    };

    // Create project using service
    const result = await ProjectService.createProject(projectData);

    if (!result.success) {
      // Handle specific error types
      if (result.error === "Project name must be unique within the team") {
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
    revalidatePath("/cp/projects");
    revalidatePath("/cp/panel-design");

    return {
      errors: {},
      message: result.message,
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error("Error in submitProjects:", error);

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
      message: "Failed to create project",
      success: false,
    };
  }
}
