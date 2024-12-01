import * as path from "path";
import * as os from "os";
import { from } from "rxjs";
import { map, mergeMap, toArray } from "rxjs/operators";
import { createSpinner } from "nanospinner";
import { Config, Metadata, Statistics, ProcessedFile } from "../types.js";
import { FileProcessingService } from "./file-processing.service.js";

export class DataCollectionService {
  constructor(
    private readonly fileService: FileProcessingService,
    private readonly config: Config
  ) {}

  async collect(): Promise<{
    metadata: Metadata;
    statistics: Statistics;
    contents: string;
  }> {
    const files = await this.fileService.findFiles();
    if (files.length === 0) {
      throw new Error("No matching files found");
    }

    const processedFiles = await this.processFilesWithProgress(files);
    const statistics = this.calculateStatistics(processedFiles);
    const metadata = this.generateMetadata();
    const contents = this.formatContents(processedFiles);

    return { metadata, statistics, contents };
  }

  private async processFilesWithProgress(
    files: string[]
  ): Promise<ProcessedFile[]> {
    const spinner = createSpinner("Processing files...").start();
    const processed = await this.processFilesInParallel(files);
    spinner.success({ text: "Files processed successfully" });
    return processed;
  }

  private processFilesInParallel(files: string[]): Promise<ProcessedFile[]> {
    return new Promise((resolve) => {
      from(files)
        .pipe(
          mergeMap(
            (file) => from(this.fileService.processFile(file)),
            this.config.concurrency
          ),
          toArray() // Collect all processed files into an array
        )
        .subscribe({
          next: (processedFiles) => resolve(processedFiles),
          error: (error) => {
            console.error("Error processing files:", error);
            resolve([]); // Return empty array on error instead of rejecting
          },
        });
    });
  }

  private calculateStatistics(files: ProcessedFile[]): Statistics {
    return {
      total_files: files.length,
      total_lines: files.reduce((acc, file) => acc + file.lines, 0),
      file_sizes: files.reduce(
        (acc: { [key: string]: number }, file) => ({
          ...acc,
          [file.extension]: (acc[file.extension] || 0) + file.size,
        }),
        {}
      ),
      language_distribution: files.reduce(
        (acc: { [key: string]: number }, file) => ({
          ...acc,
          [file.extension]: (acc[file.extension] || 0) + 1,
        }),
        {}
      ),
    };
  }

  private generateMetadata(): Metadata {
    return {
      collection_date: new Date().toISOString().split("T")[0],
      collection_time:
        new Date().toISOString().split("T")[1].split(".")[0] + " UTC",
      source_directory: path.resolve(this.config.searchDir),
      excluded_patterns: this.config.excludePatterns,
      file_extensions: this.config.extensions,
      system_info: {
        platform: os.platform(),
        cores: os.cpus().length,
        memory: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))}GB`,
      },
    };
  }

  private formatContents(files: ProcessedFile[]): string {
    return files
      .map((file) => {
        const relativePath = path.relative(this.config.searchDir, file.path);
        return [
          `--- FILE: ${relativePath} ---`,
          `LANGUAGE: ${file.extension}`,
          "BEGIN_CODE",
          file.content,
          "END_CODE\n",
        ].join("\n");
      })
      .join("\n");
  }
}
