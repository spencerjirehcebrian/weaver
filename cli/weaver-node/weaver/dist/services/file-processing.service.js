import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import { DEFAULT_CONFIG } from "../constants.js";
export class FileProcessingService {
    constructor(config) {
        this.config = config;
        this.execAsync = promisify(exec);
    }
    async findFiles() {
        try {
            // Log the search directory for debugging
            console.log(`Searching in directory: ${this.config.searchDir}`);
            const excludeArgs = this.buildExcludeArgs();
            const extensionPattern = this.buildExtensionPattern();
            // Changed the find command to be more compatible and added error checking
            const cmd = `find "${this.config.searchDir}" -type f ${excludeArgs} \\( ${extensionPattern} \\)`;
            console.log(`Executing command: ${cmd}`); // Debug log
            const { stdout, stderr } = await this.execAsync(cmd);
            if (stderr) {
                console.error(`Find command stderr: ${stderr}`);
            }
            const files = stdout.trim().split("\n").filter(Boolean);
            console.log(`Found ${files.length} files`); // Debug log
            return files;
        }
        catch (error) {
            console.error(`Error finding files: ${error}`);
            throw error;
        }
    }
    buildExcludeArgs() {
        const patterns = this.config.excludePatterns.concat(this.config.useDefaultExcludes ? DEFAULT_CONFIG.excludePatterns : []);
        return patterns.map((pattern) => `-not -path "*${pattern}*"`).join(" ");
    }
    buildExtensionPattern() {
        return this.config.extensions.map((ext) => `-name "*.${ext}"`).join(" -o ");
    }
    async processFile(filePath) {
        try {
            const content = await fs.promises.readFile(filePath, "utf8");
            const stats = await fs.promises.stat(filePath);
            return {
                path: filePath,
                content,
                lines: content.split("\n").length,
                size: stats.size,
                extension: path.extname(filePath).slice(1),
            };
        }
        catch (error) {
            throw new Error(`Error processing ${filePath}: ${error}`);
        }
    }
}
