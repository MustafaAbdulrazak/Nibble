import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../utils/storage'
import { calcBMI, getBMICategory } from '../../utils/calculations'
import IonIcon from '../Icon'

function StatCard({ label, value, unit, iconName }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-gray-400 dark:text-gray-500">
        <IonIcon name={iconName} size="18px" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</span>
        {value !== null && value !== undefined && unit && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>
        )}
      </div>
    </div>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({ height: '', age: '', weight: '' })
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', height: '', age: '', weight: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const p = storage.getProfile(user.userId)
    if (p) setProfile(p)
    setForm({ name: user.name, height: p?.height || '', age: p?.age || '', weight: p?.weight || '' })
  }, [user.userId, user.name])

  const handleSave = () => {
    const newProfile = { height: +form.height, age: +form.age, weight: +form.weight }
    storage.setProfile(user.userId, newProfile)
    setProfile(newProfile)
    storage.setUsers(storage.getUsers().map(u => u.id === user.userId ? { ...u, name: form.name } : u))
    storage.setSession({ ...storage.getSession(), name: form.name })
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const bmi = profile.height && profile.weight ? calcBMI(+profile.weight, +profile.height) : null
  const bmiCat = bmi ? getBMICategory(bmi) : null
  const isComplete = profile.height && profile.age && profile.weight

  const fields = [
    { label: 'Full Name',      key: 'name',   type: 'text',   placeholder: 'John Doe', unit: '' },
    { label: 'Height',         key: 'height', type: 'number', placeholder: '175',      unit: 'cm' },
    { label: 'Age',            key: 'age',    type: 'number', placeholder: '25',       unit: 'years' },
    { label: 'Current Weight', key: 'weight', type: 'number', placeholder: '70',       unit: 'kg' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your fitness overview</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors text-sm shadow-sm"
          >
            <IonIcon name="create-outline" size="16px" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Incomplete profile banner */}
      {!isComplete && !editing && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4 flex items-start gap-3">
          <span className="flex-shrink-0 text-amber-500 mt-0.5">
            <IonIcon name="information-circle-outline" size="22px" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-800 dark:text-amber-300">Complete your profile</p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
              Add your height, age and weight to unlock BMI tracking and personalized stats.
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex-shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Set Up
          </button>
        </div>
      )}

      {/* Success toast */}
      {saved && (
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-xl px-4 py-3 text-green-700 dark:text-green-400 text-sm">
          <IonIcon name="checkmark-circle-outline" size="18px" />
          Profile saved successfully!
        </div>
      )}

      {/* Edit form */}
      {editing ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Edit Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ label, key, type, placeholder, unit }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {label}{unit ? <span className="text-gray-400 dark:text-gray-500 font-normal"> ({unit})</span> : ''}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  step={type === 'number' ? '0.1' : undefined}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors shadow-sm">
              Save Changes
            </button>
            <button onClick={() => setEditing(false)} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Stats grid */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Height" value={profile.height || null} unit="cm"    iconName="resize-outline" />
          <StatCard label="Age"    value={profile.age    || null} unit="years" iconName="calendar-outline" />
          <StatCard label="Weight" value={profile.weight || null} unit="kg"    iconName="scale-outline" />
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-gray-400 dark:text-gray-500">
              <IonIcon name="fitness-outline" size="18px" />
              <span className="text-xs font-semibold uppercase tracking-wide">BMI</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold" style={{ color: bmiCat?.color || undefined }}>
                {bmi ?? '—'}
              </span>
            </div>
            {bmiCat && (
              <p className="text-xs font-semibold mt-1" style={{ color: bmiCat.color }}>
                {bmiCat.label}
              </p>
            )}
          </div>
        </div>
      )}

      {/* BMI status card */}
      {bmiCat && !editing && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: bmiCat.color + '22', color: bmiCat.color }}
          >
            <IonIcon name="fitness-outline" size="22px" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current BMI Status</p>
            <p className="font-bold text-gray-900 dark:text-white mt-0.5">
              BMI {bmi} — <span style={{ color: bmiCat.color }}>{bmiCat.label}</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Go to the BMI page for a detailed breakdown
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
