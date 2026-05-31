import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BOOKING_MOCK_LIST } from '@/data/bookingMockData'
import { ROOM_MOCK_LIST } from '@/data/roomMockData'
import { useAuthContext } from '@/auth/AuthContext'
import type { Booking } from '@/types'

const HOURS = Array.from({ length: 14 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`)

const STATUS_BLOCK_COLOR: Record<string, string> = {
  pending: 'bg-orange-100 border-orange-300 text-orange-800',
  confirmed: 'bg-blue-100 border-blue-300 text-blue-800',
  checked_in: 'bg-indigo-100 border-indigo-300 text-indigo-800',
  in_progress: 'bg-purple-100 border-purple-300 text-purple-800',
  completed: 'bg-green-100 border-green-300 text-green-800',
  paid: 'bg-gray-100 border-gray-300 text-gray-600',
  cancelled: 'bg-red-50 border-red-200 text-red-400',
  no_show: 'bg-red-50 border-red-200 text-red-400',
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export default function CalendarPage() {
  const { currentUser } = useAuthContext()
  const [currentDate, setCurrentDate] = useState('2026-05-31')

  const shopRooms = ROOM_MOCK_LIST.filter(r => r.shopId === currentUser?.shopId && r.status !== 'inactive')
  const dayBookings = BOOKING_MOCK_LIST.filter(
    b => b.date === currentDate && b.shopId === currentUser?.shopId && b.status !== 'cancelled'
  )

  function getBookingForRoomAndHour(roomId: string, hour: string): Booking | undefined {
    const hourMin = timeToMinutes(hour)
    return dayBookings.find(b => {
      if (b.roomId !== roomId) return false
      const start = timeToMinutes(b.startTime)
      const end = timeToMinutes(b.endTime)
      return hourMin >= start && hourMin < end
    })
  }

  function isStartOfBooking(roomId: string, hour: string): boolean {
    const b = getBookingForRoomAndHour(roomId, hour)
    return !!b && b.startTime === hour
  }

  function prevDay() {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 1)
    setCurrentDate(d.toISOString().split('T')[0])
  }
  function nextDay() {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 1)
    setCurrentDate(d.toISOString().split('T')[0])
  }

  const dateLabel = new Date(currentDate).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Lịch theo phòng</h1>
        <div className="flex items-center gap-2">
          <button onClick={prevDay} className="btn-secondary py-1.5 px-2"><ChevronLeft size={16} /></button>
          <span className="text-sm font-medium text-gray-700">{dateLabel}</span>
          <button onClick={nextDay} className="btn-secondary py-1.5 px-2"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(STATUS_BLOCK_COLOR).slice(0, 5).map(([status, cls]) => (
          <div key={status} className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium ${cls}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            {status === 'pending' ? 'Chờ xác nhận' : status === 'confirmed' ? 'Đã xác nhận' : status === 'checked_in' ? 'Check-in' : status === 'in_progress' ? 'Đang làm' : 'Hoàn thành'}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="card overflow-x-auto">
        <div className="min-w-max">
          {/* Header — rooms */}
          <div className="flex border-b bg-gray-50">
            <div className="w-16 shrink-0 px-2 py-3 text-xs text-gray-400 font-medium">Giờ</div>
            {shopRooms.map(room => (
              <div key={room.id} className="w-44 px-2 py-3 border-l">
                <div className="text-xs font-semibold text-gray-900">{room.name}</div>
                <div className="text-[10px] text-gray-400">{room.categoryName}</div>
              </div>
            ))}
          </div>

          {/* Time rows */}
          {HOURS.map(hour => (
            <div key={hour} className="flex border-b hover:bg-gray-50/50 transition-colors" style={{ minHeight: 48 }}>
              <div className="w-16 shrink-0 px-2 py-2 text-xs text-gray-400 font-mono">{hour}</div>
              {shopRooms.map(room => {
                const booking = getBookingForRoomAndHour(room.id, hour)
                const isStart = isStartOfBooking(room.id, hour)
                return (
                  <div key={room.id} className="w-44 px-1 py-1 border-l relative">
                    {isStart && booking && (
                      <div className={`rounded-lg border px-2 py-1.5 text-[10px] leading-tight ${STATUS_BLOCK_COLOR[booking.status]}`}>
                        <div className="font-bold truncate">{booking.petName}</div>
                        <div className="truncate opacity-75">{booking.serviceName}</div>
                        <div className="opacity-60">{booking.startTime}–{booking.endTime}</div>
                        {booking.assignedStaffName && (
                          <div className="opacity-60 truncate">NV: {booking.assignedStaffName}</div>
                        )}
                      </div>
                    )}
                    {booking && !isStart && (
                      <div className={`h-full rounded-lg border border-dashed opacity-30 ${STATUS_BLOCK_COLOR[booking.status]}`} />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {shopRooms.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">Không có phòng nào trong chi nhánh này</div>
      )}
    </div>
  )
}
