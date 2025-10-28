import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import storageService from '../../services/storageService'
import progressService from '../../services/progressService'
import questionAdapter from '../../services/questionAdapter'
import QuizQuestion from './QuizQuestion'
import QuizResults from './QuizResults'
import './QuizGame.css'

function QuizGame() {
  const navigate = useNavigate()
  const [currentView, setCurrentView] = useState('mode-select') // 'mode-select', 'quiz', 'results'
  const [questions, setQuestions] = useState([])
  const [quizData, setQuizData] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [questionQueue, setQuestionQueue] = useState([])
  const [masteredQuestions, setMasteredQuestions] = useState(new Set())
  const [incorrectAttempts, setIncorrectAttempts] = useState({})
  const [results, setResults] = useState(null)
  const [quizMode, setQuizMode] = useState('end')
  const [attemptCount, setAttemptCount] = useState(0)

  useEffect(() => {
    // Load current topic
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

    // Convert to quiz format
    const quizQuestions = questionAdapter.toQuizFormatBatch(content.items)
    setQuestions(quizQuestions)
    setQuizData(content)
  }, [navigate])

  const handleModeSelect = (mode) => {
    setQuizMode(mode)
    
    if (mode === 'instant') {
      setQuestionQueue([...questions])
      setCurrentQuestionIndex(0)
      setMasteredQuestions(new Set())
      setIncorrectAttempts({})
      setAttemptCount(0)
    } else {
      setUserAnswers(new Array(questions.length).fill(-1))
      setCurrentQuestionIndex(0)
    }
    
    setCurrentView('quiz')
  }

  const handleAnswerSelect = (answerIndex, isCorrect) => {
    if (quizMode === 'instant') {
      setAttemptCount(prev => prev + 1)
      
      const currentQuestion = questionQueue[currentQuestionIndex]
      const questionId = quizData.items[questions.indexOf(currentQuestion)].id
      
      // Update progress in the system
      progressService.updateProgress(questionId, isCorrect, 'quiz')
      
      if (isCorrect) {
        const newMastered = new Set(masteredQuestions)
        newMastered.add(currentQuestion)
        setMasteredQuestions(newMastered)
        
        const newQueue = [...questionQueue]
        newQueue.splice(currentQuestionIndex, 1)
        setQuestionQueue(newQueue)
        
        if (newQueue.length === 0) {
          handleInstantModeComplete()
        } else {
          if (currentQuestionIndex >= newQueue.length) {
            setCurrentQuestionIndex(newQueue.length - 1)
          }
        }
      } else {
        const questionStringId = JSON.stringify(currentQuestion)
        
        setIncorrectAttempts(prev => ({
          ...prev,
          [questionStringId]: (prev[questionStringId] || 0) + 1
        }))
        
        const newQueue = [...questionQueue]
        newQueue.splice(currentQuestionIndex, 1)
        newQueue.push(currentQuestion)
        setQuestionQueue(newQueue)
        
        if (newQueue.length === 1) {
          setCurrentQuestionIndex(-1)
          setTimeout(() => setCurrentQuestionIndex(0), 0)
        } else if (currentQuestionIndex >= newQueue.length - 1) {
          setCurrentQuestionIndex(0)
        }
      }
    } else {
      const newAnswers = [...userAnswers]
      newAnswers[currentQuestionIndex] = answerIndex
      setUserAnswers(newAnswers)
    }
  }

  const handleInstantModeComplete = () => {
    // Calculate score based on first-attempt accuracy
    let firstAttemptCorrect = 0
    
    const resultsData = {
      score: 0,
      total: questions.length,
      percentage: 0,
      totalAttempts: attemptCount,
      results: questions.map((q, idx) => {
        const questionStringId = JSON.stringify(q)
        const incorrectCount = incorrectAttempts[questionStringId] || 0
        const wasCorrectFirstTime = incorrectCount === 0
        
        if (wasCorrectFirstTime) {
          firstAttemptCorrect++
        }
        
        return {
          questionIndex: idx,
          question: q.question,
          userAnswer: q.correctAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect: wasCorrectFirstTime,
          reasoning: q.reasoning,
          incorrectAttempts: incorrectCount
        }
      })
    }
    
    resultsData.score = firstAttemptCorrect
    resultsData.percentage = Math.round((firstAttemptCorrect / questions.length) * 100)
    
    setResults(resultsData)
    setCurrentView('results')
  }

  const handleNext = () => {
    setCurrentQuestionIndex(prev => prev + 1)
  }

  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => prev - 1)
  }

  const handleSubmitQuiz = async () => {
    // Calculate results
    const resultsData = {
      score: 0,
      total: questions.length,
      percentage: 0,
      results: []
    }

    questions.forEach((q, idx) => {
      const isCorrect = userAnswers[idx] === q.correctAnswer
      const questionId = quizData.items[idx].id
      
      // Update progress
      progressService.updateProgress(questionId, isCorrect, 'quiz')
      
      if (isCorrect) {
        resultsData.score++
      }
      
      resultsData.results.push({
        questionIndex: idx,
        question: q.question,
        userAnswer: userAnswers[idx],
        correctAnswer: q.correctAnswer,
        isCorrect,
        reasoning: q.reasoning
      })
    })

    resultsData.percentage = Math.round((resultsData.score / resultsData.total) * 100)
    setResults(resultsData)
    setCurrentView('results')
  }

  const handleRestart = () => {
    navigate('/hub')
  }

  const getCurrentQuestions = () => {
    return quizMode === 'instant' ? questionQueue : questions
  }

  const getCurrentAnswers = () => {
    return quizMode === 'instant' ? [] : userAnswers
  }

  if (!questions.length) {
    return <div className="loading">Loading quiz...</div>
  }

  return (
    <div className="quiz-game">
      {currentView === 'mode-select' && (
        <div className="mode-select-container">
          <div className="mode-select-card">
            <button className="back-btn" onClick={() => navigate('/hub')}>
              ← Back to Hub
            </button>
            <h1>Choose Quiz Mode</h1>
            <p className="mode-subtitle">Select how you want to learn</p>
            
            <div className="mode-options">
              <div 
                className="mode-card instant-mode"
                onClick={() => handleModeSelect('instant')}
              >
                <div className="mode-icon">⚡</div>
                <h2>Instant Feedback</h2>
                <h3>Mastery Mode</h3>
                <p>See results immediately with explanations. Wrong answers are added back to the queue - keep going until you master them all!</p>
                <ul className="mode-features">
                  <li>Immediate feedback</li>
                  <li>Repeat until mastered</li>
                  <li>Perfect for learning</li>
                </ul>
                <button className="select-mode-btn">Select Mode</button>
              </div>

              <div 
                className="mode-card end-mode"
                onClick={() => handleModeSelect('end')}
              >
                <div className="mode-icon">📊</div>
                <h2>Results at End</h2>
                <h3>Testing Mode</h3>
                <p>Complete all questions first, then see your score and explanations at the end</p>
                <ul className="mode-features">
                  <li>Quiz-style testing</li>
                  <li>See all results together</li>
                  <li>Perfect for assessment</li>
                </ul>
                <button className="select-mode-btn">Select Mode</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'quiz' && getCurrentQuestions().length > 0 && currentQuestionIndex >= 0 && (
        <div className="quiz-container">
          <QuizQuestion
            key={`question-${currentQuestionIndex}-${quizMode}`}
            questions={getCurrentQuestions()}
            currentQuestion={currentQuestionIndex}
            userAnswers={getCurrentAnswers()}
            quizMode={quizMode}
            totalOriginalQuestions={questions.length}
            masteredCount={masteredQuestions.size}
            attemptCount={attemptCount}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={handleSubmitQuiz}
          />
        </div>
      )}

      {currentView === 'results' && results && (
        <div className="results-container">
          <QuizResults 
            results={results} 
            quizMode={quizMode} 
            onRestart={handleRestart} 
          />
        </div>
      )}
    </div>
  )
}

export default QuizGame

