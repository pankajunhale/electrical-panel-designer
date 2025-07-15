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
    panelMake: formData.get("panelMake") as string,
    incomerMake: formData.get("incomerMake") as string,
    feederMake: formData.get("feederMake") as string,
    controlMake: formData.get("controlMake") as string,
    maxHeightFeedersSection: Number(formData.get("maxHeightFeedersSection")),
    panelDoorsThickness: Number(formData.get("panelDoorsThickness")),
    mountingPlatesThickness1: Number(formData.get("mountingPlatesThickness1")),
    mountingPlatesThickness2: Number(formData.get("mountingPlatesThickness2")),
    verticalHorizPartitionsThickness: Number(
      formData.get("verticalHorizPartitionsThickness")
    ),
    horizontalPartitionRequired:
      formData.get("horizontalPartitionRequired") === "true",
    verticalPartitionRequired:
      formData.get("verticalPartitionRequired") === "true",
    horizontalPartitionsDepth: Number(
      formData.get("horizontalPartitionsDepth")
    ),
    verticalPartitionsDepth: Number(formData.get("verticalPartitionsDepth")),
  };

  const validatedFields = panelDetailsSchema.safeParse(data);
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

  const panelDetails = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Panel details:", panelDetails);
  return {
    errors: {},
    message: "Panel details submitted successfully!",
    data: panelDetails,
  };
}
