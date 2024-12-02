# Weavyr

The CLI tool of the weavyr project. A modern, real-time code collection and collaboration tool that helps developers gather, and share code snippets, directories and repositories across their development environment. Meant to be used for feeding context and code to LLMs for better results. Heavily inspired by Repomix.

## Installation

Install globally via npm:

```bash
npm install -g weavyr
```

## Features

- Scans directories recursively for code files
- Supports multiple file extensions
- Generates detailed statistics about your codebase
- Concurrent file processing for better performance
- Configurable exclusion patterns
- Output in JSON or text format
- Optional server upload functionality
- Progress indicators and detailed logging

## Usage

Basic usage:

```bash
weavyr
```

This will scan the specified directory and upload the code to the weavyr platform.

View the code at [weavyr.spencerjireh.com](https://weavyr.spencerjireh.com/)

### Command Line Options

- `-d, --dir <directory>` - Directory to scan (default: current directory)
- `-o, --output <file>` - Output filename (default: collected_code.txt)
- `-e, --extensions <list>` - File extensions to include (comma-separated)
- `-x, --exclude <patterns>` - Additional patterns to exclude (comma-separated)
- `-a, --all` - Disable default exclusions
- `-q, --quiet` - Suppress progress messages
- `-c, --concurrency <number>` - Number of concurrent file operations (default: 4)
- `--skip-upload` - Skip uploading to server
- `--api-endpoint <url>` - Custom API endpoint
- `--format <type>` - Output format (json or text, default: json)

### Examples

Scan a specific directory:

```bash
weaver --dir /path/to/project
```

Specify custom file extensions:

```bash
weaver --dir . --extensions js,ts,py
```

Change output format to text:

```bash
weaver --dir . --format text
```

Exclude additional patterns:

```bash
weaver --dir . --exclude tests,docs
```

Skip upload and increase concurrency:

```bash
weaver --dir . --skip-upload --concurrency 8
```

## Default Configuration

### Supported File Extensions

- JavaScript (js, jsx)
- TypeScript (ts, tsx)
- Python (py)
- Java (java)
- C/C++ (c, cpp, h, hpp)
- C# (cs)
- Go (go)
- Ruby (rb)
- PHP (php)
- Scala (scala)
- Rust (rs)
- Swift (swift)
- Web (html, css)
- Shell scripts (sh)
- YAML (yml, yaml)

### Default Exclusions

- Version control directories (.git, .svn, .hg)
- Dependencies (node_modules, vendor)
- Build directories (build, dist, target)
- Cache directories (**pycache**, .next)
- Environment files (.env, .venv)
- Lock files (package-lock.json)
- Compiled Python files (\*.pyc)

## Output Format

### JSON Format

```json
{
  "metadata": {
    "collection_date": "2024-12-01",
    "collection_time": "06:20:51 UTC",
    "source_directory": "/path/to/project",
    "excluded_patterns": [...],
    "file_extensions": [...],
    "system_info": {
      "platform": "linux",
      "cores": 8,
      "memory": "16GB"
    }
  },
  "statistics": {
    "total_files": 100,
    "total_lines": 5000,
    "file_sizes": {...},
    "language_distribution": {...}
  },
  "contents": "..."
}
```

### Text Format

```
<METADATA>
collection_date: "2024-12-01"
...
</METADATA>

<STATISTICS>
total_files: 100
...
</STATISTICS>

<CODE_CONTENTS>
...
</CODE_CONTENTS>
```

## Development

To build from source:

```bash
cd cli/weaver-node/weaver
npm install
npm run build
npm install -g .
```

## License

ISC

## Author

Spencer Jireh Cebrian
