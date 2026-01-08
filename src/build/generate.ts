import fs from "node:fs";
import path from "node:path";
import type { LLMConfig } from "../types.js";

type GenerateArgs = {
  outDir: string;
  config: LLMConfig;
};

/**
 * Entry point for LLM context generation.
 *
 * - Scans built HTML only
 * - Applies exclusions + safety
 * - Emits a single deterministic output file
 */
export function generateLLMContext({
  outDir,
  config
}: GenerateArgs): void {
  if (!fs.existsSync(outDir)) return;

  const htmlFiles: string[] = [];
  collectHtmlFiles(outDir, htmlFiles);

  const sections: string[] = [];

  for (const file of htmlFiles) {
    const relativePath =
      "/" + path.relative(outDir, file).replace(/\\/g, "/");

    if (shouldExcludePath(relativePath, config)) {
      continue;
    }

    const html = fs.readFileSync(file, "utf-8");
    const extracted = extractText(html, config);

    if (!extracted.trim()) continue;

    sections.push(
      `---\nPATH: ${relativePath}\n---\n${extracted.trim()}`
    );
  }

  if (sections.length === 0) return;

  const outputPath = path.join(outDir, config.output.filename);
  const finalOutput =
    config.output.format === "json"
      ? JSON.stringify({ documents: sections }, null, 2)
      : sections.join("\n\n");

  try {
    fs.writeFileSync(outputPath, finalOutput, "utf-8");
    console.log(`[astro-llm] wrote ${config.output.filename}`);
  } catch (err) {
    console.error("[astro-llm] failed to write output file", err);
  }
}

/* =================================================
   Helpers
================================================= */

function collectHtmlFiles(dir: string, results: string[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collectHtmlFiles(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      results.push(fullPath);
    }
  }
}

function shouldExcludePath(
  pathName: string,
  config: LLMConfig
): boolean {
  return config.exclude.paths.some(prefix =>
    pathName.startsWith(prefix)
  );
}

/**
 * Extract readable text from HTML according to config.
 */
function extractText(html: string, config: LLMConfig): string {
  let output = html;

  /* ---------------------------------------------
     Selector-based exclusion
  --------------------------------------------- */
  for (const selector of config.exclude.selectors) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `<[^>]*class=["'][^"']*${escaped}[^"']*["'][^>]*>[\\s\\S]*?<\\/[^>]+>`,
      "gi"
    );
    output = output.replace(regex, "");
  }

  /* ---------------------------------------------
     Safety stripping
  --------------------------------------------- */
  if (config.safety.stripScripts) {
    output = output.replace(
      /<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi,
      ""
    );
  }

  if (config.safety.stripForms) {
    output = output.replace(
      /<form[^>]*>[\s\S]*?<\/form>/gi,
      ""
    );
  }

  /* ---------------------------------------------
     Meta extraction
  --------------------------------------------- */
  let metaText = "";
  if (config.include.meta.title) {
    const match = output.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (match) metaText += match[1] + " ";
  }

  if (config.include.meta.description) {
    const match = output.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
    );
    if (match) metaText += match[1] + " ";
  }

  if (config.include.meta.keywords) {
    const match = output.match(
      /<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/i
    );
    if (match) metaText += match[1] + " ";
  }

  /* ---------------------------------------------
     Remove all HTML tags
  --------------------------------------------- */
  output = output.replace(/<[^>]+>/g, " ");

  /* ---------------------------------------------
     Entity decoding
  --------------------------------------------- */
  output = output
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  /* ---------------------------------------------
     Safety filters
  --------------------------------------------- */
  if (config.safety.stripEmails) {
    output = output.replace(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      "[email removed]"
    );
  }

  if (config.safety.stripPhoneNumbers) {
    output = output.replace(
      /\+?\d[\d\s\-().]{7,}\d/g,
      "[phone removed]"
    );
  }

  /* ---------------------------------------------
     Final normalisation
  --------------------------------------------- */
  output = (metaText + output)
    .replace(/\s+/g, " ")
    .trim();

  return output;
}