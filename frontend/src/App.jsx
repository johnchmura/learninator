import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GameHub from './pages/GameHub'
import StatsPage from './pages/StatsPage'
import QuizGame from './games/quiz/QuizGame'
import MeteorGame from './games/meteor/MeteorGame'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hub" element={<GameHub />} />
          <Route path="/game/quiz" element={<QuizGame />} />
          <Route path="/game/meteor" element={<MeteorGame />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
