import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Calendar, User, DoorOpen, Clock, ShieldCheck, 
  AlertTriangle, Check, Camera, DollarSign, FileText, ChevronRight,
  AlertCircle, CheckCircle, X
} from 'lucide-react'
import { 
  BOOKING_MOCK_LIST, 
  saveBookings, 
  STATUS_LABELS, 
  STATUS_BG 
} from '@/data/bookingMockData'
import { USER_MOCK_LIST } from '@/data/userMockData'
import { ROOM_MOCK_LIST } from '@/data/roomMockData'
import { SCHEDULE_MOCK_LIST } from '@/data/schedulesMockData'
import { formatPrice } from '@/utils/format'
import type { Booking, BookingStatus } from '@/types'

// Mock premium pet images for checked-in before/after photo logs
const BEFORE_PHOTOS = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=60', // messy puppy
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=60', // fluffy cat
  'https://images.unsplash.com/photo-1537151608828-ea2b117b6281?w=400&auto=format&fit=crop&q=60', // poodle before
]

const AFTER_PHOTOS = [
  'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&auto=format&fit=crop&q=60', // clean poodle
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&auto=format&fit=crop&q=60', // clean cat with tie
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&auto=format&fit=crop&q=60', // clean poodle with bow
]

export default function ShopHeadBookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState(() => BOOKING_MOCK_LIST)
  
  const rawBooking = bookings.find(b => b.id === id)

  // Dispatcher allocator states
  const [assignedStaffId, setAssignedStaffId] = useState(rawBooking?.assignedStaffId ?? '')
  const [roomId, setRoomId] = useState(rawBooking?.roomId ?? '')
  
  // Checkout & Checkin logs
  const [petConditionNote, setPetConditionNote] = useState(rawBooking?.checkinNote ?? '')
  const [checkoutNote, setCheckoutNote] = useState(rawBooking?.checkoutNote ?? '')
  const [beforePhotoIdx, setBeforePhotoIdx] = useState<number | null>(null)
  const [afterPhotoIdx, setAfterPhotoIdx] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'cash' | 'transfer' | 'card'>('momo')

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!rawBooking) {
    return (
      <div className="card p-8 text-center max-w-md mx-auto mt-12 space-y-4">
        <div className="text-4xl">🔍</div>
        <h2 className="text-lg font-bold text-gray-900">Không tìm thấy lịch hẹn</h2>
        <p className="text-sm text-gray-500">Mã lịch hẹn không hợp lệ hoặc đã bị xóa khỏi hệ thống.</p>
        <Link to="/shop-head/bookings" className="btn-secondary justify-center py-2 text-xs font-bold rounded-2xl">
          Quay lại danh sách
        </Link>
      </div>
    )
  }

  const booking = rawBooking!
  const shopId = booking.shopId

  // --- BUSINESS LOGIC Cross-reference checks ---
  // Get active staff working on this booking's date
  const shopStaff = USER_MOCK_LIST.filter(
    u => u.shopId === shopId && (u.role === 'petcare_staff' || u.role === 'operation_staff')
  )

  // Check if a staff member is scheduled to work on this booking's date
  const getStaffScheduleStatus = (staffId: string) => {
    const sched = SCHEDULE_MOCK_LIST.find(s => s.staffId === staffId && s.date === booking.date)
    if (!sched) return 'off_duty'
    return sched.status // 'scheduled' or 'on_leave'
  }

  // Check if staff has another booking clash in the same time frame
  const isStaffClashing = (staffId: string) => {
    if (!staffId) return false
    return bookings.some(
      b => b.id !== booking.id && 
           b.assignedStaffId === staffId && 
           b.date === booking.date && 
           b.startTime === booking.startTime &&
           ['confirmed', 'checked_in', 'in_progress'].includes(b.status)
    )
  }

  // Filter Rooms based on Service Category (recommend Grooming Rooms for cut services, Spa Rooms for spa services)
  const isSpaService = booking.serviceName.toLowerCase().includes('spa')
  const recommendedCategory = isSpaService ? 'RC02' : 'RC01' // RC02 = Spa, RC01 = Grooming
  const shopRooms = ROOM_MOCK_LIST.filter(r => r.shopId === shopId)

  // Handle Dispatch Allocation saving
  function handleSaveDispatch() {
    if (!assignedStaffId || !roomId) {
      setErrorMsg('Vui lòng chọn đầy đủ Kỹ thuật viên và Phòng dịch vụ!')
      return
    }

    const staff = USER_MOCK_LIST.find(u => u.id === assignedStaffId)
    const room = ROOM_MOCK_LIST.find(r => r.id === roomId)

    if (!staff || !room) return

    // Overlap checks
    if (getStaffScheduleStatus(staff.id) === 'off_duty') {
      setErrorMsg(`Nhân viên ${staff.fullName} không có lịch trực ngày ${booking.date}!`)
      return
    }
    if (getStaffScheduleStatus(staff.id) === 'on_leave') {
      setErrorMsg(`Nhân viên ${staff.fullName} nghỉ phép ngày ${booking.date}!`)
      return
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const updatedBookings = bookings.map(b => {
      if (b.id === booking.id) {
        return {
          ...b,
          assignedStaffId: staff.id,
          assignedStaffName: staff.fullName,
          roomId: room.id,
          roomName: room.name,
          statusHistory: [
            ...(b.statusHistory || []),
            { status: b.status, changedBy: 'Shop Head', changedAt: nowStr, note: `Đã phân phối: ${staff.fullName} - ${room.name}` }
          ]
        }
      }
      return b
    })

    setBookings(updatedBookings)
    saveBookings(updatedBookings)
    setSuccessMsg('Đã lưu phân bổ nhân viên và phòng thành công!')
    setErrorMsg('')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // Timeline Transitions
  function handleTransition(targetStatus: BookingStatus, noteText?: string) {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)

    // Business checks
    if (targetStatus === 'confirmed' && (!booking.assignedStaffId || !booking.roomId)) {
      setErrorMsg('Bạn phải phân bổ Kỹ thuật viên & Phòng dịch vụ trước khi Xác nhận lịch hẹn!');
      return
    }

    const updatedBookings = bookings.map(b => {
      if (b.id === booking.id) {
        const history = [...(b.statusHistory || [])]
        history.push({
          status: targetStatus,
          changedBy: 'Shop Head',
          changedAt: nowStr,
          note: noteText || `Đã chuyển sang ${STATUS_LABELS[targetStatus]}`
        })

        const updated: Partial<Booking> = {
          status: targetStatus,
          statusHistory: history,
        }

        // Additional payloads depending on status
        if (targetStatus === 'checked_in') {
          updated.checkinNote = petConditionNote
          if (beforePhotoIdx !== null) {
            updated.beforePhotoUrl = BEFORE_PHOTOS[beforePhotoIdx]
          }
        }
        if (targetStatus === 'completed') {
          updated.checkoutNote = checkoutNote
          if (afterPhotoIdx !== null) {
            updated.afterPhotoUrl = AFTER_PHOTOS[afterPhotoIdx]
          }
        }
        if (targetStatus === 'paid') {
          updated.paymentMethod = paymentMethod
        }

        return { ...b, ...updated } as Booking
      }
      return b
    })

    setBookings(updatedBookings)
    saveBookings(updatedBookings)
    setSuccessMsg(`Đã cập nhật trạng thái lịch hẹn thành ${STATUS_LABELS[targetStatus]}!`)
    setErrorMsg('')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // Helpers to check status sequence
  const currentStep = 
    booking.status === 'pending' ? 1 : 
    booking.status === 'confirmed' ? 2 : 
    booking.status === 'checked_in' ? 3 : 
    booking.status === 'in_progress' ? 4 : 
    booking.status === 'completed' ? 5 : 6 // paid

  return (
    <div className="space-y-6 pb-12 min-h-[calc(100vh-140px)] animate-fadeIn">
      
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/shop-head/bookings')} 
          className="btn-secondary py-1.5 px-3 rounded-2xl flex items-center gap-1 text-xs"
        >
          <ArrowLeft size={13} /> Quay lại danh sách
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold font-mono">ID Lịch hẹn: {booking.id}</span>
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${STATUS_BG[booking.status]}`}>
            {STATUS_LABELS[booking.status]}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="bg-emerald-55 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-2 text-sm font-extrabold animate-pulse-subtle">
          <Check size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-center gap-2 text-sm font-extrabold">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Interactive Workflow Progress Timeline Tracker */}
      <div className="bg-white/80 backdrop-blur-md border border-gray-150 rounded-3xl p-5 shadow-sm">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-4">
          Quy trình Vận hành lịch hẹn
        </span>

        <div className="flex items-center justify-between overflow-x-auto gap-4 py-1 select-none">
          {[
            { step: 1, label: 'Đăng ký', status: 'pending' },
            { step: 2, label: 'Đã xác nhận', status: 'confirmed' },
            { step: 3, label: 'Check-in', status: 'checked_in' },
            { step: 4, label: 'Đang làm', status: 'in_progress' },
            { step: 5, label: 'Hoàn thành', status: 'completed' },
            { step: 6, label: 'Đã thu tiền', status: 'paid' },
          ].map((s, idx, arr) => (
            <React.Fragment key={s.step}>
              <div className="flex items-center gap-2 shrink-0">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black transition-all ${
                  currentStep >= s.step 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-105' 
                    : 'bg-white text-gray-400 border-gray-200'
                }`}>
                  {currentStep > s.step ? <Check size={14} className="stroke-[3]" /> : s.step}
                </div>
                <span className={`text-xs font-bold ${currentStep >= s.step ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <ChevronRight size={14} className={`text-gray-300 shrink-0 ${currentStep > s.step ? 'text-indigo-600' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: PET & CUSTOMER INFO + TICKET DETAILS */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card Info Details */}
          <div className="bg-white/95 rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-1.5">
              🐶 Thông tin thú cưng & Khách hàng
            </h2>

            {/* Pet info */}
            <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center font-black text-indigo-600 shrink-0 text-lg">
                {booking.petName[0]}
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">{booking.petName}</h3>
                <p className="text-xs text-gray-500 font-bold mt-0.5">{booking.petBreed}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">Khách hàng:</span>
                <span className="text-gray-800 font-black">{booking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">Số điện thoại:</span>
                <span className="text-gray-800 font-mono font-bold">{booking.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">Chi nhánh phục vụ:</span>
                <span className="text-gray-800 font-black font-mono">{booking.shopId}</span>
              </div>
            </div>
          </div>

          {/* Service detail ticket */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 font-mono text-8xl font-black select-none pointer-events-none translate-y-6 translate-x-6">
              PET
            </div>
            
            <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest block mb-1">
              Dịch vụ đăng ký
            </span>
            <h3 className="text-lg font-black leading-tight border-b border-white/10 pb-3.5 mb-3.5">
              {booking.serviceName}
            </h3>

            <div className="space-y-2.5 text-xs text-indigo-100">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 opacity-80"><Calendar size={13} /> Ngày hẹn:</span>
                <strong className="font-black text-white">{booking.date}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 opacity-80"><Clock size={13} /> Thời gian:</span>
                <strong className="font-black text-white font-mono">{booking.startTime} ({booking.duration} phút)</strong>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-white/10 text-sm">
                <span className="opacity-95 font-bold">Tổng chi phí thanh toán:</span>
                <strong className="text-lg font-black text-emerald-400">{formatPrice(booking.price)}</strong>
              </div>
            </div>

            {booking.note && (
              <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-3 text-xs leading-relaxed italic text-indigo-200">
                Lưu ý từ khách: "{booking.note}"
              </div>
            )}
          </div>

        </div>

        {/* MIDDLE COLUMN: ACTIVE DISPATCH ALLOCATOR (GROOMER & ROOM ALLOCATION) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dispatcher allocation panel */}
          {booking.status === 'pending' || booking.status === 'confirmed' ? (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-1.5">
                💇‍♂️ Điều phối Kỹ thuật viên & Phòng thực hiện
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Groomer Allocator Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    Kỹ thuật viên phục vụ
                  </label>
                  <select 
                    className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500"
                    value={assignedStaffId}
                    onChange={e => setAssignedStaffId(e.target.value)}
                  >
                    <option value="">-- Chọn kỹ thuật viên --</option>
                    {shopStaff.map(s => {
                      const schedStatus = getStaffScheduleStatus(s.id)
                      const isClashed = isStaffClashing(s.id)
                      
                      let suffix = ''
                      if (schedStatus === 'off_duty') suffix = ' [Nghỉ ca trực]'
                      else if (schedStatus === 'on_leave') suffix = ' [Nghỉ phép]'
                      else if (isClashed) suffix = ' [⚠️ Trùng lịch hẹn khác]'

                      return (
                        <option 
                          key={s.id} 
                          value={s.id}
                          disabled={schedStatus !== 'scheduled'}
                          className={schedStatus !== 'scheduled' ? 'text-gray-300' : isClashed ? 'text-rose-600 font-semibold' : ''}
                        >
                          {s.fullName} ({s.position}){suffix}
                        </option>
                      )
                    })}
                  </select>
                  {assignedStaffId && (() => {
                    const selStaff = shopStaff.find(s => s.id === assignedStaffId)
                    if (!selStaff) return null
                    const isClashed = isStaffClashing(selStaff.id)
                    if (isClashed) {
                      return (
                        <div className="bg-rose-50 border border-rose-150 text-rose-800 rounded-xl p-2.5 text-[10px] font-semibold leading-normal flex items-start gap-1 mt-1.5">
                          <AlertCircle size={12} className="text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                          <span>Kỹ thuật viên này có một lịch hẹn khác cùng thời gian. Vui lòng kiểm tra lại để tránh đè việc!</span>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>

                {/* Room Allocator Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">
                    Phòng dịch vụ gán
                  </label>
                  <select 
                    className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500"
                    value={roomId}
                    onChange={e => setRoomId(e.target.value)}
                  >
                    <option value="">-- Chọn phòng --</option>
                    {shopRooms.map(r => {
                      const isRecommended = r.categoryId === recommendedCategory
                      let suffix = ''
                      if (r.status === 'maintenance') suffix = ' [🛠️ Bảo trì]'
                      else if (r.status === 'occupied') suffix = ' [Đang bận]'
                      else if (isRecommended) suffix = ' [Gợi ý chuyên dụng]'

                      return (
                        <option 
                          key={r.id} 
                          value={r.id}
                          disabled={r.status === 'maintenance'}
                          className={r.status === 'maintenance' ? 'text-gray-300' : isRecommended ? 'text-indigo-600 font-bold' : ''}
                        >
                          {r.name} ({r.categoryName}){suffix}
                        </option>
                      )
                    })}
                  </select>
                  {roomId && (() => {
                    const selRoom = shopRooms.find(r => r.id === roomId)
                    if (selRoom && selRoom.status === 'occupied') {
                      return (
                        <div className="bg-amber-50 border border-amber-150 text-amber-800 rounded-xl p-2.5 text-[10px] font-semibold leading-normal flex items-start gap-1 mt-1.5">
                          <AlertTriangle size={12} className="text-amber-600 shrink-0 mt-0.5" />
                          <span>Phòng này hiện đang bận hoặc có thú cưng khác phục vụ. Có thể xếp chồng nếu thời gian check-in so le.</span>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleSaveDispatch}
                  className="btn-primary py-2 px-4 text-xs font-bold rounded-2xl shadow-md shadow-indigo-100"
                >
                  Lưu & Phân bổ điều phối
                </button>
              </div>
            </div>
          ) : (
            // Read-only allocation info if already in work progress
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Kỹ thuật viên gán ca</span>
                <span className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                  🧑‍⚕️ {booking.assignedStaffName ?? 'Chưa phân phối'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Phòng dịch vụ sử dụng</span>
                <span className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                  🏢 {booking.roomName ?? 'Chưa gán phòng'}
                </span>
              </div>
            </div>
          )}

          {/* Workflow execution action forms */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-1.5">
              ⚡ Bảng điều khiển Quy trình Lịch hẹn
            </h2>

            {/* STEP 1: PENDING -> CONFIRMED */}
            {booking.status === 'pending' && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-500 leading-relaxed">
                  Lịch hẹn mới đăng ký trực tuyến đang chờ Shop Head xem xét duyệt thời gian, gán Kỹ thuật viên (Groomer) và phòng phục vụ thích hợp.
                </p>
                <button 
                  onClick={() => handleTransition('confirmed', 'Đã xác nhận và gán nhân lực phục vụ')}
                  className="w-full btn-primary py-2.5 text-xs font-bold justify-center rounded-2xl shadow-md shadow-indigo-150"
                >
                  Xác nhận lịch hẹn & Gửi thông báo
                </button>
              </div>
            )}

            {/* STEP 2: CONFIRMED -> CHECKED_IN */}
            {booking.status === 'confirmed' && (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs font-medium text-indigo-900 leading-relaxed">
                  📢 Lịch hẹn đã sẵn sàng! Khi chủ mang Pet đến check-in, vui lòng ghi chép tình trạng lâm sàng ban đầu và lưu biên bản ảnh chụp.
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Tình trạng Pet lúc Check-in</label>
                    <input 
                      type="text" 
                      className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500"
                      placeholder="Ví dụ: Lông hơi bết, da bình thường, bé vui vẻ nhút nhát..."
                      value={petConditionNote}
                      onChange={e => setPetConditionNote(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide block">Chọn Ảnh chụp lúc Check-in (Before)</label>
                    <div className="flex gap-2">
                      {BEFORE_PHOTOS.map((url, idx) => (
                        <button 
                          key={idx}
                          type="button"
                          onClick={() => setBeforePhotoIdx(idx)}
                          className={`w-20 h-16 rounded-xl border-2 overflow-hidden transition-all shrink-0 ${
                            beforePhotoIdx === idx ? 'border-indigo-600 scale-105 shadow-md shadow-indigo-200' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleTransition('checked_in', `Check-in thú cưng: "${petConditionNote || 'Bình thường'}"`)}
                  className="w-full btn-primary py-2.5 text-xs font-bold justify-center rounded-2xl flex items-center gap-1 shadow-md shadow-indigo-150"
                >
                  <Camera size={14} /> Hoàn tất Check-in & Chuyển vào hàng chờ
                </button>
              </div>
            )}

            {/* STEP 3: CHECKED_IN -> IN_PROGRESS */}
            {booking.status === 'checked_in' && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-500 leading-relaxed">
                  Thú cưng đã check-in thành công và đang nằm trong phòng chờ sẵn sàng. Bấm bắt đầu để báo cho kỹ thuật viên {booking.assignedStaffName} đưa bé vào thực hiện chăm sóc làm đẹp.
                </p>
                <button 
                  onClick={() => handleTransition('in_progress', `Kỹ thuật viên ${booking.assignedStaffName} bắt đầu thực hiện chăm sóc lông`)}
                  className="w-full btn-primary py-2.5 text-xs font-bold justify-center rounded-2xl shadow-md shadow-indigo-150"
                >
                  Bắt đầu thực hiện chăm sóc (Grooming/Spa)
                </button>
              </div>
            )}

            {/* STEP 4: IN_PROGRESS -> COMPLETED */}
            {booking.status === 'in_progress' && (
              <div className="space-y-4">
                <p className="text-xs font-medium text-gray-500 leading-relaxed">
                  Kỹ thuật viên đang hoàn thiện các khâu làm đẹp cuối cùng. Vui lòng ghi lại biên chép kết quả chăm sóc lông/móng của Pet và bổ sung ảnh sau khi hoàn thành.
                </p>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Nhật ký kết quả hoàn thành</label>
                    <input 
                      type="text" 
                      className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500"
                      placeholder="Ví dụ: Đã cắt tỉa gọn gàng, sấy khô thảo dược mịn thơm..."
                      value={checkoutNote}
                      onChange={e => setCheckoutNote(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide block">Chọn Ảnh chụp hoàn thành (After)</label>
                    <div className="flex gap-2">
                      {AFTER_PHOTOS.map((url, idx) => (
                        <button 
                          key={idx}
                          type="button"
                          onClick={() => setAfterPhotoIdx(idx)}
                          className={`w-20 h-16 rounded-xl border-2 overflow-hidden transition-all shrink-0 ${
                            afterPhotoIdx === idx ? 'border-indigo-600 scale-105 shadow-md shadow-indigo-200' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleTransition('completed', `Hoàn thành chăm sóc: "${checkoutNote || 'Tất cả dịch vụ đã hoàn tất tốt đẹp'}"`)}
                  className="w-full btn-primary py-2.5 text-xs font-bold justify-center rounded-2xl flex items-center gap-1 shadow-md shadow-indigo-150"
                >
                  <CheckCircle size={14} /> Xác nhận hoàn thành làm đẹp
                </button>
              </div>
            )}

            {/* STEP 5: COMPLETED -> PAID */}
            {booking.status === 'completed' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs font-medium text-emerald-800 leading-relaxed">
                  🛒 Làm đẹp đã hoàn tất! Pet đang trong trạng thái thơm tho chờ trả khách. Vui lòng tiến hành thu ngân thanh toán hóa đơn.
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide block">Hình thức thanh toán</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'momo', label: 'MoMo' },
                      { id: 'cash', label: 'Tiền mặt' },
                      { id: 'transfer', label: 'Chuyển khoản' },
                      { id: 'card', label: 'Quẹt thẻ' },
                    ].map(method => (
                      <button 
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          paymentMethod === method.id 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => handleTransition('paid', `Khách hàng hoàn tất thanh toán hóa đơn ${formatPrice(booking.price)} qua ví/cổng ${paymentMethod.toUpperCase()}`)}
                  className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-bold justify-center rounded-2xl flex items-center gap-1 shadow-md shadow-emerald-100"
                >
                  <DollarSign size={14} /> Hoàn tất thanh toán & Xuất hóa đơn
                </button>
              </div>
            )}

            {/* STEP 6: PAID */}
            {booking.status === 'paid' && (
              <div className="bg-emerald-50/50 border border-emerald-250/30 rounded-3xl p-4 text-center space-y-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <ShieldCheck size={20} className="stroke-[2.5]" />
                </div>
                <h3 className="text-sm font-black text-emerald-800">Hóa đơn đã được quyết toán thành công</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
                  Toàn bộ các khâu phục vụ bao gồm check-in, lưu trữ ảnh chụp trước/sau và thanh toán đã hoàn thành. Lịch sử thay đổi được lưu vết vĩnh viễn ở phần Nhật ký Audit bên dưới.
                </p>
                <div className="flex justify-center gap-2 pt-1.5">
                  <button className="btn-secondary py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1 bg-white hover:bg-gray-50">
                    <FileText size={12} /> In hóa đơn VAT
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Before/After Photo log previews if exists */}
          {(booking.beforePhotoUrl || booking.afterPhotoUrl) && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-1.5">
                📸 Nhật ký Biên bản Ảnh chụp làm đẹp của Pet
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {booking.beforePhotoUrl && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Trước làm đẹp (Before)</span>
                    <div className="w-full h-32 rounded-2xl overflow-hidden border border-gray-200">
                      <img src={booking.beforePhotoUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    {booking.checkinNote && <p className="text-xs italic text-gray-500 font-medium">"{booking.checkinNote}"</p>}
                  </div>
                )}
                
                {booking.afterPhotoUrl && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Sau làm đẹp (After)</span>
                    <div className="w-full h-32 rounded-2xl overflow-hidden border border-gray-200">
                      <img src={booking.afterPhotoUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    {booking.checkoutNote && <p className="text-xs italic text-gray-500 font-medium">"{booking.checkoutNote}"</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit Trail History Logs */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-1.5">
              📜 Nhật ký Audit Lịch trình thay đổi
            </h2>

            <div className="relative pl-4 border-l border-gray-200 space-y-5 py-2">
              {booking.statusHistory && booking.statusHistory.map((h, i) => (
                <div key={i} className="relative">
                  {/* Indicator Dot */}
                  <div className="absolute -left-[20.5px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-indigo-600" />
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-900 capitalize">{STATUS_LABELS[h.status] || h.status}</span>
                      <span className="text-[10px] text-gray-400 font-bold font-mono">{h.changedAt}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold mt-0.5">Tác vụ bởi: {h.changedBy}</p>
                    {h.note && (
                      <p className="text-xs bg-gray-50 p-2 border border-gray-100 rounded-xl mt-1.5 text-gray-650 leading-relaxed font-semibold">
                        {h.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
