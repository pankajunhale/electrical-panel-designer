"use server";

import {
  equipmentTypesSchema,
  type EquipmentTypesFormData,
} from "@/schema/ga/equipment-types";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: EquipmentTypesFormData;
};

export async function submitEquipmentTypes(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  };

  const validatedFields = equipmentTypesSchema.safeParse(data);
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

  const equipmentTypes = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Equipment types data:", equipmentTypes);
  return {
    errors: {},
    message: "Equipment type submitted successfully!",
    data: equipmentTypes,
  };
}
