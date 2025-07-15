"use server";

export async function submitBasicInfoServer(formData: FormData) {
  console.log("Received data (basic info):", formData);
  return {
    success: true,
    message: "",
    error: {},
  };
}
