"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "@/schema/auth";

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
    // Here you would typically:
    // 1. Check if user exists
    // 2. Verify password
    // 3. Create session/token
    // 4. Store in database

    console.log("Login attempt:", { email, password });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo purposes, let's say login is successful
    // In a real app, you'd check credentials here

    revalidatePath("/");
    redirect("/");
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
    // Here you would typically:
    // 1. Check if user already exists
    // 2. Hash the password
    // 3. Create user in database
    // 4. Send verification email

    console.log("Register attempt:", {
      firstName,
      lastName,
      email,
      phone,
      password,
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo purposes, let's say registration is successful
    // In a real app, you'd create the user here

    revalidatePath("/");
    redirect("/auth/login?message=Account created successfully");
  } catch (error) {
    return {
      errors: {},
      message: "Failed to create account",
    };
  }
}

export async function logoutAction() {
  try {
    // Here you would typically:
    // 1. Clear session/token
    // 2. Remove from database
    // 3. Clear cookies

    console.log("Logout attempt");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    revalidatePath("/");
    redirect("/auth/login");
  } catch (error) {
    return {
      message: "Failed to logout",
    };
  }
}
