import { z } from "zod";

// Starter type validation schemas
export const StarterTypeCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Starter type name is required")
    .max(50, "Starter type name must be less than 50 characters"),
  createdBy: z.string().uuid("Created by user ID is required"),
});

export const StarterTypeUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Starter type name is required")
    .max(50, "Starter type name must be less than 50 characters")
    .optional(),
  updatedBy: z.string().uuid("Updated by user ID is required"),
});

// Type exports
export type StarterTypeCreateInput = z.infer<typeof StarterTypeCreateSchema>;
export type StarterTypeUpdateInput = z.infer<typeof StarterTypeUpdateSchema>;

// Form data type for starter type creation
export type StarterTypesFormData = {
  name: string;
};

// Form schema for starter type creation (without server-side fields)
export const StarterTypeFormSchema = z.object({
  name: z
    .string()
    .min(1, "Starter type name is required")
    .max(50, "Starter type name must be less than 50 characters"),
});

// Legacy schema export for backward compatibility
export const starterTypesSchema = StarterTypeFormSchema;

// Validation helper functions
export const validateStarterTypeCreate = (data: unknown) => {
  return StarterTypeCreateSchema.safeParse(data);
};

export const validateStarterTypeUpdate = (data: unknown) => {
  return StarterTypeUpdateSchema.safeParse(data);
};
