"use server";

import { teamsSchema, type TeamsFormData } from "@/schema/ga/teams";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: TeamsFormData;
};

export async function submitTeams(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    name: formData.get("name") as string,
  };

  const validatedFields = teamsSchema.safeParse(data);
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

  const teams = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Teams data:", teams);
  return {
    errors: {},
    message: "Team submitted successfully!",
    data: teams,
  };
}
