#!/bin/bash

# Default values
output_file="collected_code.txt"
search_dir="."
extensions=("\.py" ".sh" ".yml" "\.yaml" "\.js" "\.jsx" "\.java" "\.cpp" "\.c" "\.h" "\.hpp" "\.cs" "\.html" "\.css" "\.tsx" "\.ts" "\.go" "\.rb" "\.php" "\.scala" "\.rs" "\.swift" "")
exclude_patterns=()
default_excludes=(
    ".git" ".svn" ".hg" 
    "node_modules" "vendor" "build" "dist" "target"
    "__pycache__" "*.pyc" "venv" ".env" ".venv" 
    "*_test.go" "*.test.js" "*_spec.rb" "*Test.java" "*_test.py"
    ".idea" ".vscode" ".vs" "*.swp" "*.swo"
    "*.log" "*.lock" "*.tmp"
    "docs" "*.md" "*.txt"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Help message
show_help() {
    cat << EOF
${BOLD}CodeCollect - Code Collection Tool for LLM Processing${NC}
A tool to gather source code files into a single, LLM-friendly document.

${BOLD}SYNOPSIS${NC}
    codecollect [OPTIONS]

${BOLD}DESCRIPTION${NC}
    Collects code files from a directory and its subdirectories into a single
    structured text file, formatted specifically for easy LLM (Language Model) processing.
    Automatically excludes common non-source files and provides various filtering options.

${BOLD}OPTIONS${NC}
    ${YELLOW}-d${NC} <directory>    Directory to search (default: current directory)
    ${YELLOW}-o${NC} <file>         Output file name (default: collected_code.txt)
    ${YELLOW}-e${NC} <extensions>   Comma-separated list of file extensions to include
    ${YELLOW}-x${NC} <patterns>     Comma-separated list of patterns to exclude
    ${YELLOW}-a${NC}                Include all files (override default exclusions)
    ${YELLOW}-q${NC}                Quiet mode (minimal output)
    ${YELLOW}-h${NC}                Show this help message

${BOLD}OUTPUT FORMAT${NC}
    The output file is structured in sections:
    • <METADATA>      - Collection information and settings
    • <FILE_LIST>     - Inventory of all processed files
    • <STATISTICS>    - Summary of collection results
    • <CODE_CONTENTS> - The actual source code with clear markers

${BOLD}DEFAULT EXTENSIONS${NC}
    Common programming languages:
    • Backend:    .py, .java, .cpp, .c, .go, .rb, .php, .scala, .rs
    • Frontend:   .js, .ts, .tsx, .html, .css
    • Headers:    .h, .hpp
    • Other:      .cs, .swift

${BOLD}DEFAULT EXCLUSIONS${NC}
    Common patterns automatically excluded:
    • Version Control:  .git, .svn, .hg
    • Dependencies:    node_modules, vendor, build, dist, target
    • Virtual Envs:    venv, .env, .venv
    • Cache:           __pycache__, *.pyc
    • Test Files:      *_test.*, *.test.*, *_spec.*
    • IDE/Editor:      .idea, .vscode, .vs, *.swp
    • Temporary:       *.log, *.lock, *.tmp
    • Documentation:   docs, *.md, *.txt

${BOLD}EXAMPLES${NC}
    1. Basic usage (current directory):
       ${BLUE}codecollect${NC}

    2. Collect from specific directory:
       ${BLUE}codecollect -d /path/to/project${NC}

    3. Custom output file:
       ${BLUE}codecollect -o project_code.txt${NC}

    4. Specific file extensions only:
       ${BLUE}codecollect -e .py,.js,.tsx${NC}

    5. Exclude specific patterns:
       ${BLUE}codecollect -x "build,*.test.js,config.py"${NC}

    6. Include all files (no default exclusions):
       ${BLUE}codecollect -a -d /path/to/project${NC}

    7. Quiet mode with custom settings:
       ${BLUE}codecollect -q -d /path/to/project -o output.txt -e .py,.js${NC}

${BOLD}OUTPUT STRUCTURE${NC}
    Example output format:
    ${GREEN}<METADATA>
    collection_date: 2024-11-08
    collection_time: 14:30:00 UTC
    source_directory: /path/to/source
    ...
    </METADATA>

    <FILE_LIST>
    - file_path: src/main.py
      extension: py
      line_count: 150
    ...
    </FILE_LIST>${NC}

${BOLD}NOTES${NC}
    • File paths are stored relative to the search directory
    • All timestamps are in UTC
    • Code sections are clearly marked with BEGIN_CODE and END_CODE
    • Output is formatted for optimal LLM processing
    • Large repositories might take some time to process

EOF
}
# Initialize JSON content
json_content=""

# Process command line arguments
use_default_excludes=true
quiet_mode=false

while getopts "d:e:x:aq" opt; do
    case $opt in
        d) search_dir="$OPTARG"
           [ ! -d "$search_dir" ] && echo "Error: Directory '$search_dir' does not exist" && exit 1
           ;;
        e) IFS=',' read -ra extensions <<< "$OPTARG"
           for i in "${!extensions[@]}"; do
               extensions[$i]="\\${extensions[$i]}"
           done
           ;;
        x) IFS=',' read -ra custom_excludes <<< "$OPTARG"
           exclude_patterns+=("${custom_excludes[@]}")
           ;;
        a) use_default_excludes=false;;
        q) quiet_mode=true;;
        h) show_help; exit 0;;
        ?) show_help; exit 1;;
    esac
done

# Add default excludes if not disabled
if [ "$use_default_excludes" = true ]; then
    exclude_patterns+=("${default_excludes[@]}")
fi

# Build find command
find_cmd="find \"$search_dir\""
for pattern in "${exclude_patterns[@]}"; do
    if [[ $pattern == *"*"* ]]; then
        find_cmd+=" -name \"$pattern\" -prune -o"
    else
        find_cmd+=" -name \"$pattern\" -prune -o"
        find_cmd+=" -path \"*/$pattern\" -prune -o"
        find_cmd+=" -path \"*/$pattern/*\" -prune -o"
    fi
done

extension_pattern=$(printf "|%s" "${extensions[@]}")
extension_pattern="(${extension_pattern:1})"
find_cmd+=" -type f -regextype posix-extended -regex \".*${extension_pattern}$\" -print"

# Create metadata section
json_content+="<METADATA>\n"
json_content+="collection_date: $(date -u '+%Y-%m-%d')\n"
json_content+="collection_time: $(date -u '+%H:%M:%S UTC')\n"
json_content+="source_directory: $(realpath "$search_dir")\n"
json_content+="excluded_patterns: ${exclude_patterns[*]}\n"
json_content+="file_extensions: ${extensions[*]}\n"
json_content+="</METADATA>\n\n<FILE_LIST>\n"

# Initialize counters
total_files=0
total_lines=0

# First pass - collect file list
while IFS= read -r file; do
    relative_path="${file#$search_dir/}"
    extension="${file##*.}"
    lines=$(wc -l < "$file")
    total_files=$((total_files + 1))
    total_lines=$((total_lines + lines))
    json_content+="- file_path: $relative_path\n"
done < <(eval "$find_cmd")

json_content+="</FILE_LIST>\n\n<STATISTICS>\n"
json_content+="total_files: $total_files\n"
json_content+="total_lines: $total_lines\n"
json_content+="</STATISTICS>\n\n<CODE_CONTENTS>\n"

# Second pass - collect code
while IFS= read -r file; do
    relative_path="${file#$search_dir/}"
    if [ "$quiet_mode" = false ]; then
        echo "Processing: $relative_path"
    fi
    
    json_content+="--- FILE: $relative_path ---\n"
    json_content+="LANGUAGE: ${file##*.}\n"
    json_content+="BEGIN_CODE\n"
    json_content+="$(jq -Rs . < "$file")\n"  # jq is used here to escape file content properly
    json_content+="END_CODE\n\n"
done < <(eval "$find_cmd")

# Close the code contents section
json_content+="</CODE_CONTENTS>"

# Convert to JSON structure and send
json_payload=$(jq -n --arg content "$json_content" '{"content": $content}')
curl -X POST http://localhost:4000/api/text -H "Content-Type: application/json" -d "$json_payload"

if [ "$quiet_mode" = false ]; then
    echo "Collection and transmission complete: $total_files files, $total_lines lines"
f