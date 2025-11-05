// Adapts universal question format to game-specific formats

class QuestionAdapter {
  // Normalize input data to universal format
  normalizeContent(inputData) {
    // Handle different input formats
    if (Array.isArray(inputData)) {
      // Old format: array of questions
      return {
        topic: 'Imported Questions',
        subject: 'General',
        difficulty: 'medium',
        createdAt: new Date().toISOString(),
        items: inputData.map((q, index) => this.normalizeQuestion(q, index))
      }
    } else if (inputData.items) {
      // New universal format
      return {
        topic: inputData.topic || 'Imported Questions',
        subject: inputData.subject || 'General',
        difficulty: inputData.difficulty || 'medium',
        createdAt: inputData.createdAt || new Date().toISOString(),
        items: inputData.items.map((q, index) => this.normalizeQuestion(q, index))
      }
    } else {
      // Single question or unknown format
      return {
        topic: 'Imported Questions',
        subject: 'General',
        difficulty: 'medium',
        createdAt: new Date().toISOString(),
        items: [this.normalizeQuestion(inputData, 0)]
      }
    }
  }

  // Normalize a single question
  normalizeQuestion(question, index) {
    const id = question.id || `q_${Date.now()}_${index}`
    
    return {
      id,
      type: question.type || 'multiple-choice',
      question: question.question || '',
      answer: question.answer || (question.options ? question.options[question.correctIndex || question.correctAnswer || 0] : ''),
      options: question.options || [],
      correctIndex: question.correctIndex !== undefined ? question.correctIndex : (question.correctAnswer || 0),
      explanation: question.explanation || question.reasoning || '',
      category: question.category || 'General',
      tags: question.tags || [],
      difficulty: question.difficulty || 'medium',
      relatedConcepts: question.relatedConcepts || []
    }
  }

  // Adapt to Quiz Mode format (existing format)
  toQuizFormat(item) {
    return {
      question: item.question,
      options: item.options,
      correctAnswer: item.correctIndex,
      reasoning: item.explanation
    }
  }

  // Adapt multiple items to Quiz Mode format
  toQuizFormatBatch(items) {
    return items.map(item => this.toQuizFormat(item))
  }

  // Adapt to Meteor Drop format
  toMeteorFormat(item) {
    return {
      id: item.id,
      question: item.question,
      answer: this.extractAnswer(item),
      options: item.options || [],
      acceptableAnswers: this.generateAcceptableAnswers(item),
      fallSpeed: this.calculateFallSpeed(item.difficulty),
      difficulty: item.difficulty || 'medium',
      explanation: item.explanation
    }
  }

  // Adapt to Flashcard format
  toFlashcardFormat(item) {
    return {
      id: item.id,
      front: item.question,
      back: this.extractAnswer(item),
      hint: this.extractHint(item.explanation),
      explanation: item.explanation,
      category: item.category
    }
  }

  // Helper: Extract answer text
  extractAnswer(item) {
    if (item.answer) return item.answer
    if (item.options && item.correctIndex !== undefined) {
      return item.options[item.correctIndex]
    }
    return ''
  }

  // Helper: Generate acceptable answer variations
  generateAcceptableAnswers(item) {
    const answer = this.extractAnswer(item).toLowerCase().trim()
    const variations = new Set([answer])

    // Add without punctuation
    const noPunctuation = answer.replace(/[.,!?;:]/g, '').trim()
    variations.add(noPunctuation)

    // Add without articles
    const noArticles = answer.replace(/\b(a|an|the)\b/gi, '').trim()
    variations.add(noArticles)

    // Add plural/singular variations
    if (answer.endsWith('s') && answer.length > 2) {
      variations.add(answer.slice(0, -1)) // Remove 's'
    } else if (!answer.endsWith('s')) {
      variations.add(answer + 's') // Add 's'
    }

    // Add common abbreviations
    const abbreviations = {
      'dictionary': ['dict'],
      'function': ['func', 'fn'],
      'variable': ['var'],
      'object': ['obj'],
      'string': ['str'],
      'integer': ['int'],
      'boolean': ['bool'],
      'array': ['arr', 'list']
    }

    Object.entries(abbreviations).forEach(([full, abbrevs]) => {
      if (answer.includes(full)) {
        abbrevs.forEach(abbrev => {
          variations.add(answer.replace(full, abbrev))
        })
      }
    })

    return Array.from(variations).filter(v => v.length > 0)
  }

  // Helper: Extract hint from explanation
  extractHint(explanation) {
    if (!explanation) return ''
    
    // Take first sentence as hint
    const sentences = explanation.split(/[.!?]/)
    if (sentences.length > 0) {
      return sentences[0].trim()
    }
    
    // If no sentence, take first 50 chars
    return explanation.substring(0, 50).trim() + (explanation.length > 50 ? '...' : '')
  }

  // Helper: Calculate fall speed based on difficulty
  calculateFallSpeed(difficulty) {
    const speeds = {
      'easy': 2.0,      // Slower fall
      'medium': 3.5,    // Medium fall
      'hard': 5.0       // Faster fall
    }
    return speeds[difficulty] || speeds['medium']
  }

  // Validate universal content format
  validateContent(content) {
    const errors = []

    if (!content) {
      errors.push('Content is null or undefined')
      return { valid: false, errors }
    }

    if (!content.items || !Array.isArray(content.items)) {
      errors.push('Content must have an "items" array')
      return { valid: false, errors }
    }

    if (content.items.length === 0) {
      errors.push('Content must have at least one question')
      return { valid: false, errors }
    }

    content.items.forEach((item, index) => {
      if (!item.question || item.question.trim() === '') {
        errors.push(`Item ${index + 1}: Missing question text`)
      }

      // Multiple choice questions need options and correctIndex
      if (!item.answer && (!item.options || item.options.length === 0)) {
        errors.push(`Item ${index + 1}: Missing answer or options`)
      }

      if (item.options && item.options.length > 0) {
        if (item.correctIndex === undefined || item.correctIndex < 0 || item.correctIndex >= item.options.length) {
          errors.push(`Item ${index + 1}: Invalid correctIndex`)
        }
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Generate topic ID from content
  generateTopicId(content) {
    const topic = content.topic || 'Untitled'
    const timestamp = Date.now()
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30)
    return `${slug}_${timestamp}`
  }
}

export default new QuestionAdapter()

