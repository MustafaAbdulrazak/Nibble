import React, { useState, useEffect, useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../utils/storage'
import IonIcon from '../Icon'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

const PALETTE = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316']

const baseChartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} kg` } } },
  scales: {
    x: { grid: { color: 'rgba(156,163,175,0.15)' }, ticks: { color: '#9ca3af', maxTicksLimit: 8, maxRotation: 0 } },
    y: { grid: { color: 'rgba(156,163,175,0.15)' }, ticks: { color: '#9ca3af', callback: v => `${v} kg` } },
  },
}

export default function GymProgress() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [selectedEx, setSelectedEx] = useState('')

  useEffect(() => {
    const w = storage.getWorkouts(user.userId)
    setWorkouts([...w].sort((a, b) => new Date(a.date) - new Date(b.date)))
  }, [user.userId])

  const exercises = useMemo(() => {
    const map = {}
    workouts.forEach(workout => {
      workout.exercises.forEach(ex => {
        if (!ex.name?.trim()) return
        const key = ex.name.trim().toLowerCase()
        if (!map[key]) map[key] = { name: ex.name.trim(), sessions: [] }
        map[key].sessions.push({ date: workout.date, sets: +ex.sets || 0, reps: +ex.reps || 0, weight: +ex.weight || 0, workoutName: workout.name })
      })
    })
    return Object.values(map).map(ex => {
      const sorted  = [...ex.sessions].sort((a, b) => new Date(a.date) - new Date(b.date))
      const weights = sorted.map(s => s.weight).filter(w => w > 0)
      const start   = weights[0] ?? 0
      const current = weights.at(-1) ?? 0
      const maxW    = weights.length ? Math.max(...weights) : 0
      const totalSets = sorted.reduce((s, e) => s + e.sets, 0)
      const totalReps = sorted.reduce((s, e) => s + e.sets * e.reps, 0)
      return { ...ex, sessions: sorted, start, current, maxW, totalSets, totalReps, increase: +(current - start).toFixed(1) }
    }).sort((a, b) => b.sessions.length - a.sessions.length)
  }, [workouts])

  useEffect(() => {
    if (exercises.length && !selectedEx) setSelectedEx(exercises[0].name.toLowerCase())
  }, [exercises])

  const selExData = useMemo(() => {
    const found = exercises.find(e => e.name.toLowerCase() === selectedEx)
    return found ? found.sessions : []
  }, [exercises, selectedEx])

  const totalWorkouts = workouts.length
  const totalExLogs   = workouts.reduce((s, w) => s + w.exercises.length, 0)
  const mostImproved  = exercises.reduce((best, ex) => (!best || ex.increase > best.increase) ? ex : best, null)

  const lineData = {
    labels: selExData.map(s => s.date),
    datasets: [{
      label: 'Weight (kg)',
      data: selExData.map(s => s.weight),
      borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)',
      borderWidth: 2.5, pointBackgroundColor: '#3b82f6', pointBorderColor: '#fff',
      pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7, tension: 0.4, fill: true,
    }],
  }

  const topN = exercises.slice(0, 8)
  const barData = {
    labels: topN.map(e => e.name),
    datasets: [{
      label: 'Current Weight (kg)',
      data: topN.map(e => e.current),
      backgroundColor: topN.map((_, i) => PALETTE[i % PALETTE.length] + 'bb'),
      borderColor:     topN.map((_, i) => PALETTE[i % PALETTE.length]),
      borderWidth: 2, borderRadius: 8, borderSkipped: false,
    }],
  }

  if (workouts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gym Progress</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your strength improvements over time</p>
        </div>
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
            <IonIcon name="trending-up-outline" size="32px" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold">No workout data yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Log workouts in the Workouts tab to see your progress here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gym Progress</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your strength improvements over time</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Workouts', value: totalWorkouts, icon: 'barbell-outline',     sub: 'sessions logged'   },
          { label: 'Exercise Logs',  value: totalExLogs,   icon: 'list-outline',         sub: 'sets recorded'     },
          { label: 'Most Improved',  value: mostImproved && mostImproved.increase > 0 ? `+${mostImproved.increase} kg` : '—', icon: 'trophy-outline', sub: mostImproved?.name || '' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-gray-400 dark:text-gray-500">
              <IonIcon name={stat.icon} size="18px" />
              <span className="text-xs font-semibold uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            {stat.sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Exercise stats table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Exercise Statistics</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Click a row to view its progression chart</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Exercise','Sessions','Starting','Current','Max','Increase','Sets','Reps'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {exercises.map((ex, i) => {
                const isSelected = ex.name.toLowerCase() === selectedEx
                return (
                  <tr key={ex.name} onClick={() => setSelectedEx(ex.name.toLowerCase())}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                        <span className="font-semibold text-gray-900 dark:text-white">{ex.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">{ex.sessions.length}</td>
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">{ex.start > 0 ? `${ex.start} kg` : '—'}</td>
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">{ex.current > 0 ? `${ex.current} kg` : '—'}</td>
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">{ex.maxW > 0 ? `${ex.maxW} kg` : '—'}</td>
                    <td className="px-4 py-3.5">
                      {ex.increase > 0 ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <IonIcon name="arrow-up-outline" size="12px" />+{ex.increase} kg
                        </span>
                      ) : ex.increase < 0 ? (
                        <span className="flex items-center gap-1 text-red-500 dark:text-red-400 font-bold">
                          <IonIcon name="arrow-down-outline" size="12px" />{ex.increase} kg
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">{ex.totalSets}</td>
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">{ex.totalReps}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar chart */}
      {topN.length >= 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Current Weights Comparison</h2>
          <div className="h-52"><Bar data={barData} options={baseChartOptions} /></div>
        </div>
      )}

      {/* Line chart */}
      {exercises.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Exercise Progression</h2>
            <select value={selectedEx} onChange={e => setSelectedEx(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500">
              {exercises.map(ex => (
                <option key={ex.name} value={ex.name.toLowerCase()}>{ex.name} ({ex.sessions.length} sessions)</option>
              ))}
            </select>
          </div>
          {selExData.length >= 2 ? (
            <div className="h-60 sm:h-72"><Line data={lineData} options={baseChartOptions} /></div>
          ) : (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
              <IonIcon name="stats-chart-outline" size="32px" />
              <p className="mt-2">Need at least 2 data points to show progression for this exercise</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
