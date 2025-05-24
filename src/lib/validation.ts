import { z } from "zod";

export const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#-])[_A-Za-z\d@$!%*?&_#-]{8,}$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&_#-) and start with a letter or underscore."
  );

export const emailValidation = z.string().email("Invalid email address.");

export const signupSchema = z
  .object({
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, "Password is required."),
});

export const forgotPasswordSchema = z.object({
  email: emailValidation,
});

export const courseRecommendationSchema = z.object({
  interests: z.string().min(3, "Please describe your interests."),
  learningHistory: z.string().optional(),
});
