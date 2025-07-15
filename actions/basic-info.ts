"use server";

import { basicInfoSchema, type BasicInfoFormData } from "@/schema/basic-info";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: BasicInfoFormData;
};

export async function submitBasicInfo(
  prevState: ActionState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: FormData
): Promise<ActionState> {
  console.log(formData);
  const data = {
    // System Details
    supplyLineVoltage: Number(formData.get("supplyLineVoltage")),
    supplySystem: formData.get("supplySystem") as string,
    controlVoltage: Number(formData.get("controlVoltage")),
    panelType: formData.get("panelType") as string,
    numberOfIncomers: Number(formData.get("numberOfIncomers")),
    numberOfOutgoingFeeders: Number(formData.get("numberOfOutgoingFeeders")),
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
  console.log(validatedFields);
  if (!validatedFields.success) {
    const fieldErrors: Record<string, string[]> = {};
    console.log(validatedFields.error.flatten().fieldErrors);
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
