"use server";

import {
  feederTypesSchema,
  type FeederTypesFormData,
} from "@/schema/ga/feeder-types";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: FeederTypesFormData;
};

export async function submitFeederTypes(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    name: formData.get("name") as string,
  };

  const validatedFields = feederTypesSchema.safeParse(data);
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

  const feederTypes = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Feeder types data:", feederTypes);
  return {
    errors: {},
    message: "Feeder type submitted successfully!",
    data: feederTypes,
  };
}
