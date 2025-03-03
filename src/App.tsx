import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useGameStore } from './store/gameStore'
import './styles/global.css'
import { CommandHub } from './pages/CommandHub'
import { RaceRituals } from './pages/RaceRituals'
import { RaceScreen } from './pages/RaceScreen'
import { TrackArchitects } from './pages/TrackArchitects'
import CareerMode from './pages/CareerMode'
import Garage from './pages/Garage'
import HallOfTimes from './pages/HallOfTimes'
import Settings from './pages/Settings'
import TrackArchive from './pages/TrackArchive'

export const App: React.FC = () => {
  const loadTracks = useGameStore(state => state.loadTracks)
  const loadVehicles = useGameStore(state => state.loadVehicles)

  useEffect(() => {
    // Load tracks and vehicles when the application starts
    Promise.all([
      loadTracks().catch(error => {
        console.error('Failed to load tracks:', error)
      }),
      loadVehicles().catch(error => {
        console.error('Failed to load vehicles:', error)
      })
    ])
  }, [loadTracks, loadVehicles])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<CommandHub />} />
        <Route path="/race-rituals" element={<RaceRituals />} />
        <Route path="/race" element={<RaceScreen />} />
        <Route path="/track-architects" element={<TrackArchitects />} />
        <Route path="/career-mode" element={<CareerMode />} />
        <Route path="/garage" element={<Garage />} />
        <Route path="/hall-of-times" element={<HallOfTimes />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/track-archive" element={<TrackArchive />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
} 