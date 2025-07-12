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
    supplyLineVoltage: formData.get("supplyLineVoltage") as string,
    supplySystem: formData.get("supplySystem") as string,
    controlVoltage: formData.get("controlVoltage") as string,
    panelType: formData.get("panelType") as string,
    numberOfIncomers: formData.get("numberOfIncomers") as string,
    numberOfOutgoingFeeders: formData.get("numberOfOutgoingFeeders") as string,
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
