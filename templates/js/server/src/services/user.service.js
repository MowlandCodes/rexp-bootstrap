import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/errors";

export const userService = {
  async findAll() {
    return prisma.user.findMany();
  },

  async findById(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  async create(data) {
    return prisma.user.create({ data });
  },
};
