import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Camera, CheckCircle, Play, FileText, Clock, PawPrint } from 'lucide-react'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_COLORS, saveBookings } from '@/data/bookingMockData'
import { formatPrice, formatDateTime } from '@/utils/format'

const BOARDING_PHOTOS = [
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&auto=format&fit=crop&q=60', // puppy playing
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&auto=format&fit=crop&q=60', // cat resting
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop&q=60', // happy dog
]

export default function BookingWorkPage() {
  const { id } = useParams<{ id: string }>()
  const booking = BOOKING_MOCK_LIST.find(b => b.id === id)
  const [note, setNote] = useState(booking?.serviceNote ?? '')
  const [status, setStatus] = useState(booking?.status ?? 'confirmed')
  const [saved, setSaved] = useState(false)

  // Boarding states
  const [boardingLogs, setBoardingLogs] = useState<any[]>(() => {
    return booking?.boardingLogs ?? [
      {
        date: '30/05/2026',
        feedMorning: true,
        feedEvening: true,
        walkMorning: true,
        walkEvening: true,
        hygieneCleared: true,
        temperature: '38.6',
        ownerUpdateText: 'Luna thích nghi rất tốt, đã làm quen với KTV Lê Lan. Bé ăn khỏe và ngủ ngoan trên đệm.',
        photoUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&auto=format&fit=crop&q=60',
        updatedAt: '2026-05-30 18:30',
      }
    ]
  })

  const [feedMorning, setFeedMorning] = useState(false)
  const [feedEvening, setFeedEvening] = useState(false)
  const [walkMorning, setWalkMorning] = useState(false)
  const [walkEvening, setWalkEvening] = useState(false)
  const [hygieneCleared, setHygieneCleared] = useState(false)
  const [boardingTemp, setBoardingTemp] = useState('38.5')
  const [boardingOwnerNote, setBoardingOwnerNote] = useState('')
  const [boardingPhotoIdx, setBoardingPhotoIdx] = useState<number | null>(null)

  if (!booking) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3">🔍</div>
        <h2 className="text-lg font-semibold text-gray-700">Không tìm thấy booking</h2>
        <Link to="/petcare" className="btn-secondary mt-4 inline-flex">← Quay lại</Link>
      </div>
    )
  }

  const activeBooking = booking!

  function handleSave() {
    // Save standard note
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const updatedBookings = BOOKING_MOCK_LIST.map(b => {
      if (b.id === activeBooking.id) {
        return {
          ...b,
          serviceNote: note,
          statusHistory: [
            ...(b.statusHistory || []),
            { status: b.status, changedBy: 'Kỹ thuật viên', changedAt: nowStr, note: 'Lưu ghi chú dịch vụ' }
          ]
        }
      }
      return b
    })
    saveBookings(updatedBookings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleAddBoardingLog(e: React.FormEvent) {
    e.preventDefault()
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const newLog = {
      date: new Date().toLocaleDateString('vi-VN'),
      feedMorning,
      feedEvening,
      walkMorning,
      walkEvening,
      hygieneCleared,
      temperature: boardingTemp,
      ownerUpdateText: boardingOwnerNote || 'Bé ăn ngủ tốt, tinh thần vui tươi hoạt bát.',
      photoUrl: boardingPhotoIdx !== null ? BOARDING_PHOTOS[boardingPhotoIdx] : undefined,
      updatedAt: nowStr
    }

    const updatedLogs = [...boardingLogs, newLog]
    setBoardingLogs(updatedLogs)

    // Save in bookings list
    const updatedBookings = BOOKING_MOCK_LIST.map(b => {
      if (b.id === activeBooking.id) {
        return {
          ...b,
          boardingLogs: updatedLogs,
          statusHistory: [
            ...(b.statusHistory || []),
            { status: b.status, changedBy: 'Kỹ thuật viên', changedAt: nowStr, note: `Cập nhật nhật ký lưu trú ngày ${newLog.date}` }
          ]
        }
      }
      return b
    })

    saveBookings(updatedBookings)

    // Reset current day form
    setFeedMorning(false)
    setFeedEvening(false)
    setWalkMorning(false)
    setWalkEvening(false)
    setHygieneCleared(false)
    setBoardingTemp('38.5')
    setBoardingOwnerNote('')
    setBoardingPhotoIdx(null)

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const isBoarding = booking.serviceName.toLowerCase().includes('nội trú') || booking.serviceName.toLowerCase().includes('boarding') || booking.serviceName.toLowerCase().includes('khách sạn')

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

      {/* Boarding Logs Form for Technicians */}
      {isBoarding && ['checked_in', 'in_progress', 'completed', 'paid'].includes(status) && (
        <div className="card p-5 space-y-4 bg-indigo-50/30 border border-indigo-200 rounded-2xl">
          <div className="border-b border-indigo-150/30 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-black text-indigo-900 flex items-center gap-1.5">
              🏨 Nhật ký Chăm sóc Nội trú Hàng ngày (KTV)
            </h3>
            <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Boarding Care Active
            </span>
          </div>

          {/* Diet and Nutrition Profile Card */}
          {activeBooking.boardingDiet && (
            <div className="bg-white p-3.5 rounded-2xl border border-indigo-100/50 text-xs space-y-1.5 shadow-sm">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider block">🍽️ Chỉ định Dinh dưỡng & Ăn uống của bé:</span>
              <div className="space-y-1 text-gray-700 font-semibold">
                <div>• Thức ăn: <span className="font-extrabold text-gray-900">{activeBooking.boardingDiet.foodType}</span></div>
                <div className="grid grid-cols-2 gap-1 text-[11px] bg-gray-50 p-2 rounded-lg mt-1 border border-gray-100">
                  <div>• Số bữa: <span className="font-extrabold text-gray-900">{activeBooking.boardingDiet.feedTimes} bữa/ngày</span></div>
                  <div>• Định lượng: <span className="font-extrabold text-gray-900">{activeBooking.boardingDiet.portionWeight}g/bữa</span></div>
                  <div className="col-span-2">• Nước: <span className="font-extrabold text-gray-900">{activeBooking.boardingDiet.waterFrequency}</span></div>
                </div>
                {activeBooking.boardingDiet.allergies && (
                  <div className="text-rose-700 bg-rose-50/70 p-2 rounded-lg border border-rose-100 text-[10px] flex items-center gap-1 mt-1.5">
                    ⚠️ <strong>Lưu ý quan trọng:</strong> {activeBooking.boardingDiet.allergies}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Previous Logs */}
          {boardingLogs.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Lịch sử chăm sóc các ngày trước:</span>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-white">
                {boardingLogs.map((log: any, idx: number) => (
                  <div key={idx} className="text-[10px] text-gray-600 border-b last:border-0 pb-1.5 mb-1.5 last:pb-0 last:mb-0 leading-normal">
                    <div className="flex justify-between font-bold text-indigo-900">
                      <span>Ngày {idx + 1}: {log.date}</span>
                      <span className="font-mono text-gray-400">{log.updatedAt}</span>
                    </div>
                    <div className="font-semibold text-gray-700 mt-0.5">Thân nhiệt: {log.temperature}°C · {log.feedMorning ? 'Ăn sáng ✓' : 'Ăn sáng ×'} · {log.feedEvening ? 'Ăn chiều ✓' : 'Ăn chiều ×'}</div>
                    <div className="italic text-gray-500 font-semibold bg-gray-50 p-1.5 rounded-lg border border-gray-100 mt-1">"{log.ownerUpdateText}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Log Today Form */}
          <form onSubmit={handleAddBoardingLog} className="space-y-3.5 pt-3 border-t border-indigo-100/50">
            <span className="text-[10px] font-black text-indigo-950 uppercase tracking-wider block">Ghi nhận hoạt động hôm nay</span>
            
            <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-indigo-50 shadow-sm">
              <label className="flex items-center gap-2 font-bold text-gray-700 select-none cursor-pointer">
                <input type="checkbox" checked={feedMorning} onChange={e => setFeedMorning(e.target.checked)} className="rounded border-gray-300 text-indigo-650 focus:ring-indigo-500 w-4 h-4" />
                <span>Cho ăn sáng (150g)</span>
              </label>
              <label className="flex items-center gap-2 font-bold text-gray-700 select-none cursor-pointer">
                <input type="checkbox" checked={feedEvening} onChange={e => setFeedEvening(e.target.checked)} className="rounded border-gray-300 text-indigo-650 focus:ring-indigo-500 w-4 h-4" />
                <span>Cho ăn chiều (150g)</span>
              </label>
              <label className="flex items-center gap-2 font-bold text-gray-700 select-none cursor-pointer">
                <input type="checkbox" checked={walkMorning} onChange={e => setWalkMorning(e.target.checked)} className="rounded border-gray-300 text-indigo-650 focus:ring-indigo-500 w-4 h-4" />
                <span>Đi dạo sáng</span>
              </label>
              <label className="flex items-center gap-2 font-bold text-gray-700 select-none cursor-pointer">
                <input type="checkbox" checked={walkEvening} onChange={e => setWalkEvening(e.target.checked)} className="rounded border-gray-300 text-indigo-650 focus:ring-indigo-500 w-4 h-4" />
                <span>Đi dạo chiều</span>
              </label>
              <label className="flex items-center gap-2 font-bold text-gray-700 select-none cursor-pointer col-span-2">
                <input type="checkbox" checked={hygieneCleared} onChange={e => setHygieneCleared(e.target.checked)} className="rounded border-gray-300 text-indigo-650 focus:ring-indigo-500 w-4 h-4" />
                <span>Khử trùng & Dọn vệ sinh Suite</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wide">Thân nhiệt (°C)</label>
                <input type="text" value={boardingTemp} onChange={e => setBoardingTemp(e.target.value)} className="form-input text-xs py-1.5" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wide">Nhắn chủ nuôi</label>
                <input type="text" value={boardingOwnerNote} onChange={e => setBoardingOwnerNote(e.target.value)} placeholder="Luna hôm nay ăn ngoan..." className="form-input text-xs py-1.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wide block">Gửi kèm ảnh chụp hôm nay</label>
              <div className="flex gap-2">
                {BOARDING_PHOTOS.map((url, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => setBoardingPhotoIdx(idx)}
                    className={`w-16 h-12 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
                      boardingPhotoIdx === idx ? 'border-indigo-600 scale-105 shadow shadow-indigo-100' : 'border-gray-250'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-2.5 text-xs font-black justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md flex items-center gap-1.5">
              <CheckCircle size={13} /> Lưu & Báo cáo nhật ký lưu trú
            </button>
          </form>
        </div>
      )}

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
