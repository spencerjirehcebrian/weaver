#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Installing Weaver CLI...${NC}"

# Determine install directory
INSTALL_DIR="$HOME/.weaver"
BIN_DIR="/usr/local/bin"

# Create installation directory
mkdir -p "$INSTALL_DIR"

# Function to handle installation from local or remote source
install_from_source() {
    local is_local=$1
    
    if [ "$is_local" = true ] && [ -f "cli/weaver.sh" ]; then
        echo -e "${BLUE}Installing from local source...${NC}"
        cp "cli/weaver.sh" "$INSTALL_DIR/weaver.sh"
    else
        echo -e "${BLUE}Downloading CLI scripts from GitHub...${NC}"
        curl -sSL "https://raw.githubusercontent.com/spencerjirehcebrian/weaver/main/cli/weaver.sh" -o "$INSTALL_DIR/weaver.sh"
        curl -sSL "https://raw.githubusercontent.com/spencerjirehcebrian/weaver/main/install.sh" -o "$INSTALL_DIR/install.sh"
    fi
}

# Check if we're installing from local files or remote
if [ -f "cli/weaver.sh" ]; then
    install_from_source true
else
    install_from_source false
fi

# Make scripts executable
chmod +x "$INSTALL_DIR/weaver.sh"

# Create symbolic link
echo -e "${BLUE}Creating symbolic link...${NC}"
if [ -w "$BIN_DIR" ]; then
    ln -sf "$INSTALL_DIR/weaver.sh" "$BIN_DIR/weaver"
else
    sudo ln -sf "$INSTALL_DIR/weaver.sh" "$BIN_DIR/weaver"
fi

# Verify installation
if command -v weaver >/dev/null 2>&1; then
    echo -e "${GREEN}Weaver CLI has been successfully installed!${NC}"
    echo -e "Run ${BLUE}weaver -h${NC} to see available commands"
else
    echo -e "${RED}Installation failed. Please try manual installation method.${NC}"
    exit 1
fi

# Add to PATH if needed
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo -e "${BLUE}Adding $BIN_DIR to PATH...${NC}"
    shell_file="$HOME/.bashrc"
    # Check for ZSH
    if [ -f "$HOME/.zshrc" ]; then
        shell_file="$HOME/.zshrc"
    fi
    echo "export PATH=\$PATH:$BIN_DIR" >> "$shell_file"
    echo -e "${GREEN}Please restart your terminal or run: source $shell_file${NC}"
fi