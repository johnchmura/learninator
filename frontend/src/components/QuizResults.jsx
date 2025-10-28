import './QuizResults.css'

function QuizResults({ results, quizMode, onRestart }) {
  const { score, total, percentage, totalAttempts, results: questionResults } = results
  const totalIncorrectAttempts = questionResults.reduce((sum, r) => sum + (r.incorrectAttempts || 0), 0)

  const getScoreColor = (pct) => {
    if (pct >= 80) return 'excellent'
    if (pct >= 60) return 'good'
    if (pct >= 40) return 'average'
    return 'poor'
  }

  const getScoreMessage = (pct) => {
    if (pct === 100) return 'Perfect Score!'
    if (pct >= 80) return 'Excellent Work!'
    if (pct >= 60) return 'Good Job!'
    if (pct >= 40) return 'Not Bad!'
    return 'Keep Practicing!'
  }

  return (
    <div className="quiz-results-container">
      <div className="results-header">
        <h2>Quiz Complete!</h2>
        <div className={`score-circle ${getScoreColor(percentage)}`}>
          <div className="score-number">{score}/{total}</div>
          <div className="score-percentage">{percentage}%</div>
        </div>
        <div className="score-message">{getScoreMessage(percentage)}</div>
      </div>

      <div className="results-summary">
        <div className="summary-item correct">
          <span className="summary-label">Correct</span>
          <span className="summary-value">{score}</span>
        </div>
        <div className="summary-item incorrect">
          <span className="summary-label">Incorrect Attempts</span>
          <span className="summary-value">{quizMode === 'instant' ? totalIncorrectAttempts : total - score}</span>
          {quizMode === 'instant' && totalIncorrectAttempts > 0 && (
            <span className="summary-sublabel">before mastery</span>
          )}
        </div>
        <div className="summary-item total">
          <span className="summary-label">Total Questions</span>
          <span className="summary-value">{total}</span>
        </div>
      </div>

      <div className="results-details">
        <h3>Question Review</h3>
        {questionResults.map((result, index) => (
          <div key={index} className={`result-item ${result.isCorrect ? 'correct-answer' : 'wrong-answer'}`}>
            <div className="result-header">
              <span className="result-number">Q{index + 1}</span>
              <span className={`result-badge ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                {result.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <div className="result-question">{result.question}</div>
            <div className="result-answers">
              <div className="answer-row">
                <span className="answer-label">Your answer:</span>
                <span className={`answer-value ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                  {String.fromCharCode(65 + result.userAnswer)}
                </span>
              </div>
              {!result.isCorrect && (
                <div className="answer-row">
                  <span className="answer-label">Correct answer:</span>
                  <span className="answer-value correct">
                    {String.fromCharCode(65 + result.correctAnswer)}
                  </span>
                </div>
              )}
            </div>
            <div className="result-reasoning">
              <p className="reasoning-label">Explanation:</p>
              <p className="reasoning-text">{result.reasoning}</p>
            </div>
            {quizMode === 'instant' && result.incorrectAttempts > 0 && (
              <div className="result-attempts">
                <span className="attempts-badge">
                  {result.incorrectAttempts} incorrect attempt{result.incorrectAttempts !== 1 ? 's' : ''} before mastery
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={onRestart} className="restart-btn primary-btn">
        Start New Quiz
      </button>
    </div>
  )
}

export default QuizResults

