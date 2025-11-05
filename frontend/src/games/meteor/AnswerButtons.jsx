import { useEffect, useState } from 'react'
import './MeteorGame.css'

function AnswerButtons({ options, onAnswer, disabled, correctIndex, showFeedback, disabledOptions = [], explodingOption = null }) {
  const [pressedKey, setPressedKey] = useState(null)
  
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (disabled) return
      
      const key = e.key.toUpperCase()
      let index = -1
      
      if (key === 'A' || key === '1') index = 0
      else if (key === 'B' || key === '2') index = 1
      else if (key === 'C' || key === '3') index = 2
      else if (key === 'D' || key === '4') index = 3
      
      if (index !== -1 && !disabledOptions.includes(index)) {
        setPressedKey(index)
        onAnswer(index)
        setTimeout(() => setPressedKey(null), 300)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onAnswer, disabled, disabledOptions])
  
  const getButtonClass = (index) => {
    let className = 'answer-button'
    
    const isDisabledOption = disabledOptions.includes(index)
    
    if (disabled || isDisabledOption) className += ' disabled'
    if (pressedKey === index && !isDisabledOption) className += ' pressed'
    
    if (isDisabledOption) {
      className += ' disabled-option'
    }
    
    if (explodingOption === index) {
      className += ' exploding'
    } else if (showFeedback && explodingOption === null) {
      if (index === correctIndex) {
        className += ' correct-flash'
      } else if (pressedKey === index && !isDisabledOption) {
        className += ' wrong-flash'
      }
    }
    
    return className
  }
  
  const letters = ['A', 'B', 'C', 'D']
  
  return (
    <div className="answer-buttons-grid">
      {options.map((option, index) => {
        const isDisabledOption = disabledOptions.includes(index)
        return (
          <button
            key={index}
            className={getButtonClass(index)}
            onClick={() => !disabled && !isDisabledOption && onAnswer(index)}
            disabled={disabled || isDisabledOption}
          >
            <span className="answer-letter">{letters[index]}</span>
            <span className="answer-text">{option}</span>
          </button>
        )
      })}
    </div>
  )
}

export default AnswerButtons

