import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Clock } from 'lucide-react'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_COLORS } from '@/data/bookingMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'

export default function MyBookingsPage() {
  const { currentUser } = useAuthContext()
  const myBookings = BOOKING_MOCK_LIST.filter(b => b.customerId === currentUser?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  if (myBookings.length === 0) {
    return (
      <div className="text-center py-16">
        <CalendarDays size={40} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Chưa có lịch hẹn nào</h2>
        <p className="text-sm text-gray-400 mb-4">Đặt lịch dịch vụ cho thú cưng của bạn ngay hôm nay!</p>
        <Link to="/customer/booking" className="btn-primary">Đặt lịch ngay</Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Lịch hẹn của tôi</h1>
        <Link to="/customer/booking" className="btn-primary text-sm py-2">+ Đặt lịch mới</Link>
      </div>

      <div className="space-y-3">
        {myBookings.map(b => (
          <Link key={b.id} to={`/customer/bookings/${b.id}`}
            className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="w-12 text-center shrink-0">
              <div className="text-lg font-black text-primary-600">{b.startTime}</div>
              <div className="text-[10px] text-gray-400">{b.date.split('-').slice(1).join('/')}</div>
            </div>
            <div className="w-px h-12 bg-gray-200 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-gray-900">{b.serviceName}</span>
                <span className={STATUS_COLORS[b.status]}>{STATUS_LABELS[b.status]}</span>
              </div>
              <div className="text-xs text-gray-500">{b.petName} ({b.petBreed})</div>
              {b.assignedStaffName && (
                <div className="text-xs text-gray-400 mt-0.5">NV: {b.assignedStaffName}</div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-gray-900">{formatPrice(b.price)}</div>
              <div className="flex items-center gap-1 text-xs text-gray-400 justify-end mt-0.5">
                <Clock size={10} /> {b.duration}ph
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-400 transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
