"use server";

import {
  drawingDetailsSchema,
  type DrawingDetailsFormData,
} from "@/schema/drawing-details";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: DrawingDetailsFormData;
};

export async function submitDrawingDetails(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = {
    title: formData.get("title") as string,
    drawingNo: formData.get("drawingNo") as string,
    author: formData.get("author") as string,
    company: formData.get("company") as string,
    customer: formData.get("customer") as string,
    colorFormat: formData.get("colorFormat") as string,
    ferrulPrefix: formData.get("ferrulPrefix") as string,
  };

  const validatedFields = drawingDetailsSchema.safeParse(data);

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

  const drawingDetails = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Drawing details:", drawingDetails);
  return {
    errors: {},
    message: "Drawing details submitted successfully!",
    data: drawingDetails,
  };
}
