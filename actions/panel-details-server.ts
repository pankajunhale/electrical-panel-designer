"use server";

export async function submitPanelDetailsServer(formData: FormData) {
  console.log("Received data (panel details):", formData);
  return {
    success: true,
    message: "",
    error: {},
  };
}
