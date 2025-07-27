"use server";

import { slConfigSchema, type SlConfigFormData } from "@/schema/ga/sl-config";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: SlConfigFormData;
};

export async function submitSlConfig(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    panel_id: formData.get("panel_id")
      ? Number(formData.get("panel_id"))
      : undefined,
    config_json: formData.get("config_json") as string,
  };

  const validatedFields = slConfigSchema.safeParse(data);
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

  const slConfig = validatedFields.data;

  // Simulate success, skip database for now
  console.log("SL Config data:", slConfig);
  return {
    errors: {},
    message: "SL Config submitted successfully!",
    data: slConfig,
  };
}
