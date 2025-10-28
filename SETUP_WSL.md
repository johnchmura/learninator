# WSL Setup Guide

This guide helps you set up the Quiz App properly in WSL (Windows Subsystem for Linux).

## Common Issue: Windows npm in WSL

If you see errors like:
- `UNC paths are not supported`
- `Cannot find module 'C:\Windows\install.js'`
- npm trying to access `\\wsl.localhost\...` paths

This means you're using Windows npm instead of WSL npm.

## Solution: Install Node.js Natively in WSL

### Step 1: Check Which npm You're Using

```bash
which npm
which node
```

If the output shows paths like:
- `/mnt/c/Program Files/nodejs/npm`
- Any path with `/mnt/c/`

Then you need to install Node.js in WSL.

### Step 2: Install Node.js in WSL

Run these commands in your WSL terminal:

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

Both should show version numbers WITHOUT any Windows paths.

### Step 3: Clean Up Corrupted Files

If you previously tried to install with Windows npm:

```bash
./cleanup.sh
```

Or manually:

```bash
cd frontend
rm -rf node_modules package-lock.json
cd ..
```

### Step 4: Run the App

```bash
./start.sh
```

## Alternative: Use NVM (Node Version Manager)

If you prefer to manage multiple Node.js versions:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal or run:
source ~/.bashrc

# Install Node.js
nvm install 20
nvm use 20

# Verify
node --version
npm --version
```

Then run the cleanup script and start.sh again.

## Prerequisites Summary

For this app to work in WSL, you need:

1. **Conda** (for Python backend)
   ```bash
   # Check if installed
   conda --version
   ```

2. **Node.js** (WSL native, NOT Windows version)
   ```bash
   # Check if installed correctly
   which node
   # Should show: /usr/bin/node or similar, NOT /mnt/c/...
   ```

3. **npm** (comes with Node.js)
   ```bash
   # Check if installed correctly
   which npm
   # Should show: /usr/bin/npm or similar, NOT /mnt/c/...
   ```

## Troubleshooting

### Issue: "conda: command not found"

Install Miniconda in WSL:
```bash
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
source ~/.bashrc
```

### Issue: Permission errors with node_modules

```bash
cd frontend
sudo chown -R $USER:$USER node_modules
```

Or just remove and reinstall:
```bash
./cleanup.sh
./start.sh
```

### Issue: Port already in use

Kill existing processes:
```bash
# Kill backend on port 8000
lsof -ti:8000 | xargs kill -9

# Kill frontend on port 5173
lsof -ti:5173 | xargs kill -9
```

## Recommended WSL Setup

For best results:
1. Use WSL 2 (not WSL 1)
2. Install all development tools natively in WSL
3. Don't mix Windows and WSL tools for the same project
4. Use WSL's file system (not `/mnt/c/...`) for your projects

