import { z } from "zod";

export const breakerTypesSchema = z.object({
  name: z
    .string()
    .min(1, "Breaker type name is required")
    .max(50, "Breaker type name must be 50 characters or less"),
});

export type BreakerTypesFormData = z.infer<typeof breakerTypesSchema>;
