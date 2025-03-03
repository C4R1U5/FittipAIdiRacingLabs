import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Tracks from './pages/Tracks'
import Vehicles from './pages/Vehicles'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/tracks">Tracks</Link>
          <Link to="/vehicles">Vehicles</Link>
        </nav>

        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tracks" element={<Tracks />} />
            <Route path="/vehicles" element={<Vehicles />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App 