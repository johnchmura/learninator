# Learninator - Quiz App with Mastery Mode

A modern, interactive quiz application designed for effective learning. Paste JSON-formatted quiz questions and take quizzes with instant feedback or traditional testing modes. Features a unique **Mastery Mode** that ensures you truly understand the material before moving on.

## Table of Contents
- [Features](#features)
- [Quick Start](#quick-start)
- [Quiz Modes](#quiz-modes)
- [Creating Quizzes](#creating-quizzes)
- [Project Structure](#project-structure)
- [Manual Setup](#manual-setup)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

---

## Features

### Core Features
- **Instant Feedback (Mastery Mode)**: Wrong answers loop back until you master them all
- **Traditional Quiz Mode**: Complete all questions first, then review
- **LLM Integration**: Generate quizzes with ChatGPT, Claude, or any LLM
- **Detailed Explanations**: Every question includes reasoning for the correct answer
- **Progress Tracking**: See questions remaining, mastered count, and incorrect attempts
- **Visual Feedback**: Color-coded answers (green for correct, red for incorrect)
- **Clean, Modern UI**: Responsive design with smooth animations
- **No Database Required**: All data stored in memory for privacy

### Learning Benefits
- **Active Recall**: Forces retrieval of information for better retention
- **Immediate Feedback**: Learn from mistakes right away
- **Spaced Repetition**: Wrong answers return after other questions
- **Mastery-Based Learning**: Can't skip questions you don't understand
- **Metacognition**: Track which questions you struggled with

---

## Quick Start

### Super Quick Start (Recommended)

1. **Run the startup script:**
   ```bash
   ./start.sh
   ```

2. **Open your browser:**
   Visit `http://localhost:5173`

3. **Start learning!**
   - Click "Load Example" or paste your own quiz JSON
   - Choose Instant Feedback or Results at End mode
   - Start the quiz

**To stop:** Press `Ctrl+C` in the terminal

### What the Script Does
- Creates conda environment "learn" for the backend
- Installs all backend dependencies
- Installs all frontend dependencies (creates package-lock.json)
- Starts both servers automatically
- Shows live logs

### If You Encounter Errors
```bash
./cleanup.sh  # Clean up corrupted dependencies
./start.sh    # Try again
```

---

## Quiz Modes

### 1. Instant Feedback (Mastery Mode) 🎯

**Perfect for active learning and skill building**

How it works:
1. Answer a question
2. See immediate feedback (✓ correct or ✗ incorrect) 
3. Read the explanation
4. Click "Continue" to move on
5. **Wrong answers?** They're added back to the end of the queue
6. Keep going until you've mastered 100% of questions

Features:
- Green checkmark for correct answers
- Red X for incorrect answers
- Detailed explanations after each answer
- Progress tracking: "3 questions remaining | 2 of 5 mastered | 7 total attempts"
- Can't skip or go back (encourages focus)
- Results show incorrect attempts per question

**Best for:** Learning new material, exam prep, skill mastery

### 2. Results at End Mode 📝

**Traditional quiz experience for self-testing**

How it works:
1. Answer all questions at your own pace
2. Navigate freely between questions
3. Submit when complete
4. See full results with explanations

Features:
- Progress indicators
- Previous/Next navigation
- Question status dots
- Complete score breakdown
- All explanations at the end

**Best for:** Testing yourself, progress checks, quick assessments

---

## Creating Quizzes

### Method 1: Use an LLM (Recommended)

1. **Copy the prompt** from the app (click "Copy Prompt" button)

2. **Use this template** with ChatGPT, Claude, or any LLM:
   ```
   Generate a quiz on [TOPIC] with [NUMBER] multiple choice questions. 
   Return ONLY valid JSON in this exact format:
   [
     {
       "question": "question text here",
       "options": ["option A", "option B", "option C", "option D"],
       "correctAnswer": 0,
       "reasoning": "explanation of why this answer is correct"
     }
   ]
   where correctAnswer is the index (0-3) of the correct option, and reasoning explains why that answer is correct.
   ```

3. **Example prompt:**
   ```
   Generate a quiz on Python programming with 10 multiple choice questions.
   ```

4. **Paste the JSON** into the app

**Important:**
- LLM must return ONLY the JSON array
- Remove any markdown formatting (like \`\`\`json) before pasting
- Each question needs exactly 4 options
- correctAnswer must be 0, 1, 2, or 3

### Method 2: Load Example

Click "Load Example" to try a sample quiz about general knowledge.

### Method 3: Write Your Own

Create a JSON file with this format:

```json
[
  {
    "question": "What is the capital of France?",
    "options": ["London", "Paris", "Berlin", "Madrid"],
    "correctAnswer": 1,
    "reasoning": "Paris is the capital and largest city of France, known for landmarks like the Eiffel Tower and the Louvre Museum."
  },
  {
    "question": "Which planet is known as the Red Planet?",
    "options": ["Venus", "Jupiter", "Mars", "Saturn"],
    "correctAnswer": 2,
    "reasoning": "Mars is called the Red Planet because of its reddish appearance, caused by iron oxide (rust) on its surface."
  }
]
```

**Required fields:**
- `question`: The question text (string)
- `options`: Array of exactly 4 answer choices (strings)
- `correctAnswer`: Index of correct option (0-3)
- `reasoning`: Explanation of why the answer is correct (string)

---

## Project Structure

```
learninator/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── requirements.txt     # Python dependencies
│   ├── environment.yml      # Conda environment spec
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuizInput.jsx       # JSON input & mode selection
│   │   │   ├── QuizQuestion.jsx    # Quiz display with mastery loop
│   │   │   └── QuizResults.jsx     # Score & detailed results
│   │   ├── App.jsx                 # Main app logic
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── start.sh                 # Startup script
├── cleanup.sh              # Dependency cleanup script
├── example-quiz.json       # Sample quiz
├── LLM_PROMPT_TEMPLATE.txt # Template for LLMs
└── README.md               # This file
```

---

## Manual Setup

If the startup script doesn't work, follow these steps:

### Prerequisites

- **Node.js** v18 or higher
- **Conda** (Miniconda or Anaconda)
- **npm** (comes with Node.js)

Check versions:
```bash
node --version   # Should be v18+
conda --version  # Should be installed
npm --version    # Should be installed
```

### Backend Setup

1. **Create conda environment:**
   ```bash
   conda create -n learn python=3.10 -y
   conda activate learn
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Start the server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

The backend will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

---

## Usage Guide

### Taking a Quiz

1. **Open the app** at `http://localhost:5173`

2. **Prepare your quiz:**
   - Click "Load Example" for a sample quiz, OR
   - Generate quiz JSON using an LLM, OR
   - Paste your own JSON

3. **Choose a quiz mode:**
   - **Instant Feedback (Mastery Mode)**: Learn as you go with repeated practice
   - **Results at End**: Traditional testing experience

4. **Start the quiz** and answer questions

5. **Review your results:**
   - See your score and accuracy
   - Read explanations for each question
   - View incorrect attempts (in Mastery Mode)

### Understanding Your Results

#### Mastery Mode Results
- **Correct**: Total questions mastered (always = total in mastery mode)
- **Incorrect Attempts**: Number of wrong answers before achieving mastery
- **Total Questions**: Number of questions in the quiz
- **Per-question badges**: Shows attempts needed for each question

Example:
```
Score: 5/5 (100%)

[Correct: 5] [Incorrect Attempts: 3] [Total Questions: 5]
                before mastery

Q1: What is 2+2?
✓ Correct
Explanation: Basic addition...
[2 incorrect attempts before mastery]
```

#### Traditional Mode Results
- **Correct**: Questions answered correctly
- **Incorrect**: Questions answered incorrectly  
- **Total**: Total number of questions
- **Review**: See all questions with correct answers highlighted

---

## API Documentation

### Backend Endpoints

#### GET /
Health check endpoint.

**Response:**
```json
{
  "message": "Quiz API is running"
}
```

#### POST /api/quiz/validate
Validates quiz JSON structure before starting.

**Request:**
```json
{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "reasoning": "..."
    }
  ]
}
```

**Response:**
```json
{
  "valid": true,
  "questionCount": 5,
  "message": "Quiz validated successfully with 5 questions"
}
```

**Validation rules:**
- Must have exactly 4 options per question
- correctAnswer must be 0-3
- All fields are required

#### POST /api/quiz/submit
Calculates score and returns detailed results.

**Request:**
```json
{
  "answers": [1, 2, 0, 3, 1],
  "questions": [...]
}
```

**Response:**
```json
{
  "score": 4,
  "total": 5,
  "percentage": 80.0,
  "results": [
    {
      "questionIndex": 0,
      "question": "...",
      "userAnswer": 1,
      "correctAnswer": 1,
      "isCorrect": true,
      "reasoning": "..."
    }
  ]
}
```

---

## Troubleshooting

### Backend Issues

**Problem:** Backend won't start
```bash
# Check conda is installed
conda --version

# Create/activate environment
conda create -n learn python=3.10 -y
conda activate learn

# Reinstall dependencies
cd backend
pip install -r requirements.txt
```

**Problem:** Port 8000 already in use
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn main:app --reload --port 8001
```

### Frontend Issues

**Problem:** Frontend won't start
```bash
# Check Node.js version
node --version  # Should be v18+

# Clean install
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Problem:** Port 5173 already in use
```bash
# Kill existing process
lsof -ti:5173 | xargs kill -9
```

**Problem:** npm errors in WSL
- Make sure Node.js is installed NATIVELY in WSL
- Check with: `which npm` (should NOT show `/mnt/c/...`)
- Install Node.js in WSL:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

### Connection Issues

**Problem:** Can't connect to backend
1. Check backend is running: `curl http://localhost:8000`
2. Check frontend URL matches: Should use `http://localhost:8000`
3. Check firewall isn't blocking ports 8000 or 5173

**Problem:** CORS errors
- Backend already has CORS enabled for all origins
- Clear browser cache and reload

### Quiz Issues

**Problem:** JSON validation fails
- Ensure valid JSON format (use a JSON validator)
- Each question must have exactly 4 options
- `correctAnswer` must be 0, 1, 2, or 3
- Remove markdown formatting from LLM output (like \`\`\`json)
- Ensure all required fields are present

**Problem:** Quiz stuck in mastery mode
- Refresh the page to reset
- This happens if there's a bug - report it!

---

## Development

### Tech Stack

**Frontend:**
- React 18 with Hooks
- Vite for fast development
- Pure CSS with CSS variables
- No external UI libraries

**Backend:**
- FastAPI (Python 3.10)
- Pydantic for validation
- Uvicorn ASGI server
- No database (in-memory only)

### Development Workflow

1. **Make changes** to code
2. **Hot reload** happens automatically
   - Frontend: Vite HMR
   - Backend: Uvicorn --reload flag
3. **Check logs** in terminal or `.log` files
4. **Test** in browser at `http://localhost:5173`

### Code Organization

**Frontend components:**
- `QuizInput.jsx`: Handles JSON input, validation, mode selection
- `QuizQuestion.jsx`: Displays questions, handles mastery loop logic
- `QuizResults.jsx`: Shows final results with statistics

**Backend routes:**
- `/api/quiz/validate`: Validates quiz structure
- `/api/quiz/submit`: Calculates and returns results

### Adding Features

The codebase is designed to be extended. Some ideas:
- **Question categories/tags**: Add category field to questions
- **Difficulty levels**: Tag questions as easy/medium/hard
- **Hints system**: Add hints array to questions
- **Confidence ratings**: Ask users how confident they were
- **Progress persistence**: Save progress to localStorage
- **Spaced repetition**: Schedule questions for review

See the project roadmap in the original plan for more ideas.

---

## License

This project is open source and available under the MIT License.

---

## Contributing

Contributions are welcome! This is a learning project designed to help students master material through active practice.

### Future Enhancements

**High Priority:**
- LocalStorage persistence for questions and progress
- Confidence rating system
- Question categories and filtering
- Hint system for difficult questions

**Medium Priority:**
- Spaced repetition algorithm
- Progress analytics dashboard
- Different study modes (Learn, Review, Challenge)
- XP and achievement system

**Low Priority:**
- Export results as PDF
- Share quiz sets
- AI-generated follow-up questions
- Voice mode for accessibility

---

**Built with ❤️ for learners who want to truly master their material, not just memorize it.**
