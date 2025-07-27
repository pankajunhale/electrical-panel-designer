"use server";

import { rolesSchema, type RolesFormData } from "@/schema/ga/roles";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: RolesFormData;
};

export async function submitRoles(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    name: formData.get("name") as string,
  };

  const validatedFields = rolesSchema.safeParse(data);
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

  const roles = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Roles data:", roles);
  return {
    errors: {},
    message: "Role submitted successfully!",
    data: roles,
  };
}
