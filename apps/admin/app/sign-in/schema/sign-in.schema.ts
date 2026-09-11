import { z } from "zod";

export const signInSchema = z.object({
  email: z.email({ error: "Invalid email" }).trim(),
  password: z.string().min(8).max(56).trim(),
});

export type SignInFormData = z.infer<typeof signInSchema>;
