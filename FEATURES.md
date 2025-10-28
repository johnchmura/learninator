# Quiz App Features

## Quiz Modes

The app now supports two different quiz-taking modes:

### 1. Instant Feedback Mode
- Get immediate visual feedback after selecting each answer
- See a green checkmark for correct answers
- See a red X for incorrect answers
- Read the explanation/reasoning right after answering
- Can't change your answer once selected (locks in your choice)
- Perfect for learning as you go

### 2. Results at End Mode
- Answer all questions without seeing if you're right or wrong
- Get a complete score report at the end
- Review all questions with their explanations
- See which answers were correct/incorrect
- Perfect for testing yourself

## Question Format

Each question now includes:
- **Question text**: The question being asked
- **4 Options**: Multiple choice answers (A, B, C, D)
- **Correct Answer**: Index (0-3) of the correct option
- **Reasoning**: Explanation of why the answer is correct

## User Experience

### Quiz Input Screen
- Paste JSON quiz data or load an example
- **Select quiz mode** with radio buttons:
  - Instant Feedback: Immediate results with explanations
  - Results at End: Complete quiz first, review later
- Visual mode selection with descriptions
- Copy LLM prompt template with one click

### During Quiz (Instant Feedback Mode)
- Answer selection with visual feedback
- Correct answers show in green
- Incorrect answers show in red
- Feedback box appears with:
  - Checkmark or X icon
  - "Correct!" or "Incorrect" message
  - Full explanation/reasoning
- Navigation locked until answer is selected
- Can't go back to change answers

### During Quiz (Results at End Mode)
- Standard answer selection
- Progress indicators
- Navigation between questions
- No feedback until submission

### Results Screen
- Overall score with percentage
- Score breakdown (correct/incorrect/total)
- Color-coded score circle (excellent/good/average/poor)
- Detailed question-by-question review
- Each question shows:
  - Your answer
  - Correct answer (if different)
  - Full explanation/reasoning
- Restart button to take a new quiz

## Visual Design

- Modern, clean interface
- Color-coded feedback:
  - Green for correct
  - Red for incorrect
  - Blue for primary actions
- Responsive layout
- Smooth transitions and animations
- Clear typography and spacing
- Intuitive navigation

## LLM Integration

Updated prompt template to include reasoning:

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
```

## Technical Implementation

### Backend Changes
- Added `reasoning` field to `QuizQuestion` model
- Updated validation to require reasoning
- Results endpoint now returns reasoning for each question

### Frontend Changes
- Added quiz mode selection state
- Updated QuizInput component with mode selector
- Enhanced QuizQuestion component:
  - Instant feedback display
  - Answer locking in instant mode
  - Color-coded option buttons
  - Feedback box with explanations
- Updated QuizResults component:
  - Shows reasoning for each question
  - Better visual hierarchy
- New CSS styles for:
  - Mode selection radio buttons
  - Feedback boxes
  - Correct/incorrect states
  - Reasoning display

## File Updates

### Modified Files
- `backend/main.py` - Added reasoning field
- `frontend/src/App.jsx` - Added mode state management
- `frontend/src/components/QuizInput.jsx` - Mode selection UI
- `frontend/src/components/QuizQuestion.jsx` - Instant feedback logic
- `frontend/src/components/QuizResults.jsx` - Reasoning display
- `frontend/src/components/QuizInput.css` - Mode selector styles
- `frontend/src/components/QuizQuestion.css` - Feedback styles
- `frontend/src/components/QuizResults.css` - Reasoning styles
- `LLM_PROMPT_TEMPLATE.txt` - Updated with reasoning
- `example-quiz.json` - Added reasoning to examples
- `README.md` - Updated documentation

