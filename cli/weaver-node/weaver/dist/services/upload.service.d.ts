import { Config } from "../types.js";
export declare class UploadService {
    private readonly config;
    private readonly CHUNK_SIZE;
    constructor(config: Config);
    upload(content: string): Promise<void>;
    private splitIntoChunks;
    private uploadChunks;
}
