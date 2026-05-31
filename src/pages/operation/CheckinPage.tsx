import { useState } from 'react'
import { Search, CheckCircle, AlertCircle, PawPrint, Clock } from 'lucide-react'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_COLORS } from '@/data/bookingMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'
import type { Booking } from '@/types'

export default function CheckinPage() {
  const { currentUser } = useAuthContext()
  const [query, setQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [checkinNote, setCheckinNote] = useState('')
  const [checkedIn, setCheckedIn] = useState<string[]>([])

  const confirmableStatuses = ['confirmed']
  const todayStr = '2026-05-31'

  const results = query.length > 1
    ? BOOKING_MOCK_LIST.filter(b =>
        b.shopId === currentUser?.shopId &&
        (b.id.toLowerCase().includes(query.toLowerCase()) ||
         b.customerPhone.includes(query) ||
         b.customerName.toLowerCase().includes(query.toLowerCase()) ||
         b.petName.toLowerCase().includes(query.toLowerCase()))
      )
    : BOOKING_MOCK_LIST.filter(b =>
        b.shopId === currentUser?.shopId &&
        b.date === todayStr &&
        confirmableStatuses.includes(b.status)
      )

  function handleCheckin() {
    if (!selectedBooking) return
    setCheckedIn(prev => [...prev, selectedBooking.id])
    setSelectedBooking(null)
    setCheckinNote('')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Quầy Check-in</h1>
        <p className="text-sm text-gray-500">Tìm booking theo mã, số điện thoại hoặc tên khách/pet</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="form-input pl-10 py-3 text-base"
          placeholder="Nhập mã booking (BK-001), SĐT (0901...) hoặc tên..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: search results */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500">
            {query.length > 1 ? `Kết quả tìm kiếm (${results.length})` : `Booking cần check-in hôm nay (${results.length})`}
          </h2>
          {results.length === 0 ? (
            <div className="card p-6 text-center text-sm text-gray-400">
              {query.length > 1 ? 'Không tìm thấy booking' : 'Không có booking cần check-in'}
            </div>
          ) : (
            results.map(b => {
              const done = checkedIn.includes(b.id)
              return (
                <button key={b.id}
                  onClick={() => !done && setSelectedBooking(b)}
                  className={`w-full card p-4 text-left transition-all ${done ? 'opacity-50 cursor-default' : selectedBooking?.id === b.id ? 'border-primary-400 bg-primary-50' : 'hover:shadow-md'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-primary-600">{b.id}</span>
                      {done ? <span className="badge-green">✓ Đã check-in</span> : <span className={STATUS_COLORS[b.status]}>{STATUS_LABELS[b.status]}</span>}
                    </div>
                    <span className="text-sm font-bold text-gray-600">{b.startTime}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-lg shrink-0">🐾</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{b.petName} <span className="text-gray-400 font-normal">({b.petBreed})</span></div>
                      <div className="text-xs text-gray-500">{b.customerName} · {b.customerPhone}</div>
                      <div className="text-xs text-gray-400">{b.serviceName}</div>
                    </div>
                  </div>
                  {b.note && <div className="mt-2 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">⚠️ {b.note}</div>}
                </button>
              )
            })
          )}
        </div>

        {/* Right: check-in form */}
        <div>
          {selectedBooking ? (
            <div className="card p-5 space-y-4 sticky top-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                <h3 className="font-semibold text-gray-900">Xác nhận Check-in</h3>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <PawPrint size={14} className="text-blue-500" />
                  <span className="font-bold text-gray-900">{selectedBooking.petName}</span>
                  <span className="text-gray-500">({selectedBooking.petBreed})</span>
                </div>
                <div className="text-gray-600">👤 {selectedBooking.customerName} · {selectedBooking.customerPhone}</div>
                <div className="text-gray-600">✂️ {selectedBooking.serviceName}</div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock size={12} /> {selectedBooking.startTime}–{selectedBooking.endTime} · {selectedBooking.duration} phút
                </div>
                {selectedBooking.assignedStaffName && <div className="text-gray-600">👨‍🔧 NV: {selectedBooking.assignedStaffName}</div>}
                {selectedBooking.roomName && <div className="text-gray-600">🚪 Phòng: {selectedBooking.roomName}</div>}
                <div className="font-bold text-primary-600 text-base">{formatPrice(selectedBooking.price)}</div>
              </div>

              {selectedBooking.note && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm text-orange-700">
                  <strong>⚠️ Ghi chú đặt lịch:</strong> {selectedBooking.note}
                </div>
              )}

              {/* Pet condition check */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Kiểm tra tình trạng pet khi check-in</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Khỏe mạnh bình thường', 'Có vết thương nhỏ', 'Lo lắng/căng thẳng', 'Có ký sinh trùng'].map(cond => (
                    <label key={cond} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" className="accent-primary-500" />
                      {cond}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Ghi chú check-in (tuỳ chọn)</label>
                <textarea
                  className="form-input h-20 resize-none text-sm"
                  placeholder="Ghi nhận tình trạng thú cưng khi đến..."
                  value={checkinNote}
                  onChange={e => setCheckinNote(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button onClick={handleCheckin} className="flex-1 btn-primary justify-center py-3 bg-green-500 hover:bg-green-600">
                  <CheckCircle size={16} /> Xác nhận Check-in
                </button>
                <button onClick={() => setSelectedBooking(null)} className="btn-secondary">Hủy</button>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center text-gray-400">
              <AlertCircle size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Chọn một booking để thực hiện check-in</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
