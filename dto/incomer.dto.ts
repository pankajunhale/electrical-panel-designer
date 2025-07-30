import { z } from "zod";

export const incomerDtoSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  ampereRating: z.number().nullable().optional(),
  panelId: z.string().uuid("Invalid panel ID"),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  version: z.number().int().positive(),
});

export type IncomerDto = z.infer<typeof incomerDtoSchema>;

export const createIncomerDtoSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  ampereRating: z.number().min(1, "Ampere rating is required"),
  panelId: z.string().uuid("Invalid panel ID"),
});

export type CreateIncomerDto = z.infer<typeof createIncomerDtoSchema>;

export const updateIncomerDtoSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  ampereRating: z.number().nullable().optional(),
  panelId: z.string().uuid("Invalid panel ID").optional(),
});

export type UpdateIncomerDto = z.infer<typeof updateIncomerDtoSchema>;
