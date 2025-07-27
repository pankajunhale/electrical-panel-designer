"use server";

import {
  feederLayoutsSchema,
  type FeederLayoutsFormData,
} from "@/schema/ga/feeder-layouts";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: FeederLayoutsFormData;
};

export async function submitFeederLayouts(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    feeder_id: formData.get("feeder_id")
      ? Number(formData.get("feeder_id"))
      : undefined,
    x: formData.get("x") ? Number(formData.get("x")) : undefined,
    y: formData.get("y") ? Number(formData.get("y")) : undefined,
    width: formData.get("width") ? Number(formData.get("width")) : undefined,
    height: formData.get("height") ? Number(formData.get("height")) : undefined,
    view_type: formData.get("view_type") as "front" | "rear" | undefined,
  };

  const validatedFields = feederLayoutsSchema.safeParse(data);
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

  const feederLayouts = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Feeder layouts data:", feederLayouts);
  return {
    errors: {},
    message: "Feeder layout submitted successfully!",
    data: feederLayouts,
  };
}
