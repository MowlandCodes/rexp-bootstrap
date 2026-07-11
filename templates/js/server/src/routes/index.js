import { Router } from "express";
import { userController } from "@/controllers/user.controller";
import { validate } from "@/middlewares/validate";
import { createUserSchema, idParamSchema } from "@/schemas/user.schema";

const router = Router();

router.get("/users", userController.getAll);
router.get("/users/:id", validate(idParamSchema, "params"), userController.getById);
router.post("/users", validate(createUserSchema, "body"), userController.create);

export default router;
