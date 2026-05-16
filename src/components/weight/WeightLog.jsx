import React, { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../utils/storage'
import { genId } from '../../utils/calculations'
import IonIcon from '../Icon'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

function StatBadge({ label, value, unit, iconName, sub, subColor }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-gray-400 dark:text-gray-500">
        <IonIcon name={iconName} size="16px" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          {value !== null && value !== undefined ? value : '—'}
        </span>
        {value !== null && value !== undefined && unit && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{unit}</span>
        )}
      </div>
      {sub && <p className={`text-xs mt-0.5 font-medium ${subColor || 'text-gray-400'}`}>{sub}</p>}
    </div>
  )
}

export default function WeightLog() {
  const { user } = useAuth()
  const [log, setLog] = useState([])
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), weight: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    const entries = storage.getWeightLog(user.userId)
    setLog([...entries].sort((a, b) => new Date(a.date) - new Date(b.date)))
  }, [user.userId])

  const save = (entries) => {
    const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))
    setLog(sorted)
    storage.setWeightLog(user.userId, sorted)
  }

  const addEntry = () => {
    if (!form.weight || !form.date) { setError('Please fill in both date and weight'); return }
    const w = parseFloat(form.weight)
    if (isNaN(w) || w < 20 || w > 500) { setError('Please enter a valid weight between 20 and 500 kg'); return }
    setError('')
    save([...log, { id: genId(), date: form.date, weight: w }])
    setForm(f => ({ ...f, weight: '' }))
  }

  const deleteEntry = (id) => save(log.filter(e => e.id !== id))

  const weights = log.map(e => e.weight)
  const current = weights.length ? weights.at(-1) : null
  const min     = weights.length ? Math.min(...weights) : null
  const max     = weights.length ? Math.max(...weights) : null
  const avg     = weights.length ? +(weights.reduce((s, w) => s + w, 0) / weights.length).toFixed(1) : null
  const change  = weights.length >= 2 ? +(weights.at(-1) - weights[0]).toFixed(1) : null

  const chartData = {
    labels: log.map(e => e.date),
    datasets: [{
      label: 'Weight (kg)',
      data: log.map(e => e.weight),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.08)',
      borderWidth: 2.5,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.4,
      fill: true,
    }],
  }

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} kg` } } },
    scales: {
      x: { grid: { color: 'rgba(156,163,175,0.15)' }, ticks: { color: '#9ca3af', maxTicksLimit: 8, maxRotation: 0 } },
      y: { grid: { color: 'rgba(156,163,175,0.15)' }, ticks: { color: '#9ca3af', callback: v => `${v} kg` } },
    },
  }

  const changeColor = change === null ? 'text-gray-400' : change > 0 ? 'text-red-500' : change < 0 ? 'text-green-500' : 'text-gray-400'
  const changeSub   = change === null ? undefined : change > 0 ? `+${change} kg gained` : change < 0 ? `${change} kg lost` : 'No change'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weight Log</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your weight journey over time</p>
      </div>

      {/* Add entry */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Log New Entry</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">Weight (kg)</label>
            <input
              type="number"
              value={form.weight}
              onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addEntry()}
              placeholder="e.g. 75.5"
              step="0.1" min="20" max="500"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
            />
          </div>
        </div>
        <button
          onClick={addEntry}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors shadow-sm text-sm mt-3"
        >
          <IonIcon name="add-outline" size="18px" />
          Add Entry
        </button>
        {error && (
          <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400 text-sm mt-2.5">
            <IonIcon name="warning-outline" size="16px" />
            {error}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatBadge label="Current"  value={current} unit="kg" iconName="location-outline" />
        <StatBadge label="Minimum"  value={min}     unit="kg" iconName="arrow-down-outline" />
        <StatBadge label="Maximum"  value={max}     unit="kg" iconName="arrow-up-outline" />
        <StatBadge label="Average"  value={avg}     unit="kg" iconName="pulse-outline" />
        <StatBadge label="Change"   value={change !== null ? Math.abs(change) : null} unit="kg" iconName="trending-down-outline" sub={changeSub} subColor={changeColor} />
      </div>

      {/* Chart */}
      {log.length >= 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Weight Progression</h2>
          <div className="h-60 sm:h-72">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* History table */}
      {log.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">History</h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full font-medium">
              {log.length} {log.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['Date', 'Weight', 'Change', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {[...log].reverse().map((entry, i, arr) => {
                  const prev = arr[i + 1]
                  const diff = prev ? +(entry.weight - prev.weight).toFixed(1) : null
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{entry.date}</td>
                      <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300 font-semibold">{entry.weight} kg</td>
                      <td className="px-5 py-3.5">
                        {diff !== null ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            diff > 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : diff < 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            <IonIcon name={diff > 0 ? 'arrow-up-outline' : diff < 0 ? 'arrow-down-outline' : 'remove-outline'} size="11px" />
                            {diff > 0 ? '+' : ''}{diff} kg
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">First entry</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete entry"
                        >
                          <IonIcon name="trash-outline" size="16px" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
            <IonIcon name="scale-outline" size="32px" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold">No weight entries yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Log your first weight entry above to get started</p>
        </div>
      )}
    </div>
  )
}
