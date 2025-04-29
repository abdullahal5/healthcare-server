import { z } from "zod";

const loginSchemaValidation = z
  .object({
    body: z.object({
      email: z
        .string({
          required_error: "Email is required",
        })
        .email("Invalid email format"),

      password: z.string({
        required_error: "Password is required",
      }),
    }),
  })
  .strict();

export const AuthValidation = {
  loginSchemaValidation,
};
