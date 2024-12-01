import { promises as fs } from "fs";
import chalk from "chalk";
import { FileProcessingService } from "./services/file-processing.service.js";
import { DataCollectionService } from "./services/data-collection.service.js";
import { UploadService } from "./services/upload.service.js";
import { setupCLI } from "./cli.js";
export async function main() {
    try {
        const config = setupCLI();
        const fileService = new FileProcessingService(config);
        const dataService = new DataCollectionService(fileService, config);
        const uploadService = new UploadService(config);
        const { metadata, statistics, contents } = await dataService.collect();
        const output = config.format === "json"
            ? JSON.stringify({ metadata, statistics, contents }, null, 2)
            : [
                "<METADATA>",
                Object.entries(metadata)
                    .map(([key, value]) => `${key}: ${JSON.stringify(value, null, 2)}`)
                    .join("\n"),
                "</METADATA>\n",
                "<STATISTICS>",
                Object.entries(statistics)
                    .map(([key, value]) => `${key}: ${JSON.stringify(value, null, 2)}`)
                    .join("\n"),
                "</STATISTICS>\n",
                "<CODE_CONTENTS>",
                contents,
                "</CODE_CONTENTS>",
            ].join("\n");
        await fs.writeFile(config.outputFile, output);
        if (!config.skipUpload) {
            await uploadService.upload(output);
        }
        if (!config.quietMode) {
            console.log(chalk.green(`
Collection complete:
- Total files: ${statistics.total_files}
- Total lines: ${statistics.total_lines}
- Output saved to: ${config.outputFile}
      `));
        }
    }
    catch (error) {
        console.error(chalk.red("Error:"), error);
        process.exit(1);
    }
}
