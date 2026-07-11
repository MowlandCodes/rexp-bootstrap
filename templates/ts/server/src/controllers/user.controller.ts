import type { Request, Response } from "express";
import { userService } from "@/services/user.service";

export const userController = {
  async getAll(_req: Request, res: Response) {
    const users = await userService.findAll();
    res.sendSuccess(users);
  },

  async getById(req: Request, res: Response) {
    const user = await userService.findById(req.params.id);
    res.sendSuccess(user);
  },

  async create(req: Request, res: Response) {
    const user = await userService.create(req.body);
    res.sendSuccess(user, "User created", 201);
  },
};
