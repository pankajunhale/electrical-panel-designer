import { z } from "zod";

export const feederTypesSchema = z.object({
  name: z
    .string()
    .min(1, "Feeder type name is required")
    .max(50, "Feeder type name must be 50 characters or less"),
});

export type FeederTypesFormData = z.infer<typeof feederTypesSchema>;
