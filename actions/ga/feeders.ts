"use server";

import { feedersSchema, type FeedersFormData } from "@/schema/ga/feeders";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: FeedersFormData;
};

export async function submitFeeders(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    panel_id: formData.get("panel_id")
      ? Number(formData.get("panel_id"))
      : undefined,
    description: formData.get("description") as string,
    rating_kw: formData.get("rating_kw")
      ? Number(formData.get("rating_kw"))
      : undefined,
    rating_hp: formData.get("rating_hp")
      ? Number(formData.get("rating_hp"))
      : undefined,
    starter_type_id: formData.get("starter_type_id")
      ? Number(formData.get("starter_type_id"))
      : undefined,
    feeder_type_id: formData.get("feeder_type_id")
      ? Number(formData.get("feeder_type_id"))
      : undefined,
    source_type_id: formData.get("source_type_id")
      ? Number(formData.get("source_type_id"))
      : undefined,
    breaker_type_id: formData.get("breaker_type_id")
      ? Number(formData.get("breaker_type_id"))
      : undefined,
    quantity: formData.get("quantity")
      ? Number(formData.get("quantity"))
      : undefined,
  };

  const validatedFields = feedersSchema.safeParse(data);
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

  const feeders = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Feeders data:", feeders);
  return {
    errors: {},
    message: "Feeder submitted successfully!",
    data: feeders,
  };
}
