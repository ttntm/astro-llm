import fs from "node:fs";
import path from "node:path";
import type { LLMConfig } from "../types.js";

const CONFIG_FILENAME = "llm.config.json";

/**
 * Default config written on first run.
 *
 * IMPORTANT:
 * - Must fully satisfy LLMConfig
 * - Must be explicit
 * - Must contain NO magic defaults
 * - Must NEVER diverge from types.ts
 */
const DEFAULT_CONFIG: LLMConfig = {
  /**
   * Master switch
   */
  enabled: true,

  /**
   * Output behaviour
   */
  output: {
    format: "txt",
    filename: "llm.txt"
  },

  /**
   * Content inclusion rules
   */
  include: {
    pages: true,
    headings: true,
    paragraphs: true,
    lists: true,
    tables: false,
    codeBlocks: false,

    meta: {
      title: true,
      description: true,
      keywords: false
    }
  },

  /**
   * Hard exclusions
   */
  exclude: {
    paths: [],
    selectors: []
  },

  /**
   * Safety & sanitisation
   */
  safety: {
    stripEmails: true,
    stripPhoneNumbers: true,
    stripForms: true,
    stripScripts: true
  },

  /**
   * Declared intent
   * (future guardrails)
   */
  purpose: {
    llmTraining: false,
    ragIndexing: true,
    chatGrounding: true
  }
};

/**
 * Ensure llm.config.json exists in project root.
 *
 * Behaviour:
 * - Creates file only if missing
 * - NEVER overwrites
 * - NEVER throws
 * - NEVER blocks dev or build
 */
export function ensureConfigFile(): void {
  const projectRoot = process.cwd();
  const configPath = path.join(projectRoot, CONFIG_FILENAME);

  if (fs.existsSync(configPath)) {
    return;
  }

  try {
    fs.writeFileSync(
      configPath,
      JSON.stringify(DEFAULT_CONFIG, null, 2),
      { encoding: "utf-8", flag: "wx" }
    );

    console.log(
      `[astro-llm] created ${CONFIG_FILENAME} — edit this file to customise LLM output`
    );
  } catch (err) {
    // HARD SAFETY:
    // Never break dev/build
    console.warn(
      "[astro-llm] failed to create config file (non-fatal)",
      err
    );
  }
}