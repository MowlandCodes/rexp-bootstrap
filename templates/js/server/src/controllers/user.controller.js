import { userService } from "@/services/user.service";
import { BadRequestError } from "@/errors";

export const userController = {
  async getAll(_req, res) {
    const users = await userService.findAll();
    res.json(users);
  },

  async getById(req, res) {
    const { id } = req.params;
    if (!id) throw new BadRequestError("User ID is required");

    const user = await userService.findById(id);
    res.json(user);
  },

  async create(req, res) {
    const { name, email } = req.body;
    if (!name || !email) throw new BadRequestError("Name and email are required");

    const user = await userService.create({ name, email });
    res.status(201).json(user);
  },
};
