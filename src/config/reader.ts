import fs from "node:fs";
import path from "node:path";
import type { LLMConfig } from "../types.js";

const CONFIG_FILENAME = "llm.config.json";

/**
 * Hard fallback config.
 *
 * Used when:
 * - config file is missing
 * - config file is invalid
 * - parsing fails
 *
 * MUST fully satisfy LLMConfig.
 */
const FALLBACK_CONFIG: LLMConfig = {
  enabled: false,

  output: {
    format: "txt",
    filename: "llm.txt"
  },

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

  exclude: {
    paths: [],
    selectors: []
  },

  safety: {
    stripEmails: true,
    stripPhoneNumbers: true,
    stripForms: true,
    stripScripts: true
  },

  purpose: {
    llmTraining: false,
    ragIndexing: true,
    chatGrounding: true
  }
};

/**
 * Load and normalise llm.config.json.
 *
 * Guarantees:
 * - Always returns a valid LLMConfig
 * - Never throws
 * - Never mutates user config
 * - Missing or invalid values fall back safely
 */
export function loadConfig(projectRoot: string = process.cwd()): LLMConfig {
  const configPath = path.join(projectRoot, CONFIG_FILENAME);

  if (!fs.existsSync(configPath)) {
    return FALLBACK_CONFIG;
  }

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw);

    return {
      ...FALLBACK_CONFIG,
      ...parsed,

      output: {
        ...FALLBACK_CONFIG.output,
        ...(parsed.output ?? {})
      },

      include: {
        ...FALLBACK_CONFIG.include,
        ...(parsed.include ?? {}),
        meta: {
          ...FALLBACK_CONFIG.include.meta,
          ...(parsed.include?.meta ?? {})
        }
      },

      exclude: {
        ...FALLBACK_CONFIG.exclude,
        ...(parsed.exclude ?? {})
      },

      safety: {
        ...FALLBACK_CONFIG.safety,
        ...(parsed.safety ?? {})
      },

      purpose: {
        ...FALLBACK_CONFIG.purpose,
        ...(parsed.purpose ?? {})
      }
    };
  } catch {
    // Invalid JSON → fail closed
    return FALLBACK_CONFIG;
  }
}
