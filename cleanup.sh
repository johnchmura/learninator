#!/bin/bash

# Cleanup script for fixing npm issues in WSL
# Run this if you encounter npm installation errors

echo "Cleaning up frontend dependencies..."

cd "$(dirname "$0")/frontend"

# Remove node_modules and package-lock.json
if [ -d "node_modules" ]; then
    echo "Removing node_modules..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo "Removing package-lock.json..."
    rm -f package-lock.json
fi

echo "Cleanup complete!"
echo ""
echo "Now run ./start.sh again"

