// Game logic and physics for Meteor Drop

export const FALL_SPEEDS = {
  easy: 0.4,    // percent per frame (faster - ~4 seconds to fall)
  medium: 0.25, // percent per frame (normal - ~6 seconds to fall)
  hard: 0.15    // percent per frame (slower - ~10 seconds to fall, more time to think)
}

export const GAME_CONFIG = {
  INITIAL_LIVES: 3,
  SPAWN_DELAY: 1000, // ms between meteors
  GROUND_POSITION: 85, // percentage from top
  METEOR_START_Y: -10, // percentage from top
  BONUS_LIFE_INTERVAL: 10, // correct answers needed for bonus life
}

export const POINTS = {
  easy: 10,
  medium: 20,
  hard: 30
}

export const SPEED_BONUS = {
  top: 0.5,     // +50% if answered in top third
  middle: 0.25, // +25% if answered in middle third
  bottom: 0     // No bonus in bottom third
}

export const STREAK_MULTIPLIERS = [1, 2, 3, 5, 5] // Max at 5x

export const calculateScore = (difficulty, position, streak) => {
  const basePoints = POINTS[difficulty] || POINTS.medium
  
  // Calculate speed bonus based on position (0-100)
  let speedBonus = 0
  if (position < 33) {
    speedBonus = basePoints * SPEED_BONUS.top
  } else if (position < 66) {
    speedBonus = basePoints * SPEED_BONUS.middle
  }
  
  const multiplier = STREAK_MULTIPLIERS[Math.min(streak, STREAK_MULTIPLIERS.length - 1)]
  
  return Math.floor((basePoints + speedBonus) * multiplier)
}

export const getStreakMultiplier = (streak) => {
  return STREAK_MULTIPLIERS[Math.min(streak, STREAK_MULTIPLIERS.length - 1)]
}

export const getMeteorStyle = (difficulty) => {
  const styles = {
    easy: {
      color: '#FF6B35',
      size: 80,
      icon: '🔥',
      glow: '0 0 20px #FF6B35, 0 0 40px #FF6B35'
    },
    medium: {
      color: '#4ECDC4',
      size: 100,
      icon: '☄️',
      glow: '0 0 20px #4ECDC4, 0 0 40px #4ECDC4'
    },
    hard: {
      color: '#9B59B6',
      size: 120,
      icon: '💎',
      glow: '0 0 20px #9B59B6, 0 0 40px #9B59B6, 0 0 60px #9B59B6'
    }
  }
  
  return styles[difficulty] || styles.medium
}

export const shouldEarnBonusLife = (correctAnswers) => {
  return correctAnswers > 0 && correctAnswers % GAME_CONFIG.BONUS_LIFE_INTERVAL === 0
}

