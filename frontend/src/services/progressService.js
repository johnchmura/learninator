// Progress tracking and mastery calculation service

import storageService from './storageService'

class ProgressService {
  // Mastery levels: 0 (new) -> 5 (mastered)
  MASTERY_LEVELS = {
    NEW: 0,
    LEARNING: 1,
    FAMILIAR: 2,
    PROFICIENT: 3,
    ADVANCED: 4,
    MASTERED: 5
  }

  // Initialize progress for a question
  initializeProgress(questionId) {
    const existing = storageService.getProgress(questionId)
    if (existing) return existing

    const initialProgress = {
      masteryLevel: this.MASTERY_LEVELS.NEW,
      totalAttempts: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      lastAttempted: null,
      nextReview: null,
      gameStats: {},
      confidenceHistory: [],
      notes: ''
    }

    storageService.saveProgress(questionId, initialProgress)
    return initialProgress
  }

  // Update progress after an attempt
  updateProgress(questionId, isCorrect, gameType, confidence = null) {
    const progress = this.initializeProgress(questionId)

    // Update attempt counts
    progress.totalAttempts += 1
    if (isCorrect) {
      progress.correctAttempts += 1
    } else {
      progress.incorrectAttempts += 1
    }

    // Update game-specific stats
    if (!progress.gameStats[gameType]) {
      progress.gameStats[gameType] = { attempts: 0, correct: 0 }
    }
    progress.gameStats[gameType].attempts += 1
    if (isCorrect) {
      progress.gameStats[gameType].correct += 1
    }

    // Update confidence history if provided
    if (confidence !== null) {
      progress.confidenceHistory.push(confidence)
      // Keep only last 10 confidence ratings
      if (progress.confidenceHistory.length > 10) {
        progress.confidenceHistory = progress.confidenceHistory.slice(-10)
      }
    }

    // Update mastery level
    progress.masteryLevel = this.calculateMasteryLevel(progress)

    // Update timestamps
    progress.lastAttempted = new Date().toISOString()
    progress.nextReview = this.calculateNextReview(progress)

    storageService.saveProgress(questionId, progress)
    
    // Update user profile XP
    this.updateXP(isCorrect, progress.masteryLevel, gameType)

    return progress
  }

  // Calculate mastery level based on performance
  calculateMasteryLevel(progress) {
    const { totalAttempts, correctAttempts, incorrectAttempts } = progress

    if (totalAttempts === 0) return this.MASTERY_LEVELS.NEW

    const accuracy = correctAttempts / totalAttempts
    const recentAccuracy = this.getRecentAccuracy(progress, 5)

    // Mastery criteria
    if (recentAccuracy >= 0.9 && correctAttempts >= 5) {
      return this.MASTERY_LEVELS.MASTERED
    } else if (accuracy >= 0.8 && correctAttempts >= 4) {
      return this.MASTERY_LEVELS.ADVANCED
    } else if (accuracy >= 0.7 && correctAttempts >= 3) {
      return this.MASTERY_LEVELS.PROFICIENT
    } else if (accuracy >= 0.5 && correctAttempts >= 2) {
      return this.MASTERY_LEVELS.FAMILIAR
    } else if (totalAttempts >= 1) {
      return this.MASTERY_LEVELS.LEARNING
    }

    return this.MASTERY_LEVELS.NEW
  }

  // Get recent accuracy from last N attempts
  getRecentAccuracy(progress, n = 5) {
    const gameStats = Object.values(progress.gameStats)
    if (gameStats.length === 0) return 0

    let recentCorrect = 0
    let recentTotal = 0

    gameStats.forEach(stat => {
      const attempts = Math.min(stat.attempts, n)
      recentTotal += attempts
      recentCorrect += Math.min(stat.correct, attempts)
    })

    return recentTotal > 0 ? recentCorrect / recentTotal : 0
  }

  // Calculate next review date based on spaced repetition
  calculateNextReview(progress) {
    const now = new Date()
    const masteryLevel = progress.masteryLevel
    
    // Interval in days based on mastery level
    const intervals = {
      [this.MASTERY_LEVELS.NEW]: 0,
      [this.MASTERY_LEVELS.LEARNING]: 1,
      [this.MASTERY_LEVELS.FAMILIAR]: 3,
      [this.MASTERY_LEVELS.PROFICIENT]: 7,
      [this.MASTERY_LEVELS.ADVANCED]: 14,
      [this.MASTERY_LEVELS.MASTERED]: 30
    }

    const daysUntilReview = intervals[masteryLevel] || 1
    const nextReview = new Date(now)
    nextReview.setDate(nextReview.getDate() + daysUntilReview)

    return nextReview.toISOString()
  }

  // Update user XP based on performance
  updateXP(isCorrect, masteryLevel, gameType) {
    const profile = storageService.getProfile()

    if (isCorrect) {
      // Base XP for correct answer
      let xp = 10
      
      // Bonus XP based on mastery level (higher level = more XP)
      xp += masteryLevel * 5
      
      // Game type multipliers
      const multipliers = {
        quiz: 1.0,
        meteor: 1.2,  // More XP for faster games
        flashcards: 1.1
      }
      xp = Math.floor(xp * (multipliers[gameType] || 1.0))

      profile.totalXP += xp
    }

    // Update games played count
    if (!profile.gamesPlayed[gameType]) {
      profile.gamesPlayed[gameType] = 0
    }
    profile.gamesPlayed[gameType] += 1

    // Calculate level (every 100 XP = 1 level)
    profile.level = Math.floor(profile.totalXP / 100) + 1

    storageService.saveProfile(profile)
  }

  // Get mastery stats for a topic
  getMasteryStats(topicId) {
    const content = storageService.getContent(topicId)
    if (!content || !content.items) return null

    const stats = {
      total: content.items.length,
      mastered: 0,
      advanced: 0,
      proficient: 0,
      familiar: 0,
      learning: 0,
      new: 0,
      averageMastery: 0,
      totalAttempts: 0,
      correctRate: 0
    }

    let totalMastery = 0
    let totalCorrect = 0
    let totalAttempts = 0

    content.items.forEach(item => {
      const progress = storageService.getProgress(item.id)
      if (!progress) {
        stats.new += 1
        return
      }

      totalMastery += progress.masteryLevel
      totalAttempts += progress.totalAttempts
      totalCorrect += progress.correctAttempts

      switch (progress.masteryLevel) {
        case this.MASTERY_LEVELS.MASTERED:
          stats.mastered += 1
          break
        case this.MASTERY_LEVELS.ADVANCED:
          stats.advanced += 1
          break
        case this.MASTERY_LEVELS.PROFICIENT:
          stats.proficient += 1
          break
        case this.MASTERY_LEVELS.FAMILIAR:
          stats.familiar += 1
          break
        case this.MASTERY_LEVELS.LEARNING:
          stats.learning += 1
          break
        default:
          stats.new += 1
      }
    })

    stats.averageMastery = stats.total > 0 ? totalMastery / stats.total : 0
    stats.totalAttempts = totalAttempts
    stats.correctRate = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0

    return stats
  }

  // Get questions that need review
  getQuestionsForReview(topicId) {
    const content = storageService.getContent(topicId)
    if (!content || !content.items) return []

    const now = new Date()
    const questionsForReview = []

    content.items.forEach(item => {
      const progress = storageService.getProgress(item.id)
      
      if (!progress || progress.masteryLevel < this.MASTERY_LEVELS.MASTERED) {
        if (!progress || !progress.nextReview || new Date(progress.nextReview) <= now) {
          questionsForReview.push(item)
        }
      }
    })

    return questionsForReview
  }

  // Get recommended game for a question
  getRecommendedGame(questionId) {
    const progress = storageService.getProgress(questionId)
    if (!progress) return 'quiz' // Default for new questions

    const { gameStats, masteryLevel } = progress

    // For new/learning questions, recommend quiz (structured)
    if (masteryLevel <= this.MASTERY_LEVELS.LEARNING) {
      return 'quiz'
    }

    // For familiar/proficient, recommend variety
    if (masteryLevel <= this.MASTERY_LEVELS.PROFICIENT) {
      // Find game with least practice
      const gameCounts = Object.entries(gameStats).map(([game, stats]) => ({
        game,
        count: stats.attempts
      }))
      
      if (gameCounts.length > 0) {
        gameCounts.sort((a, b) => a.count - b.count)
        return gameCounts[0].game
      }
      
      return Math.random() > 0.5 ? 'meteor' : 'flashcards'
    }

    // For advanced/mastered, any game is fine
    const games = ['quiz', 'meteor', 'flashcards']
    return games[Math.floor(Math.random() * games.length)]
  }
}

export default new ProgressService()

