import { z } from "zod";

export const projectsSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or less"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),
  client_id: z.number().optional(),
});

export type ProjectsFormData = z.infer<typeof projectsSchema>;
