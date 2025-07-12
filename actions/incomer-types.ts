"use server";

import {
  incomerTypesSchema,
  type IncomerTypesFormData,
} from "@/schema/incomer-types";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: IncomerTypesFormData;
};

export async function submitIncomerTypes(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Extract incomer types data from FormData
  const incomerTypes = [];
  let incomerIndex = 0;

  while (formData.get(`incomerTypes[${incomerIndex}].type`)) {
    const incomerType = {
      type: formData.get(`incomerTypes[${incomerIndex}].type`) as string,
      rating: formData.get(`incomerTypes[${incomerIndex}].rating`) as string,
      poles: formData.get(`incomerTypes[${incomerIndex}].poles`) as string,
      breakingCapacity: formData.get(
        `incomerTypes[${incomerIndex}].breakingCapacity`
      ) as string,
    };
    incomerTypes.push(incomerType);
    incomerIndex++;
  }

  const data = { incomerTypes };

  const validatedFields = incomerTypesSchema.safeParse(data);

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

  const incomerTypesData = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Incomer types:", incomerTypesData);
  return {
    errors: {},
    message: "Incomer types submitted successfully!",
    data: incomerTypesData,
  };
}
