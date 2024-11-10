#!/bin/bash
set -e

echo "Setting up Weaver CLI..."
chmod +x weaver.sh
sudo ln -sf "$(pwd)/weaver.sh" /usr/local/bin/weaver
echo "Weaver CLI has been installed successfully!"
