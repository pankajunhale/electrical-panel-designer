import { z } from "zod";

export const drawingDetailsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  drawingNo: z.string().min(1, "Drawing No. is required"),
  author: z.string().min(1, "Author is required"),
  company: z.string().min(1, "Company is required"),
  customer: z.string().min(1, "Customer is required"),
  colorFormat: z.enum(["Colored", "Monochrome"]),
  ferrulPrefix: z
    .string()
    .regex(
      /^[0-9A-Z]$/,
      "Ferrul Prefix must be a single digit or uppercase letter"
    ),
});

export type DrawingDetailsFormData = z.infer<typeof drawingDetailsSchema>;
