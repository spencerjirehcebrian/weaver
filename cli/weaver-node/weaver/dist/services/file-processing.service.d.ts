import { Config, ProcessedFile } from "../types.js";
export declare class FileProcessingService {
    private readonly config;
    private readonly execAsync;
    constructor(config: Config);
    findFiles(): Promise<string[]>;
    private buildExcludeArgs;
    private buildExtensionPattern;
    processFile(filePath: string): Promise<ProcessedFile>;
}
