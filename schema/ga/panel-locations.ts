import { z } from "zod";

// Panel location validation schemas
export const PanelLocationCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Location name is required")
    .max(100, "Location name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  teamId: z.string().uuid("Team ID is required"),
  createdBy: z.string().uuid("Created by user ID is required"),
});

export const PanelLocationUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Location name is required")
    .max(100, "Location name must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  teamId: z.string().uuid("Team ID is required").optional(),
  updatedBy: z.string().uuid("Updated by user ID is required"),
});

// Type exports
export type PanelLocationCreateInput = z.infer<
  typeof PanelLocationCreateSchema
>;
export type PanelLocationUpdateInput = z.infer<
  typeof PanelLocationUpdateSchema
>;

// Form data type for panel location creation
export type PanelLocationsFormData = {
  name: string;
  description?: string;
};

// Form schema for panel location creation (without server-side fields)
export const PanelLocationFormSchema = z.object({
  name: z
    .string()
    .min(1, "Location name is required")
    .max(100, "Location name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

// Legacy schema export for backward compatibility
export const panelLocationsSchema = PanelLocationFormSchema;

// Validation helper functions
export const validatePanelLocationCreate = (data: unknown) => {
  return PanelLocationCreateSchema.safeParse(data);
};

export const validatePanelLocationUpdate = (data: unknown) => {
  return PanelLocationUpdateSchema.safeParse(data);
};
