import { z } from "zod";

// Equipment type validation schemas
export const EquipmentTypeCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Equipment type name is required")
    .max(100, "Equipment type name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  createdBy: z.string().uuid("Created by user ID is required"),
});

export const EquipmentTypeUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Equipment type name is required")
    .max(100, "Equipment type name must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  updatedBy: z.string().uuid("Updated by user ID is required"),
});

// Type exports
export type EquipmentTypeCreateInput = z.infer<
  typeof EquipmentTypeCreateSchema
>;
export type EquipmentTypeUpdateInput = z.infer<
  typeof EquipmentTypeUpdateSchema
>;

// Form data type for equipment type creation
export type EquipmentTypesFormData = {
  name: string;
  description?: string;
};

// Form schema for equipment type creation (without server-side fields)
export const EquipmentTypeFormSchema = z.object({
  name: z
    .string()
    .min(1, "Equipment type name is required")
    .max(100, "Equipment type name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

// Legacy schema export for backward compatibility
export const equipmentTypesSchema = EquipmentTypeFormSchema;

// Validation helper functions
export const validateEquipmentTypeCreate = (data: unknown) => {
  return EquipmentTypeCreateSchema.safeParse(data);
};

export const validateEquipmentTypeUpdate = (data: unknown) => {
  return EquipmentTypeUpdateSchema.safeParse(data);
};
