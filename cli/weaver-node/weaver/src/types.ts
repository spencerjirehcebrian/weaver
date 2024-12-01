export interface Metadata {
  collection_date: string;
  collection_time: string;
  source_directory: string;
  excluded_patterns: string[];
  file_extensions: string[];
  system_info: {
    platform: string;
    cores: number;
    memory: string;
  };
}

export interface Statistics {
  total_files: number;
  total_lines: number;
  file_sizes: { [key: string]: number };
  language_distribution: { [key: string]: number };
}

export interface Config {
  outputFile: string;
  searchDir: string;
  extensions: string[];
  excludePatterns: string[];
  useDefaultExcludes: boolean;
  quietMode: boolean;
  concurrency: number;
  skipUpload: boolean;
  apiEndpoint: string;
  format: "json" | "text";
}

export interface ProcessedFile {
  path: string;
  content: string;
  lines: number;
  size: number;
  extension: string;
}


