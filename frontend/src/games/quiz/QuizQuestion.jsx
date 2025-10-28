import { useState, useEffect } from 'react'
import './QuizQuestion.css'

function QuizQuestion({ 
  questions, 
  currentQuestion, 
  userAnswers, 
  quizMode,
  totalOriginalQuestions,
  masteredCount,
  attemptCount,
  onAnswerSelect, 
  onNext, 
  onPrevious, 
  onSubmit 
}) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(-1)
  
  const question = questions[currentQuestion]
  const isFirstQuestion = currentQuestion === 0
  const isLastQuestion = currentQuestion === questions.length - 1
  const hasAnsweredCurrent = quizMode === 'end' && userAnswers[currentQuestion] !== -1
  const allAnswered = quizMode === 'end' && userAnswers.every(answer => answer !== -1)
  const userAnswer = quizMode === 'end' ? userAnswers[currentQuestion] : selectedAnswer
  const isCorrect = userAnswer === question.correctAnswer

  // Reset state when question changes
  useEffect(() => {
    setShowFeedback(false)
    setSelectedAnswer(-1)
  }, [currentQuestion, questions, question])

  const handleOptionClick = (optionIndex) => {
    if (quizMode === 'instant') {
      if (selectedAnswer !== -1) {
        return // Already answered this question
      }
      
      setSelectedAnswer(optionIndex)
      setShowFeedback(true)
      
    } else {
      // End mode - just record the answer
      onAnswerSelect(optionIndex, false)
    }
  }

  const handleInstantModeNext = () => {
    const correct = selectedAnswer === question.correctAnswer
    onAnswerSelect(selectedAnswer, correct)
  }

  const handleNextClick = () => {
    setShowFeedback(false)
    setSelectedAnswer(-1)
    onNext()
  }

  const getOptionClassName = (index) => {
    let className = 'option-btn'
    
    if (quizMode === 'instant' && selectedAnswer !== -1) {
      // Show correct/incorrect in instant mode after selection
      if (index === question.correctAnswer) {
        className += ' correct'
      } else if (index === selectedAnswer) {
        className += ' incorrect'
      }
    } else if (quizMode === 'end' && userAnswer === index) {
      className += ' selected'
    }
    
    return className
  }

  return (
    <div className="quiz-question-container">
      <div className="quiz-progress">
        {quizMode === 'instant' ? (
          <>
            <div className="progress-text">
              {questions.length} question{questions.length !== 1 ? 's' : ''} remaining | 
              {masteredCount} of {totalOriginalQuestions} mastered | 
              {attemptCount} total attempts
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(masteredCount / totalOriginalQuestions) * 100}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="progress-text">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </>
        )}
      </div>

      <div className="question-card">
        <h2 className="question-text">{question.question}</h2>

        <div className="options-container">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={getOptionClassName(index)}
              onClick={() => handleOptionClick(index)}
              disabled={(quizMode === 'instant' && selectedAnswer !== -1)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>

        {quizMode === 'instant' && showFeedback && selectedAnswer !== -1 && (
          <div className={`feedback-box ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
            <div className="feedback-header">
              {isCorrect ? (
                <>
                  <span className="feedback-icon">✓</span>
                  <strong>Correct! Question mastered!</strong>
                </>
              ) : (
                <>
                  <span className="feedback-icon">✗</span>
                  <strong>Incorrect - This question will appear again</strong>
                </>
              )}
            </div>
            <div className="feedback-reasoning">
              <p><strong>Explanation:</strong></p>
              <p>{question.reasoning}</p>
            </div>
            <div className="feedback-actions">
              <button onClick={handleInstantModeNext} className="next-question-btn primary-btn">
                Continue
              </button>
            </div>
          </div>
        )}
      </div>

      {quizMode === 'end' && (
        <div className="navigation-buttons">
          <button
            onClick={onPrevious}
            disabled={isFirstQuestion}
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
      )}

      {quizMode === 'end' && (
        <div className="question-indicators">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === currentQuestion ? 'current' : ''} ${userAnswers[index] !== -1 ? 'answered' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default QuizQuestion
