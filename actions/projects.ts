"use server";

import { revalidatePath } from "next/cache";
import { ProjectService } from "@/lib/project-service";
import {
  projectSchema,
  updateProjectSchema,
  type ProjectFormData,
  type UpdateProjectData,
} from "@/schema/project";

export async function createProject(
  prevState: { errors: Record<string, string[]>; message: string; data?: ProjectFormData },
  formData: FormData
) {
  const rawFormData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    client: formData.get("client") as string,
    location: formData.get("location") as string,
    status: formData.get("status") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    budget: formData.get("budget") as string,
    priority: formData.get("priority") as string,
  };

  // Remove empty strings for optional fields
  if (!rawFormData.description) rawFormData.description = undefined;
  if (!rawFormData.endDate) rawFormData.endDate = undefined;
  if (!rawFormData.budget) rawFormData.budget = undefined;

  // Validate the form data
  const validatedFields = projectSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data",
    };
  }

  try {
    await ProjectService.createProject(validatedFields.data);

    revalidatePath("/cp/projects");
    return {
      errors: {},
      message: "Project created successfully",
      data: validatedFields.data,
    };
  } catch (error) {
    return {
      errors: {},
      message: "Failed to create project",
    };
  }
}

export async function updateProject(
  prevState: { errors: Record<string, string[]>; message: string; data?: UpdateProjectData },
  formData: FormData
) {
  const rawFormData = {
    id: formData.get("id") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    client: formData.get("client") as string,
    location: formData.get("location") as string,
    status: formData.get("status") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    budget: formData.get("budget") as string,
    priority: formData.get("priority") as string,
  };

  // Remove empty strings for optional fields
  if (!rawFormData.description) rawFormData.description = undefined;
  if (!rawFormData.endDate) rawFormData.endDate = undefined;
  if (!rawFormData.budget) rawFormData.budget = undefined;

  // Validate the form data
  const validatedFields = updateProjectSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data",
    };
  }

  try {
    const updatedProject = await ProjectService.updateProject(validatedFields.data);
    
    if (!updatedProject) {
      return {
        errors: {},
        message: "Project not found",
      };
    }

    revalidatePath("/cp/projects");
    return {
      errors: {},
      message: "Project updated successfully",
      data: validatedFields.data,
    };
  } catch (error) {
    return {
      errors: {},
      message: "Failed to update project",
    };
  }
}

export async function deleteProject(id: string) {
  try {
    const success = await ProjectService.deleteProject(id);
    
    if (!success) {
      return {
        message: "Project not found",
      };
    }

    revalidatePath("/cp/projects");
    return {
      message: "Project deleted successfully",
    };
  } catch (error) {
    return {
      message: "Failed to delete project",
    };
  }
}

export async function getAllProjects() {
  try {
    return await ProjectService.getAllProjects();
  } catch (error) {
    throw new Error("Failed to fetch projects");
  }
}

export async function getProjectById(id: string) {
  try {
    return await ProjectService.getProjectById(id);
  } catch (error) {
    throw new Error("Failed to fetch project");
  }
}

export async function searchProjects(query: string) {
  try {
    return await ProjectService.searchProjects(query);
  } catch (error) {
    throw new Error("Failed to search projects");
  }
}