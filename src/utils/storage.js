export const storage = {
  get: (key) => {
    try {
      const v = localStorage.getItem(key)
      return v ? JSON.parse(v) : null
    } catch {
      return null
    }
  },
  set: (key, val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch {}
  },

  getUsers: () => storage.get('ft_users') || [],
  setUsers: (u) => storage.set('ft_users', u),

  getSession: () => storage.get('ft_session'),
  setSession: (s) => storage.set('ft_session', s),
  clearSession: () => localStorage.removeItem('ft_session'),

  getProfile: (uid) => (storage.get('ft_profiles') || {})[uid] || null,
  setProfile: (uid, p) => {
    const all = storage.get('ft_profiles') || {}
    all[uid] = p
    storage.set('ft_profiles', all)
  },

  getWeightLog: (uid) => (storage.get('ft_weightlog') || {})[uid] || [],
  setWeightLog: (uid, log) => {
    const all = storage.get('ft_weightlog') || {}
    all[uid] = log
    storage.set('ft_weightlog', all)
  },

  getWorkouts: (uid) => (storage.get('ft_workouts') || {})[uid] || [],
  setWorkouts: (uid, w) => {
    const all = storage.get('ft_workouts') || {}
    all[uid] = w
    storage.set('ft_workouts', all)
  },
}
