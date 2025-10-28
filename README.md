# Learninator - Multi-Game Learning Platform

A modern, interactive learning platform where you **generate content once and learn in many ways**. Create learning sets with LLMs, then practice through multiple game formats including quiz mode, meteor drop (coming soon), flashcards (coming soon), and more!

## Table of Contents
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Learning Games](#learning-games)
- [Creating Learning Sets](#creating-learning-sets)
- [Progress Tracking](#progress-tracking)
- [Project Structure](#project-structure)
- [Manual Setup](#manual-setup)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

---

## Features

### Core Platform Features
- **Universal Data Format**: Generate content once, use across all games
- **Multiple Learning Games**: Quiz, Meteor Drop, Flashcards, and more (expanding)
- **Mastery Tracking**: Track progress across all games with unified progress system
- **Game Hub**: Central dashboard to choose learning games and view progress
- **localStorage Persistence**: All your content and progress saved locally
- **LLM Integration**: Generate learning sets with ChatGPT, Claude, or any LLM
- **No Database Required**: Privacy-first with local-only storage
- **Modern UI**: Beautiful, responsive design with smooth animations

### Learning Benefits
- **Active Recall**: Forces retrieval of information for better retention
- **Immediate Feedback**: Learn from mistakes right away
- **Spaced Repetition**: Built-in algorithm schedules review sessions
- **Mastery-Based Learning**: Can't skip questions you don't understand
- **Variety**: Different games for different learning styles and moods
- **Progress Visibility**: See improvement over time with detailed statistics

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
   - Paste JSON from your LLM or click "Use Example"
   - Navigate to the Game Hub
   - Choose your learning game
   - Start playing and mastering!

**To stop:** Press `Ctrl+C` in the terminal

### What the Script Does
- Creates conda environment "learn" for the backend
- Installs all backend dependencies
- Installs all frontend dependencies
- Starts both servers automatically
- Shows live logs

---

## Architecture

### The Learninator Way

**Generate once → Choose game → Learn in your style → Track mastery**

```
┌──────────────────────────────────────┐
│  1. Create Learning Set              │
│  (Home Page)                         │
│  - Paste JSON from LLM               │
│  - Load saved topics                 │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  2. Choose Your Game                 │
│  (Game Hub)                          │
│  - See progress stats                │
│  - Select learning game              │
└─────────────┬────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌──────┐ ┌────────┐ ┌──────┐
│ Quiz │ │ Meteor │ │Flash │
│ Mode │ │  Drop  │ │Cards │
└──────┘ └────────┘ └──────┘
    │         │         │
    └─────────┼─────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  3. Track Progress                   │
│  (Stats Page)                        │
│  - Mastery levels                    │
│  - Per-question analytics            │
│  - Game statistics                   │
└──────────────────────────────────────┘
```

### Universal Data Format

All games use the same standardized question format:

```json
{
  "topic": "Python Programming",
  "difficulty": "medium",
  "items": [
    {
      "id": "q_abc123",
      "question": "What is a list comprehension?",
      "answer": "A concise way to create lists",
      "options": [
        "A concise way to create lists",
        "A type of loop",
        "A function decorator",
        "A class method"
      ],
      "correctIndex": 0,
      "explanation": "List comprehensions provide a concise way to create lists...",
      "category": "Data Structures",
      "difficulty": "medium"
    }
  ]
}
```

This universal format is automatically adapted for each game type.

---

## Learning Games

### 1. Quiz Mode (Available Now) 📝

Classic quiz experience with two modes:

#### Mastery Mode (Instant Feedback)
- Answer questions one at a time
- Get immediate feedback with explanations
- Wrong answers loop back until mastered
- Track incorrect attempts per question
- Perfect for learning new material

**Best for:** Active learning, exam prep, skill building

#### Testing Mode (Results at End)
- Answer all questions first
- Navigate freely between questions
- See results and explanations at the end
- Traditional quiz experience

**Best for:** Self-testing, progress checks, assessments

### 2. Meteor Drop (Coming Soon) ☄️

Fast-paced action game where questions fall from the sky!

- Type answers before meteors hit the ground
- Multiple meteors active simultaneously
- Lives system (3 lives)
- Score multipliers for streaks
- Increasing difficulty

**Best for:** Speed, reflexes, kinetic learners

### 3. Flashcards (Coming Soon) 🃏

Classic flashcard experience with modern features:

- Swipe or click to flip
- Self-assessment (Again, Hard, Good, Easy)
- Spaced repetition scheduling
- Shuffle and focus modes

**Best for:** Memorization, spaced repetition, review

### More Games Coming
- **Type Race**: Speed typing challenge
- **Memory Match**: Pair matching game
- **Battle Mode**: Multiplayer learning

---

## Creating Learning Sets

### Method 1: Use an LLM (Recommended)

1. **Copy this prompt** (also available in the app):

```
Generate a learning set on [TOPIC] with [NUMBER] items at [DIFFICULTY] difficulty level.
Return ONLY valid JSON in this exact format:

{
  "topic": "[TOPIC]",
  "difficulty": "[DIFFICULTY]",
  "items": [
    {
      "question": "question text",
      "answer": "correct answer text",
      "options": ["correct answer", "wrong 1", "wrong 2", "wrong 3"],
      "correctIndex": 0,
      "explanation": "why this answer is correct and others are wrong",
      "category": "subtopic",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Requirements:
- Set overall difficulty to [DIFFICULTY] and adjust the ratio of question difficulties accordingly:
  * For "easy" sets: mostly easy questions, some medium questions, NO hard questions
  * For "medium" sets: balanced mix of easy, medium, and hard questions
  * For "hard" sets: mostly hard questions, some medium questions, NO easy questions
- Each item needs a clear question
- Provide the answer as text (for all game types)
- Include 4 options for multiple choice games
- correctIndex (0-3) points to the right answer
- Explanation should teach the concept
- Categorize by subtopic
- Rate individual question difficulty based on complexity
```

2. **Use with ChatGPT, Claude, etc:**
   ```
   Generate a learning set on Python Programming with 10 items.
   ```

3. **Paste the JSON** into the app

### Method 2: Load Saved Topics

The app automatically saves all your learning sets. Access them from the home page!

### Method 3: Use Example

Click "Use Example" on the home page to try the platform with sample content.

---

## Progress Tracking

### Mastery System

The platform tracks your progress with a 6-level mastery system:

- **Level 0 - New**: Never attempted
- **Level 1 - Learning**: First attempts
- **Level 2 - Familiar**: 50%+ accuracy
- **Level 3 - Proficient**: 70%+ accuracy
- **Level 4 - Advanced**: 80%+ accuracy
- **Level 5 - Mastered**: 90%+ accuracy with 5+ correct

### Universal Progress

Progress is tracked across ALL games:
- Total attempts per question
- Correct vs incorrect ratio
- Per-game statistics
- Last attempted date
- Next review date (spaced repetition)
- Confidence history

### XP and Levels

Earn XP for correct answers:
- Base 10 XP per correct answer
- Bonus XP based on mastery level
- Game type multipliers
- Level up every 100 XP

### Statistics Dashboard

View detailed analytics:
- Overall accuracy rate
- Mastery breakdown by level
- Per-question progress
- Game-specific statistics
- Time tracking

---

## Project Structure

```
learninator/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── requirements.txt     # Python dependencies
│   └── environment.yml      # Conda environment
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Content creation
│   │   │   ├── GameHub.jsx         # Game selection
│   │   │   └── StatsPage.jsx       # Analytics
│   │   ├── games/
│   │   │   └── quiz/
│   │   │       ├── QuizGame.jsx    # Quiz wrapper
│   │   │       ├── QuizQuestion.jsx
│   │   │       └── QuizResults.jsx
│   │   ├── services/
│   │   │   ├── storageService.js   # localStorage manager
│   │   │   ├── progressService.js  # Progress tracking
│   │   │   └── questionAdapter.js  # Format conversion
│   │   ├── App.jsx                 # Router
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── start.sh
├── cleanup.sh
└── README.md
```

---

## Manual Setup

### Prerequisites

- **Node.js** v18 or higher
- **Conda** (Miniconda or Anaconda)
- **npm** (comes with Node.js)

### Backend Setup

```bash
# Create conda environment
conda create -n learn python=3.10 -y
conda activate learn

# Install dependencies
cd backend
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start dev server
npm run dev
```

Access the app at `http://localhost:5173`

---

## API Documentation

### POST /api/quiz/validate
Validates quiz JSON structure.

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
  "message": "Quiz validated successfully"
}
```

### POST /api/quiz/submit
Calculates quiz results.

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
  "results": [...]
}
```

---

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
lsof -ti:8000 | xargs kill -9
uvicorn main:app --reload --port 8000
```

**Conda environment issues:**
```bash
conda deactivate
conda remove -n learn --all -y
conda create -n learn python=3.10 -y
conda activate learn
pip install -r backend/requirements.txt
```

### Frontend Issues

**Node.js/npm issues:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**WSL npm errors:**
- Install Node.js NATIVELY in WSL (not Windows version)
- Check: `which npm` should NOT show `/mnt/c/...`
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Data Issues

**Clear all saved data:**
```javascript
// In browser console:
localStorage.clear()
location.reload()
```

**Export/import data:**
```javascript
// Export (in browser console)
const data = {
  content: localStorage.getItem('learninator_content'),
  progress: localStorage.getItem('learninator_progress'),
  profile: localStorage.getItem('learninator_profile')
}
console.log(JSON.stringify(data))

// Import (paste data then run)
localStorage.setItem('learninator_content', data.content)
localStorage.setItem('learninator_progress', data.progress)
localStorage.setItem('learninator_profile', data.profile)
location.reload()
```

---

## Development

### Tech Stack

**Frontend:**
- React 18 with Hooks
- React Router for navigation
- Vite for fast development
- Pure CSS with CSS variables
- localStorage for data persistence

**Backend:**
- FastAPI (Python 3.10)
- Pydantic for validation
- Uvicorn ASGI server
- No database (validation only)

### Adding New Games

1. Create game directory: `frontend/src/games/newgame/`
2. Implement game component
3. Use `questionAdapter` to convert format
4. Update progress with `progressService`
5. Add route in `App.jsx`
6. Add card to `GameHub.jsx`

### Service Layer

**storageService.js**: Manages localStorage
- `saveContent()` / `getContent()`
- `saveProgress()` / `getProgress()`
- `getProfile()` / `saveProfile()`

**progressService.js**: Tracks mastery
- `updateProgress(questionId, isCorrect, gameType)`
- `getMasteryStats(topicId)`
- `getQuestionsForReview(topicId)`

**questionAdapter.js**: Format conversion
- `normalizeContent(inputData)`
- `toQuizFormat(item)`
- `toMeteorFormat(item)`
- `toFlashcardFormat(item)`

---

## Roadmap

### Phase 1: Foundation (Completed)
- ✅ Universal data format
- ✅ Storage service (localStorage)
- ✅ Progress tracking system
- ✅ Multi-page routing
- ✅ Game Hub dashboard
- ✅ Quiz game integration

### Phase 2: New Games (In Progress)
- 🚧 Meteor Drop game
- 🚧 Flashcards game
- ⏳ Type Race game
- ⏳ Memory Match game

### Phase 3: Advanced Features
- ⏳ Spaced repetition algorithm
- ⏳ Achievement system
- ⏳ Daily goals and streaks
- ⏳ Advanced analytics
- ⏳ Export/import functionality

### Phase 4: Platform Features
- ⏳ Cloud sync (optional)
- ⏳ Social sharing
- ⏳ Community content marketplace
- ⏳ Mobile app (React Native)
- ⏳ Teacher dashboard

---

## License

This project is open source and available under the MIT License.

---

**Built with learning science in mind. Generate once, learn in many ways!**
