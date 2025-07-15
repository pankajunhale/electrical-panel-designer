"use server";

export async function submitDrawingDetailsServer(formData: FormData) {
  console.log("Received data (drawing details):", formData);
  return {
    success: true,
    message: "",
    error: {},
  };
}
