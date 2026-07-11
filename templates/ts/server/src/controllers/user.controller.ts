import type { Request, Response } from "express";
import { userService } from "@/services/user.service";
import { BadRequestError } from "@/errors";

export const userController = {
  async getAll(_req: Request, res: Response) {
    const users = await userService.findAll();
    res.json(users);
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) throw new BadRequestError("User ID is required");

    const user = await userService.findById(id);
    res.json(user);
  },

  async create(req: Request, res: Response) {
    const { name, email } = req.body;
    if (!name || !email) throw new BadRequestError("Name and email are required");

    const user = await userService.create({ name, email });
    res.status(201).json(user);
  },
};
