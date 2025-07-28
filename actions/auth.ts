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

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        passwordHash,
        roleId: defaultRole.id,
        // phone can be added to schema if needed
      },
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
    // NextAuth handles logout through signOut()
    // This can be called from client components
    revalidatePath("/");
    redirect("/auth/login");
  } catch (error) {
    return {
      message: "Failed to logout",
    };
  }
}
