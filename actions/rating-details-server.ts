"use server";

export async function submitRatingDetailsServer(formData: FormData) {
  console.log("Received data (rating details):", formData);
  return {
    success: true,
    message: "",
    error: {},
  };
}
