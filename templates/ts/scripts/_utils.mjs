import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { resolve } from "path";

export function kebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function camelCase(str) {
  const kebab = kebabCase(str);
  return kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

export function pascalCase(str) {
  const camel = camelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

export function detectLanguage() {
  const root = process.cwd();
  const tsServer = resolve(root, "server/tsconfig.json");
  return existsSync(tsServer) ? "ts" : "js";
}

export function ext() {
  return detectLanguage() === "ts" ? "ts" : "js";
}

export function tsxExt() {
  return detectLanguage() === "ts" ? "tsx" : "jsx";
}

export function ensureDir(path) {
  const { mkdir } = require?.("fs/promises") ?? import("fs/promises");
}

export async function pathExists(filePath) {
  return existsSync(filePath);
}
