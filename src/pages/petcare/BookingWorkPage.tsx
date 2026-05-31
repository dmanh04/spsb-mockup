import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Camera, CheckCircle, Play, FileText, Clock, PawPrint } from 'lucide-react'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_COLORS } from '@/data/bookingMockData'
import { formatPrice, formatDateTime } from '@/utils/format'

export default function BookingWorkPage() {
  const { id } = useParams<{ id: string }>()
  const booking = BOOKING_MOCK_LIST.find(b => b.id === id)
  const [note, setNote] = useState(booking?.serviceNote ?? '')
  const [status, setStatus] = useState(booking?.status ?? 'confirmed')
  const [saved, setSaved] = useState(false)

  if (!booking) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3">🔍</div>
        <h2 className="text-lg font-semibold text-gray-700">Không tìm thấy booking</h2>
        <Link to="/petcare" className="btn-secondary mt-4 inline-flex">← Quay lại</Link>
      </div>
    )
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/petcare" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Thực hiện dịch vụ</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-mono text-primary-600">{booking.id}</span>
            <span className={STATUS_COLORS[status]}>{STATUS_LABELS[status as keyof typeof STATUS_LABELS]}</span>
          </div>
        </div>
      </div>

      {/* Pet info card */}
      <div className="card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">🐾</div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900">{booking.petName}</h2>
            <p className="text-sm text-gray-600">{booking.petBreed}</p>
            <p className="text-xs text-gray-500 mt-1">Chủ: {booking.customerName} · {booking.customerPhone}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">{booking.serviceName}</div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <Clock size={10} /> {booking.startTime}–{booking.endTime}
            </div>
            <div className="text-sm font-bold text-primary-600 mt-1">{formatPrice(booking.price)}</div>
          </div>
        </div>
        {booking.note && (
          <div className="mt-3 bg-orange-100 border border-orange-200 rounded-lg p-2.5 text-xs text-orange-700">
            ⚠️ <strong>Lưu ý từ khách hàng:</strong> {booking.note}
          </div>
        )}
        {booking.checkinNote && (
          <div className="mt-2 bg-blue-100 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-700">
            📋 <strong>Note check-in:</strong> {booking.checkinNote}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Cập nhật trạng thái</h3>
        <div className="grid grid-cols-2 gap-2">
          {status === 'checked_in' && (
            <button
              onClick={() => setStatus('in_progress')}
              className="col-span-2 btn-primary justify-center py-3 bg-purple-500 hover:bg-purple-600"
            >
              <Play size={16} /> Bắt đầu thực hiện dịch vụ
            </button>
          )}
          {status === 'in_progress' && (
            <button
              onClick={() => setStatus('completed')}
              className="col-span-2 btn-primary justify-center py-3 bg-green-500 hover:bg-green-600"
            >
              <CheckCircle size={16} /> Đánh dấu Hoàn thành
            </button>
          )}
          {(status === 'confirmed' || status === 'pending') && (
            <div className="col-span-2 text-center text-sm text-gray-400 py-2">
              Chờ Operation Staff check-in pet trước
            </div>
          )}
          {status === 'completed' && (
            <div className="col-span-2 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle size={16} /> Dịch vụ đã hoàn thành. Operation Staff sẽ thu tiền.
            </div>
          )}
        </div>
      </div>

      {/* Service note */}
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FileText size={14} /> Ghi chú dịch vụ
        </h3>
        <textarea
          className="form-input h-24 resize-none text-sm"
          placeholder="Ghi lại tình trạng thú cưng, những điều đặc biệt trong quá trình làm..."
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <button onClick={handleSave} className={`btn-primary w-full justify-center ${saved ? 'bg-green-500 hover:bg-green-500' : ''}`}>
          {saved ? '✓ Đã lưu' : 'Lưu ghi chú'}
        </button>
      </div>

      {/* Photo upload */}
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Camera size={14} /> Ảnh trước/sau
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Before */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Ảnh trước</p>
            {booking.beforePhotoUrl ? (
              <img src={booking.beforePhotoUrl} alt="Before" className="w-full rounded-lg" />
            ) : (
              <button className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-300 transition-colors text-gray-400">
                <Camera size={20} />
                <span className="text-xs">Chụp ảnh trước</span>
              </button>
            )}
          </div>
          {/* After */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Ảnh sau</p>
            {booking.afterPhotoUrl ? (
              <img src={booking.afterPhotoUrl} alt="After" className="w-full rounded-lg" />
            ) : (
              <button className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-300 transition-colors text-gray-400">
                <Camera size={20} />
                <span className="text-xs">Chụp ảnh sau</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status history */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Lịch sử</h3>
        <div className="space-y-2">
          {[...booking.statusHistory].reverse().map((h, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
              <div>
                <span className={STATUS_COLORS[h.status]}>{STATUS_LABELS[h.status as keyof typeof STATUS_LABELS]}</span>
                <span className="text-gray-400 ml-2">{formatDateTime(h.changedAt)}</span>
                {h.note && <p className="text-gray-500">{h.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
