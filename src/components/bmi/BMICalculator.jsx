import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../utils/storage'
import { calcBMI, getBMICategory, getHealthyWeightRange } from '../../utils/calculations'
import IonIcon from '../Icon'

const SEGMENTS = [
  { label: 'Underweight', range: '< 18.5',   color: '#60a5fa', min: 10,   max: 18.5 },
  { label: 'Normal',      range: '18.5–24.9', color: '#34d399', min: 18.5, max: 25   },
  { label: 'Overweight',  range: '25–29.9',   color: '#fbbf24', min: 25,   max: 30   },
  { label: 'Obese',       range: '≥ 30',      color: '#f87171', min: 30,   max: 40   },
]

function BMIGauge({ bmi }) {
  const clamped = Math.min(Math.max(bmi, 10), 40)
  const pct = ((clamped - 10) / 30) * 100

  return (
    <div className="space-y-4">
      {/* Bar */}
      <div className="relative">
        <div className="relative h-10 rounded-full overflow-visible flex shadow-inner">
          {SEGMENTS.map((s, i) => (
            <div
              key={i}
              className="flex-1 first:rounded-l-full last:rounded-r-full"
              style={{ backgroundColor: s.color, opacity: 0.8 }}
            />
          ))}
          {/* Needle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 pointer-events-none"
            style={{ left: `${pct}%` }}
          >
            <div className="w-1 h-14 bg-gray-900 dark:bg-white rounded-full shadow-lg" />
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-gray-900 dark:border-white shadow-md"
              style={{ backgroundColor: getBMICategory(bmi).color }}
            />
          </div>
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1 px-0.5">
          <span>10</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>40+</span>
        </div>
      </div>

      {/* Segment labels */}
      <div className="grid grid-cols-4 gap-1">
        {SEGMENTS.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500">{s.range}</div>
          </div>
        ))}
      </div>

      {/* Current BMI badge */}
      <div className="text-center pt-1">
        <span
          className="inline-block px-5 py-1.5 rounded-full text-sm font-bold"
          style={{
            backgroundColor: getBMICategory(bmi).color + '22',
            color: getBMICategory(bmi).color,
            border: `1.5px solid ${getBMICategory(bmi).color}44`,
          }}
        >
          Your BMI: {bmi} — {getBMICategory(bmi).label}
        </span>
      </div>
    </div>
  )
}

export default function BMICalculator() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [manual, setManual] = useState({ height: '', weight: '' })
  const [useManual, setUseManual] = useState(false)

  useEffect(() => {
    const p = storage.getProfile(user.userId)
    setProfile(p)
    setUseManual(!p?.height || !p?.weight)
  }, [user.userId])

  const height = useManual ? +manual.height : profile?.height
  const weight = useManual ? +manual.weight : profile?.weight
  const valid  = height > 0 && weight > 0
  const bmi    = valid ? calcBMI(weight, height) : null
  const cat    = bmi ? getBMICategory(bmi) : null
  const healthy = height ? getHealthyWeightRange(height) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BMI Calculator</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Body Mass Index analysis and healthy weight ranges</p>
      </div>

      {/* Source toggle */}
      {profile?.height && profile?.weight && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseManual(false)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              !useManual
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            From Profile
          </button>
          <button
            onClick={() => setUseManual(true)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              useManual
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Custom Input
          </button>
        </div>
      )}

      {/* Manual input */}
      {useManual && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
            Enter Your Measurements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'height', label: 'Height', unit: 'cm',  placeholder: '175' },
              { key: 'weight', label: 'Weight', unit: 'kg',  placeholder: '70'  },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {f.label} <span className="text-gray-400 font-normal">({f.unit})</span>
                </label>
                <input
                  type="number"
                  value={manual[f.key]}
                  onChange={e => setManual(m => ({ ...m, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  step="0.1"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {bmi && cat ? (
        <div className="space-y-5">
          {/* Gauge */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-6">
              BMI Scale
            </h2>
            <BMIGauge bmi={bmi} />
          </div>

          {/* Cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* BMI value */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Your BMI</p>
              <p className="text-5xl font-bold" style={{ color: cat.color }}>{bmi}</p>
              <p className="text-sm font-bold mt-2" style={{ color: cat.color }}>{cat.label}</p>
            </div>

            {/* Healthy range */}
            {healthy && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Healthy Weight Range</p>
                <p className="text-3xl font-bold text-emerald-500">
                  {healthy.min}–{healthy.max}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">kg for {height} cm</p>
              </div>
            )}

            {/* Weight to ideal */}
            {healthy && weight > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  {weight < healthy.min ? 'Weight to Gain' : weight > healthy.max ? 'Weight to Lose' : 'Status'}
                </p>
                {weight >= healthy.min && weight <= healthy.max ? (
                  <>
                    <p className="text-4xl font-bold text-emerald-500">✓</p>
                    <p className="text-sm font-semibold text-emerald-500 mt-2">In healthy range!</p>
                  </>
                ) : weight < healthy.min ? (
                  <>
                    <p className="text-3xl font-bold text-blue-500">
                      +{+(healthy.min - weight).toFixed(1)} kg
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">to reach healthy range</p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-amber-500">
                      -{+(weight - healthy.max).toFixed(1)} kg
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">to reach healthy range</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Reference table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              BMI Reference Categories
            </h2>
            <div className="space-y-2">
              {SEGMENTS.map((s, i) => {
                const isActive = bmi >= s.min && bmi < s.max
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${
                      isActive ? 'ring-2' : 'opacity-60'
                    }`}
                    style={{
                      backgroundColor: s.color + '18',
                      ringColor: isActive ? s.color : 'transparent',
                      ...(isActive ? { outline: `2px solid ${s.color}` } : {}),
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{s.label}</span>
                      {isActive && (
                        <span
                          className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                          style={{ backgroundColor: s.color + '33', color: s.color }}
                        >
                          You are here
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-mono font-medium">{s.range}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
            <IonIcon name="stats-chart-outline" size="32px" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold">Enter measurements to calculate BMI</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Update your profile or use the custom input above
          </p>
        </div>
      )}
    </div>
  )
}
