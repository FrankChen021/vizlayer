import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function docsContentPlugin() {
  const virtualModuleId = "virtual:docs-content";
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;
  const docsRoot = path.resolve(__dirname, "../../docs");

  return {
    name: "vizlayer-docs-content",
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }

      return null;
    },
    load(id: string) {
      if (id !== resolvedVirtualModuleId) {
        return null;
      }

      const pages = readDocsPages(docsRoot);
      return `export const docs = ${JSON.stringify(pages)};`;
    },
  };
}

export default defineConfig({
  plugins: [react(), docsContentPlugin()],
  server: {
    fs: {
      allow: [path.resolve(__dirname, "../..")],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

function readDocsPages(root: string) {
  return walkMarkdown(root).map((filePath) => {
    const relativePath = path
      .relative(root, filePath)
      .replaceAll(path.sep, "/");
    const source = fs.readFileSync(filePath, "utf-8");
    const title = extractTitle(source, relativePath);
    const slug = relativePath.replace(/\.md$/i, "").replaceAll("/", "-");

    return {
      slug,
      title,
      body: source,
    };
  });
}

function walkMarkdown(root: string): string[] {
  if (!fs.existsSync(root)) {
    return [];
  }

  const files: string[] = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkMarkdown(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function extractTitle(source: string, fallbackPath: string) {
  const heading = source
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("# "));

  if (heading) {
    return heading.slice(2).trim();
  }

  return fallbackPath.replace(/\.md$/i, "");
}
