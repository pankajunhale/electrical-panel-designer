"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import bcrypt from "bcryptjs";
import { loginSchema, registerSchema } from "@/schema/auth";
import { prisma } from "@/lib/prisma";

export async function loginAction(
  prevState: { errors: Record<string, string[]>; message: string },
  formData: FormData
) {
  const rawFormData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Validate the form data
  const validatedFields = loginSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data",
    };
  }

  const { email, password } = validatedFields.data;

  try {
    // Note: NextAuth handles the actual authentication in the authorize callback
    // This action can be used for client-side form handling
    // The actual authentication happens through the NextAuth sign-in API

    return {
      errors: {},
      message: "Please use the sign-in form",
    };
  } catch (error) {
    return {
      errors: {},
      message: "Invalid credentials",
    };
  }
}

export async function registerAction(
  prevState: { errors: Record<string, string[]>; message: string },
  formData: FormData
) {
  const rawFormData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // Validate the form data
  const validatedFields = registerSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data",
    };
  }

  const { firstName, lastName, email, phone, password } = validatedFields.data;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        errors: { email: ["Email already exists"] },
        message: "User already exists",
      };
    }

    // Get default role (you might want to create a default role first)
    const defaultRole = await prisma.role.findFirst({
      where: { name: "User" }, // or whatever your default role is
    });

    if (!defaultRole) {
      return {
        errors: {},
        message: "System error: Default role not found",
      };
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create user in database
      const user = await tx.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          passwordHash,
          roleId: defaultRole.id,
          // phone can be added to schema if needed
        },
      });

      // Find or create default team
      let defaultTeam = await tx.team.findFirst({
        where: { name: "Default Team" },
      });

      if (!defaultTeam) {
        // Create default team if it doesn't exist
        defaultTeam = await tx.team.create({
          data: {
            name: "Default Team",
            createdBy: user.id,
          },
        });
      }

      // Create UserTeam relationship to assign user to default team
      await tx.userTeam.create({
        data: {
          userId: user.id,
          teamId: defaultTeam.id,
          createdBy: user.id,
        },
      });

      return { user, defaultTeam };
    });

    revalidatePath("/");
    redirect("/auth/login?message=Account created successfully");
  } catch (error) {
    console.error("Registration error:", error);
    return {
      errors: {},
      message: "Failed to create account",
    };
  }
}

export async function logoutAction() {
  try {
    // Clear any server-side session data if needed
    revalidatePath("/");
    // Redirect to login page - client will handle NextAuth signOut
    redirect("/auth/login");
  } catch (error) {
    console.error("Logout action error:", error);
    return {
      message: "Failed to logout",
    };
  }
}
