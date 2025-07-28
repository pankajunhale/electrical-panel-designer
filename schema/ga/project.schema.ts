import { z } from "zod";

// Project validation schemas
export const ProjectCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be less than 100 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  clientId: z.string().uuid("Invalid client ID").optional(),
  userId: z.string().uuid("Invalid user ID").optional(),
  teamId: z.string().uuid("Invalid team ID").optional(),
  createdBy: z.string().uuid("Created by user ID is required"),
});

export const ProjectUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  clientId: z.string().uuid("Invalid client ID").nullable().optional(),
  userId: z.string().uuid("Invalid user ID").nullable().optional(),
  teamId: z.string().uuid("Invalid team ID").nullable().optional(),
  updatedBy: z.string().uuid("Updated by user ID is required"),
});

export const ProjectQuerySchema = z.object({
  teamId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const ProjectFiltersSchema = z.object({
  teamId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  hasActivePanels: z.boolean().optional(),
});

export const ProjectSortSchema = z.object({
  sortBy: z
    .enum(["name", "createdAt", "updatedAt", "clientName", "panelCount"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Type exports
export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>;
export type ProjectQueryInput = z.infer<typeof ProjectQuerySchema>;
export type ProjectFiltersInput = z.infer<typeof ProjectFiltersSchema>;
export type ProjectSortInput = z.infer<typeof ProjectSortSchema>;

// Validation helper functions
export const validateProjectCreate = (data: unknown) => {
  return ProjectCreateSchema.safeParse(data);
};

export const validateProjectUpdate = (data: unknown) => {
  return ProjectUpdateSchema.safeParse(data);
};

export const validateProjectQuery = (data: unknown) => {
  return ProjectQuerySchema.safeParse(data);
};

export const validateProjectFilters = (data: unknown) => {
  return ProjectFiltersSchema.safeParse(data);
};

export const validateProjectSort = (data: unknown) => {
  return ProjectSortSchema.safeParse(data);
};
