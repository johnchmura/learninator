import { useState } from 'react'
import './QuizQuestion.css'

function QuizQuestion({ 
  questions, 
  currentQuestion, 
  userAnswers, 
  quizMode,
  onAnswerSelect, 
  onNext, 
  onPrevious, 
  onSubmit 
}) {
  const [showFeedback, setShowFeedback] = useState(false)
  
  const question = questions[currentQuestion]
  const isFirstQuestion = currentQuestion === 0
  const isLastQuestion = currentQuestion === questions.length - 1
  const hasAnsweredCurrent = userAnswers[currentQuestion] !== -1
  const allAnswered = userAnswers.every(answer => answer !== -1)
  const userAnswer = userAnswers[currentQuestion]
  const isCorrect = userAnswer === question.correctAnswer

  const handleOptionClick = (optionIndex) => {
    if (quizMode === 'instant' && hasAnsweredCurrent) {
      return // Don't allow changing answer in instant mode
    }
    
    onAnswerSelect(currentQuestion, optionIndex)
    
    if (quizMode === 'instant') {
      setShowFeedback(true)
    }
  }

  const handleNextClick = () => {
    setShowFeedback(false)
    onNext()
  }

  const getOptionClassName = (index) => {
    let className = 'option-btn'
    
    if (quizMode === 'instant' && hasAnsweredCurrent) {
      // Show correct/incorrect in instant mode
      if (index === question.correctAnswer) {
        className += ' correct'
      } else if (index === userAnswer) {
        className += ' incorrect'
      }
    } else if (userAnswer === index) {
      className += ' selected'
    }
    
    return className
  }

  return (
    <div className="quiz-question-container">
      <div className="quiz-progress">
        <div className="progress-text">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="question-card">
        <h2 className="question-text">{question.question}</h2>

        <div className="options-container">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={getOptionClassName(index)}
              onClick={() => handleOptionClick(index)}
              disabled={quizMode === 'instant' && hasAnsweredCurrent}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>

        {quizMode === 'instant' && showFeedback && hasAnsweredCurrent && (
          <div className={`feedback-box ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
            <div className="feedback-header">
              {isCorrect ? (
                <>
                  <span className="feedback-icon">✓</span>
                  <strong>Correct!</strong>
                </>
              ) : (
                <>
                  <span className="feedback-icon">✗</span>
                  <strong>Incorrect</strong>
                </>
              )}
            </div>
            <div className="feedback-reasoning">
              <p><strong>Explanation:</strong></p>
              <p>{question.reasoning}</p>
            </div>
          </div>
        )}
      </div>

      <div className="navigation-buttons">
        <button
          onClick={onPrevious}
          disabled={isFirstQuestion || (quizMode === 'instant' && !hasAnsweredCurrent)}
          className="nav-btn secondary-btn"
        >
          Previous
        </button>

        <div className="answer-status">
          {hasAnsweredCurrent ? (
            <span className="answered">Answered</span>
          ) : (
            <span className="not-answered">Select an answer</span>
          )}
        </div>

        {!isLastQuestion ? (
          <button
            onClick={handleNextClick}
            disabled={!hasAnsweredCurrent}
            className="nav-btn primary-btn"
          >
            Next
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={!allAnswered}
            className="nav-btn submit-btn"
          >
            {allAnswered ? 'Submit Quiz' : 'Answer all questions'}
          </button>
        )}
      </div>

      <div className="question-indicators">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`indicator ${index === currentQuestion ? 'current' : ''} ${userAnswers[index] !== -1 ? 'answered' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

export default QuizQuestion
