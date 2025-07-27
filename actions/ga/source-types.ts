"use server";

import {
  sourceTypesSchema,
  type SourceTypesFormData,
} from "@/schema/ga/source-types";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: SourceTypesFormData;
};

export async function submitSourceTypes(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    name: formData.get("name") as string,
  };

  const validatedFields = sourceTypesSchema.safeParse(data);
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

  const sourceTypes = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Source types data:", sourceTypes);
  return {
    errors: {},
    message: "Source type submitted successfully!",
    data: sourceTypes,
  };
}
