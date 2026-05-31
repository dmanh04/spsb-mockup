import { Link } from 'react-router-dom'
import { Clock, PawPrint, ChevronRight, CheckCircle } from 'lucide-react'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_COLORS } from '@/data/bookingMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'

export default function TodayPage() {
  const { currentUser } = useAuthContext()
  const todayStr = '2026-05-31'

  const myBookings = BOOKING_MOCK_LIST.filter(
    b => b.assignedStaffId === currentUser?.id && (b.date === todayStr || b.status === 'in_progress')
  ).sort((a, b) => a.startTime.localeCompare(b.startTime))

  const done = myBookings.filter(b => b.status === 'completed' || b.status === 'paid').length
  const total = myBookings.length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Lịch hôm nay</h1>
        <p className="text-sm text-gray-500">{todayStr} · {currentUser?.fullName}</p>
      </div>

      {/* Progress */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Tiến độ hôm nay</span>
          <span className="text-sm font-bold text-gray-900">{done}/{total} hoàn thành</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all"
            style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Booking list */}
      {myBookings.length === 0 ? (
        <div className="text-center py-16 card">
          <CheckCircle size={40} className="mx-auto text-green-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">Không có lịch hôm nay</h2>
          <p className="text-sm text-gray-400 mt-1">Chưa có booking nào được gán cho bạn</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myBookings.map(b => {
            const isDone = b.status === 'completed' || b.status === 'paid'
            const isActive = b.status === 'in_progress'
            return (
              <Link key={b.id} to={`/petcare/bookings/${b.id}`}
                className={`card p-4 flex items-center gap-4 hover:shadow-md transition-shadow group ${isActive ? 'border-purple-300 bg-purple-50' : isDone ? 'opacity-60' : ''}`}>
                <div className="text-center w-14 shrink-0">
                  <div className={`text-lg font-black ${isActive ? 'text-purple-600' : 'text-primary-600'}`}>{b.startTime}</div>
                  <div className="text-[10px] text-gray-400">{b.duration}ph</div>
                </div>
                <div className="w-px h-12 bg-gray-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900">{b.petName}</span>
                    <span className="text-xs text-gray-400">({b.petBreed})</span>
                    {isDone && <CheckCircle size={13} className="text-green-500" />}
                  </div>
                  <div className="text-xs text-gray-500">{b.serviceName}</div>
                  <div className="text-xs text-gray-400">{b.customerName}</div>
                  {b.note && <div className="text-[10px] text-orange-500 mt-0.5">⚠️ {b.note}</div>}
                </div>
                <div className="text-right shrink-0">
                  <span className={STATUS_COLORS[b.status]}>{STATUS_LABELS[b.status]}</span>
                  <div className="text-xs text-gray-500 mt-1">{formatPrice(b.price)}</div>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-400 transition-colors shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
