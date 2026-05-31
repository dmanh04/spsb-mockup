import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Home, ShoppingBag, Scissors, PawPrint,
  ShoppingCart, Package, CalendarDays, Bell, User, LogOut,
} from 'lucide-react'
import { useAuthContext } from '@/auth/AuthContext'

const TOP_NAV = [
  { to: '/customer', label: 'Trang chủ', icon: Home },
  { to: '/customer/products', label: 'Sản phẩm', icon: ShoppingBag },
  { to: '/customer/services', label: 'Dịch vụ', icon: Scissors },
  { to: '/customer/booking', label: 'Đặt lịch', icon: CalendarDays },
  { to: '/customer/my-pets', label: 'Thú cưng', icon: PawPrint },
]

const RIGHT_NAV = [
  { to: '/customer/orders', label: 'Đơn hàng', icon: Package },
  { to: '/customer/bookings', label: 'Lịch hẹn', icon: CalendarDays },
  { to: '/customer/cart', label: 'Giỏ hàng', icon: ShoppingCart },
  { to: '/customer/notifications', label: 'Thông báo', icon: Bell },
  { to: '/customer/profile', label: 'Tài khoản', icon: User },
]

export default function CustomerLayout() {
  const { currentUser, logout } = useAuthContext()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-0">
          <div className="flex items-center h-14 gap-6">
            {/* Logo */}
            <Link to="/customer" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <PawPrint size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">PetCare</span>
            </Link>

            {/* Main nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {TOP_NAV.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/customer'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon size={14} />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 shrink-0">
              {RIGHT_NAV.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`
                  }
                  title={item.label}
                >
                  <item.icon size={17} />
                </NavLink>
              ))}

              {currentUser && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-1" />
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50">
                    <img src={currentUser.avatar} alt="" className="w-6 h-6 rounded-full" />
                    <span className="text-xs font-medium text-gray-700 hidden lg:block">
                      {currentUser.fullName.split(' ').slice(-1)[0]}
                    </span>
                    <button
                      onClick={() => { logout(); navigate('/login') }}
                      className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                      title="Đăng xuất"
                    >
                      <LogOut size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
