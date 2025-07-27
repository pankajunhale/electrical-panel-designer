"use server";

import { projectsSchema, type ProjectsFormData } from "@/schema/ga/projects";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: ProjectsFormData;
};

export async function submitProjects(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    name: formData.get("name") as string,
    client_id: formData.get("client_id")
      ? Number(formData.get("client_id"))
      : undefined,
    user_id: formData.get("user_id")
      ? Number(formData.get("user_id"))
      : undefined,
  };

  const validatedFields = projectsSchema.safeParse(data);
  console.log(validatedFields);
  if (!validatedFields.success) {
    const fieldErrors: Record<string, string[]> = {};

    // Convert the field errors to the expected format
    Object.entries(validatedFields.error.flatten().fieldErrors).forEach(
      ([key, value]) => {
        fieldErrors[key] = value || [];
      }
    );

    return {
      errors: fieldErrors,
      message: "Invalid fields.",
    };
  }

  const projects = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Projects data:", projects);
  return {
    errors: {},
    message: "Project submitted successfully!",
    data: projects,
  };
}
