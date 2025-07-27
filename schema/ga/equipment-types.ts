import { z } from "zod";

export const equipmentTypesSchema = z.object({
  name: z
    .string()
    .min(1, "Equipment type name is required")
    .max(100, "Equipment type name must be 100 characters or less"),
  description: z.string().optional(),
});

export type EquipmentTypesFormData = z.infer<typeof equipmentTypesSchema>;
