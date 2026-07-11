import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";
import { pascalCase, kebabCase, tsxExt } from "./_utils.mjs";

const name = process.argv[2];
if (!name) {
  console.error("Usage: npm run make:view <Name>");
  process.exit(1);
}

const viewName = pascalCase(name);
const fileName = kebabCase(name);
const compExt = tsxExt();
const viewPath = resolve(
  process.cwd(),
  "client",
  "src",
  "components",
  `${fileName}.${compExt}`,
);

const content = compExt === "tsx"
  ? `function ${viewName}() {
  return <div>${viewName}</div>;
}

export default ${viewName};
`
  : `function ${viewName}() {
  return <div>${viewName}</div>;
}

export default ${viewName};
`;

await mkdir(resolve(process.cwd(), "client", "src", "components"), {
  recursive: true,
});
await writeFile(viewPath, content, "utf-8");
console.log(`View created: client/src/components/${fileName}.${compExt}`);
