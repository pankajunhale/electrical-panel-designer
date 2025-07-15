"use server";

import {
  systemDetailsSchema,
  type SystemDetailsFormData,
} from "@/schema/system-details";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: SystemDetailsFormData;
};

export async function submitSystemDetails(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    supplyLineVoltage: Number(formData.get("supplyLineVoltage")),
    supplySystem: formData.get("supplySystem") as string,
    numberOfOutgoingFeeders: Number(formData.get("numberOfOutgoingFeeders")),
    controlVoltage: Number(formData.get("controlVoltage")),
    panelType: formData.get("panelType") as string,
    numberOfIncomers: Number(formData.get("numberOfIncomers")),
    saveAsDefault: formData.get("saveAsDefault") === "on",
  };

  const validatedFields = systemDetailsSchema.safeParse(data);

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

  const systemDetails = validatedFields.data;

  // Simulate success, skip database for now
  console.log("System details:", systemDetails);
  return {
    errors: {},
    message: "System details submitted successfully!",
    data: systemDetails,
  };
}
