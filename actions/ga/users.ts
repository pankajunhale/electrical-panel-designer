"use server";

import { usersSchema, type UsersFormData } from "@/schema/ga/users";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: UsersFormData;
};

export async function submitUsers(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password_hash: formData.get("password_hash") as string,
    role_id: formData.get("role_id")
      ? Number(formData.get("role_id"))
      : undefined,
    team_id: formData.get("team_id")
      ? Number(formData.get("team_id"))
      : undefined,
  };

  const validatedFields = usersSchema.safeParse(data);
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

  const users = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Users data:", users);
  return {
    errors: {},
    message: "User submitted successfully!",
    data: users,
  };
}
