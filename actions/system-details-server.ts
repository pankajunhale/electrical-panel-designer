"use server";

export async function submitSystemDetailsServer(formData: FormData) {
  console.log("Received data (system details):", formData);
  return {
    success: true,
    message: "",
    error: {},
  };
}
