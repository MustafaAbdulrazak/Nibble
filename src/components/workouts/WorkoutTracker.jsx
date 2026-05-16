import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getWorkouts as fetchWorkouts, addWorkout, deleteWorkout, getPlans as fetchPlans, savePlan, deletePlan } from '../../utils/db'
import { genId } from '../../utils/calculations'
import IonIcon from '../Icon'

const makeExercise = () => ({ id: genId(), name: '', sets: '', reps: '', weight: '' })

// ─── Shared: editable exercise row (plan builder / scratch log) ───────────────
function ExerciseInput({ ex, index, onChange, onDelete, canDelete }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-5">#{index + 1}</span>
        <input
          value={ex.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="Exercise name (e.g. Bench Press)"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        />
        {canDelete && (
          <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0">
            <IonIcon name="close-outline" size="16px" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 ml-7">
        {[
          { key: 'sets', label: 'Sets', ph: '3' },
          { key: 'reps', label: 'Reps', ph: '10' },
          { key: 'weight', label: 'kg',   ph: '60' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">{f.label}</label>
            <input
              type="number" inputMode="decimal"
              value={ex[f.key]} onChange={e => onChange(f.key, e.target.value)}
              placeholder={f.ph} step="0.5"
              className="w-full px-2 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition min-h-[44px]"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Plan form (create + edit) ────────────────────────────────────────────────
function PlanForm({ initial, title, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [exercises, setExercises] = useState(
    initial?.exercises?.length ? initial.exercises.map(e => ({ ...e })) : [makeExercise()]
  )
  const [error, setError] = useState('')

  const addEx    = () => setExercises(e => [...e, makeExercise()])
  const removeEx = id => setExercises(e => e.filter(x => x.id !== id))
  const updateEx = (id, key, val) => setExercises(e => e.map(x => x.id === id ? { ...x, [key]: val } : x))

  const handleSave = () => {
    if (!name.trim()) { setError('Please enter a plan name'); return }
    if (exercises.some(e => !e.name.trim())) { setError('Please fill in all exercise names'); return }
    setError('')
    onSave({ name: name.trim(), exercises: exercises.map(e => ({ ...e, name: e.name.trim() })) })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">{title}</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Plan Name</label>
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Push Day, Leg Day, Full Body"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        />
      </div>
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Exercises ({exercises.length})</h3>
          <button onClick={addEx} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition-colors">
            <IonIcon name="add-outline" size="14px" /> Add Exercise
          </button>
        </div>
        <div className="space-y-2">
          {exercises.map((ex, i) => (
            <ExerciseInput key={ex.id} ex={ex} index={i}
              onChange={(k, v) => updateEx(ex.id, k, v)}
              onDelete={() => removeEx(ex.id)}
              canDelete={exercises.length > 1}
            />
          ))}
        </div>
      </div>
      {error && <div className="flex items-center gap-1.5 text-red-500 text-sm mb-4"><IonIcon name="warning-outline" size="16px" />{error}</div>}
      <div className="flex gap-3">
        <button onClick={handleSave} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors shadow-sm">Save Plan</button>
        <button onClick={onCancel} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors">Cancel</button>
      </div>
    </div>
  )
}

// ─── Plan card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, onEdit, onDelete, onDuplicate, onStartWorkout }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-primary-500 dark:text-primary-400"><IonIcon name="clipboard-outline" size="18px" /></span>
            <span className="font-bold text-gray-900 dark:text-white truncate">{plan.name}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">{plan.exercises.length} exercise{plan.exercises.length !== 1 ? 's' : ''}</p>
        </div>
        <span className={`text-gray-400 transition-transform duration-200 flex-shrink-0 mt-1 ml-3 ${open ? 'rotate-180' : ''}`}>
          <IonIcon name="chevron-down-outline" size="16px" />
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-5 pb-5 pt-4">
          <div className="space-y-1.5 mb-4">
            {plan.exercises.map((ex, i) => (
              <div key={ex.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3">
                <span className="text-xs text-gray-400 font-bold w-5">#{i + 1}</span>
                <span className="flex-1 font-semibold text-gray-900 dark:text-white text-sm">{ex.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {ex.sets || '—'}×{ex.reps || '—'} @ {ex.weight ? `${ex.weight}kg` : '—'}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onStartWorkout(plan)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors">
              <IonIcon name="play-outline" size="15px" /> Start Workout
            </button>
            <button onClick={() => onEdit(plan)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors">
              <IonIcon name="create-outline" size="15px" /> Edit
            </button>
            <button onClick={() => onDuplicate(plan)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors">
              <IonIcon name="copy-outline" size="15px" /> Duplicate
            </button>
            <button onClick={() => onDelete(plan.id)}
              className="flex items-center gap-1.5 px-4 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors ml-auto">
              <IonIcon name="trash-outline" size="15px" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Log workout form ─────────────────────────────────────────────────────────
function LogWorkoutForm({ plan, prevSession, onSave, onCancel }) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [name, setName] = useState('')
  const [exercises, setExercises] = useState(
    plan ? plan.exercises.map(e => ({ ...e, id: genId() })) : [makeExercise()]
  )
  const [error, setError] = useState('')

  const addEx    = () => setExercises(e => [...e, makeExercise()])
  const removeEx = id => setExercises(e => e.filter(x => x.id !== id))
  const updateEx = (id, key, val) => setExercises(e => e.map(x => x.id === id ? { ...x, [key]: val } : x))

  const prevMap = useMemo(() => {
    if (!prevSession) return {}
    const m = {}
    prevSession.exercises.forEach(ex => { m[ex.name.toLowerCase()] = ex })
    return m
  }, [prevSession])

  const handleSave = () => {
    if (!plan && !name.trim()) { setError('Please enter a workout name'); return }
    if (exercises.some(e => !e.name?.trim())) { setError('Please fill in all exercise names'); return }
    setError('')
    onSave({
      name: plan ? plan.name : name.trim(),
      date,
      planId: plan?.id || null,
      exercises: exercises.map(e => ({ ...e, name: e.name.trim() })),
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Log Workout</h2>
        {plan && (
          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-semibold">
            {plan.name}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {!plan && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Workout Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Push Day, Chest, Arms"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
        </div>
      </div>

      {prevSession && (
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2.5 mb-4 text-xs text-blue-700 dark:text-blue-400">
          <IonIcon name="time-outline" size="14px" />
          Last session: {prevSession.date} — previous values shown below each field
        </div>
      )}

      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Exercises ({exercises.length})
          </h3>
          {!plan && (
            <button onClick={addEx} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition-colors">
              <IonIcon name="add-outline" size="14px" /> Add Exercise
            </button>
          )}
        </div>
        <div className="space-y-2">
          {exercises.map((ex, i) => {
            const prev = plan ? prevMap[ex.name?.toLowerCase()] : null
            return (
              <div key={ex.id} className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-5">#{i + 1}</span>
                  {plan ? (
                    <span className="flex-1 font-semibold text-gray-900 dark:text-white text-sm">{ex.name}</span>
                  ) : (
                    <input value={ex.name} onChange={e => updateEx(ex.id, 'name', e.target.value)}
                      placeholder="Exercise name"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
                  )}
                  {!plan && exercises.length > 1 && (
                    <button onClick={() => removeEx(ex.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0">
                      <IonIcon name="close-outline" size="16px" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 ml-7">
                  {[
                    { key: 'sets', label: 'Sets', ph: '3' },
                    { key: 'reps', label: 'Reps', ph: '10' },
                    { key: 'weight', label: 'kg',   ph: '60' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">{f.label}</label>
                      <input type="number" inputMode="decimal"
                        value={ex[f.key]} onChange={e => updateEx(ex.id, f.key, e.target.value)}
                        placeholder={prev ? String(prev[f.key] || f.ph) : f.ph}
                        step="0.5"
                        className="w-full px-2 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition min-h-[44px]"
                      />
                      {prev && prev[f.key] && (
                        <p className="text-[10px] text-center text-gray-400 mt-0.5">prev: {prev[f.key]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {error && <div className="flex items-center gap-1.5 text-red-500 text-sm mb-4"><IonIcon name="warning-outline" size="16px" />{error}</div>}
      <div className="flex gap-3">
        <button onClick={handleSave} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors shadow-sm">Save Workout</button>
        <button onClick={onCancel} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors">Cancel</button>
      </div>
    </div>
  )
}

// ─── Workout history card ─────────────────────────────────────────────────────
function WorkoutCard({ workout, onDelete }) {
  const [open, setOpen] = useState(false)
  const totalSets = workout.exercises.reduce((s, e) => s + (+e.sets || 0), 0)
  const totalReps = workout.exercises.reduce((s, e) => s + (+e.sets || 0) * (+e.reps || 0), 0)
  const totalVol  = workout.exercises.reduce((s, e) => s + (+e.sets || 0) * (+e.reps || 0) * (+e.weight || 0), 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-primary-500 dark:text-primary-400"><IonIcon name="barbell-outline" size="18px" /></span>
            <span className="font-bold text-gray-900 dark:text-white truncate">{workout.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><IonIcon name="calendar-outline" size="12px" />{workout.date}</span>
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
            <button onClick={() => onDelete(workout.id)}
              className="flex items-center gap-1.5 px-4 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors">
              <IonIcon name="trash-outline" size="15px" /> Delete Workout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function WorkoutTracker() {
  const { user } = useAuth()
  const [tab, setTab] = useState('plans')
  const [plans, setPlans] = useState([])
  const [workouts, setWorkouts] = useState([])

  const [creatingPlan, setCreatingPlan] = useState(false)
  const [editingPlan,  setEditingPlan]  = useState(null)
  const [logging,      setLogging]      = useState(false)
  const [activePlan,   setActivePlan]   = useState(null)
  const [prevSession,  setPrevSession]  = useState(null)

  useEffect(() => {
    const load = async () => {
      const [w, p] = await Promise.all([fetchWorkouts(user.userId), fetchPlans(user.userId)])
      setWorkouts([...w].sort((a, b) => new Date(b.date) - new Date(a.date)))
      setPlans([...p].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)))
    }
    load()
  }, [user.userId])

  // Plans
  const handleSavePlan = async (data) => {
    const plan = { id: genId(), createdAt: new Date().toISOString(), ...data }
    await savePlan(user.userId, plan)
    setPlans(prev => [plan, ...prev])
    setCreatingPlan(false)
  }
  const handleUpdatePlan = async (data) => {
    const updated = { ...editingPlan, ...data, updatedAt: new Date().toISOString() }
    await savePlan(user.userId, updated)
    setPlans(prev => prev.map(p => p.id === updated.id ? updated : p))
    setEditingPlan(null)
  }
  const handleDeletePlan = async (id) => {
    await deletePlan(user.userId, id)
    setPlans(prev => prev.filter(p => p.id !== id))
  }
  const handleDuplicatePlan = async (plan) => {
    const copy = { ...plan, id: genId(), name: `${plan.name} (Copy)`, createdAt: new Date().toISOString() }
    await savePlan(user.userId, copy)
    setPlans(prev => [copy, ...prev])
  }

  // Logging
  const handleStartWorkout = (plan) => {
    setActivePlan(plan)
    setPrevSession(workouts.find(w => w.planId === plan.id) || null)
    setLogging(true)
    setTab('history')
  }
  const handleLogWorkout = async (data) => {
    const newWorkout = { id: genId(), ...data }
    await addWorkout(user.userId, newWorkout)
    setWorkouts(prev => [newWorkout, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)))
    setLogging(false); setActivePlan(null); setPrevSession(null)
  }
  const handleDeleteWorkout = async (id) => {
    await deleteWorkout(user.userId, id)
    setWorkouts(prev => prev.filter(x => x.id !== id))
  }
  const cancelLog  = () => { setLogging(false); setActivePlan(null); setPrevSession(null) }
  const cancelPlan = () => { setCreatingPlan(false); setEditingPlan(null) }

  const showTabs = !logging && !creatingPlan && !editingPlan

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workouts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Plans, logging and history</p>
        </div>
        {showTabs && (
          tab === 'plans' ? (
            <button onClick={() => setCreatingPlan(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors text-sm shadow-sm">
              <IonIcon name="add-outline" size="18px" /> New Plan
            </button>
          ) : (
            <button onClick={() => { setActivePlan(null); setPrevSession(null); setLogging(true) }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors text-sm shadow-sm">
              <IonIcon name="add-outline" size="18px" /> Log Workout
            </button>
          )
        )}
      </div>

      {/* Tab switcher */}
      {showTabs && (
        <div className="flex bg-gray-100 dark:bg-gray-700/60 rounded-xl p-1">
          {[
            { id: 'plans',   label: 'Plans',   icon: 'clipboard-outline' },
            { id: 'history', label: 'History', icon: 'time-outline' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              <IonIcon name={t.icon} size="16px" />
              {t.label}
              {t.id === 'plans' && plans.length > 0 && (
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs px-1.5 py-0.5 rounded-full font-bold">{plans.length}</span>
              )}
              {t.id === 'history' && workouts.length > 0 && (
                <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full font-bold">{workouts.length}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Forms */}
      {creatingPlan && <PlanForm title="New Workout Plan" onSave={handleSavePlan} onCancel={cancelPlan} />}
      {editingPlan  && <PlanForm title="Edit Plan" initial={editingPlan} onSave={handleUpdatePlan} onCancel={cancelPlan} />}
      {logging      && <LogWorkoutForm plan={activePlan} prevSession={prevSession} onSave={handleLogWorkout} onCancel={cancelLog} />}

      {/* Plans tab */}
      {showTabs && tab === 'plans' && (
        plans.length > 0 ? (
          <div className="space-y-3">
            {plans.map(plan => (
              <PlanCard key={plan.id} plan={plan}
                onEdit={setEditingPlan}
                onDelete={handleDeletePlan}
                onDuplicate={handleDuplicatePlan}
                onStartWorkout={handleStartWorkout}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
              <IonIcon name="clipboard-outline" size="32px" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-semibold">No workout plans yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Create a plan to quickly start and track your sessions</p>
            <button onClick={() => setCreatingPlan(true)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors text-sm shadow-sm">
              <IonIcon name="add-outline" size="18px" /> Create First Plan
            </button>
          </div>
        )
      )}

      {/* History tab */}
      {showTabs && tab === 'history' && (
        workouts.length > 0 ? (
          <div className="space-y-3">
            {workouts.map(w => (
              <WorkoutCard key={w.id} workout={w} onDelete={handleDeleteWorkout} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
              <IonIcon name="barbell-outline" size="32px" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-semibold">No workouts logged yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Start a workout from a plan or log one manually</p>
          </div>
        )
      )}
    </div>
  )
}
