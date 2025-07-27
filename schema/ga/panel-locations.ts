import { z } from "zod";

export const panelLocationsSchema = z.object({
  name: z
    .string()
    .max(100, "Location name must be 100 characters or less")
    .optional(),
  description: z.string().optional(),
});

export type PanelLocationsFormData = z.infer<typeof panelLocationsSchema>;
