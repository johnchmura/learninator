// localStorage management service for universal learning content

const STORAGE_KEYS = {
  CONTENT: 'learninator_content',
  PROGRESS: 'learninator_progress',
  PROFILE: 'learninator_profile',
  CURRENT_TOPIC: 'learninator_current_topic'
}

class StorageService {
  // Content Management
  saveContent(topicId, contentData) {
    try {
      const allContent = this.getAllContent()
      allContent[topicId] = {
        ...contentData,
        id: topicId,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(allContent))
      return true
    } catch (error) {
      console.error('Error saving content:', error)
      return false
    }
  }

  getContent(topicId) {
    try {
      const allContent = this.getAllContent()
      return allContent[topicId] || null
    } catch (error) {
      console.error('Error getting content:', error)
      return null
    }
  }

  getAllContent() {
    try {
      const content = localStorage.getItem(STORAGE_KEYS.CONTENT)
      return content ? JSON.parse(content) : {}
    } catch (error) {
      console.error('Error getting all content:', error)
      return {}
    }
  }

  deleteContent(topicId) {
    try {
      const allContent = this.getAllContent()
      delete allContent[topicId]
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(allContent))
      return true
    } catch (error) {
      console.error('Error deleting content:', error)
      return false
    }
  }

  // Current Topic Management
  setCurrentTopic(topicId) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_TOPIC, topicId)
      return true
    } catch (error) {
      console.error('Error setting current topic:', error)
      return false
    }
  }

  getCurrentTopic() {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_TOPIC)
    } catch (error) {
      console.error('Error getting current topic:', error)
      return null
    }
  }

  clearCurrentTopic() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_TOPIC)
      return true
    } catch (error) {
      console.error('Error clearing current topic:', error)
      return false
    }
  }

  // Progress Management
  getProgress(questionId) {
    try {
      const allProgress = this.getAllProgress()
      return allProgress[questionId] || null
    } catch (error) {
      console.error('Error getting progress:', error)
      return null
    }
  }

  getAllProgress() {
    try {
      const progress = localStorage.getItem(STORAGE_KEYS.PROGRESS)
      return progress ? JSON.parse(progress) : {}
    } catch (error) {
      console.error('Error getting all progress:', error)
      return {}
    }
  }

  saveProgress(questionId, progressData) {
    try {
      const allProgress = this.getAllProgress()
      allProgress[questionId] = {
        ...allProgress[questionId],
        ...progressData,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress))
      return true
    } catch (error) {
      console.error('Error saving progress:', error)
      return false
    }
  }

  // User Profile
  getProfile() {
    try {
      const profile = localStorage.getItem(STORAGE_KEYS.PROFILE)
      return profile ? JSON.parse(profile) : this.createDefaultProfile()
    } catch (error) {
      console.error('Error getting profile:', error)
      return this.createDefaultProfile()
    }
  }

  saveProfile(profileData) {
    try {
      const currentProfile = this.getProfile()
      const updatedProfile = {
        ...currentProfile,
        ...profileData,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile))
      return true
    } catch (error) {
      console.error('Error saving profile:', error)
      return false
    }
  }

  createDefaultProfile() {
    return {
      totalXP: 0,
      level: 1,
      gamesPlayed: {
        quiz: 0,
        meteor: 0,
        flashcards: 0
      },
      achievements: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
  }

  // Utility Methods
  clearAllData() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('Error clearing all data:', error)
      return false
    }
  }

  exportData() {
    try {
      return {
        content: this.getAllContent(),
        progress: this.getAllProgress(),
        profile: this.getProfile(),
        exportedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      return null
    }
  }

  importData(data) {
    try {
      if (data.content) {
        localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(data.content))
      }
      if (data.progress) {
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data.progress))
      }
      if (data.profile) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile))
      }
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }
}

export default new StorageService()

