"use server";

export async function submitFeederIncomerTypesServer(formData: FormData) {
  console.log("Received data (feeder incomer types):", formData);
  return {
    success: true,
    message: "",
    error: {},
  };
}
