"use server";

import {
  breakerTypesSchema,
  type BreakerTypesFormData,
} from "@/schema/ga/breaker-types";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: BreakerTypesFormData;
};

export async function submitBreakerTypes(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    name: formData.get("name") as string,
  };

  const validatedFields = breakerTypesSchema.safeParse(data);
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

  const breakerTypes = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Breaker types data:", breakerTypes);
  return {
    errors: {},
    message: "Breaker type submitted successfully!",
    data: breakerTypes,
  };
}
