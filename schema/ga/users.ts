import { z } from "zod";

export const usersSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  email: z
    .string()
    .email("Invalid email address")
    .max(100, "Email must be 100 characters or less"),
  password_hash: z.string().min(1, "Password is required"),
  role_id: z.number().optional(),
  team_id: z.number().optional(),
});

export type UsersFormData = z.infer<typeof usersSchema>;
