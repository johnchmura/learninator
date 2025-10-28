import { useEffect, useState } from 'react'
import './MeteorGame.css'

function AnswerButtons({ options, onAnswer, disabled, correctIndex, showFeedback }) {
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
      
      if (index !== -1) {
        setPressedKey(index)
        onAnswer(index)
        setTimeout(() => setPressedKey(null), 300)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onAnswer, disabled])
  
  const getButtonClass = (index) => {
    let className = 'answer-button'
    
    if (disabled) className += ' disabled'
    if (pressedKey === index) className += ' pressed'
    
    if (showFeedback) {
      if (index === correctIndex) {
        className += ' correct-flash'
      } else if (pressedKey === index) {
        className += ' wrong-flash'
      }
    }
    
    return className
  }
  
  const letters = ['A', 'B', 'C', 'D']
  
  return (
    <div className="answer-buttons-grid">
      {options.map((option, index) => (
        <button
          key={index}
          className={getButtonClass(index)}
          onClick={() => !disabled && onAnswer(index)}
          disabled={disabled}
        >
          <span className="answer-letter">{letters[index]}</span>
          <span className="answer-text">{option}</span>
        </button>
      ))}
    </div>
  )
}

export default AnswerButtons

