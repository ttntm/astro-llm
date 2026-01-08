/**
 * LLM configuration contract.
 *
 * This is the SINGLE source of truth.
 * All config writing, reading, and validation must conform to this type.
 */

export type LLMConfig = {
  /**
   * Master switch.
   * If false, plugin does nothing.
   */
  enabled: boolean;

  /**
   * Output behaviour.
   */
  output: {
    /**
     * Output format.
     * - "txt"  → plain text
     * - "json" → structured machine-readable
     */
    format: "txt" | "json";

    /**
     * Output filename written to /dist.
     */
    filename: string;
  };

  /**
   * What content is included.
   */
  include: {
    pages: boolean;
    headings: boolean;
    paragraphs: boolean;
    lists: boolean;
    tables: boolean;
    codeBlocks: boolean;

    meta: {
      title: boolean;
      description: boolean;
      keywords: boolean;
    };
  };

  /**
   * Hard exclusions.
   */
  exclude: {
    /**
     * Path prefixes to skip.
     * Example: ["/admin", "/api"]
     */
    paths: string[];

    /**
     * CSS selectors to remove before processing.
     */
    selectors: string[];
  };

  /**
   * Safety & sanitisation.
   */
  safety: {
    stripEmails: boolean;
    stripPhoneNumbers: boolean;
    stripForms: boolean;
    stripScripts: boolean;
  };

  /**
   * Declared intent.
   * Used for future guardrails.
   */
  purpose: {
    llmTraining: boolean;
    ragIndexing: boolean;
    chatGrounding: boolean;
  };
};