import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import storageService from '../../services/storageService'
import progressService from '../../services/progressService'
import questionAdapter from '../../services/questionAdapter'
import GameHeader from './GameHeader'
import Meteor from './Meteor'
import AnswerButtons from './AnswerButtons'
import GameOverScreen from './GameOverScreen'
import { 
  FALL_SPEEDS, 
  GAME_CONFIG, 
  calculateScore, 
  shouldEarnBonusLife 
} from './gameLogic'
import './MeteorGame.css'

const shuffleQuestions = (questions) => {
  const copy = [...questions]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const buildQuestionInstance = (question, seed = Date.now()) => ({
  ...question,
  instanceId: `${question.id || 'question'}-${seed}-${Math.random().toString(36).slice(2, 8)}`
})

function MeteorGame() {
  const navigate = useNavigate()
  const [gameState, setGameState] = useState('playing') // 'playing', 'paused', 'gameover'
  const [lives, setLives] = useState(GAME_CONFIG.INITIAL_LIVES)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [highestStreak, setHighestStreak] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  
  const [meteors, setMeteors] = useState([]) // Array of { id, question, position, destroyed, isActive }
  const [questionsPool, setQuestionsPool] = useState([])
  const [disabled, setDisabled] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastAnswerIndex, setLastAnswerIndex] = useState(null)
  const [showWarning, setShowWarning] = useState(true)
  const [disabledOptions, setDisabledOptions] = useState([])
  const [explodingOption, setExplodingOption] = useState(null)
  const [lastOptions, setLastOptions] = useState([])
  const [lastCorrectIndex, setLastCorrectIndex] = useState(-1)
  const [feedbackMeteorId, setFeedbackMeteorId] = useState(null)
  
  const animationFrameRef = useRef(null)
  const lastTimeRef = useRef(Date.now())
  const warningHiddenRef = useRef(false)
  const meteorIdCounterRef = useRef(0)
  const spawnTimerRef = useRef(null)
  const lifeRemovedForMeteorRef = useRef(new Set()) // Track which meteors already had life removed
  const isProcessingAnswerRef = useRef(false) // Prevent multiple simultaneous answer processing
  const meteorsRef = useRef([]) // Track current meteors array for reading without setState
  const gameStateRef = useRef(gameState) // Track current game state to avoid stale closures
  const baseQuestionsRef = useRef([])
  const questionBufferRef = useRef([])
  const spawnLockRef = useRef(false)

  const refillQuestionBuffer = useCallback(() => {
    const baseQuestions = baseQuestionsRef.current
    if (!baseQuestions || baseQuestions.length === 0) {
      return
    }

    const shuffled = shuffleQuestions(baseQuestions)
    shuffled.forEach(question => {
      questionBufferRef.current.push(buildQuestionInstance(question))
    })
  }, [])

  const getNextQuestion = useCallback(() => {
    if (questionBufferRef.current.length === 0) {
      refillQuestionBuffer()
    }

    if (questionBufferRef.current.length === 0) {
      return null
    }

    return questionBufferRef.current.shift()
  }, [refillQuestionBuffer])
  
  // Load questions
  useEffect(() => {
    const topicId = storageService.getCurrentTopic()
    if (!topicId) {
      navigate('/')
      return
    }
    
    const content = storageService.getContent(topicId)
    if (!content) {
      navigate('/')
      return
    }
    
    // Convert to meteor format and shuffle
    const meteorQuestions = content.items.map(item => 
      questionAdapter.toMeteorFormat(item)
    )
    baseQuestionsRef.current = meteorQuestions
    questionBufferRef.current = []
    refillQuestionBuffer()
    setQuestionsPool(meteorQuestions)
    spawnLockRef.current = false
  }, [navigate, refillQuestionBuffer])
  
  // Spawn a new meteor
  const spawnMeteor = useCallback(() => {
    if (gameState !== 'playing' || lives <= 0 || spawnLockRef.current) return

    spawnLockRef.current = true

    const nextQuestion = getNextQuestion()
    if (!nextQuestion) {
      spawnLockRef.current = false
      return
    }

    const newMeteorId = meteorIdCounterRef.current++
    const newMeteor = {
      id: newMeteorId,
      question: nextQuestion,
      position: GAME_CONFIG.METEOR_START_Y,
      destroyed: false,
      isActive: false
    }

    setMeteors(prevMeteors => {
      const updated = [...prevMeteors, newMeteor]
      const firstActiveIndex = updated.findIndex(m => !m.destroyed)
      return updated.map((meteor, index) => ({
        ...meteor,
        isActive: !meteor.destroyed && index === firstActiveIndex
      }))
    })

    isProcessingAnswerRef.current = false
    setDisabled(false)
    setShowFeedback(false)
    setLastAnswerIndex(null)
    setDisabledOptions([])
    setExplodingOption(null)
    setFeedbackMeteorId(null)

    spawnLockRef.current = false
  }, [gameState, lives, getNextQuestion])
  
  // Automatic meteor spawning timer
  useEffect(() => {
    if (gameState !== 'playing' || lives <= 0) {
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current)
        spawnTimerRef.current = null
      }
      return
    }
    
    // Spawn first meteor immediately
    if (meteors.length === 0 && questionsPool.length > 0) {
      spawnMeteor()
    }
    
    // Set up interval for spawning
    spawnTimerRef.current = setInterval(() => {
      spawnMeteor()
    }, GAME_CONFIG.SPAWN_DELAY)
    
    return () => {
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current)
        spawnTimerRef.current = null
      }
    }
  }, [gameState, lives, meteors.length, questionsPool.length, spawnMeteor])
  
  // Game loop - meteor falling for all meteors
  useEffect(() => {
    if (gameState !== 'playing' || meteors.length === 0) return
    
    lastTimeRef.current = Date.now()
    
    const animate = () => {
      const currentTime = Date.now()
      const deltaTime = (currentTime - lastTimeRef.current) / 1000 // Convert to seconds
      lastTimeRef.current = currentTime
      
      setMeteors(prev => {
        return prev.map(meteor => {
          if (meteor.destroyed) return meteor
          
          const fallSpeed = FALL_SPEEDS[meteor.question.difficulty || 'medium']
          const newPosition = meteor.position + (fallSpeed * deltaTime * 60)
          return {
            ...meteor,
            position: newPosition
          }
        })
      })
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState, meteors.length])
  
  // Update active meteor ID ref and meteors ref when meteors change
  useEffect(() => {
    meteorsRef.current = meteors
  }, [meteors])
  
  // Update gameState ref when gameState changes
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])
  
  // Remove destroyed meteors after animation
  useEffect(() => {
    const destroyedMeteors = meteors.filter(m => m.destroyed)
    if (destroyedMeteors.length === 0) return
    
    const timer = setTimeout(() => {
      setMeteors(prev => {
        const filtered = prev.filter(m => !m.destroyed)
        // Make sure only first meteor is active if there are any left
        if (filtered.length > 0) {
          // Remove active status from all and make first one active
          return filtered.map((m, index) => ({
            ...m,
            isActive: index === 0
          }))
        }
        return filtered
      })
    }, 400) // Wait for explosion animation
    
    return () => clearTimeout(timer)
  }, [meteors])
  
  const handleMeteorHitGround = useCallback((meteorId) => {
    if (gameState !== 'playing') return
    
    const meteor = meteorsRef.current.find(m => m.id === meteorId)
    if (!meteor || lifeRemovedForMeteorRef.current.has(meteorId)) return
    
    // Hide warning on first meteor hit
    if (!warningHiddenRef.current) {
      setShowWarning(false)
      warningHiddenRef.current = true
    }
    
    lifeRemovedForMeteorRef.current.add(meteorId)
    
    setDisabled(true)
    
    // Check lives BEFORE updating to prevent issues
    setLives(prevLives => {
      const newLives = prevLives - 1
      if (newLives <= 0) {
        setGameState('gameover')
        return 0
      }
      return newLives
    })
    
    setStreak(0)
    
    // Update progress as incorrect
    const topicId = storageService.getCurrentTopic()
    const content = storageService.getContent(topicId)
    const questionItem = content.items.find(item => 
      item.question === meteor.question.question
    )
    if (questionItem) {
      progressService.updateProgress(questionItem.id, false, 'meteor')
    }
    
    // Mark meteor as destroyed and update active status
    setMeteors(prev => {
      const updated = prev.map(m => 
        m.id === meteorId ? { ...m, destroyed: true } : m
      )

      const firstActiveIndex = updated.findIndex(m => !m.destroyed)
      if (firstActiveIndex === -1) {
        return updated
      }

      return updated.map((m, index) => ({
        ...m,
        isActive: !m.destroyed && index === firstActiveIndex
      }))
    })
  }, [gameState])
  
  const resetAnswerState = useCallback((options = {}) => {
    const { preserveExplosion = false } = options

    requestAnimationFrame(() => {
      if (gameStateRef.current === 'playing') {
        setDisabled(false)
        setShowFeedback(false)
        setLastAnswerIndex(null)
        setDisabledOptions([])
        if (preserveExplosion) {
          setTimeout(() => setExplodingOption(null), 200)
        } else {
          setExplodingOption(null)
        }
        setFeedbackMeteorId(null)
      } else if (!preserveExplosion) {
        setExplodingOption(null)
      }

      isProcessingAnswerRef.current = false
    })
  }, [])

  const handleAnswer = useCallback((answerIndex) => {
    // Guard against rapid clicks and disabled state
    if (disabled || isProcessingAnswerRef.current || gameState !== 'playing') return
    
    // Find active meteor using ref (no setState needed)
    const activeMeteor = meteorsRef.current.find(m => m.isActive && !m.destroyed)
    
    if (!activeMeteor) return
    
    // Set processing flag to prevent multiple simultaneous calls
    isProcessingAnswerRef.current = true
    
    // Hide warning on first meteor answer
    if (!warningHiddenRef.current) {
      setShowWarning(false)
      warningHiddenRef.current = true
    }
    
    // Do all side effects OUTSIDE of setMeteors
    setDisabled(true)
    setLastAnswerIndex(answerIndex)
    setShowFeedback(true)
    setFeedbackMeteorId(activeMeteor.id)
    
    const isCorrect = activeMeteor.question.acceptableAnswers.some(acceptable => 
      activeMeteor.question.options[answerIndex].toLowerCase().trim() === acceptable
    )
    
    setQuestionsAnswered(prev => prev + 1)
    
    if (isCorrect) {
      // Correct answer - destroy active meteor
      setMeteors(prev => {
        const updated = prev.map(m => 
          m.id === activeMeteor.id ? { ...m, destroyed: true } : m
        )

        const hasAliveMeteor = updated.some(m => !m.destroyed)
        let combined = updated

        if (!hasAliveMeteor) {
          const replacementQuestion = getNextQuestion()
          if (replacementQuestion) {
            const newMeteorId = meteorIdCounterRef.current++
            const replacementMeteor = {
              id: newMeteorId,
              question: replacementQuestion,
              position: GAME_CONFIG.METEOR_START_Y,
              destroyed: false,
              isActive: false
            }
            combined = [...updated, replacementMeteor]
          }
        }

        const firstActiveIndex = combined.findIndex(m => !m.destroyed)
        if (firstActiveIndex === -1) {
          return combined
        }

        return combined.map((m, index) => ({
          ...m,
          isActive: !m.destroyed && index === firstActiveIndex
        }))
      })
      
      // Calculate score
      const points = calculateScore(
        activeMeteor.question.difficulty || 'medium',
        activeMeteor.position,
        streak
      )
      
      setScore(prev => prev + points)
      setStreak(prev => {
        const newStreak = prev + 1
        setHighestStreak(current => Math.max(current, newStreak))
        return newStreak
      })
      setCorrectAnswers(prev => {
        const newCount = prev + 1
        if (shouldEarnBonusLife(newCount)) {
          setLives(l => l + 1)
        }
        return newCount
      })
      
      // Update progress as correct
      const topicId = storageService.getCurrentTopic()
      const content = storageService.getContent(topicId)
      const questionItem = content.items.find(item => 
        item.question === activeMeteor.question.question
      )
      if (questionItem) {
        progressService.updateProgress(questionItem.id, true, 'meteor')
      }
      
      resetAnswerState()
    } else {
      // Wrong answer - swap question on same meteor
      const wrongMeteorId = activeMeteor.id
      const wrongMeteorQuestion = activeMeteor.question
      
      setStreak(0)
      setExplodingOption(answerIndex)
      
      // Remove life immediately - check BEFORE updating to prevent game over issues
      if (!lifeRemovedForMeteorRef.current.has(wrongMeteorId)) {
        lifeRemovedForMeteorRef.current.add(wrongMeteorId)
        setLives(prev => {
          const newLives = prev - 1
          if (newLives <= 0) {
            setGameState('gameover')
            isProcessingAnswerRef.current = false
            return 0
          }
          return newLives
        })
      }
      
      // Update progress as incorrect
      const topicId = storageService.getCurrentTopic()
      const content = storageService.getContent(topicId)
      const questionItem = content.items.find(item => 
        item.question === wrongMeteorQuestion.question
      )
      if (questionItem) {
        progressService.updateProgress(questionItem.id, false, 'meteor')
      }
      
      // Swap question immediately on the same meteor
      if (gameStateRef.current !== 'playing') {
        isProcessingAnswerRef.current = false
        return
      }

      const nextQuestion = getNextQuestion()
      if (!nextQuestion) {
        resetAnswerState({ preserveExplosion: true })
        return
      }

      setMeteors(current => {
        const stillActive = current.find(m => m.id === wrongMeteorId && !m.destroyed)
        if (stillActive && gameStateRef.current === 'playing') {
          return current.map(m => 
            m.id === wrongMeteorId 
              ? { ...m, question: nextQuestion }
              : m
          )
        }
        return current
      })

      resetAnswerState({ preserveExplosion: true })
    }
  }, [disabled, streak, gameState, getNextQuestion, resetAnswerState])
  
  const handlePause = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing')
  }
  
  const handlePlayAgain = () => {
    setGameState('playing')
    setLives(GAME_CONFIG.INITIAL_LIVES)
    setScore(0)
    setStreak(0)
    setHighestStreak(0)
    setQuestionsAnswered(0)
    setCorrectAnswers(0)
    setMeteors([])
    setDisabled(false)
    setShowFeedback(false)
    setShowWarning(true)
    setDisabledOptions([])
    setExplodingOption(null)
    setLastOptions([])
    setLastCorrectIndex(-1)
    setFeedbackMeteorId(null)
    setLastAnswerIndex(null)
    warningHiddenRef.current = false
    meteorIdCounterRef.current = 0
    lifeRemovedForMeteorRef.current.clear()
    isProcessingAnswerRef.current = false
    meteorsRef.current = []
    gameStateRef.current = 'playing'
    questionBufferRef.current = []

    const topicId = storageService.getCurrentTopic()
    const content = storageService.getContent(topicId)
    const meteorQuestions = content?.items.map(item => 
      questionAdapter.toMeteorFormat(item)
    ) || []

    baseQuestionsRef.current = meteorQuestions
    questionBufferRef.current = []
    refillQuestionBuffer()
    setQuestionsPool(meteorQuestions)
    spawnLockRef.current = false
  }
  
  const handleReturnToMenu = () => {
    navigate('/hub')
  }
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' && e.target.tagName !== 'INPUT') {
        e.preventDefault()
        handlePause()
      }
      if (e.key === 'Escape') {
        navigate('/hub')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])
  
  const activeMeteor = meteors.find(m => m.isActive && !m.destroyed)
  const correctIndex = activeMeteor?.question.options.findIndex(option =>
    activeMeteor?.question.acceptableAnswers.some(acceptable =>
      option.toLowerCase().trim() === acceptable
    )
  ) ?? -1
  const isLoading = questionsPool.length === 0 && meteors.length === 0

  useEffect(() => {
    if (gameState !== 'playing' || lives <= 0) {
      return
    }

    if (!activeMeteor && !spawnLockRef.current) {
      spawnMeteor()
    }
  }, [activeMeteor, gameState, lives, spawnMeteor])

  useEffect(() => {
    if (activeMeteor?.question?.options?.length) {
      setLastOptions(activeMeteor.question.options)
      setLastCorrectIndex(correctIndex)
    }
  }, [activeMeteor, correctIndex])

  useEffect(() => {
    if (activeMeteor && feedbackMeteorId !== null && activeMeteor.id !== feedbackMeteorId) {
      setShowFeedback(false)
      setLastAnswerIndex(null)
      setFeedbackMeteorId(null)
    }
  }, [activeMeteor, feedbackMeteorId])

  useEffect(() => {
    if (activeMeteor && disabled && !showFeedback && !isProcessingAnswerRef.current) {
      setDisabled(false)
      setDisabledOptions([])
      setExplodingOption(null)
    }
  }, [activeMeteor, disabled, showFeedback])

  useEffect(() => {
    if (!activeMeteor && showFeedback) {
      setShowFeedback(false)
      setLastAnswerIndex(null)
      setFeedbackMeteorId(null)
    }
  }, [activeMeteor, showFeedback])

  const displayOptions = activeMeteor?.question?.options ?? lastOptions
  const resolvedOptions = Array.isArray(displayOptions) && displayOptions.length > 0
    ? displayOptions
    : ['Preparing next meteor...', 'Preparing next meteor...', 'Preparing next meteor...', 'Preparing next meteor...']
  const effectiveCorrectIndex = activeMeteor ? correctIndex : lastCorrectIndex
  const pendingQuestions = questionBufferRef.current.length
  const shouldDisableButtons = disabled || !activeMeteor
  const shouldShowWaitingIndicator = gameState === 'playing' && !activeMeteor && pendingQuestions === 0
 
  if (isLoading) {
    return <div className="loading">Loading game...</div>
  }
  
  return (
    <div className="meteor-game">
      <GameHeader 
        lives={lives}
        score={score}
        streak={streak}
        onPause={handlePause}
      />
      
      <div className="meteor-game-area">
        {gameState === 'playing' && (
          <>
            {meteors.map(meteor => (
              <Meteor 
                key={meteor.id}
                id={meteor.id}
                question={meteor.question.question}
                difficulty={meteor.question.difficulty || 'medium'}
                position={meteor.position}
                onHitGround={handleMeteorHitGround}
                destroyed={meteor.destroyed}
              />
            ))}
            <AnswerButtons 
              options={resolvedOptions}
              onAnswer={handleAnswer}
              disabled={shouldDisableButtons}
              correctIndex={effectiveCorrectIndex}
              showFeedback={showFeedback && !!activeMeteor}
              disabledOptions={disabledOptions}
              explodingOption={explodingOption}
            />
            {shouldShowWaitingIndicator && (
              <div className="answer-waiting-indicator">
                <div className="answer-spinner" aria-hidden="true"></div>
                <span>Preparing next meteor...</span>
              </div>
            )}
          </>
        )}
        
        {gameState === 'paused' && (
          <div className="pause-overlay">
            <div className="pause-modal">
              <h2>GAME PAUSED</h2>
              <button className="resume-btn" onClick={handlePause}>
                Resume Game
              </button>
              <button className="menu-btn" onClick={handleReturnToMenu}>
                Return to Menu
              </button>
              <div className="pause-stats">
                <p>Lives: {lives}</p>
                <p>Score: {score.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className={`meteor-ground ${showWarning ? 'show-warning' : 'hide-warning'}`}></div>
      </div>
      
      {gameState === 'gameover' && (
        <GameOverScreen 
          score={score}
          questionsAnswered={questionsAnswered}
          correctAnswers={correctAnswers}
          highestStreak={highestStreak}
          onPlayAgain={handlePlayAgain}
          onReturnToMenu={handleReturnToMenu}
        />
      )}
    </div>
  )
}

export default MeteorGame
