"use server";

import {
  makeDetailsSchema,
  type MakeDetailsFormData,
} from "@/schema/make-details";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: MakeDetailsFormData;
};

export async function submitMakeDetails(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    sfu: formData.get("sfu") as string,
    mccb: formData.get("mccb") as string,
    acb: formData.get("acb") as string,
    mpcb: formData.get("mpcb") as string,
    contactor: formData.get("contactor") as string,
    meter: formData.get("meter") as string,
    pilotDevice: formData.get("pilotDevice") as string,
    capacitor: formData.get("capacitor") as string,
  };

  const validatedFields = makeDetailsSchema.safeParse(data);

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

  const makeDetails = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Make details:", makeDetails);
  return {
    errors: {},
    message: "Make details submitted successfully!",
    data: makeDetails,
  };
}
