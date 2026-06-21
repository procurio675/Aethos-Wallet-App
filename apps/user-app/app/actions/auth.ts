"use server";

import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signUp(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = signUpSchema.safeParse(rawData);

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const { name, email, phone, password } = parsed.data;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return { error: "User with this email or phone already exists" };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("SignUp error:", error);
    return { error: "Internal server error" };
  }
}
