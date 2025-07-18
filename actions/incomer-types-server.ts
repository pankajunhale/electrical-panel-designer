"use server";

export async function submitIncomerTypesServer(formData: FormData) {
  console.log("Received data (incomer types):", formData);
  return {
    success: true,
    message: "",
    error: {},
  };
}
