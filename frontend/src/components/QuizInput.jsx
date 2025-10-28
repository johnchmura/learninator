import { useState } from 'react'
import './QuizInput.css'

function QuizInput({ onQuizStart }) {
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [quizMode, setQuizMode] = useState('end') // 'instant' or 'end'

  const examplePrompt = `Generate a quiz on [TOPIC] with [NUMBER] multiple choice questions. 
Return ONLY valid JSON in this exact format:
[
  {
    "question": "question text here",
    "options": ["option A", "option B", "option C", "option D"],
    "correctAnswer": 0,
    "reasoning": "explanation of why this answer is correct"
  }
]
where correctAnswer is the index (0-3) of the correct option, and reasoning explains why that answer is correct.`

  const handleValidate = async () => {
    setError('')
    setIsValidating(true)

    try {
      // Parse JSON locally first
      const parsed = JSON.parse(jsonInput)
      
      if (!Array.isArray(parsed)) {
        throw new Error('JSON must be an array of questions')
      }

      // Validate with backend
      const response = await fetch('http://localhost:8000/api/quiz/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions: parsed })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Validation failed')
      }

      const data = await response.json()
      
      if (data.valid) {
        onQuizStart(parsed, quizMode)
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your input.')
      } else {
        setError(err.message)
      }
    } finally {
      setIsValidating(false)
    }
  }

  const handleLoadExample = () => {
    const exampleQuiz = [
      {
        question: "What is the capital of France?",
        options: ["London", "Paris", "Berlin", "Madrid"],
        correctAnswer: 1,
        reasoning: "Paris is the capital and largest city of France, known for landmarks like the Eiffel Tower and the Louvre Museum."
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Jupiter", "Mars", "Saturn"],
        correctAnswer: 2,
        reasoning: "Mars is called the Red Planet because of its reddish appearance, caused by iron oxide (rust) on its surface."
      },
      {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1,
        reasoning: "Basic addition: 2 + 2 equals 4. This is a fundamental arithmetic operation."
      }
    ]
    setJsonInput(JSON.stringify(exampleQuiz, null, 2))
    setError('')
  }

  return (
    <div className="quiz-input-container">
      <div className="input-section">
        <h2>Create Your Quiz</h2>
        <p className="instruction">
          Use an LLM to generate quiz questions, then paste the JSON here:
        </p>
        
        <div className="prompt-box">
          <h3>LLM Prompt Template:</h3>
          <pre className="prompt-template">{examplePrompt}</pre>
          <button onClick={() => navigator.clipboard.writeText(examplePrompt)} className="copy-btn">
            Copy Prompt
          </button>
        </div>

        <div className="json-input-area">
          <label htmlFor="json-textarea">Paste Quiz JSON:</label>
          <textarea
            id="json-textarea"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='[{"question": "...", "options": [...], "correctAnswer": 0}]'
            rows={15}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="quiz-mode-selection">
          <h3>Quiz Mode:</h3>
          <div className="mode-options">
            <label className={`mode-option ${quizMode === 'instant' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="quizMode"
                value="instant"
                checked={quizMode === 'instant'}
                onChange={(e) => setQuizMode(e.target.value)}
              />
              <div className="mode-info">
                <strong>Instant Feedback (Mastery Mode)</strong>
                <p>See results immediately with explanations. Wrong answers are added back to the queue - keep going until you master them all!</p>
              </div>
            </label>
            <label className={`mode-option ${quizMode === 'end' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="quizMode"
                value="end"
                checked={quizMode === 'end'}
                onChange={(e) => setQuizMode(e.target.value)}
              />
              <div className="mode-info">
                <strong>Results at End</strong>
                <p>Complete all questions first, then see your score and explanations</p>
              </div>
            </label>
          </div>
        </div>

        <div className="button-group">
          <button 
            onClick={handleValidate} 
            disabled={!jsonInput.trim() || isValidating}
            className="primary-btn"
          >
            {isValidating ? 'Validating...' : 'Start Quiz'}
          </button>
          <button onClick={handleLoadExample} className="secondary-btn">
            Load Example
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuizInput

