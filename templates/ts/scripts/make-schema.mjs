import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";
import { pascalCase, camelCase, kebabCase, ext } from "./_utils.mjs";

const name = process.argv[2];
if (!name) {
  console.error("Usage: npm run make:schema <Name>");
  process.exit(1);
}

const schemaName = pascalCase(name);
const instanceName = camelCase(name);
const fileName = kebabCase(name);
const isTS = ext() === "ts";

const schemaPath = resolve(
  process.cwd(),
  "server",
  "src",
  "schemas",
  `${fileName}.schema.${ext()}`,
);

const content = isTS
  ? `import { z } from "zod";

export const create${schemaName}Schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export const update${schemaName}Schema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email").optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, "${schemaName} ID is required"),
});
`
  : `import { z } from "zod";

export const create${schemaName}Schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export const update${schemaName}Schema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email").optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, "${schemaName} ID is required"),
});
`;

await mkdir(resolve(process.cwd(), "server", "src", "schemas"), {
  recursive: true,
});
await writeFile(schemaPath, content, "utf-8");
console.log(`Schema created: server/src/schemas/${fileName}.schema.${ext()}`);
