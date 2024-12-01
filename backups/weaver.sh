#!/bin/bash

# Default values
output_file="collected_code.txt"
search_dir="."
extensions=("\.py" ".sh" ".yml" "\.yaml" "\.js" "\.jsx" "\.java" "\.cpp" "\.c" "\.h" "\.hpp" "\.cs" "\.html" "\.css" "\.tsx" "\.ts" "\.go" "\.rb" "\.php" "\.scala" "\.rs" "\.swift" "")
exclude_patterns=()
default_excludes=(
    ".git" ".svn" ".hg" "package-lock.json"
    "node_modules" "vendor" "build" "dist" "target" ".next"
    "__pycache__" "*.pyc" "venv" ".env" ".venv" 
    "*_test.go" "*.test.js" "*_spec.rb" "*Test.java" "*_test.py"
    ".idea" ".vscode" ".vs" "*.swp" "*.swo"
    "*.log" "*.lock" "*.tmp"
    "docs" "*.md" "*.txt" "*.ico" "*.png" "*.jpg" "*.jpeg" "*.gif" "*.svg" "*.bmp" "*.mp4" "*.mov" "*.avi" "*.mkv" "*.mp3" "*.wav" "*.ogg" "*.flac" "*.m4a" "*.webm" "*.wma" 
)

# ANSI color codes in variables for better maintainability
declare -A COLORS=(
    ["header"]=$'\033[1;36m'      # Cyan, bold
    ["section"]=$'\033[1;35m'     # Magenta, bold
    ["option"]=$'\033[0;32m'      # Green
    ["emphasis"]=$'\033[1m'       # Bold
    ["warning"]=$'\033[1;33m'     # Yellow, bold
    ["reset"]=$'\033[0m'          # Reset
)

# Function to wrap text at a specified width while preserving indentation
wrap_text() {
    local text="$1"
    local indent="$2"
    echo "$text" | fold -s -w 80 | sed "2,\$s/^/${indent}/"
}

show_help() {
    local script_name=$(basename "$0")
    local C="${COLORS[@]}"  # Short reference to colors
    
    # Common file extensions as an array for better maintenance
    local default_extensions=(
        py sh yml yaml js jsx java cpp c h hpp cs
        html css tsx ts go rb php scala rs swift
    )
    
    # Default exclusions as an array for better maintenance
    local default_exclusions=(
        ".git/" ".svn/" ".hg/"
        "node_modules/" "vendor/" "build/" "dist/" "target/"
        "__pycache__/" "*.pyc" "venv/" ".env" ".venv/"
        "*_test.go" "*.test.js" "*_spec.rb" "*Test.java" "*_test.py"
        ".idea/" ".vscode/" ".vs/" "*.swp" "*.swo"
        "*.log" "*.lock" "*.tmp"
        "docs/" "*.md" "*.txt" "images/" "audio/" "video/"
    )

    cat <<EOF
${COLORS[header]}Code Collection and Transmission Script${COLORS[reset]}

${COLORS[section]}DESCRIPTION${COLORS[reset]}
    $(wrap_text "Recursively collects code files from a directory and transmits them to a specified endpoint. Supports multiple file extensions, exclusion patterns, and includes metadata about the collection." "    ")

${COLORS[section]}USAGE${COLORS[reset]}
    $script_name [OPTIONS]

${COLORS[section]}OPTIONS${COLORS[reset]}
    ${COLORS[option]}-d${COLORS[reset]} <directory>    Search directory (default: current directory)
    ${COLORS[option]}-o${COLORS[reset]} <file>         Output filename (default: collected_code.txt)
    ${COLORS[option]}-e${COLORS[reset]} <extensions>   File extensions to include (comma-separated)
                     Default: ${default_extensions[@]}
    ${COLORS[option]}-x${COLORS[reset]} <patterns>     Additional patterns to exclude (comma-separated)
    ${COLORS[option]}-a${COLORS[reset]}               Disable default exclusions
    ${COLORS[option]}-q${COLORS[reset]}               Quiet mode - suppress progress messages
    ${COLORS[option]}-h${COLORS[reset]}               Show this help message

${COLORS[section]}DEFAULT EXCLUSIONS${COLORS[reset]}
    Version Control:  ${default_exclusions[@]:0:3}
    Dependencies:    ${default_exclusions[@]:3:5}
    Cache/Env:       ${default_exclusions[@]:8:5}
    Test Files:      ${default_exclusions[@]:13:5}
    IDE/Editor:      ${default_exclusions[@]:18:5}
    Logs/Temp:       ${default_exclusions[@]:23:3}
    Documentation:   ${default_exclusions[@]:26:6}

${COLORS[section]}OUTPUT FORMAT${COLORS[reset]}
    • Collection metadata (timestamp, source)
    • File inventory (paths, sizes)
    • Statistics (file count, line count)
    • Code contents with language markers

${COLORS[section]}EXAMPLES${COLORS[reset]}
    # Collect Python and JavaScript files
    $script_name -e py,js

    # Search specific directory with custom exclusions
    $script_name -d /path/to/project -x "*.min.js,*.generated.*"

    # Custom output with all files (no default exclusions)
    $script_name -a -o my_collection.txt -d /path/to/code

${COLORS[section]}NOTE${COLORS[reset]}
    ${COLORS[warning]}Files are processed in chunks and sent to http://localhost:4000/api/text${COLORS[reset]}
EOF
}
# Process command line arguments
use_default_excludes=true
quiet_mode=false

while getopts "d:o:e:x:aqh" opt; do
    case $opt in
        d) search_dir="$OPTARG"
           [ ! -d "$search_dir" ] && echo "Error: Directory '$search_dir' does not exist" && exit 1
           ;;
        o) output_file="$OPTARG";;
        e) IFS=',' read -ra extensions <<< "$OPTARG"
           for i in "${!extensions[@]}"; do
               extensions[$i]="\\${extensions[$i]}"
           done
           ;;
        x) IFS=',' read -ra custom_excludes <<< "$OPTARG"
           exclude_patterns+=("${custom_excludes[@]}")
           ;;
        a) use_default_excludes=true;;
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

# Create temporary directory for processing
temp_dir=$(mktemp -d)
trap 'rm -rf "$temp_dir"' EXIT

# Write metadata section
cat > "$temp_dir/output.txt" << EOF
<METADATA>
collection_date: $(date -u '+%Y-%m-%d')
collection_time: $(date -u '+%H:%M:%S UTC')
source_directory: $(realpath "$search_dir")
excluded_patterns: ${exclude_patterns[*]}
file_extensions: ${extensions[*]}
</METADATA>

<FILE_LIST>
EOF

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
    echo "- file_path: $relative_path" >> "$temp_dir/output.txt"
done < <(eval "$find_cmd")

# Write statistics
cat >> "$temp_dir/output.txt" << EOF

</FILE_LIST>

<STATISTICS>
total_files: $total_files
total_lines: $total_lines
</STATISTICS>

<CODE_CONTENTS>
EOF

# Second pass - collect code
while IFS= read -r file; do
    relative_path="${file#$search_dir/}"
    if [ "$quiet_mode" = false ]; then
        echo "Processing: $relative_path"
    fi
    
    {
        echo "--- FILE: $relative_path ---"
        echo "LANGUAGE: ${file##*.}"
        echo "BEGIN_CODE"
        sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g; s/\r//g' "$file"
        echo "END_CODE"
        echo
    } >> "$temp_dir/output.txt"
done < <(eval "$find_cmd")

# Close the code contents section
echo "</CODE_CONTENTS>" >> "$temp_dir/output.txt"

# Split the file into chunks for processing
split -b 1M "$temp_dir/output.txt" "$temp_dir/chunk_"

for chunk in "$temp_dir"/chunk_*; do
    if [ "$quiet_mode" = false ]; then
        echo "Sending chunk: $(basename "$chunk")"
    fi
    
    # Create a temporary JSON file
    json_file="$temp_dir/payload.json"
    
    # Create JSON structure directly without using jq
    {
        echo -n '{"content": "'
        sed 's/\\/\\\\/g; s/"/\\"/g; s/$/\\n/g' "$chunk" | tr -d '\n'
        echo '"}'
    } > "$json_file"
    
    # Send the JSON file directly to curl
    curl -X POST http://weaver-api.spencerjireh.com/api/text \
         -H "Content-Type: application/json" \
         --data @"$json_file"
         
    # Clean up the temporary JSON file
    rm -f "$json_file"
done

if [ "$quiet_mode" = false ]; then
    echo "Collection and transmission complete: $total_files files, $total_lines lines"
fi