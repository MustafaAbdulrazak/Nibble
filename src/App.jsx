import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import AuthPage from './components/auth/AuthPage'
import Layout from './components/layout/Layout'
import Profile from './components/profile/Profile'
import WeightLog from './components/weight/WeightLog'
import BMICalculator from './components/bmi/BMICalculator'
import WorkoutTracker from './components/workouts/WorkoutTracker'
import GymProgress from './components/progress/GymProgress'

const PAGES = {
  profile:  Profile,
  weight:   WeightLog,
  bmi:      BMICalculator,
  workouts: WorkoutTracker,
  progress: GymProgress,
}

function AppInner() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('profile')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading Nibble…</p>
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  const PageComponent = PAGES[page] || Profile

  return (
    <Layout page={page} setPage={setPage}>
      <PageComponent />
    </Layout>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  )
}
