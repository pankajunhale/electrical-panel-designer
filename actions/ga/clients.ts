"use server";

import { clientsSchema, type ClientsFormData } from "@/schema/ga/clients";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: ClientsFormData;
};

export async function submitClients(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    name: formData.get("name") as string,
    address: formData.get("address") as string,
    contact_email: formData.get("contact_email") as string,
    contact_number: formData.get("contact_number") as string,
  };

  const validatedFields = clientsSchema.safeParse(data);
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

  const clients = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Clients data:", clients);
  return {
    errors: {},
    message: "Client submitted successfully!",
    data: clients,
  };
}
