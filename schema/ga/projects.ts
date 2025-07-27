import { z } from "zod";

export const projectsSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or less"),
  client_id: z.number().optional(),
  user_id: z.number().optional(),
});

export type ProjectsFormData = z.infer<typeof projectsSchema>;
