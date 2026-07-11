import { userService } from "@/services/user.service";

export const userController = {
  async getAll(_req, res) {
    const users = await userService.findAll();
    res.sendSuccess(users);
  },

  async getById(req, res) {
    const user = await userService.findById(req.params.id);
    res.sendSuccess(user);
  },

  async create(req, res) {
    const user = await userService.create(req.body);
    res.sendSuccess(user, "User created", 201);
  },
};
