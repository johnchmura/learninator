import './MeteorGame.css'

function GameOverScreen({ score, questionsAnswered, correctAnswers, highestStreak, onPlayAgain, onReturnToMenu }) {
  const accuracy = questionsAnswered > 0 
    ? Math.round((correctAnswers / questionsAnswered) * 100) 
    : 0
  
  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <h2 className="game-over-title">GAME OVER!</h2>
        
        <div className="game-over-stats">
          <div className="final-stat">
            <span className="final-stat-label">Final Score</span>
            <span className="final-stat-value">{score.toLocaleString()}</span>
          </div>
          
          <div className="final-stat">
            <span className="final-stat-label">Questions Answered</span>
            <span className="final-stat-value">{questionsAnswered}</span>
          </div>
          
          <div className="final-stat">
            <span className="final-stat-label">Accuracy</span>
            <span className="final-stat-value">{accuracy}%</span>
          </div>
          
          <div className="final-stat">
            <span className="final-stat-label">Highest Streak</span>
            <span className="final-stat-value">{highestStreak + 1}x</span>
          </div>
        </div>
        
        <div className="game-over-actions">
          <button className="game-over-btn primary" onClick={onPlayAgain}>
            Play Again
          </button>
          <button className="game-over-btn secondary" onClick={onReturnToMenu}>
            Return to Menu
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameOverScreen

