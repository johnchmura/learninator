import './QuizQuestion.css'

function QuizQuestion({ 
  questions, 
  currentQuestion, 
  userAnswers, 
  onAnswerSelect, 
  onNext, 
  onPrevious, 
  onSubmit 
}) {
  const question = questions[currentQuestion]
  const isFirstQuestion = currentQuestion === 0
  const isLastQuestion = currentQuestion === questions.length - 1
  const hasAnsweredCurrent = userAnswers[currentQuestion] !== -1
  const allAnswered = userAnswers.every(answer => answer !== -1)

  const handleOptionClick = (optionIndex) => {
    onAnswerSelect(currentQuestion, optionIndex)
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
              className={`option-btn ${userAnswers[currentQuestion] === index ? 'selected' : ''}`}
              onClick={() => handleOptionClick(index)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>
      </div>

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
            onClick={onNext}
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

