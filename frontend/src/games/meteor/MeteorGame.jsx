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
  getStreakMultiplier,
  shouldEarnBonusLife 
} from './gameLogic'
import './MeteorGame.css'

function MeteorGame() {
  const navigate = useNavigate()
  const [gameState, setGameState] = useState('playing') // 'playing', 'paused', 'gameover'
  const [lives, setLives] = useState(GAME_CONFIG.INITIAL_LIVES)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [highestStreak, setHighestStreak] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [meteorPosition, setMeteorPosition] = useState(GAME_CONFIG.METEOR_START_Y)
  const [questionQueue, setQuestionQueue] = useState([])
  const [disabled, setDisabled] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastAnswerIndex, setLastAnswerIndex] = useState(null)
  const [meteorKey, setMeteorKey] = useState(0)
  
  const animationFrameRef = useRef(null)
  const fallSpeedRef = useRef(FALL_SPEEDS.medium)
  const lastTimeRef = useRef(Date.now())
  
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
    const shuffled = [...meteorQuestions].sort(() => Math.random() - 0.5)
    setQuestionQueue(shuffled)
    setCurrentQuestion(shuffled[0])
  }, [navigate])
  
  // Game loop - meteor falling
  useEffect(() => {
    if (gameState !== 'playing' || !currentQuestion) return
    
    lastTimeRef.current = Date.now()
    
    const animate = () => {
      const currentTime = Date.now()
      const deltaTime = (currentTime - lastTimeRef.current) / 1000 // Convert to seconds
      lastTimeRef.current = currentTime
      
      setMeteorPosition(prev => {
        // Speed is calibrated for 60fps, so multiply by deltaTime * 60 to normalize
        const newPos = prev + (fallSpeedRef.current * deltaTime * 60)
        return newPos
      })
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState, currentQuestion])
  
  const spawnNextMeteor = useCallback(() => {
    if (questionQueue.length <= 1) {
      // Reshuffle and continue
      const topicId = storageService.getCurrentTopic()
      const content = storageService.getContent(topicId)
      const meteorQuestions = content.items.map(item => 
        questionAdapter.toMeteorFormat(item)
      )
      const shuffled = [...meteorQuestions].sort(() => Math.random() - 0.5)
      setQuestionQueue(shuffled)
      setCurrentQuestion(shuffled[0])
    } else {
      setCurrentQuestion(questionQueue[1])
      setQuestionQueue(prev => prev.slice(1))
    }
    
    setMeteorPosition(GAME_CONFIG.METEOR_START_Y)
    setMeteorKey(prev => prev + 1) // Force remount of meteor with new X position
    setDisabled(false)
    setShowFeedback(false)
    setLastAnswerIndex(null)
  }, [questionQueue])
  
  const handleMeteorHitGround = useCallback(() => {
    if (disabled) return // Already handled
    
    setDisabled(true)
    setLives(prev => {
      const newLives = prev - 1
      if (newLives <= 0) {
        setGameState('gameover')
      }
      return newLives
    })
    setStreak(0)
    
    // Update progress as incorrect
    const topicId = storageService.getCurrentTopic()
    const content = storageService.getContent(topicId)
    const questionItem = content.items.find(item => 
      item.question === currentQuestion.question
    )
    if (questionItem) {
      progressService.updateProgress(questionItem.id, false, 'meteor')
    }
    
    setTimeout(() => {
      if (lives - 1 > 0) {
        spawnNextMeteor()
      }
    }, 1500)
  }, [disabled, lives, currentQuestion, spawnNextMeteor])
  
  const handleAnswer = useCallback((answerIndex) => {
    if (disabled) return
    
    setDisabled(true)
    setLastAnswerIndex(answerIndex)
    setShowFeedback(true)
    
    const isCorrect = currentQuestion.acceptableAnswers.some(acceptable => 
      currentQuestion.options[answerIndex].toLowerCase().trim() === acceptable
    )
    
    setQuestionsAnswered(prev => prev + 1)
    
    if (isCorrect) {
      // Correct answer
      const points = calculateScore(
        currentQuestion.difficulty || 'medium',
        meteorPosition,
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
        item.question === currentQuestion.question
      )
      if (questionItem) {
        progressService.updateProgress(questionItem.id, true, 'meteor')
      }
      
      setTimeout(() => {
        spawnNextMeteor()
      }, 1000)
    } else {
      // Wrong answer - meteor falls faster
      setStreak(0)
      fallSpeedRef.current = fallSpeedRef.current * 2
      
      // Update progress as incorrect
      const topicId = storageService.getCurrentTopic()
      const content = storageService.getContent(topicId)
      const questionItem = content.items.find(item => 
        item.question === currentQuestion.question
      )
      if (questionItem) {
        progressService.updateProgress(questionItem.id, false, 'meteor')
      }
      
      setTimeout(() => {
        setDisabled(false)
        setShowFeedback(false)
        fallSpeedRef.current = FALL_SPEEDS[currentQuestion.difficulty || 'medium']
      }, 800)
    }
  }, [disabled, currentQuestion, meteorPosition, streak, spawnNextMeteor])
  
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
    setMeteorPosition(GAME_CONFIG.METEOR_START_Y)
    setMeteorKey(prev => prev + 1)
    setDisabled(false)
    setShowFeedback(false)
    
    // Reload questions
    const topicId = storageService.getCurrentTopic()
    const content = storageService.getContent(topicId)
    const meteorQuestions = content.items.map(item => 
      questionAdapter.toMeteorFormat(item)
    )
    const shuffled = [...meteorQuestions].sort(() => Math.random() - 0.5)
    setQuestionQueue(shuffled)
    setCurrentQuestion(shuffled[0])
  }
  
  const handleReturnToMenu = () => {
    navigate('/hub')
  }
  
  // Update fall speed when question changes
  useEffect(() => {
    if (currentQuestion) {
      fallSpeedRef.current = FALL_SPEEDS[currentQuestion.difficulty || 'medium']
    }
  }, [currentQuestion])
  
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
  
  if (!currentQuestion) {
    return <div className="loading">Loading game...</div>
  }
  
  const correctIndex = currentQuestion.options.findIndex(option =>
    currentQuestion.acceptableAnswers.some(acceptable =>
      option.toLowerCase().trim() === acceptable
    )
  )
  
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
            <Meteor 
              key={meteorKey}
              question={currentQuestion.question}
              difficulty={currentQuestion.difficulty || 'medium'}
              position={meteorPosition}
              onHitGround={handleMeteorHitGround}
            />
            
            <AnswerButtons 
              options={currentQuestion.options}
              onAnswer={handleAnswer}
              disabled={disabled}
              correctIndex={correctIndex}
              showFeedback={showFeedback}
            />
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
        
        <div className="meteor-ground"></div>
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

