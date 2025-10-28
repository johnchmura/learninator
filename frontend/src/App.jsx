import { useState } from 'react'
import QuizInput from './components/QuizInput'
import QuizQuestion from './components/QuizQuestion'
import QuizResults from './components/QuizResults'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('input') // 'input', 'quiz', 'results'
  const [quizData, setQuizData] = useState(null)
  const [userAnswers, setUserAnswers] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [results, setResults] = useState(null)

  const handleQuizStart = (questions) => {
    setQuizData(questions)
    setUserAnswers(new Array(questions.length).fill(-1))
    setCurrentQuestion(0)
    setCurrentView('quiz')
  }

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    const newAnswers = [...userAnswers]
    newAnswers[questionIndex] = answerIndex
    setUserAnswers(newAnswers)
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
          questions: quizData
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
    setQuizData(null)
    setUserAnswers([])
    setCurrentQuestion(0)
    setResults(null)
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
        
        {currentView === 'quiz' && quizData && (
          <QuizQuestion
            questions={quizData}
            currentQuestion={currentQuestion}
            userAnswers={userAnswers}
            onAnswerSelect={handleAnswerSelect}
            onNext={() => setCurrentQuestion(prev => prev + 1)}
            onPrevious={() => setCurrentQuestion(prev => prev - 1)}
            onSubmit={handleSubmitQuiz}
          />
        )}
        
        {currentView === 'results' && results && (
          <QuizResults results={results} onRestart={handleRestart} />
        )}
      </main>
    </div>
  )
}

export default App

