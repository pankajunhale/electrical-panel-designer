"use server";

import {
  feederIncomerTypesSchema,
  type FeederIncomerTypesFormData,
} from "@/schema/feeder-incomer-types";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: FeederIncomerTypesFormData;
};

export async function submitFeederIncomerTypes(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Extract feeder and incomer types data from FormData
  const feederTypes = [];
  const incomerTypes = [];

  let feederIndex = 0;
  while (formData.get(`feederTypes[${feederIndex}].type`)) {
    const feederType = {
      type: formData.get(`feederTypes[${feederIndex}].type`) as string,
      rating: formData.get(`feederTypes[${feederIndex}].rating`) as string,
    };
    feederTypes.push(feederType);
    feederIndex++;
  }

  let incomerIndex = 0;
  while (formData.get(`incomerTypes[${incomerIndex}].type`)) {
    const incomerType = {
      type: formData.get(`incomerTypes[${incomerIndex}].type`) as string,
      rating: formData.get(`incomerTypes[${incomerIndex}].rating`) as string,
    };
    incomerTypes.push(incomerType);
    incomerIndex++;
  }

  const data = { feederTypes, incomerTypes };

  const validatedFields = feederIncomerTypesSchema.safeParse(data);

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

  const feederIncomerTypesData = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Feeder and incomer types:", feederIncomerTypesData);
  return {
    errors: {},
    message: "Feeder and incomer types submitted successfully!",
    data: feederIncomerTypesData,
  };
}
