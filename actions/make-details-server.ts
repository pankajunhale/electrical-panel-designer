"use server";

export async function submitMakeDetailsServer(formData: FormData) {
  console.log("Received data (make details):", formData);
  return {
    success: true,
    message: "",
    error: {},
  };
}
