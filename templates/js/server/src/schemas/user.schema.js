import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export const idParamSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});
