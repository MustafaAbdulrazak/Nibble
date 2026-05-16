import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'

// Profile
export const getProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data().profile || null) : null
}

export const saveProfile = async (uid, profile) => {
  await setDoc(doc(db, 'users', uid), { profile }, { merge: true })
}

// Weight log
export const getWeightLog = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'weightLog'))
  return snap.docs.map(d => d.data())
}

export const addWeightEntry = async (uid, entry) => {
  await setDoc(doc(db, 'users', uid, 'weightLog', entry.id), entry)
}

export const deleteWeightEntry = async (uid, entryId) => {
  await deleteDoc(doc(db, 'users', uid, 'weightLog', entryId))
}

// Workouts
export const getWorkouts = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'workouts'))
  return snap.docs.map(d => d.data())
}

export const addWorkout = async (uid, workout) => {
  await setDoc(doc(db, 'users', uid, 'workouts', workout.id), workout)
}

export const deleteWorkout = async (uid, workoutId) => {
  await deleteDoc(doc(db, 'users', uid, 'workouts', workoutId))
}

// Plans
export const getPlans = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'plans'))
  return snap.docs.map(d => d.data())
}

export const savePlan = async (uid, plan) => {
  await setDoc(doc(db, 'users', uid, 'plans', plan.id), plan)
}

export const deletePlan = async (uid, planId) => {
  await deleteDoc(doc(db, 'users', uid, 'plans', planId))
}
