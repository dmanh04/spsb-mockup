import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { NOTIFICATION_MOCK_LIST, NOTIF_ICONS, NOTIF_COLORS, type NotifType } from '@/data/notificationMockData'
import { useAuthContext } from '@/auth/AuthContext'

const TYPE_LABELS: Record<NotifType, string> = {
  booking: 'Lịch hẹn', order: 'Đơn hàng', inventory: 'Kho hàng',
  system: 'Hệ thống', leave: 'Nghỉ phép', payment: 'Thanh toán',
}

export default function NotificationsPage() {
  const { currentUser } = useAuthContext()
  const [notifs, setNotifs] = useState(
    NOTIFICATION_MOCK_LIST.filter(n => n.forRoles.includes(currentUser?.role ?? ''))
  )
  const [filter, setFilter] = useState<NotifType | 'all'>('all')

  const unread = notifs.filter(n => !n.read).length
  const filtered = filter === 'all' ? notifs : notifs.filter(n => n.type === filter)
  const types = [...new Set(notifs.map(n => n.type))]

  function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }
  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }
  function remove(id: string) {
    setNotifs(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Bell size={20} /> Thông báo</h1>
          {unread > 0 && <p className="text-sm text-blue-600">{unread} thông báo chưa đọc</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm py-1.5">
            <CheckCheck size={14} /> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilter('all')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${filter === 'all' ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
          Tất cả ({notifs.length})
        </button>
        {types.map(type => (
          <button key={type} onClick={() => setFilter(type)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${filter === type ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
            <span>{NOTIF_ICONS[type]}</span> {TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map(n => (
          <div key={n.id} onClick={() => markRead(n.id)}
            className={`card p-4 flex items-start gap-4 cursor-pointer hover:shadow-md transition-all ${!n.read ? 'border-blue-200 bg-blue-50/30' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${NOTIF_COLORS[n.type]}`}>
              {NOTIF_ICONS[n.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className={`text-sm font-semibold ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  <button onClick={e => { e.stopPropagation(); remove(n.id) }} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] text-gray-400">{n.createdAt}</span>
                {n.link && (
                  <Link to={n.link} className="text-[10px] text-primary-600 hover:underline" onClick={e => e.stopPropagation()}>
                    Xem chi tiết →
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Bell size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Không có thông báo nào</p>
          </div>
        )}
      </div>
    </div>
  )
}
