import { z } from "zod";

const updateAdminSchema = z
  .object({
    name: z.string().min(1, "Name is required").optional(),
    profilePhoto: z.string().optional(),
    contactNumber: z
      .string()
      .min(10, "Contact number must be at least 10 characters long")
      .optional(),
  })
  .strict();

export const AdminValidation = {
  updateAdminSchema,
};
