import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import storageService from '../services/storageService'
import progressService from '../services/progressService'
import questionAdapter from '../services/questionAdapter'
import './GameHub.css'

function GameHub() {
  const navigate = useNavigate()
  const [currentTopic, setCurrentTopic] = useState(null)
  const [masteryStats, setMasteryStats] = useState(null)
  const [profile, setProfile] = useState(null)
  
  // Add Questions Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [topic, setTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [jsonInput, setJsonInput] = useState('')
  const [showCopied, setShowCopied] = useState(false)
  const [error, setError] = useState('')

  const loadTopicData = useCallback(() => {
    const topicId = storageService.getCurrentTopic()
    if (!topicId) {
      navigate('/')
      return
    }

    const topic = storageService.getContent(topicId)
    if (!topic) {
      navigate('/')
      return
    }

    setCurrentTopic(topic)
    setMasteryStats(progressService.getMasteryStats(topicId))
    setProfile(storageService.getProfile())
    setTopic(topic.topic)
  }, [navigate])

  useEffect(() => {
    loadTopicData()
  }, [loadTopicData])

  const handleGameSelect = (gameType) => {
    if (gameType === 'quiz') {
      navigate('/game/quiz')
    } else if (gameType === 'stats') {
      navigate('/stats')
    } else {
      alert(`${gameType} is coming soon!`)
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  const handleOpenAddModal = () => {
    setShowAddModal(true)
    setJsonInput('')
    setError('')
    setNumQuestions('')
    setDifficulty('')
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setJsonInput('')
    setError('')
  }

  const generateEnhancedPrompt = () => {
    const existingQuestions = currentTopic.items.map(item => ({
      question: item.question,
      answer: item.answer
    }))

    let prompt = `Generate a learning set on [TOPIC] with [NUMBER] items at [DIFFICULTY] difficulty level.
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

IMPORTANT - DO NOT duplicate these existing questions:
${JSON.stringify(existingQuestions, null, 2)}

Generate NEW questions that are different from the ones above.`

    // Substitute values
    if (topic.trim()) {
      prompt = prompt.replace(/\[TOPIC\]/g, topic.trim())
    }
    if (numQuestions.trim()) {
      prompt = prompt.replace(/\[NUMBER\]/g, numQuestions.trim())
    }
    if (difficulty) {
      prompt = prompt.replace(/\[DIFFICULTY\]/g, difficulty)
    }

    return prompt
  }

  const handleCopyPrompt = () => {
    const prompt = generateEnhancedPrompt()
    navigator.clipboard.writeText(prompt)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 1200)
  }

  const handleAddQuestions = () => {
    setError('')
    
    try {
      const parsedNew = JSON.parse(jsonInput)
      const normalized = questionAdapter.normalizeContent(parsedNew)
      
      const validation = questionAdapter.validateContent(normalized)
      if (!validation.valid) {
        setError('Invalid content: ' + validation.errors.join(', '))
        return
      }

      // Filter out duplicates (case-insensitive question text comparison)
      const existing = currentTopic.items.map(i => i.question.toLowerCase().trim())
      const newItems = normalized.items.filter(item => 
        !existing.includes(item.question.toLowerCase().trim())
      )

      if (newItems.length === 0) {
        setError('No new questions to add (all are duplicates)')
        return
      }

      // Append to existing
      const updatedContent = {
        ...currentTopic,
        items: [...currentTopic.items, ...newItems],
        savedAt: new Date().toISOString()
      }

      storageService.saveContent(currentTopic.id, updatedContent)
      setShowAddModal(false)
      loadTopicData()
    } catch (err) {
      setError('Invalid JSON: ' + err.message)
    }
  }

  const handleReplaceQuestions = () => {
    setError('')
    
    try {
      const parsedNew = JSON.parse(jsonInput)
      const normalized = questionAdapter.normalizeContent(parsedNew)
      
      const validation = questionAdapter.validateContent(normalized)
      if (!validation.valid) {
        setError('Invalid content: ' + validation.errors.join(', '))
        return
      }

      // Keep same topic ID, replace items
      const updatedContent = {
        ...currentTopic,
        topic: normalized.topic || currentTopic.topic,
        difficulty: normalized.difficulty || currentTopic.difficulty,
        items: normalized.items,
        savedAt: new Date().toISOString()
      }

      storageService.saveContent(currentTopic.id, updatedContent)
      setShowAddModal(false)
      loadTopicData()
    } catch (err) {
      setError('Invalid JSON: ' + err.message)
    }
  }

  const getDifficultyMix = () => {
    if (!currentTopic || !currentTopic.items) return null
    
    const difficulties = new Set(
      currentTopic.items
        .map(item => item.difficulty)
        .filter(d => d) // Remove undefined/null
    )
    
    const diffArray = Array.from(difficulties).sort()
    
    if (diffArray.length === 0) return null
    if (diffArray.length === 1) return diffArray[0]
    
    // Multiple difficulties - show them joined
    return diffArray.join(' and ')
  }

  if (!currentTopic) {
    return <div className="loading">Loading...</div>
  }

  const games = [
    {
      id: 'quiz',
      icon: '📝',
      name: 'Quiz Mode',
      description: 'Classic testing',
      available: true
    },
    {
      id: 'meteor',
      icon: '☄️',
      name: 'Meteor Drop',
      description: 'Fast & action!',
      available: false
    },
    {
      id: 'flashcards',
      icon: '🃏',
      name: 'Flash Cards',
      description: 'Memory practice',
      available: false
    },
    {
      id: 'typerace',
      icon: '⌨️',
      name: 'Type Race',
      description: 'Speed typing',
      available: false
    },
    {
      id: 'memory',
      icon: '🎮',
      name: 'Memory Match',
      description: 'Pair matching',
      available: false
    },
    {
      id: 'stats',
      icon: '📊',
      name: 'Stats & More',
      description: 'View progress',
      available: true
    }
  ]

  return (
    <div className="game-hub">
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseAddModal}>
          <div className="modal-content add-questions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add or Replace Questions</h2>
              <button className="close-modal-btn" onClick={handleCloseAddModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="prompt-inputs-group">
                <input
                  type="text"
                  placeholder="Topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="modal-input"
                />
                <input
                  type="text"
                  placeholder="Number of questions"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="modal-input modal-input-small"
                />
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="modal-select"
                >
                  <option value="">Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="prompt-section">
                <h3>LLM Prompt (with existing questions to prevent duplicates):</h3>
                <pre className="modal-prompt">{generateEnhancedPrompt()}</pre>
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

              <div className="json-section">
                <label htmlFor="json-input">Paste JSON from LLM:</label>
                <textarea
                  id="json-input"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{"topic": "...", "items": [...]}'
                  rows={10}
                  className="modal-textarea"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions-row">
                <button 
                  onClick={handleAddQuestions}
                  disabled={!jsonInput.trim()}
                  className="action-btn add-btn"
                >
                  Add Questions (Append)
                </button>
                <button 
                  onClick={handleReplaceQuestions}
                  disabled={!jsonInput.trim()}
                  className="action-btn replace-btn"
                >
                  Replace All Questions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="hub-container">
        <div className="hub-header">
          <button className="back-btn" onClick={handleBackToHome}>
            ← Back to Home
          </button>
          <div className="topic-info">
            <h1>{currentTopic.topic}</h1>
            <p className="topic-details">
              {currentTopic.items.length} questions
              {getDifficultyMix() && ` • ${getDifficultyMix()}`}
            </p>
          </div>
        </div>

        <div className="question-management">
          <button className="add-questions-btn" onClick={handleOpenAddModal}>
            + Add More Questions
          </button>
        </div>

        {masteryStats && (
          <div className="progress-banner">
            <div className="progress-stat">
              <div className="stat-value">{masteryStats.mastered}</div>
              <div className="stat-label">Mastered</div>
            </div>
            <div className="progress-stat">
              <div className="stat-value">
                {masteryStats.mastered}/{masteryStats.total}
              </div>
              <div className="stat-label">Progress</div>
            </div>
            <div className="progress-stat">
              <div className="stat-value">
                {masteryStats.correctRate.toFixed(0)}%
              </div>
              <div className="stat-label">Accuracy</div>
            </div>
            {profile && (
              <div className="progress-stat">
                <div className="stat-value">Level {profile.level}</div>
                <div className="stat-label">{profile.totalXP} XP</div>
              </div>
            )}
          </div>
        )}

        <div className="games-section">
          <h2>Choose Your Learning Game</h2>
          <div className="games-grid">
            {games.map(game => (
              <div
                key={game.id}
                className={`game-card ${!game.available ? 'disabled' : ''}`}
                onClick={() => game.available && handleGameSelect(game.id)}
              >
                <div className="game-icon">{game.icon}</div>
                <h3 className="game-name">{game.name}</h3>
                <p className="game-description">{game.description}</p>
                {!game.available && (
                  <span className="coming-soon-badge">Coming Soon</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {masteryStats && masteryStats.total > 0 && (
          <div className="mastery-breakdown">
            <h3>Mastery Breakdown</h3>
            <div className="mastery-bar">
              {masteryStats.mastered > 0 && (
                <div 
                  className="mastery-segment mastered" 
                  style={{ width: `${(masteryStats.mastered / masteryStats.total) * 100}%` }}
                  title={`${masteryStats.mastered} mastered`}
                />
              )}
              {masteryStats.advanced > 0 && (
                <div 
                  className="mastery-segment advanced" 
                  style={{ width: `${(masteryStats.advanced / masteryStats.total) * 100}%` }}
                  title={`${masteryStats.advanced} advanced`}
                />
              )}
              {masteryStats.proficient > 0 && (
                <div 
                  className="mastery-segment proficient" 
                  style={{ width: `${(masteryStats.proficient / masteryStats.total) * 100}%` }}
                  title={`${masteryStats.proficient} proficient`}
                />
              )}
              {masteryStats.familiar > 0 && (
                <div 
                  className="mastery-segment familiar" 
                  style={{ width: `${(masteryStats.familiar / masteryStats.total) * 100}%` }}
                  title={`${masteryStats.familiar} familiar`}
                />
              )}
              {masteryStats.learning > 0 && (
                <div 
                  className="mastery-segment learning" 
                  style={{ width: `${(masteryStats.learning / masteryStats.total) * 100}%` }}
                  title={`${masteryStats.learning} learning`}
                />
              )}
              {masteryStats.new > 0 && (
                <div 
                  className="mastery-segment new" 
                  style={{ width: `${(masteryStats.new / masteryStats.total) * 100}%` }}
                  title={`${masteryStats.new} new`}
                />
              )}
            </div>
            <div className="mastery-legend">
              {masteryStats.mastered > 0 && <span className="legend-item mastered">●  Mastered ({masteryStats.mastered})</span>}
              {masteryStats.advanced > 0 && <span className="legend-item advanced">●  Advanced ({masteryStats.advanced})</span>}
              {masteryStats.proficient > 0 && <span className="legend-item proficient">●  Proficient ({masteryStats.proficient})</span>}
              {masteryStats.familiar > 0 && <span className="legend-item familiar">●  Familiar ({masteryStats.familiar})</span>}
              {masteryStats.learning > 0 && <span className="legend-item learning">●  Learning ({masteryStats.learning})</span>}
              {masteryStats.new > 0 && <span className="legend-item new">●  New ({masteryStats.new})</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameHub

