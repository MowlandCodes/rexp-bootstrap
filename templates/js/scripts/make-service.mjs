import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";
import { pascalCase, camelCase, kebabCase, ext } from "./_utils.mjs";

const name = process.argv[2];
if (!name) {
  console.error("Usage: npm run make:service <Name>");
  process.exit(1);
}

const serviceName = pascalCase(name);
const instanceName = camelCase(name);
const fileName = kebabCase(name);
const isTS = ext() === "ts";
const servicePath = resolve(
  process.cwd(),
  "server",
  "src",
  "services",
  `${fileName}.service.${ext()}`,
);

const content = isTS
  ? `import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/errors";

export const ${instanceName}Service = {
  async findAll() {
    return prisma.${instanceName}.findMany();
  },

  async findById(id: string) {
    const item = await prisma.${instanceName}.findUnique({ where: { id } });
    if (!item) throw new NotFoundError("${serviceName} not found");
    return item;
  },

  async create(data: Record<string, unknown>) {
    return prisma.${instanceName}.create({ data });
  },

  async update(id: string, data: Record<string, unknown>) {
    const item = await prisma.${instanceName}.findUnique({ where: { id } });
    if (!item) throw new NotFoundError("${serviceName} not found");
    return prisma.${instanceName}.update({ where: { id }, data });
  },

  async remove(id: string) {
    const item = await prisma.${instanceName}.findUnique({ where: { id } });
    if (!item) throw new NotFoundError("${serviceName} not found");
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
    if (!item) throw new NotFoundError("${serviceName} not found");
    return item;
  },

  async create(data) {
    return prisma.${instanceName}.create({ data });
  },

  async update(id, data) {
    const item = await prisma.${instanceName}.findUnique({ where: { id } });
    if (!item) throw new NotFoundError("${serviceName} not found");
    return prisma.${instanceName}.update({ where: { id }, data });
  },

  async remove(id) {
    const item = await prisma.${instanceName}.findUnique({ where: { id } });
    if (!item) throw new NotFoundError("${serviceName} not found");
    return prisma.${instanceName}.delete({ where: { id } });
  },
};
`;

await mkdir(resolve(process.cwd(), "server", "src", "services"), {
  recursive: true,
});
await writeFile(servicePath, content, "utf-8");
console.log(`Service created: server/src/services/${fileName}.service.${ext()}`);
