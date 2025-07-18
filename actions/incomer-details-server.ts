"use server";

export async function submitIncomerDetailsServer(formData: FormData) {
  console.log("Received data (incomer details):", formData);
  return {
    success: true,
    message: "",
    error: {},
  };
}
