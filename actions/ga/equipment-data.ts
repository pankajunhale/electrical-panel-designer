"use server";

import {
  equipmentDataSchema,
  type EquipmentDataFormData,
} from "@/schema/ga/equipment-data";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  success: boolean;
  data?: EquipmentDataFormData;
};

export async function submitEquipmentData(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    panel_id: formData.get("panel_id")
      ? Number(formData.get("panel_id"))
      : undefined,
    serial_number: Number(formData.get("serial_number")),
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
    quantity: Number(formData.get("quantity")),
    total_load_kw: formData.get("total_load_kw")
      ? Number(formData.get("total_load_kw"))
      : undefined,
    equipment_type_id: formData.get("equipment_type_id")
      ? Number(formData.get("equipment_type_id"))
      : undefined,
  };

  const validatedFields = equipmentDataSchema.safeParse(data);
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
      success: false,
      message: "Invalid fields.",
    };
  }

  const equipmentData = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Equipment data:", equipmentData);
  return {
    errors: {},
    success: true,
    message: "Equipment data submitted successfully!",
    data: equipmentData,
  };
}
