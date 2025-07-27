"use server";

import { panelsSchema, type PanelsFormData } from "@/schema/ga/panels";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: PanelsFormData;
};

export async function submitPanels(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    project_id: formData.get("project_id")
      ? Number(formData.get("project_id"))
      : undefined,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    voltage_level: formData.get("voltage_level") as string,
    width: formData.get("width") ? Number(formData.get("width")) : undefined,
    height: formData.get("height") ? Number(formData.get("height")) : undefined,
    depth: formData.get("depth") ? Number(formData.get("depth")) : undefined,
    location_id: formData.get("location_id")
      ? Number(formData.get("location_id"))
      : undefined,
    front_view_url: formData.get("front_view_url") as string,
    rear_view_url: formData.get("rear_view_url") as string,
    status: formData.get("status") as string,
  };

  const validatedFields = panelsSchema.safeParse(data);
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

  const panels = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Panels data:", panels);
  return {
    errors: {},
    message: "Panel submitted successfully!",
    data: panels,
  };
}
