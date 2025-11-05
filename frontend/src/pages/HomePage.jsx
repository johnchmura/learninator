import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import storageService from '../services/storageService'
import questionAdapter from '../services/questionAdapter'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const [topic, setTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [showSavedTopics, setShowSavedTopics] = useState(false)
  const [savedTopics, setSavedTopics] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(null) // { type: 'single'|'all', topicId?: string }

  const generateLLMPrompt = () => {
    let prompt = `Generate a learning set on [TOPIC] with [NUMBER] items at [DIFFICULTY] difficulty level.
Return ONLY valid JSON in this exact format:

{
  "topic": "[TOPIC]",
  "difficulty": "[DIFFICULTY]",
  "items": [
    {
      "type": "multiple-choice",
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
- Generate multiple-choice questions with "type": "multiple-choice"
- Each item needs 4 options with correctIndex (0-3) pointing to the right answer
- Each item needs a clear question
- Provide the answer as text
- Explanation should teach the concept
- Categorize by subtopic
- Rate individual question difficulty based on complexity`

    return prompt
  }

  const handleCopyPrompt = () => {
    let promptToCopy = generateLLMPrompt()
    
    // Substitute topic, number, and difficulty if provided
    if (topic.trim()) {
      promptToCopy = promptToCopy.replace(/\[TOPIC\]/g, topic.trim())
    }
    if (numQuestions.trim()) {
      promptToCopy = promptToCopy.replace(/\[NUMBER\]/g, numQuestions.trim())
    }
    if (difficulty) {
      promptToCopy = promptToCopy.replace(/\[DIFFICULTY\]/g, difficulty)
    }
    
    navigator.clipboard.writeText(promptToCopy)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 1200)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Parse JSON
      const parsedData = JSON.parse(jsonInput)
      
      // Normalize to universal format
      const normalizedContent = questionAdapter.normalizeContent(parsedData)
      
      // Validate
      const validation = questionAdapter.validateContent(normalizedContent)
      if (!validation.valid) {
        setError('Invalid content: ' + validation.errors.join(', '))
        setLoading(false)
        return
      }

      // Generate topic ID and save
      const topicId = questionAdapter.generateTopicId(normalizedContent)
      storageService.saveContent(topicId, normalizedContent)
      storageService.setCurrentTopic(topicId)

      // Navigate to game hub
      navigate('/hub')
    } catch (err) {
      setError('Invalid JSON: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadExample = () => {
    const exampleContent = {
      "topic": "Python Programming Basics",
      "difficulty": "medium",
      "items": [
        {
          "question": "What is a list comprehension in Python?",
          "answer": "A concise way to create lists",
          "options": [
            "A concise way to create lists",
            "A type of loop",
            "A function decorator",
            "A class method"
          ],
          "correctIndex": 0,
          "explanation": "List comprehensions provide a concise way to create lists in Python using a single line of code with an expression and optional conditionals.",
          "category": "Data Structures",
          "difficulty": "medium"
        },
        {
          "question": "What does the 'self' parameter represent in a Python class method?",
          "answer": "The instance of the class",
          "options": [
            "The instance of the class",
            "The class itself",
            "A global variable",
            "The parent class"
          ],
          "correctIndex": 0,
          "explanation": "The 'self' parameter in Python class methods refers to the instance of the class. It allows you to access instance attributes and methods.",
          "category": "Object-Oriented Programming",
          "difficulty": "medium"
        },
        {
          "question": "Which keyword is used to create a function in Python?",
          "answer": "def",
          "options": [
            "def",
            "function",
            "func",
            "define"
          ],
          "correctIndex": 0,
          "explanation": "The 'def' keyword is used to define a function in Python. It is followed by the function name and parentheses containing any parameters.",
          "category": "Functions",
          "difficulty": "easy"
        }
      ]
    }
    setJsonInput(JSON.stringify(exampleContent, null, 2))
    setError('')
  }

  const handleViewSavedTopics = () => {
    const topics = Object.values(storageService.getAllContent())
    setSavedTopics(topics)
    setShowSavedTopics(true)
  }

  const handleLoadTopic = (topicId) => {
    storageService.setCurrentTopic(topicId)
    navigate('/hub')
  }

  const handleDeleteTopic = (topicId, e) => {
    e.stopPropagation()
    setConfirmDelete({ type: 'single', topicId })
  }

  const handleClearAllTopics = () => {
    setConfirmDelete({ type: 'all' })
  }

  const handleConfirmDelete = () => {
    if (confirmDelete.type === 'single') {
      storageService.deleteContent(confirmDelete.topicId)
      const topics = Object.values(storageService.getAllContent())
      setSavedTopics(topics)
    } else if (confirmDelete.type === 'all') {
      storageService.clearAllData()
      setSavedTopics([])
      setShowSavedTopics(false)
    }
    setConfirmDelete(null)
  }

  const handleCancelDelete = () => {
    setConfirmDelete(null)
  }

  const handleCloseModal = () => {
    setShowSavedTopics(false)
  }

  return (
    <div className="home-page">
      {confirmDelete && (
        <div className="confirm-overlay" onMouseDown={(e) => e.target === e.currentTarget && handleCancelDelete()}>
          <div className="confirm-dialog">
            <h3>Confirm Deletion</h3>
            <p>
              {confirmDelete.type === 'single' 
                ? 'Are you sure you want to delete this learning set?'
                : 'Are you sure you want to delete ALL saved learning sets? This cannot be undone!'}
            </p>
            <div className="confirm-actions">
              <button className="confirm-cancel-btn" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showSavedTopics && (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Your Saved Learning Sets</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              {savedTopics.length === 0 ? (
                <div className="empty-state">
                  <p>No saved learning sets yet.</p>
                  <p>Create your first one below!</p>
                </div>
              ) : (
                <>
                  <div className="topics-list">
                    {savedTopics.map(topic => (
                      <div 
                        key={topic.id} 
                        className="topic-item"
                        onClick={() => handleLoadTopic(topic.id)}
                      >
                        <div className="topic-info">
                          <h3>{topic.topic}</h3>
                          <div className="topic-meta">
                            <span className="question-count">{topic.items.length} questions</span>
                          </div>
                          <p className="topic-date">
                            Created: {new Date(topic.savedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          className="delete-topic-btn"
                          onClick={(e) => handleDeleteTopic(topic.id, e)}
                          title="Delete this topic"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="clear-all-btn"
                      onClick={handleClearAllTopics}
                    >
                      Clear All Data
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="home-container">
        <div className="home-header">
          <h1>Learninator</h1>
          <p className="tagline">Generate content once, learn in many ways!</p>
        </div>

        <div className="input-section">
          <h2>Create Your Learning Set</h2>
          <p className="instruction">
            Use an LLM to generate learning content, then paste the JSON here:
          </p>
          
          <div className="prompt-box">
            <h3>LLM Prompt Template:</h3>
            <pre className="prompt-template">{generateLLMPrompt()}</pre>
            <div className="prompt-controls">
              <div className="prompt-inputs">
                <input
                  type="text"
                  placeholder="Topic (optional)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="prompt-input"
                />
                <input
                  type="text"
                  placeholder="# Questions (optional)"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="prompt-input prompt-input-small"
                />
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="prompt-select"
                >
                  <option value="">Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="copy-btn-container">
                <button onClick={handleCopyPrompt} className="copy-btn">
                  Copy Prompt
                </button>
                {showCopied && (
                  <div className="copied-notification">
                    Copied to clipboard!
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="json-input-area">
            <label htmlFor="json-textarea">Paste response from the LLM:</label>
            <textarea
              id="json-textarea"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"topic": "...", "items": [...]}'
              rows={15}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button 
              onClick={handleSubmit} 
              disabled={!jsonInput.trim() || loading}
              className="primary-btn"
            >
              {loading ? 'Loading...' : 'Create Learning Set'}
            </button>
            <button onClick={handleLoadExample} className="secondary-btn">
              Load Example
            </button>
            <button onClick={handleViewSavedTopics} className="secondary-btn">
              View Saved Topics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
