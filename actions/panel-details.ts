"use server";

import {
  panelDetailsSchema,
  type PanelDetailsFormData,
} from "@/schema/panel-details";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: PanelDetailsFormData;
};

export async function submitPanelDetails(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    panelType: formData.get("panelType") as string,
    construction: formData.get("construction") as string,
    protection: formData.get("protection") as string,
    mounting: formData.get("mounting") as string,
    ipRating: formData.get("ipRating") as string,
    color: formData.get("color") as string,
  };

  const validatedFields = panelDetailsSchema.safeParse(data);

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

  const panelDetails = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Panel details:", panelDetails);
  return {
    errors: {},
    message: "Panel details submitted successfully!",
    data: panelDetails,
  };
}
