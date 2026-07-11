import { Router } from "express";
import { z } from "zod";
import { userController } from "@/controllers/user.controller";
import { validate } from "@/middlewares/validate";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

const idParamSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

const router = Router();

router.get("/users", userController.getAll);
router.get("/users/:id", validate(idParamSchema, "params"), userController.getById);
router.post("/users", validate(createUserSchema, "body"), userController.create);

export default router;
