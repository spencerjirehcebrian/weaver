import { Config, Metadata, Statistics } from "../types.js";
import { FileProcessingService } from "./file-processing.service.js";
export declare class DataCollectionService {
    private readonly fileService;
    private readonly config;
    constructor(fileService: FileProcessingService, config: Config);
    collect(): Promise<{
        metadata: Metadata;
        statistics: Statistics;
        contents: string;
    }>;
    private processFilesWithProgress;
    private processFilesInParallel;
    private calculateStatistics;
    private generateMetadata;
    private formatContents;
}
