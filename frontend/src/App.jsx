import { useState } from 'react'
import QuizInput from './components/QuizInput'
import QuizQuestion from './components/QuizQuestion'
import QuizResults from './components/QuizResults'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('input') // 'input', 'quiz', 'results'
  const [originalQuestions, setOriginalQuestions] = useState(null) // Original questions for reference
  const [questionQueue, setQuestionQueue] = useState([]) // Queue of questions to answer (for instant mode)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([]) // All answers given (for end mode)
  const [masteredQuestions, setMasteredQuestions] = useState(new Set()) // Questions answered correctly (for instant mode)
  const [incorrectAttempts, setIncorrectAttempts] = useState({}) // Track incorrect attempts per question
  const [results, setResults] = useState(null)
  const [quizMode, setQuizMode] = useState('end') // 'instant' or 'end'
  const [attemptCount, setAttemptCount] = useState(0) // Track total attempts in instant mode

  const handleQuizStart = (questions, mode) => {
    setOriginalQuestions(questions)
    setQuizMode(mode)
    
    if (mode === 'instant') {
      // In instant mode, start with question queue
      setQuestionQueue([...questions])
      setCurrentQuestionIndex(0)
      setMasteredQuestions(new Set())
      setIncorrectAttempts({})
      setAttemptCount(0)
    } else {
      // In end mode, use traditional approach
      setUserAnswers(new Array(questions.length).fill(-1))
      setCurrentQuestionIndex(0)
    }
    
    setCurrentView('quiz')
  }

  const handleAnswerSelect = (answerIndex, isCorrect) => {
    if (quizMode === 'instant') {
      // Instant mode: track if correct
      setAttemptCount(prev => prev + 1)
      
      if (isCorrect) {
        // Mark this question as mastered
        const currentQuestion = questionQueue[currentQuestionIndex]
        const newMastered = new Set(masteredQuestions)
        newMastered.add(currentQuestion)
        setMasteredQuestions(newMastered)
        
        // Remove from queue
        const newQueue = [...questionQueue]
        newQueue.splice(currentQuestionIndex, 1)
        setQuestionQueue(newQueue)
        
        // Check if all questions are mastered
        if (newQueue.length === 0) {
          // All done! Show results
          handleInstantModeComplete()
        } else {
          // Move to next question (or stay at same index if we're at the end)
          if (currentQuestionIndex >= newQueue.length) {
            setCurrentQuestionIndex(newQueue.length - 1)
          }
        }
      } else {
        // Wrong answer: track incorrect attempt and move question to end of queue
        const currentQuestion = questionQueue[currentQuestionIndex]
        const questionId = JSON.stringify(currentQuestion) // Use stringified question as ID
        
        setIncorrectAttempts(prev => ({
          ...prev,
          [questionId]: (prev[questionId] || 0) + 1
        }))
        
        const newQueue = [...questionQueue]
        newQueue.splice(currentQuestionIndex, 1) // Remove from current position
        newQueue.push(currentQuestion) // Add to end
        setQuestionQueue(newQueue)
        
        // Determine next question index
        if (newQueue.length === 1) {
          // Only one question left - stay at index 0 but force re-render
          setCurrentQuestionIndex(-1)
          setTimeout(() => setCurrentQuestionIndex(0), 0)
        } else if (currentQuestionIndex >= newQueue.length - 1) {
          // Was at last question, wrap to start
          setCurrentQuestionIndex(0)
        }
        // If not at end, the "next" question is now at the current index (stays same)
      }
    } else {
      // End mode: just store the answer
      const newAnswers = [...userAnswers]
      newAnswers[currentQuestionIndex] = answerIndex
      setUserAnswers(newAnswers)
    }
  }

  const handleInstantModeComplete = async () => {
    // Create results for instant mode - all answers are correct
    const resultsData = {
      score: originalQuestions.length,
      total: originalQuestions.length,
      percentage: 100,
      totalAttempts: attemptCount,
      results: originalQuestions.map((q, idx) => {
        const questionId = JSON.stringify(q)
        return {
          questionIndex: idx,
          question: q.question,
          userAnswer: q.correctAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect: true,
          reasoning: q.reasoning,
          incorrectAttempts: incorrectAttempts[questionId] || 0
        }
      })
    }
    setResults(resultsData)
    setCurrentView('results')
  }

  const handleNext = () => {
    if (quizMode === 'instant') {
      // In instant mode, can't manually navigate
      return
    }
    setCurrentQuestionIndex(prev => prev + 1)
  }

  const handlePrevious = () => {
    if (quizMode === 'instant') {
      // In instant mode, can't go back
      return
    }
    setCurrentQuestionIndex(prev => prev - 1)
  }

  const handleSubmitQuiz = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: userAnswers,
          questions: originalQuestions
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }
      
      const data = await response.json()
      setResults(data)
      setCurrentView('results')
    } catch (error) {
      alert('Error submitting quiz: ' + error.message)
    }
  }

  const handleRestart = () => {
    setCurrentView('input')
    setOriginalQuestions(null)
    setQuestionQueue([])
    setUserAnswers([])
    setCurrentQuestionIndex(0)
    setMasteredQuestions(new Set())
    setIncorrectAttempts({})
    setResults(null)
    setQuizMode('end')
    setAttemptCount(0)
  }

  // Get current questions and answers based on mode
  const getCurrentQuestions = () => {
    return quizMode === 'instant' ? questionQueue : originalQuestions
  }

  const getCurrentAnswers = () => {
    return quizMode === 'instant' ? [] : userAnswers
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quiz App</h1>
      </header>
      
      <main className="app-main">
        {currentView === 'input' && (
          <QuizInput onQuizStart={handleQuizStart} />
        )}
        
        {currentView === 'quiz' && getCurrentQuestions().length > 0 && currentQuestionIndex >= 0 && (
          <QuizQuestion
            key={`question-${currentQuestionIndex}-${quizMode}`}
            questions={getCurrentQuestions()}
            currentQuestion={currentQuestionIndex}
            userAnswers={getCurrentAnswers()}
            quizMode={quizMode}
            totalOriginalQuestions={originalQuestions?.length || 0}
            masteredCount={masteredQuestions.size}
            attemptCount={attemptCount}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={handleSubmitQuiz}
          />
        )}
        
        {currentView === 'results' && results && (
          <QuizResults results={results} quizMode={quizMode} onRestart={handleRestart} />
        )}
      </main>
    </div>
  )
}

export default App
