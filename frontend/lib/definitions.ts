import { z } from "zod";

export const RegisterFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters long." })
    .trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }) // can add regex
    .trim(),
});

export type FormState =
  | {
      errors?: {
        name?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
