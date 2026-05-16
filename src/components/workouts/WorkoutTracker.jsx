import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../utils/storage'
import { genId } from '../../utils/calculations'
import IonIcon from '../Icon'

const makeExercise = () => ({ id: genId(), name: '', sets: '', reps: '', weight: '' })

function ExerciseInput({ ex, index, onChange, onDelete, canDelete }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-5">#{index + 1}</span>
        <input
          value={ex.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="Exercise name (e.g. Bench Press)"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        />
        {canDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
          >
            <IonIcon name="close-outline" size="16px" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 ml-7">
        {[
          { key: 'sets',   label: 'Sets',   ph: '3'  },
          { key: 'reps',   label: 'Reps',   ph: '10' },
          { key: 'weight', label: 'kg',     ph: '60' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">{f.label}</label>
            <input
              type="number"
              inputMode="decimal"
              value={ex[f.key]}
              onChange={e => onChange(f.key, e.target.value)}
              placeholder={f.ph}
              step="0.5"
              className="w-full px-2 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition min-h-[44px]"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function WorkoutCard({ workout, onDelete }) {
  const [open, setOpen] = useState(false)
  const totalSets = workout.exercises.reduce((s, e) => s + (+e.sets || 0), 0)
  const totalReps = workout.exercises.reduce((s, e) => s + (+e.sets || 0) * (+e.reps || 0), 0)
  const totalVol  = workout.exercises.reduce((s, e) => s + (+e.sets || 0) * (+e.reps || 0) * (+e.weight || 0), 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-primary-500 dark:text-primary-400">
              <IonIcon name="barbell-outline" size="18px" />
            </span>
            <span className="font-bold text-gray-900 dark:text-white truncate">{workout.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <IonIcon name="calendar-outline" size="12px" />
              {workout.date}
            </span>
            <span>·</span>
            <span>{workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{totalSets} sets / {totalReps} reps</span>
            {totalVol > 0 && <><span>·</span><span>{totalVol.toLocaleString()} kg vol</span></>}
          </div>
        </div>
        <span className={`text-gray-400 transition-transform duration-200 flex-shrink-0 mt-1 ml-3 ${open ? 'rotate-180' : ''}`}>
          <IonIcon name="chevron-down-outline" size="16px" />
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-5 pb-5 pt-4">
          <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 px-1">
            <div className="col-span-5">Exercise</div>
            <div className="col-span-2 text-center">Sets</div>
            <div className="col-span-2 text-center">Reps</div>
            <div className="col-span-3 text-center">Weight</div>
          </div>
          <div className="space-y-1.5">
            {workout.exercises.map((ex, i) => (
              <div key={ex.id} className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="sm:col-span-5 flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-bold w-5">#{i + 1}</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{ex.name || '—'}</span>
                </div>
                <div className="sm:col-span-2 flex sm:justify-center items-center gap-1">
                  <span className="sm:hidden text-xs text-gray-400">Sets:</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{ex.sets || '—'}</span>
                </div>
                <div className="sm:col-span-2 flex sm:justify-center items-center gap-1">
                  <span className="sm:hidden text-xs text-gray-400">Reps:</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{ex.reps || '—'}</span>
                </div>
                <div className="sm:col-span-3 flex sm:justify-center items-center gap-1">
                  <span className="sm:hidden text-xs text-gray-400">Weight:</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{ex.weight ? `${ex.weight} kg` : '—'}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => onDelete(workout.id)}
              className="flex items-center gap-1.5 px-4 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors"
            >
              <IonIcon name="trash-outline" size="15px" />
              Delete Workout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function WorkoutTracker() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', date: new Date().toISOString().slice(0, 10), exercises: [makeExercise()] })
  const [error, setError] = useState('')

  useEffect(() => {
    const w = storage.getWorkouts(user.userId)
    setWorkouts([...w].sort((a, b) => new Date(b.date) - new Date(a.date)))
  }, [user.userId])

  const save = (list) => {
    const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
    setWorkouts(sorted)
    storage.setWorkouts(user.userId, sorted)
  }

  const addExercise = () => setForm(f => ({ ...f, exercises: [...f.exercises, makeExercise()] }))
  const removeExercise = (id) => setForm(f => ({ ...f, exercises: f.exercises.filter(e => e.id !== id) }))
  const updateExercise = (id, key, val) => setForm(f => ({ ...f, exercises: f.exercises.map(e => e.id === id ? { ...e, [key]: val } : e) }))

  const handleSave = () => {
    if (!form.name.trim()) { setError('Please enter a workout name'); return }
    if (form.exercises.length === 0) { setError('Add at least one exercise'); return }
    if (form.exercises.some(e => !e.name.trim())) { setError('Please fill in all exercise names'); return }
    setError('')
    const newWorkout = { id: genId(), name: form.name.trim(), date: form.date, exercises: form.exercises.map(e => ({ ...e, name: e.name.trim() })) }
    save([newWorkout, ...workouts])
    setCreating(false)
    setForm({ name: '', date: new Date().toISOString().slice(0, 10), exercises: [makeExercise()] })
  }

  const cancel = () => { setCreating(false); setError(''); setForm({ name: '', date: new Date().toISOString().slice(0, 10), exercises: [makeExercise()] }) }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workouts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Log and track your training sessions</p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors text-sm shadow-sm"
          >
            <IonIcon name="add-outline" size="18px" />
            New Workout
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">New Workout Session</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Workout Name</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Push Day, Leg Day, Full Body"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
          </div>
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Exercises ({form.exercises.length})
              </h3>
              <button
                onClick={addExercise}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition-colors"
              >
                <IonIcon name="add-outline" size="14px" />
                Add Exercise
              </button>
            </div>
            <div className="space-y-2">
              {form.exercises.map((ex, i) => (
                <ExerciseInput key={ex.id} ex={ex} index={i}
                  onChange={(k, v) => updateExercise(ex.id, k, v)}
                  onDelete={() => removeExercise(ex.id)}
                  canDelete={form.exercises.length > 1}
                />
              ))}
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400 text-sm mb-4">
              <IonIcon name="warning-outline" size="16px" />
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors shadow-sm">
              Save Workout
            </button>
            <button onClick={cancel} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Workout list */}
      {workouts.length > 0 ? (
        <div className="space-y-3">
          {workouts.map(w => (
            <WorkoutCard key={w.id} workout={w} onDelete={id => save(workouts.filter(x => x.id !== id))} />
          ))}
        </div>
      ) : !creating && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
            <IonIcon name="barbell-outline" size="32px" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold">No workouts logged yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Create your first workout session to start tracking progress</p>
        </div>
      )}
    </div>
  )
}
