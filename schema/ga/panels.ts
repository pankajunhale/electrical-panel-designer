import { z } from "zod";

export const panelsSchema = z.object({
  project_id: z.number().optional(),
  name: z
    .string()
    .min(1, "Panel name is required")
    .max(100, "Panel name must be 100 characters or less"),
  description: z.string().optional(),
  voltage_level: z
    .string()
    .max(50, "Voltage level must be 50 characters or less")
    .optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  depth: z.number().optional(),
  location_id: z.number().optional(),
  front_view_url: z.string().optional(),
  rear_view_url: z.string().optional(),
  status: z.string().max(20, "Status must be 20 characters or less").optional(),
});

export type PanelsFormData = z.infer<typeof panelsSchema>;
