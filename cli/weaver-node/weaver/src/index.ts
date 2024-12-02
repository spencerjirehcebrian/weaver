import { promises as fs } from "fs";
import chalk from "chalk";
import { FileProcessingService } from "./services/file-processing.service.js";
import { DataCollectionService } from "./services/data-collection.service.js";
import { UploadService } from "./services/upload.service.js";
import { setupCLI } from "./cli.js";

export async function main(): Promise<void> {
  try {
    const config = setupCLI();
    const fileService = new FileProcessingService(config);
    const dataService = new DataCollectionService(fileService, config);
    const uploadService = new UploadService(config);

    const { metadata, statistics, contents } = await dataService.collect();

    // Generate file list from contents
    const fileList = contents
      .split("--- FILE: ")
      .slice(1) // Skip first empty element
      .map((section) => section.split(" ---")[0])
      .join("\n  - ");

    const output =
      config.format === "json"
        ? JSON.stringify({ metadata, statistics, contents }, null, 2)
        : [
            "================================================================",
            "METADATA",
            "================================================================",
            `Collection Date: ${metadata.collection_date}`,
            `Collection Time: ${metadata.collection_time}`,
            `Source Directory: ${metadata.source_directory}`,
            // "\nExcluded Patterns:",
            // metadata.excluded_patterns
            //   .map((pattern) => `  - ${pattern}`)
            //   .join("\n"),
            "\nFile Extensions:",
            metadata.file_extensions.map((ext) => `  - ${ext}`).join("\n"),
            "\nSystem Information:",
            `  Platform: ${metadata.system_info.platform}`,
            `  CPU Cores: ${metadata.system_info.cores}`,
            `  Memory: ${metadata.system_info.memory}`,
            "\n================================================================",
            "FILE LIST",
            "================================================================",
            `  - ${fileList}`,
            "\n================================================================",
            "STATISTICS",
            "================================================================",
            `Total Files: ${statistics.total_files}`,
            `Total Lines: ${statistics.total_lines}`,
            "\nFile Sizes by Extension:",
            Object.entries(statistics.file_sizes)
              .map(([ext, size]) => `  ${ext}: ${size} bytes`)
              .join("\n"),
            "\nLanguage Distribution:",
            Object.entries(statistics.language_distribution)
              .map(([lang, count]) => `  ${lang}: ${count} files`)
              .join("\n"),
            "\n================================================================",
            "CODE CONTENTS",
            "================================================================",
            contents,
          ].join("\n");

    // Only write to file if outputFile is specified
    if (config.outputFile) {
      await fs.writeFile(config.outputFile, output);
    } else if (!config.quietMode) {
      // If no file output is specified and not in quiet mode, print to console
      console.log("Uploading to server...");
    }

    if (!config.skipUpload) {
      await uploadService.upload(output);
    }

    if (!config.quietMode) {
      const summary = [
        "\nCollection complete:",
        `- Total files: ${statistics.total_files}`,
        `- Total lines: ${statistics.total_lines}`,
      ];

      if (config.outputFile) {
        summary.push(`- Output saved to: ${config.outputFile}`);
      }

      console.log(chalk.green(summary.join("\n")));
    }
  } catch (error) {
    console.error(chalk.red("Error:"), error);
    process.exit(1);
  }
}
