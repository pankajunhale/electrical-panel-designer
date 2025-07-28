import { z } from "zod";

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must be less than 100 characters"),
  description: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 500, {
      message: "Description must be less than 500 characters",
    }),
  client: z
    .string()
    .min(1, "Client is required")
    .min(2, "Client name must be at least 2 characters"),
  location: z
    .string()
    .min(1, "Location is required")
    .min(2, "Location must be at least 2 characters"),
  status: z.enum(["Active", "Completed", "On Hold", "Cancelled"], {
    required_error: "Status is required",
  }),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please enter a valid start date",
    }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Please enter a valid end date",
    }),
  budget: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(parseFloat(val)), {
      message: "Budget must be a valid number",
    }),
  priority: z.enum(["Low", "Medium", "High", "Critical"], {
    required_error: "Priority is required",
  }),
});

export const createProjectSchema = projectSchema;
export const updateProjectSchema = projectSchema.partial().extend({
  id: z.string().min(1, "Project ID is required"),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
export type CreateProjectData = z.infer<typeof createProjectSchema>;
export type UpdateProjectData = z.infer<typeof updateProjectSchema>;