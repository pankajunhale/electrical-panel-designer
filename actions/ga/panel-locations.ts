"use server";

import {
  panelLocationsSchema,
  type PanelLocationsFormData,
} from "@/schema/ga/panel-locations";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: PanelLocationsFormData;
};

export async function submitPanelLocations(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  };

  const validatedFields = panelLocationsSchema.safeParse(data);
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

  const panelLocations = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Panel locations data:", panelLocations);
  return {
    errors: {},
    message: "Panel location submitted successfully!",
    data: panelLocations,
  };
}
