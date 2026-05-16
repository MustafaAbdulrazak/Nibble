import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import IonIcon from '../Icon'

export default function AuthPage() {
  const { login, register } = useAuth()
  const { dark, toggle } = useTheme()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let result
    if (tab === 'login') {
      result = login(form.email, form.password)
    } else {
      if (!form.name.trim()) { setError('Please enter your name'); setLoading(false); return }
      if (form.password !== form.confirm) { setError('Passwords do not match'); setLoading(false); return }
      if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return }
      result = register(form.name.trim(), form.email, form.password)
    }

    if (result.error) setError(result.error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="fixed top-4 right-4 p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform"
        aria-label="Toggle theme"
      >
        <IonIcon name={dark ? 'sunny-outline' : 'moon-outline'} size="20px" />
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100 dark:border-gray-700">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 mb-4">
            <IonIcon name="barbell-outline" size="32px" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nibble</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5">Your personal fitness companion</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-6">
          {[
            { id: 'login',    label: 'Sign In' },
            { id: 'register', label: 'Sign Up' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded"
              >
                <IonIcon name={showPw ? 'eye-off-outline' : 'eye-outline'} size="20px" />
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={form.confirm}
                onChange={e => set('confirm', e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded-xl">
              <IonIcon name="warning-outline" size="18px" className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl transition-colors text-sm mt-2 shadow-sm hover:shadow-md"
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError('') }}
            className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            {tab === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
