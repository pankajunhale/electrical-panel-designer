"use server";

import { basicInfoSchema, type BasicInfoFormData } from "@/schema/basic-info";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: BasicInfoFormData;
};

export async function submitBasicInfo(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    // System Details
    supplyLineVoltage: formData.get("supplyLineVoltage") as string,
    supplySystem: formData.get("supplySystem") as string,
    controlVoltage: formData.get("controlVoltage") as string,
    panelType: formData.get("panelType") as string,
    numberOfIncomers: formData.get("numberOfIncomers") as string,
    numberOfOutgoingFeeders: formData.get("numberOfOutgoingFeeders") as string,
    saveAsDefault: formData.get("saveAsDefault") === "on",
    // Drawing Details
    title: formData.get("title") as string,
    drawingNo: formData.get("drawingNo") as string,
    author: formData.get("author") as string,
    company: formData.get("company") as string,
    customer: formData.get("customer") as string,
    colorFormat: formData.get("colorFormat") as string,
    ferrulPrefix: formData.get("ferrulPrefix") as string,
    // Make Details
    sfu: formData.get("sfu") as string,
    mccb: formData.get("mccb") as string,
    acb: formData.get("acb") as string,
    mpcb: formData.get("mpcb") as string,
    contactor: formData.get("contactor") as string,
    meter: formData.get("meter") as string,
    pilotDevice: formData.get("pilotDevice") as string,
    capacitor: formData.get("capacitor") as string,
  };

  const validatedFields = basicInfoSchema.safeParse(data);

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

  const basicInfo = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Basic Info:", basicInfo);
  return {
    errors: {},
    message: "Basic info submitted successfully!",
    data: basicInfo,
  };
}
