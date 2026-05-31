import { useState } from 'react'
import { CheckCircle, User, DoorOpen, X } from 'lucide-react'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_BG, STATUS_COLORS } from '@/data/bookingMockData'
import { USER_MOCK_LIST } from '@/data/userMockData'
import { ROOM_MOCK_LIST } from '@/data/roomMockData'
import { useAuthContext } from '@/auth/AuthContext'
import type { Booking, BookingStatus } from '@/types'
import { formatPrice } from '@/utils/format'

const COLUMNS: { status: BookingStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'Chờ xác nhận', color: 'border-t-orange-400' },
  { status: 'confirmed', label: 'Đã xác nhận', color: 'border-t-blue-400' },
  { status: 'checked_in', label: 'Đã Check-in', color: 'border-t-indigo-400' },
  { status: 'in_progress', label: 'Đang thực hiện', color: 'border-t-purple-400' },
  { status: 'completed', label: 'Hoàn thành', color: 'border-t-green-400' },
]

interface BookingModalProps {
  booking: Booking
  onClose: () => void
  shopId: string
}

function BookingModal({ booking, onClose, shopId }: BookingModalProps) {
  const staffList = USER_MOCK_LIST.filter(u => u.role === 'petcare_staff' && u.shopId === shopId)
  const rooms = ROOM_MOCK_LIST.filter(r => r.shopId === shopId && r.status === 'available')
  const [selectedStaff, setSelectedStaff] = useState(booking.assignedStaffId ?? '')
  const [selectedRoom, setSelectedRoom] = useState(booking.roomId ?? '')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">Chi tiết & Xử lý</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-sm">
            <div className="font-semibold">{booking.serviceName}</div>
            <div className="text-gray-500">{booking.petName} ({booking.petBreed}) — {booking.customerName}</div>
            <div className="text-gray-500">{booking.date} · {booking.startTime}–{booking.endTime}</div>
            <div className="font-bold text-primary-600">{formatPrice(booking.price)}</div>
            {booking.note && <div className="text-orange-600 text-xs">⚠️ {booking.note}</div>}
          </div>

          <div>
            <label className="form-label flex items-center gap-1"><User size={13} /> Gán nhân viên</label>
            <select className="form-input" value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
              <option value="">-- Chọn nhân viên --</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.fullName} — {s.position}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label flex items-center gap-1"><DoorOpen size={13} /> Gán phòng</label>
            <select className="form-input" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
              <option value="">-- Chọn phòng --</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.categoryName})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            {booking.status === 'pending' && (
              <button className="btn-primary flex-1 justify-center" onClick={onClose}>
                <CheckCircle size={14} /> Xác nhận
              </button>
            )}
            {booking.status === 'confirmed' && (
              <button className="btn-primary flex-1 justify-center bg-indigo-500 hover:bg-indigo-600" onClick={onClose}>
                Check-in
              </button>
            )}
            {booking.status === 'checked_in' && (
              <button className="btn-primary flex-1 justify-center bg-purple-500 hover:bg-purple-600" onClick={onClose}>
                Bắt đầu dịch vụ
              </button>
            )}
            {booking.status === 'completed' && (
              <button className="btn-primary flex-1 justify-center bg-green-500 hover:bg-green-600" onClick={onClose}>
                Thu tiền & Hoàn tất
              </button>
            )}
            <button className="btn-secondary" onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function QueuePage() {
  const { currentUser } = useAuthContext()
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const todayStr = '2026-05-31'
  const todayBookings = BOOKING_MOCK_LIST.filter(
    b => (b.date === todayStr || b.status === 'in_progress') && b.shopId === currentUser?.shopId
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Hàng chờ Booking</h1>
        <p className="text-sm text-gray-500">Kéo thẻ để chuyển trạng thái · {todayStr}</p>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const cards = todayBookings.filter(b => b.status === col.status)
          return (
            <div key={col.status} className={`shrink-0 w-64 bg-gray-50 rounded-xl border-t-4 ${col.color}`}>
              <div className="px-3 py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">{col.label}</span>
                <span className="bg-white border text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center text-gray-600">
                  {cards.length}
                </span>
              </div>
              <div className="p-2 space-y-2 min-h-24">
                {cards.map(b => (
                  <button key={b.id} onClick={() => setSelectedBooking(b)}
                    className="w-full bg-white rounded-xl p-3 border shadow-sm text-left hover:shadow-md transition-shadow hover:border-primary-300">
                    <div className="flex items-start justify-between mb-1.5">
                      <span className="text-xs font-bold text-primary-600">{b.id}</span>
                      <span className="text-[10px] text-gray-400">{b.startTime}</span>
                    </div>
                    <div className="text-xs font-semibold text-gray-900 mb-0.5">{b.petName}</div>
                    <div className="text-[10px] text-gray-500 mb-1">{b.serviceName}</div>
                    <div className="text-[10px] text-gray-400">{b.customerName}</div>
                    {b.assignedStaffName && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center text-[8px] text-green-600 font-bold">
                          {b.assignedStaffName[0]}
                        </div>
                        <span className="text-[10px] text-gray-500">{b.assignedStaffName}</span>
                      </div>
                    )}
                    {b.note && (
                      <div className="mt-1 text-[10px] text-orange-600">⚠️ Có ghi chú</div>
                    )}
                  </button>
                ))}
                {cards.length === 0 && (
                  <div className="text-xs text-gray-300 text-center py-4">Trống</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          shopId={currentUser?.shopId ?? 'SH01'}
        />
      )}
    </div>
  )
}
