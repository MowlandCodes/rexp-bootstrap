import { Router } from "express";
import { userController } from "@/controllers/user.controller";

const router = Router();

router.get("/users", userController.getAll);
router.get("/users/:id", userController.getById);
router.post("/users", userController.create);

export default router;
