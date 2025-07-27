import { z } from "zod";

export const starterTypesSchema = z.object({
  name: z
    .string()
    .min(1, "Starter type name is required")
    .max(50, "Starter type name must be 50 characters or less"),
});

export type StarterTypesFormData = z.infer<typeof starterTypesSchema>;
