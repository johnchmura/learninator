# Quick Start Guide

## Important: WSL Users

If you're using WSL, make sure Node.js is installed NATIVELY in WSL, not Windows.

Quick check:
```bash
which npm
```

If it shows `/mnt/c/...` or `Program Files`, see `SETUP_WSL.md` for setup instructions.

## Super Quick Start (Easiest!)

Just run the startup script:

```bash
./start.sh
```

This will automatically:
- Set up conda environment "learn" for the backend
- Install all dependencies
- Start both servers

Then visit `http://localhost:5173` in your browser.

Press `Ctrl+C` to stop all servers when done.

### If npm installation fails:

1. Run the cleanup script:
```bash
./cleanup.sh
```

2. Check the WSL setup guide:
```bash
cat SETUP_WSL.md
```

---

## Manual Start (Alternative)

If the scripts don't work, follow these steps:

### Step 1: Start the Backend

Open a terminal and run:

```bash
conda create -n learn python=3.10 -y
conda activate learn
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Keep this terminal running.

### Step 2: Start the Frontend

Open a NEW terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Keep this terminal running too.

### Step 3: Open the App

Visit `http://localhost:5173` in your browser.

## Testing the App

1. Click "Load Example" to load sample quiz questions
2. Click "Start Quiz"
3. Answer the questions
4. Submit to see your score

## Creating Your Own Quizzes

### Option 1: Use the LLM Prompt

1. Copy the prompt from the app (click "Copy Prompt")
2. Go to ChatGPT, Claude, or any LLM
3. Replace [TOPIC] with your subject and [NUMBER] with question count
4. Copy the JSON response
5. Paste it into the app

### Option 2: Use the Example File

The `example-quiz.json` file in the root directory has a sample quiz you can copy and paste.

### Option 3: Write Your Own

Format:
```json
[
  {
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]
```

Note: `correctAnswer` is the index (0-3) of the correct option.

## Troubleshooting

### Backend won't start
- Make sure conda is installed: `conda --version`
- Make sure the conda environment is activated: `conda activate learn`
- Try reinstalling dependencies: `pip install -r requirements.txt`

### Frontend won't start
- Make sure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### App loads but can't connect to backend
- Check that the backend is running on port 8000
- Check that the frontend is running on port 5173
- Make sure no firewall is blocking the connections

### JSON validation fails
- Make sure you're pasting valid JSON
- Check that each question has exactly 4 options
- Check that correctAnswer is between 0 and 3
- Remove any markdown formatting (backticks, etc.) from the LLM output

