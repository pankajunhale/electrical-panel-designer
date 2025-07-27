import { z } from "zod";

export const sourceTypesSchema = z.object({
  name: z
    .string()
    .min(1, "Source type name is required")
    .max(50, "Source type name must be 50 characters or less"),
});

export type SourceTypesFormData = z.infer<typeof sourceTypesSchema>;
