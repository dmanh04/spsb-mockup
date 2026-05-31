import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, MapPin, User, PawPrint, Camera } from 'lucide-react'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_COLORS } from '@/data/bookingMockData'
import { formatPrice, formatDateTime } from '@/utils/format'

const STATUS_STEP_ORDER = ['pending', 'confirmed', 'checked_in', 'in_progress', 'completed', 'paid']

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const booking = BOOKING_MOCK_LIST.find(b => b.id === id)

  if (!booking) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3">🔍</div>
        <h2 className="text-lg font-semibold text-gray-700">Không tìm thấy lịch hẹn</h2>
        <Link to="/customer/bookings" className="btn-secondary mt-4 inline-flex">← Quay lại</Link>
      </div>
    )
  }

  const currentStep = STATUS_STEP_ORDER.indexOf(booking.status)

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/customer/bookings" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Chi tiết lịch hẹn</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-mono text-primary-600">{booking.id}</span>
            <span className={STATUS_COLORS[booking.status]}>{STATUS_LABELS[booking.status]}</span>
          </div>
        </div>
      </div>

      {/* Progress timeline */}
      {booking.status !== 'cancelled' && booking.status !== 'no_show' && (
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Tiến trình</h3>
          <div className="flex items-center justify-between">
            {STATUS_STEP_ORDER.map((status, i) => {
              const done = i <= currentStep
              const active = i === currentStep
              return (
                <div key={status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-200 text-gray-300'}`}>
                      {done ? <CheckCircle size={14} /> : <span className="text-xs">{i + 1}</span>}
                    </div>
                    <span className={`text-[9px] mt-1 text-center w-14 ${active ? 'text-primary-600 font-semibold' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                      {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                    </span>
                  </div>
                  {i < STATUS_STEP_ORDER.length - 1 && (
                    <div className={`h-0.5 flex-1 -mt-4 ${i < currentStep ? 'bg-primary-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main info */}
      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <Clock size={15} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-gray-400">Thời gian</div>
              <div className="text-sm font-semibold text-gray-900">{booking.date}</div>
              <div className="text-sm text-gray-700">{booking.startTime} – {booking.endTime}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <PawPrint size={15} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-gray-400">Thú cưng</div>
              <div className="text-sm font-semibold text-gray-900">{booking.petName}</div>
              <div className="text-sm text-gray-500">{booking.petBreed}</div>
            </div>
          </div>
          {booking.assignedStaffName && (
            <div className="flex items-start gap-2">
              <User size={15} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Nhân viên phụ trách</div>
                <div className="text-sm font-semibold text-gray-900">{booking.assignedStaffName}</div>
              </div>
            </div>
          )}
          {booking.roomName && (
            <div className="flex items-start gap-2">
              <MapPin size={15} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Phòng</div>
                <div className="text-sm font-semibold text-gray-900">{booking.roomName}</div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">Dịch vụ</div>
            <div className="text-sm font-semibold text-gray-900">{booking.serviceName}</div>
          </div>
          <div className="text-lg font-bold text-primary-600">{formatPrice(booking.price)}</div>
        </div>

        {booking.note && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
            📋 {booking.note}
          </div>
        )}
      </div>

      {/* Before/After photos */}
      {(booking.beforePhotoUrl || booking.afterPhotoUrl) && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Camera size={14} /> Ảnh trước/sau
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {booking.beforePhotoUrl && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Trước khi làm</div>
                <img src={booking.beforePhotoUrl} alt="Before" className="w-full rounded-lg" />
              </div>
            )}
            {booking.afterPhotoUrl && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Sau khi làm</div>
                <img src={booking.afterPhotoUrl} alt="After" className="w-full rounded-lg" />
              </div>
            )}
          </div>
          {booking.serviceNote && (
            <p className="text-xs text-gray-600 mt-3 italic">"{booking.serviceNote}"</p>
          )}
        </div>
      )}

      {/* Status history */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Lịch sử trạng thái</h3>
        <div className="space-y-3">
          {[...booking.statusHistory].reverse().map((h, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={STATUS_COLORS[h.status]}>{STATUS_LABELS[h.status]}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(h.changedAt)}</span>
                </div>
                {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
                <p className="text-xs text-gray-400">{h.changedBy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
