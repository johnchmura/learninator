import { useEffect, useMemo } from 'react'
import { getMeteorStyle } from './gameLogic'
import './MeteorGame.css'

function Meteor({ id, question, difficulty, position, onHitGround, destroyed }) {
  const style = getMeteorStyle(difficulty)
  
  // Generate random X position only once per meteor
  const xPosition = useMemo(() => Math.random() * 60 + 20, [])
  
  useEffect(() => {
    if (position >= 85 && !destroyed) { // Ground position
      onHitGround(id)
    }
  }, [position, onHitGround, destroyed, id])
  
  return (
    <div 
      className={`meteor ${destroyed ? 'exploding' : ''}`}
      style={{
        top: `${position}%`,
        left: `${xPosition}%`,
        transform: `translateX(-50%)` // No rotation on container
      }}
    >
      <div 
        className="meteor-body"
        style={{
          width: `${style.size}px`,
          height: `${style.size}px`,
          background: style.color,
          boxShadow: style.glow
        }}
      >
        <span className="meteor-icon">{style.icon}</span>
      </div>
      <div className="meteor-trail" style={{ background: style.color }}></div>
      <div className="meteor-question" title={question}>
        {question}
      </div>
    </div>
  )
}

export default Meteor

