import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";
import { pascalCase, camelCase, kebabCase, ext } from "./_utils.mjs";

const name = process.argv[2];
if (!name) {
  console.error("Usage: npm run make:model <Name>");
  process.exit(1);
}

const modelName = pascalCase(name);
const instanceName = camelCase(name);
const fileName = kebabCase(name);
const svcFileName = fileName;
const modelsDir = resolve(process.cwd(), "server", "prisma", "models");
const prismaPath = resolve(modelsDir, `${fileName}.prisma`);
const svcPath = resolve(
  process.cwd(),
  "server",
  "src",
  "services",
  `${svcFileName}.service.${ext()}`,
);

const prismaContent = `model ${modelName} {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("${instanceName}")
}
`;

const isTS = ext() === "ts";

const svcContent = isTS
  ? `import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/errors";

export const ${instanceName}Service = {
  async findAll() {
    return prisma.${instanceName}.findMany();
  },

  async findById(id: string) {
    const item = await prisma.${instanceName}.findUnique({ where: { id } });
    if (!item) throw new NotFoundError("${modelName} not found");
    return item;
  },

  async create(data: Record<string, unknown>) {
    return prisma.${instanceName}.create({ data });
  },

  async update(id: string, data: Record<string, unknown>) {
    const item = await prisma.${instanceName}.findUnique({ where: { id } });
    if (!item) throw new NotFoundError("${modelName} not found");
    return prisma.${instanceName}.update({ where: { id }, data });
  },

  async remove(id: string) {
    const item = await prisma.${instanceName}.findUnique({ where: { id } });
    if (!item) throw new NotFoundError("${modelName} not found");
    return prisma.${instanceName}.delete({ where: { id } });
  },
};
`
  : `import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/errors";

export const ${instanceName}Service = {
  async findAll() {
    return prisma.${instanceName}.findMany();
  },

  async findById(id) {
    const item = await prisma.${instanceName}.findUnique({ where: { id } });
    if (!item) throw new NotFoundError("${modelName} not found");
    return item;
  },

  async create(data) {
    return prisma.${instanceName}.create({ data });
  },

  async update(id, data) {
    const item = await prisma.${instanceName}.findUnique({ where: { id } });
    if (!item) throw new NotFoundError("${modelName} not found");
    return prisma.${instanceName}.update({ where: { id }, data });
  },

  async remove(id) {
    const item = await prisma.${instanceName}.findUnique({ where: { id } });
    if (!item) throw new NotFoundError("${modelName} not found");
    return prisma.${instanceName}.delete({ where: { id } });
  },
};
`;

await mkdir(modelsDir, { recursive: true });
await writeFile(prismaPath, prismaContent, "utf-8");
console.log(`Prisma model created: prisma/models/${fileName}.prisma`);

await mkdir(resolve(process.cwd(), "server", "src", "services"), {
  recursive: true,
});
await writeFile(svcPath, svcContent, "utf-8");
console.log(`Service created: server/src/services/${svcFileName}.service.${ext()}`);
