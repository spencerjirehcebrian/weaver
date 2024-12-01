import fetch from "node-fetch";
import { createSpinner } from "nanospinner";
import { Config } from "../types.js";

export class UploadService {
  private readonly CHUNK_SIZE = 1024 * 1024; // 1MB

  constructor(private readonly config: Config) {}

  async upload(content: string): Promise<void> {
    const chunks = this.splitIntoChunks(content);
    const spinner = createSpinner("Uploading content...").start();

    try {
      await this.uploadChunks(chunks);
      spinner.success({ text: "Upload complete" });
    } catch (error) {
      spinner.error({ text: "Upload failed" });
      throw error;
    }
  }

  private splitIntoChunks(content: string): string[] {
    const chunks = [];
    for (let i = 0; i < content.length; i += this.CHUNK_SIZE) {
      chunks.push(content.slice(i, i + this.CHUNK_SIZE));
    }
    return chunks;
  }

  private async uploadChunks(chunks: string[]): Promise<void> {
    for (let i = 0; i < chunks.length; i++) {
      try {
        const response = await fetch(this.config.apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: chunks[i] }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        throw new Error(`Error uploading chunk ${i + 1}: ${error}`);
      }
    }
  }
}
