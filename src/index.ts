import type { AstroIntegration } from "astro";
import { ensureConfigFile } from "./config/writer.js";
import { loadConfig } from "./config/reader.js";
import { generateLLMContext } from "./build/generate.js";

export default function astroLLM(): AstroIntegration {
  return {
    name: "astro-llm",

    hooks: {
      /**
       * Runs once Astro config is loaded.
       * Ideal place to ensure config exists.
       */
      "astro:config:setup"() {
        ensureConfigFile();
      },

      /**
       * Runs after build completes.
       * Generates final LLM output using config.
       */
      "astro:build:done"({ dir }) {
        const config = loadConfig();
        if (!config.enabled) return;

        generateLLMContext({
          outDir: new URL(dir).pathname,
          config
        });
      }
    }
  };
}