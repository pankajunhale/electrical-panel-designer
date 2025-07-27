import { z } from "zod";

export const teamsSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required")
    .max(100, "Team name must be 100 characters or less"),
});

export type TeamsFormData = z.infer<typeof teamsSchema>;
