import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { LogOut, Bell, PawPrint, Search, X, ChevronRight, AlertTriangle } from 'lucide-react'
import { useAuthContext } from '@/auth/AuthContext'
import { NOTIFICATION_MOCK_LIST, NOTIF_ICONS, NOTIF_COLORS } from '@/data/notificationMockData'
import { BOOKING_MOCK_LIST } from '@/data/bookingMockData'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { INVENTORY_ITEMS } from '@/data/inventoryMockData'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  badge?: number
}

interface Props {
  title: string
  subtitle?: string
  accentClass: string
  navItems: NavItem[]
}

function NotificationPanel({ role, onClose }: { role: string; onClose: () => void }) {
  const [notifs, setNotifs] = useState(
    NOTIFICATION_MOCK_LIST.filter(n => n.forRoles.includes(role))
  )
  const unread = notifs.filter(n => !n.read).length

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }
  function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <div className="absolute right-0 top-8 w-80 bg-white border rounded-xl shadow-xl z-50 overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50">
        <div>
          <span className="text-sm font-semibold text-gray-900">Thông báo</span>
          {unread > 0 && <span className="ml-2 badge-red text-[10px]">{unread} mới</span>}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline">
              Đánh dấu tất cả đã đọc
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y">
        {notifs.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">Không có thông báo nào</div>
        ) : (
          notifs.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${NOTIF_COLORS[n.type]}`}>
                  {NOTIF_ICONS[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className={`text-xs font-semibold ${!n.read ? 'text-gray-900' : 'text-gray-600'} line-clamp-1`}>{n.title}</p>
                    {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-0.5" />}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{n.createdAt}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const bookingResults = query.length > 1
    ? BOOKING_MOCK_LIST.filter(b => b.petName.toLowerCase().includes(query.toLowerCase()) || b.id.toLowerCase().includes(query.toLowerCase()) || b.customerName.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : []

  const productResults = query.length > 1
    ? PRODUCT_MOCK_LIST.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : []

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 text-sm outline-none"
            placeholder="Tìm booking, sản phẩm, khách hàng..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={15} /></button>
        </div>

        {query.length > 1 ? (
          <div className="p-2 max-h-80 overflow-y-auto">
            {bookingResults.length > 0 && (
              <div>
                <p className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Booking</p>
                {bookingResults.map(b => (
                  <button key={b.id} onClick={onClose} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-left">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-sm shrink-0">📅</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{b.id} — {b.petName}</div>
                      <div className="text-xs text-gray-400">{b.serviceName} · {b.date}</div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                  </button>
                ))}
              </div>
            )}
            {productResults.length > 0 && (
              <div>
                <p className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Sản phẩm</p>
                {productResults.map(p => (
                  <button key={p.id} onClick={onClose} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-left">
                    <img src={p.images[0]} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.brand} · {p.skus.length} biến thể</div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                  </button>
                ))}
              </div>
            )}
            {bookingResults.length === 0 && productResults.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400">
                Không tìm thấy kết quả cho "{query}"
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 py-4">
            <p className="text-xs text-gray-400 mb-3">Gợi ý tìm kiếm:</p>
            <div className="flex flex-wrap gap-2">
              {['BK-001', 'Milo', 'Royal Canin', 'Trần Hùng', 'Spa'].map(s => (
                <button key={s} onClick={() => setQuery(s)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BaseLayout({ title, subtitle, accentClass, navItems }: Props) {
  const { currentUser, logout } = useAuthContext()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const unreadCount = NOTIFICATION_MOCK_LIST.filter(
    n => !n.read && n.forRoles.includes(currentUser?.role ?? '')
  ).length

  const lowStockCount = INVENTORY_ITEMS.filter(item => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'warehouse_manager') {
      return item.quantity <= item.minStock
    } else if (currentUser?.shopId) {
      return item.shopId === currentUser.shopId && item.quantity <= item.minStock
    }
    return false
  }).length

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
      if (e.key === 'Escape') {
        setShowNotifs(false)
        setShowSearch(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r flex flex-col shrink-0">
        <div className="px-4 py-4 border-b">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 ${accentClass} rounded-lg flex items-center justify-center shrink-0`}>
              <PawPrint size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">PetCare</div>
              <div className="text-[10px] text-gray-400 truncate">{subtitle ?? title}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').filter(Boolean).length <= 1}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={15} className="shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50">
            <img src={currentUser?.avatar ?? 'https://placehold.co/32x32/gray/white?text=?'} alt="" className="w-8 h-8 rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate">{currentUser?.fullName}</div>
              <div className="text-[10px] text-gray-400 truncate">{currentUser?.position ?? title}</div>
            </div>
            <button onClick={() => { logout(); navigate('/login') }} className="text-gray-400 hover:text-red-500 transition-colors shrink-0" title="Đăng xuất">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b px-5 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-gray-700">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Low stock warning */}
            {lowStockCount > 0 && (
              <Link
                to={currentUser?.role === 'shop_head' ? '/shop-head/products' : (currentUser?.role === 'admin' ? '/admin/inventory' : '/warehouse')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-250/30 text-amber-700 rounded-lg text-xs font-bold transition-all shadow-xs mr-1 animate-pulse"
                title={`Có ${lowStockCount} mặt hàng dưới ngưỡng tồn kho an toàn!`}
              >
                <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                <span className="hidden md:inline">Cảnh báo tồn kho ({lowStockCount})</span>
                <span className="md:hidden">({lowStockCount})</span>
              </Link>
            )}

            {/* Global search */}
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-500 transition-colors"
            >
              <Search size={13} />
              <span className="hidden sm:block">Tìm kiếm</span>
              <kbd className="hidden sm:block bg-white border rounded text-[9px] px-1">⌘K</kbd>
            </button>

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(v => !v)}
                className={`relative p-2 rounded-lg transition-colors ${showNotifs ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <NotificationPanel role={currentUser?.role ?? ''} onClose={() => setShowNotifs(false)} />
              )}
            </div>

            <div className="w-px h-4 bg-gray-200" />
            <div className="text-xs text-gray-400">
              {new Date(2026, 4, 31).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
