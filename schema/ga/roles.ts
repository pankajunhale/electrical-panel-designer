import { z } from "zod";

export const rolesSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(50, "Role name must be 50 characters or less"),
});

export type RolesFormData = z.infer<typeof rolesSchema>;
