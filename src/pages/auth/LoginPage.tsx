import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, PawPrint } from 'lucide-react'
import { useAuthContext } from '@/auth/AuthContext'
import { DEMO_ACCOUNTS } from '@/data/userMockData'

const ROLE_BTN: Record<string, string> = {
  customer: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200',
  operation_staff: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200',
  petcare_staff: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200',
  shop_head: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200',
  admin: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
  warehouse_manager: 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      const result = login(email, password || 'demo')
      if (result.success) {
        navigate(result.redirectTo)
      } else {
        setError('Email không tồn tại trong hệ thống demo.')
      }
      setLoading(false)
    }, 400)
  }

  function handleQuickLogin(demoEmail: string) {
    setLoading(true)
    setTimeout(() => {
      const result = login(demoEmail, 'demo')
      if (result.success) navigate(result.redirectTo)
      setLoading(false)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 shadow-lg shadow-primary-200">
            <PawPrint size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PetCare System</h1>
          <p className="text-sm text-gray-500 mt-1">Hệ thống quản lý Pet Care đa chi nhánh</p>
        </div>

        {/* Login Form */}
        <div className="card p-6 mb-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Đăng nhập tài khoản</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Demo: nhập bất kỳ mật khẩu nào</p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            <button
              type="submit"
              className="btn-primary w-full justify-center py-2.5"
              disabled={loading}
            >
              <LogIn size={16} />
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        {/* Quick Login */}
        <div className="card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-gray-100" />
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Đăng nhập nhanh (Demo)</p>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.role}
                onClick={() => handleQuickLogin(acc.email)}
                disabled={loading}
                className={`px-3 py-2.5 rounded-lg text-left transition-colors disabled:opacity-50 ${ROLE_BTN[acc.role]}`}
              >
                <div className="text-xs font-semibold">{acc.label}</div>
                <div className="text-[10px] opacity-60 mt-0.5 truncate">{acc.email}</div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          PetCare Management System v2.0 — Demo Mode
        </p>
      </div>
    </div>
  )
}
