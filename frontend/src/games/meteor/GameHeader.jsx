import './MeteorGame.css'

function GameHeader({ lives, score, streak, onPause }) {
  const hearts = '❤️'.repeat(lives)
  const streakText = streak > 0 ? `${streak + 1}x` : '1x'
  
  return (
    <div className="meteor-header">
      <div className="meteor-stat">
        <span className="stat-label">Lives:</span>
        <span className="stat-value lives">{hearts || '💔'}</span>
      </div>
      
      <div className="meteor-stat">
        <span className="stat-label">Score:</span>
        <span className="stat-value score">{score.toLocaleString()}</span>
      </div>
      
      <div className="meteor-stat">
        <span className="stat-label">Streak:</span>
        <span className={`stat-value streak streak-${Math.min(streak, 4)}`}>
          {streakText}
        </span>
      </div>
      
      <button className="pause-btn" onClick={onPause}>
        ⏸ Pause
      </button>
    </div>
  )
}

export default GameHeader

