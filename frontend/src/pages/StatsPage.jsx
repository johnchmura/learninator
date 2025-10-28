import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import storageService from '../services/storageService'
import progressService from '../services/progressService'
import './StatsPage.css'

function StatsPage() {
  const navigate = useNavigate()
  const [currentTopic, setCurrentTopic] = useState(null)
  const [masteryStats, setMasteryStats] = useState(null)
  const [questionProgress, setQuestionProgress] = useState([])
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const topicId = storageService.getCurrentTopic()
    if (!topicId) {
      navigate('/')
      return
    }

    const topic = storageService.getContent(topicId)
    if (!topic) {
      navigate('/')
      return
    }

    setCurrentTopic(topic)
    setMasteryStats(progressService.getMasteryStats(topicId))
    setProfile(storageService.getProfile())

    // Load progress for each question
    const progressData = topic.items.map(item => {
      const progress = storageService.getProgress(item.id) || progressService.initializeProgress(item.id)
      return {
        question: item.question,
        ...progress
      }
    })
    setQuestionProgress(progressData)
  }, [navigate])

  const handleBackToHub = () => {
    navigate('/hub')
  }

  const getMasteryLevelName = (level) => {
    const names = ['New', 'Learning', 'Familiar', 'Proficient', 'Advanced', 'Mastered']
    return names[level] || 'Unknown'
  }

  const getMasteryColor = (level) => {
    const colors = ['#9e9e9e', '#ff5722', '#ff9800', '#ffeb3b', '#8bc34a', '#4caf50']
    return colors[level] || '#999'
  }

  if (!currentTopic || !masteryStats) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="stats-page">
      <div className="stats-container">
        <div className="stats-header">
          <button className="back-btn" onClick={handleBackToHub}>
            ← Back to Hub
          </button>
          <h1>Progress Statistics</h1>
          <p className="topic-name">{currentTopic.topic}</p>
        </div>

        {profile && (
          <div className="profile-card">
            <div className="profile-stat">
              <h3>Level {profile.level}</h3>
              <p>{profile.totalXP} Total XP</p>
            </div>
            <div className="profile-stat">
              <h3>{Object.values(profile.gamesPlayed).reduce((a, b) => a + b, 0)}</h3>
              <p>Games Played</p>
            </div>
            <div className="profile-stat">
              <h3>{masteryStats.mastered}/{masteryStats.total}</h3>
              <p>Questions Mastered</p>
            </div>
          </div>
        )}

        <div className="overall-stats">
          <h2>Overall Performance</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{masteryStats.total}</div>
              <div className="stat-label">Total Questions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{masteryStats.totalAttempts}</div>
              <div className="stat-label">Total Attempts</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{masteryStats.correctRate.toFixed(1)}%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{masteryStats.averageMastery.toFixed(1)}</div>
              <div className="stat-label">Avg Mastery Level</div>
            </div>
          </div>
        </div>

        <div className="question-details">
          <h2>Question-by-Question Progress</h2>
          <div className="questions-list">
            {questionProgress.map((progress, index) => (
              <div key={index} className="question-item">
                <div className="question-header">
                  <span className="question-number">Q{index + 1}</span>
                  <span 
                    className="mastery-badge"
                    style={{ background: getMasteryColor(progress.masteryLevel) }}
                  >
                    {getMasteryLevelName(progress.masteryLevel)}
                  </span>
                </div>
                <p className="question-text">{progress.question}</p>
                <div className="question-stats">
                  <div className="stat-item">
                    <span className="stat-value">{progress.totalAttempts}</span>
                    <span className="stat-name">Attempts</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value correct">{progress.correctAttempts}</span>
                    <span className="stat-name">Correct</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value incorrect">{progress.incorrectAttempts}</span>
                    <span className="stat-name">Incorrect</span>
                  </div>
                  {progress.totalAttempts > 0 && (
                    <div className="stat-item">
                      <span className="stat-value">
                        {((progress.correctAttempts / progress.totalAttempts) * 100).toFixed(0)}%
                      </span>
                      <span className="stat-name">Accuracy</span>
                    </div>
                  )}
                </div>
                {progress.lastAttempted && (
                  <p className="last-attempted">
                    Last attempted: {new Date(progress.lastAttempted).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {profile && Object.keys(profile.gamesPlayed).length > 0 && (
          <div className="games-stats">
            <h2>Game Statistics</h2>
            <div className="games-list">
              {Object.entries(profile.gamesPlayed).map(([game, count]) => (
                <div key={game} className="game-stat-item">
                  <span className="game-name">{game.charAt(0).toUpperCase() + game.slice(1)}</span>
                  <span className="game-count">{count} sessions</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsPage

