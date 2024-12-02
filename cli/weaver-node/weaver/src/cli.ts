#!/usr/bin/env node
import { program } from "commander";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Config } from "./types.js";
import { DEFAULT_CONFIG } from "./constants.js";
import { main } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function setupCLI(): Config {
  program
    .option("-d, --dir <directory>", "Search directory", ".")
    .option("-o, --output <file>", "Output filename")
    .option(
      "-e, --extensions <list>",
      "File extensions to include (comma-separated)"
    )
    .option(
      "-x, --exclude <patterns>",
      "Additional patterns to exclude (comma-separated)"
    )
    .option("-a, --all", "Disable default exclusions")
    .option("-q, --quiet", "Quiet mode - suppress progress messages")
    .option(
      "-c, --concurrency <number>",
      "Number of concurrent file operations",
      "4"
    )
    .option("--skip-upload", "Skip uploading to server")
    .option("--api-endpoint <url>", "Custom API endpoint")
    .option("--format <type>", "Output format (json or text)", "text")
    .parse(process.argv);

  const options = program.opts();

  return {
    outputFile: options.output,
    searchDir: options.dir,
    extensions: options.extensions
      ? options.extensions.split(",")
      : DEFAULT_CONFIG.extensions,
    excludePatterns: options.exclude ? options.exclude.split(",") : [],
    useDefaultExcludes: !options.all,
    quietMode: options.quiet || false,
    concurrency: parseInt(options.concurrency, 10),
    skipUpload: options.skipUpload || false,
    apiEndpoint: options.apiEndpoint || DEFAULT_CONFIG.apiEndpoint,
    format: options.format as "json" | "text",
  };
}

// Immediately execute main when run as CLI
if (import.meta.url === `file://${__filename}`) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
