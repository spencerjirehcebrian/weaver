#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Uninstalling Weaver CLI...${NC}"

# Define directories
INSTALL_DIR="$HOME/.weaver"
BIN_DIR="/usr/local/bin"

# Remove symbolic link
if [ -L "$BIN_DIR/weaver" ]; then
    echo -e "${BLUE}Removing symbolic link...${NC}"
    if [ -w "$BIN_DIR" ]; then
        rm "$BIN_DIR/weaver"
    else
        sudo rm "$BIN_DIR/weaver"
    fi
fi

# Remove installation directory
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${BLUE}Removing installation directory...${NC}"
    rm -rf "$INSTALL_DIR"
fi

# Remove PATH entry if it exists
echo -e "${BLUE}Checking for PATH modifications...${NC}"
shell_files=("$HOME/.bashrc" "$HOME/.zshrc")

for shell_file in "${shell_files[@]}"; do
    if [ -f "$shell_file" ]; then
        echo -e "${BLUE}Checking $shell_file...${NC}"
        # Create a temporary file
        temp_file=$(mktemp)
        # Remove the PATH line while copying to temp file
        grep -v "export PATH=\$PATH:$BIN_DIR" "$shell_file" > "$temp_file"
        # Copy back only if changes were made
        if ! cmp -s "$shell_file" "$temp_file"; then
            cp "$temp_file" "$shell_file"
            echo -e "${BLUE}Removed Weaver PATH entry from $shell_file${NC}"
        fi
        rm "$temp_file"
    fi
done

# Verify uninstallation
if ! command -v weaver >/dev/null 2>&1; then
    echo -e "${GREEN}Weaver CLI has been successfully uninstalled!${NC}"
    echo -e "${BLUE}Please restart your terminal for all changes to take effect.${NC}"
else
    echo -e "${RED}Uninstallation may have encountered issues. Please check manually.${NC}"
    exit 1
fi