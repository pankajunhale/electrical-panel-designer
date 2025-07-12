"use server";

import {
  incomerDetailsSchema,
  type IncomerDetailsFormData,
} from "@/schema/incomer-details";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: IncomerDetailsFormData;
};

export async function submitIncomerDetails(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Extract incomer data from FormData
  const incomers = [];
  let incomerIndex = 0;

  while (formData.get(`incomers[${incomerIndex}].type`)) {
    const incomer = {
      type: formData.get(`incomers[${incomerIndex}].type`) as string,
      rating: formData.get(`incomers[${incomerIndex}].rating`) as string,
      make: formData.get(`incomers[${incomerIndex}].make`) as string,
      model: formData.get(`incomers[${incomerIndex}].model`) as string,
      poles: formData.get(`incomers[${incomerIndex}].poles`) as string,
      breakingCapacity: formData.get(
        `incomers[${incomerIndex}].breakingCapacity`
      ) as string,
    };
    incomers.push(incomer);
    incomerIndex++;
  }

  const data = { incomers };

  const validatedFields = incomerDetailsSchema.safeParse(data);

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

  const incomerDetails = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Incomer details:", incomerDetails);
  return {
    errors: {},
    message: "Incomer details submitted successfully!",
    data: incomerDetails,
  };
}
