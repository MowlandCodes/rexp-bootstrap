import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";
import { existsSync } from "fs";
import { pascalCase, camelCase, kebabCase, ext } from "./_utils.mjs";

const name = process.argv[2];
if (!name) {
  console.error("Usage: npm run make:controller <Name>");
  process.exit(1);
}

const controllerName = pascalCase(name);
const serviceName = `${controllerName}Service`;
const instanceName = camelCase(name);
const fileName = kebabCase(name);
const isTS = ext() === "ts";
const controllerPath = resolve(
  process.cwd(),
  "server",
  "src",
  "controllers",
  `${fileName}.controller.${ext()}`,
);

const content = isTS
  ? `import type { Request, Response } from "express";
import { ${serviceName} } from "@/services/${fileName}.service";

export const ${instanceName}Controller = {
  async getAll(_req: Request, res: Response) {
    const items = await ${serviceName}.findAll();
    res.sendSuccess(items);
  },

  async getById(req: Request, res: Response) {
    const item = await ${serviceName}.findById(req.params.id);
    res.sendSuccess(item);
  },

  async create(req: Request, res: Response) {
    const item = await ${serviceName}.create(req.body);
    res.sendSuccess(item, "${controllerName} created", 201);
  },
};
`
  : `import { ${serviceName} } from "@/services/${fileName}.service";

export const ${instanceName}Controller = {
  async getAll(_req, res) {
    const items = await ${serviceName}.findAll();
    res.sendSuccess(items);
  },

  async getById(req, res) {
    const item = await ${serviceName}.findById(req.params.id);
    res.sendSuccess(item);
  },

  async create(req, res) {
    const item = await ${serviceName}.create(req.body);
    res.sendSuccess(item, "${controllerName} created", 201);
  },
};
`;

await mkdir(resolve(process.cwd(), "server", "src", "controllers"), {
  recursive: true,
});
await writeFile(controllerPath, content, "utf-8");
console.log(`Controller created: server/src/controllers/${fileName}.controller.${ext()}`);
