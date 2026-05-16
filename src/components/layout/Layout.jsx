import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import IonIcon from '../Icon'

const navItems = [
  { id: 'profile',  icon: 'person-outline',      label: 'Profile'    },
  { id: 'weight',   icon: 'scale-outline',        label: 'Weight Log' },
  { id: 'bmi',      icon: 'stats-chart-outline',  label: 'BMI'        },
  { id: 'workouts', icon: 'barbell-outline',       label: 'Workouts'   },
  { id: 'progress', icon: 'trending-up-outline',  label: 'Progress'   },
]

export default function Layout({ page, setPage, children }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <IonIcon name="barbell-outline" size="20px" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Nibble</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                page === item.id
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <IonIcon name={item.icon} size="20px" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <div className="px-4 py-2 mb-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <IonIcon name={dark ? 'sunny-outline' : 'moon-outline'} size="18px" />
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <IonIcon name="log-out-outline" size="18px" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-60 min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <IonIcon name="barbell-outline" size="18px" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Nibble</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <IonIcon name={dark ? 'sunny-outline' : 'moon-outline'} size="20px" />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Sign out"
            >
              <IonIcon name="log-out-outline" size="20px" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-8 max-w-6xl mx-auto pb-28 lg:pb-8">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30 flex safe-bottom" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-colors min-h-[56px] ${
              page === item.id
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <IonIcon name={item.icon} size="22px" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
