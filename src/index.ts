#!/usr/bin/env node
import { intro, outro, cancel, text, select, confirm, spinner, isCancel } from "@clack/prompts";
import { cp, readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

type Options = {
  projectName: string;
  language: "ts" | "js";
  runtime: "node" | "bun";
  database: "postgresql" | "mysql" | "sqlite";
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
  initGit: boolean;
  installDeps: boolean;
};

type AdapterConfig = {
  pkg: string;
  driver: string;
  importSpec: string;
  init: string;
};

const adapterMap: Record<string, AdapterConfig> = {
  postgresql: {
    pkg: "@prisma/adapter-pg",
    driver: "pg",
    importSpec: "{ PrismaPg }",
    init: "new PrismaPg({ connectionString: process.env.DATABASE_URL })",
  },
  mysql: {
    pkg: "@prisma/adapter-mysql",
    driver: "mysql2",
    importSpec: "{ PrismaMySql }",
    init: "new PrismaMySql({ connectionString: process.env.DATABASE_URL })",
  },
  sqlite: {
    pkg: "@prisma/adapter-libsql",
    driver: "@libsql/client",
    importSpec: "{ PrismaLibSql }",
    init: "new PrismaLibSql({ url: process.env.DATABASE_URL })",
  },
};

function validateProjectName(value: string): string | undefined {
  if (value.length === 0) return "Project name is required";
  if (!/^[a-z0-9-_.]+$/i.test(value))
    return "Only letters, numbers, hyphens, dots, and underscores allowed";
  if (/^[._-]/.test(value)) return "Name cannot start with a special character";
}

async function promptUser(): Promise<Options> {
  const projectName = await text({
    message: "What is the name of your project?",
    placeholder: "my-app",
    defaultValue: "my-app",
    validate: validateProjectName,
  });
  if (isCancel(projectName)) {
    cancel("Cancelled");
    process.exit(0);
  }

  const language = await select({
    message: "Select a language",
    options: [
      { value: "ts", label: "TypeScript" },
      { value: "js", label: "JavaScript" },
    ],
  });
  if (isCancel(language)) {
    cancel("Cancelled");
    process.exit(0);
  }

  const runtime = await select({
    message: "Select a runtime",
    options: [
      { value: "node", label: "Node.js" },
      { value: "bun", label: "Bun" },
    ],
  });
  if (isCancel(runtime)) {
    cancel("Cancelled");
    process.exit(0);
  }

  const database = await select({
    message: "Select a database",
    options: [
      { value: "postgresql", label: "PostgreSQL" },
      { value: "mysql", label: "MySQL" },
      { value: "sqlite", label: "SQLite" },
    ],
  });
  if (isCancel(database)) {
    cancel("Cancelled");
    process.exit(0);
  }

  const packageManager = await select({
    message: "Select a package manager",
    options: [
      { value: "npm", label: "npm" },
      { value: "yarn", label: "yarn" },
      { value: "pnpm", label: "pnpm" },
      { value: "bun", label: "bun" },
    ],
  });
  if (isCancel(packageManager)) {
    cancel("Cancelled");
    process.exit(0);
  }

  const initGit = await confirm({
    message: "Initialize a git repository?",
    initialValue: true,
  });
  if (isCancel(initGit)) {
    cancel("Cancelled");
    process.exit(0);
  }

  const installDeps = await confirm({
    message: "Install dependencies?",
    initialValue: true,
  });
  if (isCancel(installDeps)) {
    cancel("Cancelled");
    process.exit(0);
  }

  return {
    projectName: projectName as string,
    language: language as Options["language"],
    runtime: runtime as Options["runtime"],
    database: database as Options["database"],
    packageManager: packageManager as Options["packageManager"],
    initGit: initGit as boolean,
    installDeps: installDeps as boolean,
  };
}

function buildTokens(options: Options): Record<string, string> {
  const isTS = options.language === "ts";
  const isBun = options.runtime === "bun";
  const ext = isTS ? "ts" : "js";
  const tsxExt = isTS ? "tsx" : "jsx";
  const adapter = adapterMap[options.database];

  const pkgInstall: Record<string, string> = {
    npm: "npm install",
    yarn: "yarn",
    pnpm: "pnpm install",
    bun: "bun install",
  };

  const pkgRun: Record<string, string> = {
    npm: "npm run",
    yarn: "yarn",
    pnpm: "pnpm",
    bun: "bun run",
  };

  let serverDev: string;
  let serverBuild: string;
  let serverStart: string;
  let moduleAliasImport: string;

  if (isBun) {
    serverDev = `bun --watch src/index.${ext}`;
    serverBuild = isTS ? `bun build src/index.${ext} --outdir dist --target bun` : "";
    serverStart = `bun run src/index.${ext}`;
    moduleAliasImport = "";
  } else if (isTS) {
    serverDev = `tsx watch src/index.${ext}`;
    serverBuild = `tsup src/index.${ext} --format esm --clean`;
    serverStart = `node dist/index.js`;
    moduleAliasImport = "";
  } else {
    serverDev = `node --watch --import module-alias/register src/index.${ext}`;
    serverBuild = "";
    serverStart = `node --import module-alias/register src/index.${ext}`;
    moduleAliasImport = "import 'module-alias/register';";
  }

  return {
    __PROJECT_NAME__: options.projectName,
    __DATABASE_PROVIDER__: options.database,
    __ADAPTER_PACKAGE__: adapter.pkg,
    __DRIVER_PACKAGE__: adapter.driver,
    __ADAPTER_IMPORT__: adapter.importSpec,
    __ADAPTER_INIT__: adapter.init,
    __RUNTIME__: options.runtime,
    __EXT__: ext,
    __TSX_EXT__: tsxExt,
    __PKG_MANAGER__: options.packageManager,
    __PKG_INSTALL__: pkgInstall[options.packageManager],
    __PKG_RUN__: pkgRun[options.packageManager],
    __SERVER_DEV__: serverDev,
    __SERVER_BUILD__: serverBuild,
    __SERVER_START__: serverStart,
    __MODULE_ALIAS_IMPORT__: moduleAliasImport,
  };
}

async function replaceTokens(dir: string, tokens: Record<string, string>): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules") continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await replaceTokens(fullPath, tokens);
    } else {
      let content = await readFile(fullPath, "utf-8");
      for (const [key, value] of Object.entries(tokens)) {
        content = content.replaceAll(key, value);
      }
      await writeFile(fullPath, content, "utf-8");
    }
  }
}

async function main() {
  intro("create-rexp");

  const options = await promptUser();
  const tokens = buildTokens(options);

  const templateDir = join(__dirname, "..", "templates", options.language);
  const targetDir = join(process.cwd(), options.projectName);

  if (!existsSync(templateDir)) {
    console.error(`Template directory not found: ${templateDir}`);
    process.exit(1);
  }

  if (existsSync(targetDir)) {
    const overwrite = await confirm({
      message: `Directory "${options.projectName}" already exists. Overwrite?`,
      initialValue: false,
    });
    if (isCancel(overwrite)) {
      cancel("Cancelled");
      process.exit(0);
    }
    if (!overwrite) {
      cancel("Aborted");
      process.exit(0);
    }
  }

  const s = spinner();

  s.start("Scaffolding project...");
  await cp(templateDir, targetDir, { recursive: true, force: true });
  await replaceTokens(targetDir, tokens);
  s.stop("Project scaffolded");

  if (options.initGit) {
    s.start("Initializing git repository...");
    try {
      execSync("git init", { cwd: targetDir, stdio: "pipe" });
      s.stop("Git repository initialized");
    } catch {
      s.stop("Warning: could not initialize git repository");
    }
  }

  if (options.installDeps) {
    s.start("Installing dependencies...");
    try {
      execSync(tokens.__PKG_INSTALL__, { cwd: targetDir, stdio: "inherit", timeout: 120000 });
      s.stop("Dependencies installed");
    } catch {
      s.stop("Warning: could not install all dependencies");
      console.log(`  Run "${tokens.__PKG_INSTALL__}" inside "${options.projectName}" manually`);
    }
  }

  outro(`
  ${options.projectName} ready!

  ${tokens.__PKG_RUN__} dev`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
