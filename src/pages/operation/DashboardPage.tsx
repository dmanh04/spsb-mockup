import { Link } from 'react-router-dom'
import { CalendarCheck, Clock, DoorOpen, Users, AlertCircle } from 'lucide-react'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_COLORS, STATUS_BG } from '@/data/bookingMockData'
import { ROOM_MOCK_LIST } from '@/data/roomMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'

export default function OperationDashboardPage() {
  const { currentUser } = useAuthContext()
  const todayStr = '2026-05-31'
  const todayBookings = BOOKING_MOCK_LIST.filter(b => b.date === todayStr && b.shopId === currentUser?.shopId)
  const shopRooms = ROOM_MOCK_LIST.filter(r => r.shopId === currentUser?.shopId)

  const pending = todayBookings.filter(b => b.status === 'pending')
  const inProgress = todayBookings.filter(b => b.status === 'in_progress')
  const confirmed = todayBookings.filter(b => b.status === 'confirmed')

  const stats = [
    { label: 'Tổng hôm nay', value: todayBookings.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Chờ xác nhận', value: pending.length, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Đang thực hiện', value: inProgress.length, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Đã xác nhận', value: confirmed.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Vận hành</h1>
        <p className="text-sm text-gray-500">{todayStr} · {currentUser?.position}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`card p-4 ${s.bg}`}>
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs font-medium text-gray-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert: pending bookings */}
      {pending.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-orange-500 shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-semibold text-orange-800">
              {pending.length} lịch hẹn đang chờ xác nhận
            </span>
            <span className="text-xs text-orange-600 ml-2">Cần gán nhân viên và phòng</span>
          </div>
          <Link to="/operation/queue" className="btn-primary text-xs py-1.5 shrink-0">Xử lý ngay</Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Today's schedule */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <CalendarCheck size={15} className="text-primary-500" /> Lịch hôm nay
            </h2>
            <Link to="/operation/queue" className="text-xs text-primary-600 hover:underline">Xem tất cả</Link>
          </div>
          <div className="divide-y max-h-80 overflow-y-auto">
            {todayBookings.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">Không có lịch hôm nay</div>
            ) : (
              todayBookings
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(b => (
                  <div key={b.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50">
                    <div className="text-center w-12 shrink-0">
                      <div className="text-sm font-bold text-primary-600">{b.startTime}</div>
                      <div className="text-[10px] text-gray-400">{b.duration}ph</div>
                    </div>
                    <div className="w-px h-8 bg-gray-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate">{b.petName} — {b.serviceName}</div>
                      <div className="text-xs text-gray-500">{b.customerName}</div>
                      {b.assignedStaffName && <div className="text-[10px] text-gray-400">NV: {b.assignedStaffName}</div>}
                    </div>
                    <span className={`${STATUS_COLORS[b.status]} shrink-0`}>{STATUS_LABELS[b.status]}</span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Room status */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <DoorOpen size={15} className="text-primary-500" /> Tình trạng phòng
            </h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {shopRooms.map(r => (
              <div key={r.id} className={`rounded-xl p-3 border-2 ${
                r.status === 'available' ? 'border-green-200 bg-green-50'
                : r.status === 'occupied' ? 'border-orange-200 bg-orange-50'
                : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="text-sm font-semibold text-gray-900">{r.name}</div>
                <div className="text-xs text-gray-500">{r.categoryName}</div>
                <div className={`text-xs font-medium mt-1 ${
                  r.status === 'available' ? 'text-green-600'
                  : r.status === 'occupied' ? 'text-orange-600'
                  : 'text-gray-400'
                }`}>
                  {r.status === 'available' ? '● Trống' : r.status === 'occupied' ? '● Đang dùng' : '● Bảo trì'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
