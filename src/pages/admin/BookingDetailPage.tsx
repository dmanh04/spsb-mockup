import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, AlertTriangle, CheckCircle, Clock, Calendar, 
  MapPin, User, Scissors, Home, Award, DollarSign, Image as ImageIcon, 
  Plus, Edit, Eye, ShieldAlert, ArrowRight, ClipboardList, Receipt
} from 'lucide-react'
import { BOOKING_MOCK_LIST, saveBookings, STATUS_LABELS, STATUS_BG } from '@/data/bookingMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { USER_MOCK_LIST } from '@/data/userMockData'
import { ROOM_MOCK_LIST } from '@/data/roomMockData'
import { formatPrice } from '@/utils/format'
import type { Booking, BookingStatus, BookingStatusHistory } from '@/types'

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  
  // Edit & Assign States
  const [assignedStaffId, setAssignedStaffId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [note, setNote] = useState('')
  const [serviceNote, setServiceNote] = useState('')
  const [checkinNote, setCheckinNote] = useState('')
  const [beforePhotoUrl, setBeforePhotoUrl] = useState('')
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('')
  
  // Transition Workflow States
  const [transitionStatus, setTransitionStatus] = useState<BookingStatus | null>(null)
  const [transitionNote, setTransitionNote] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Load booking details
  useEffect(() => {
    if (id) {
      const b = BOOKING_MOCK_LIST.find(x => x.id === id)
      if (b) {
        setBooking(b)
        setAssignedStaffId(b.assignedStaffId || '')
        setRoomId(b.roomId || '')
        setNote(b.note || '')
        setServiceNote(b.serviceNote || '')
        setCheckinNote(b.checkinNote || '')
        setBeforePhotoUrl(b.beforePhotoUrl || '')
        setAfterPhotoUrl(b.afterPhotoUrl || '')
      } else {
        setErrorMsg('Không tìm thấy mã Booking yêu cầu!')
      }
    }
  }, [id])

  if (!booking) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 text-center py-20">
        <div className="inline-flex p-4 rounded-full bg-red-50 text-red-500 mb-4 border border-red-100">
          <ShieldAlert size={36} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Lỗi nạp dữ liệu</h2>
        <p className="text-gray-500 mt-1">{errorMsg || 'Đang tải dữ liệu...'}</p>
        <button onClick={() => navigate('/admin/bookings')} className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
          Quay lại danh sách
        </button>
      </div>
    )
  }

  // Get staff matching this shop
  const petCareStaffOptions = USER_MOCK_LIST.filter(
    u => u.role === 'petcare_staff' && u.shopId === booking.shopId && u.status === 'active'
  )

  // Get rooms matching this shop
  const roomOptions = ROOM_MOCK_LIST.filter(
    r => r.shopId === booking.shopId && r.status !== 'inactive'
  )

  const shopName = SHOP_MOCK_LIST.find(s => s.id === booking.shopId)?.name || 'Chi nhánh'

  // Determine next possible workflow transitions
  const getWorkflowActions = (status: BookingStatus): { next: BookingStatus; label: string; color: string }[] => {
    switch (status) {
      case 'pending':
        return [
          { next: 'confirmed', label: 'Xác nhận đặt lịch', color: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100' },
          { next: 'cancelled', label: 'Hủy lịch đặt', color: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' }
        ]
      case 'confirmed':
        return [
          { next: 'checked_in', label: 'Check-in thú cưng', color: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100' },
          { next: 'no_show', label: 'Không đến (No Show)', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200' },
          { next: 'cancelled', label: 'Hủy đặt chỗ', color: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' }
        ]
      case 'checked_in':
        return [
          { next: 'in_progress', label: 'Bắt đầu làm dịch vụ', color: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-100' }
        ]
      case 'in_progress':
        return [
          { next: 'completed', label: 'Hoàn thành dịch vụ', color: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100' }
        ]
      case 'completed':
        return [
          { next: 'paid', label: 'Thanh toán & Đóng đơn', color: 'bg-gray-900 hover:bg-gray-800 text-white shadow-gray-200' }
        ]
      default:
        return [] // terminal states: paid, cancelled, no_show
    }
  }

  // Handle Resource Assignment (Staff & Room)
  const handleAssignResources = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedStaff = USER_MOCK_LIST.find(u => u.id === assignedStaffId)
    const selectedRoom = ROOM_MOCK_LIST.find(r => r.id === roomId)

    const updatedBooking: Booking = {
      ...booking,
      assignedStaffId: assignedStaffId || undefined,
      assignedStaffName: selectedStaff ? selectedStaff.fullName : undefined,
      roomId: roomId || undefined,
      roomName: selectedRoom ? selectedRoom.name : undefined,
      note: note.trim(),
      serviceNote: serviceNote.trim(),
      checkinNote: checkinNote.trim(),
      beforePhotoUrl: beforePhotoUrl.trim() || undefined,
      afterPhotoUrl: afterPhotoUrl.trim() || undefined,
    }

    // If staff/room changed, let's write a log
    const changed = booking.assignedStaffId !== assignedStaffId || booking.roomId !== roomId
    if (changed) {
      const logMsg = `Đã phân phối: Nhân viên (${selectedStaff ? selectedStaff.fullName : 'Chưa gán'}) - Phòng (${selectedRoom ? selectedRoom.name : 'Chưa gán'})`
      const newHistory: BookingStatusHistory = {
        status: booking.status,
        changedBy: 'Admin PetCare',
        changedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        note: logMsg
      }
      updatedBooking.statusHistory = [...booking.statusHistory, newHistory]
    }

    const nextList = BOOKING_MOCK_LIST.map(b => b.id === booking.id ? updatedBooking : b)
    saveBookings(nextList)
    setBooking(updatedBooking)

    setToastMsg('Cập nhật phân bổ và ghi chú thành công!')
    setTimeout(() => setToastMsg(''), 1500)
  }

  // Handle Workflow Status Transition
  const handleTransition = () => {
    if (!transitionStatus) return

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16)
    
    // Create new log entry
    const newHistory: BookingStatusHistory = {
      status: transitionStatus,
      changedBy: 'Admin PetCare',
      changedAt: nowStr,
      note: transitionNote.trim() || undefined
    }

    const updatedBooking: Booking = {
      ...booking,
      status: transitionStatus,
      statusHistory: [...booking.statusHistory, newHistory],
      // auto generate invoice if paid
      invoiceId: transitionStatus === 'paid' && !booking.invoiceId ? `INV-0${Date.now().toString().slice(-4)}` : booking.invoiceId
    }

    // auto populate mock photos depending on states to make mockup look stunning
    if (transitionStatus === 'checked_in' && !updatedBooking.beforePhotoUrl) {
      updatedBooking.beforePhotoUrl = 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500'
      setBeforePhotoUrl(updatedBooking.beforePhotoUrl)
    }
    if (transitionStatus === 'completed' && !updatedBooking.afterPhotoUrl) {
      updatedBooking.afterPhotoUrl = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500'
      setAfterPhotoUrl(updatedBooking.afterPhotoUrl)
    }

    const nextList = BOOKING_MOCK_LIST.map(b => b.id === booking.id ? updatedBooking : b)
    saveBookings(nextList)
    setBooking(updatedBooking)

    setToastMsg(`Chuyển trạng thái sang "${STATUS_LABELS[transitionStatus]}" thành công!`)
    setTransitionStatus(null)
    setTransitionNote('')
    setTimeout(() => setToastMsg(''), 1500)
  }

  const actions = getWorkflowActions(booking.status)
  const isTerminalState = ['paid', 'cancelled', 'no_show'].includes(booking.status)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn text-sm">
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800 animate-bounce">
          <CheckCircle size={20} className="text-emerald-400 shrink-0" />
          <span className="font-semibold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Header section with Glassmorphic breadcrumb */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-100 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/bookings')}
            className="p-3 border border-gray-200 bg-white hover:bg-gray-50 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider select-none">
              <span>Quản lý Booking</span>
              <span>/</span>
              <span className="text-indigo-600">Xem chi tiết & Điều phối</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mt-1 flex items-center gap-3">
              {booking.id}
              <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${STATUS_BG[booking.status]}`}>
                {STATUS_LABELS[booking.status]}
              </span>
            </h1>
          </div>
        </div>

        {/* Edit Button */}
        <div>
          <button
            onClick={() => navigate(`/admin/bookings/${booking.id}/edit`)}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-2xl font-semibold shadow-sm transition-all"
          >
            <Edit size={16} /> Chỉnh sửa lịch
          </button>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Workflow Actions - Transition Box */}
          {!isTerminalState && (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-indigo-900 flex items-center gap-2">
                <ClipboardList size={18} className="text-indigo-600 animate-pulse" />
                Xử lý & Chuyển trạng thái quy trình
              </h3>
              <p className="text-xs text-gray-400">
                Lựa chọn bước chuyển tiếp theo trong vòng đời dịch vụ của thú cưng:
              </p>

              {transitionStatus === null ? (
                <div className="flex flex-wrap gap-3 pt-2">
                  {actions.map(act => (
                    <button
                      key={act.next}
                      type="button"
                      onClick={() => setTransitionStatus(act.next)}
                      className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 shadow-md ${act.color}`}
                    >
                      {act.label} <ArrowRight size={14} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/20 space-y-4 animate-slideIn">
                  <div className="flex items-center justify-between border-b border-indigo-50 pb-2">
                    <span className="font-extrabold text-indigo-950 text-sm">
                      📝 Xác nhận đổi trạng thái sang: <span className="underline">{STATUS_LABELS[transitionStatus]}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => { setTransitionStatus(null); setTransitionNote(''); }}
                      className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      Hủy bỏ
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-indigo-900">Ghi chú lý do chuyển đổi (Tùy chọn)</label>
                    <textarea
                      rows={2}
                      placeholder="Nhập ghi chú chi tiết (Ví dụ: Khách thanh toán thành công, vật nuôi khoẻ mạnh)..."
                      value={transitionNote}
                      onChange={e => setTransitionNote(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => { setTransitionStatus(null); setTransitionNote(''); }}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 active:scale-95 transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleTransition}
                      className="px-4 py-2 bg-indigo-600 text-white font-extrabold rounded-xl text-xs hover:bg-indigo-700 shadow-md shadow-indigo-100 active:scale-95 transition-all"
                    >
                      Xác nhận lưu
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isTerminalState && (
            <div className="bg-emerald-50/60 border border-emerald-100 p-5 rounded-3xl shadow-sm flex items-start gap-4">
              <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 shrink-0">
                <CheckCircle size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-extrabold text-emerald-900">Booking đã được đóng đơn hàng</h3>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed font-medium">
                  Lịch hẹn này đã đạt tới trạng thái cuối cùng (**{STATUS_LABELS[booking.status]}**). 
                  {booking.invoiceId && ` Số hóa đơn liên quan: ${booking.invoiceId}.`} Cảm ơn bạn đã điều phối chăm sóc!
                </p>
              </div>
            </div>
          )}

          {/* Card 2: Basic Booking Info Overview */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <ClipboardList size={18} className="text-gray-500" />
              Tổng quan đặt lịch dịch vụ
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Date */}
              <div className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <Calendar className="text-gray-400 shrink-0" size={20} />
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Ngày hẹn</span>
                  <span className="text-xs font-bold text-gray-900">{booking.date}</span>
                </div>
              </div>

              {/* Time slot */}
              <div className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <Clock className="text-gray-400 shrink-0" size={20} />
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Giờ thực hiện</span>
                  <span className="text-xs font-bold text-gray-900 font-mono">{booking.startTime} ({booking.duration} phút)</span>
                </div>
              </div>

              {/* Price */}
              <div className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <DollarSign className="text-indigo-500 shrink-0" size={20} />
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Giá trị</span>
                  <span className="text-xs font-black text-indigo-600">{formatPrice(booking.price)}</span>
                </div>
              </div>

              {/* Applied Shop */}
              <div className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <MapPin className="text-gray-400 shrink-0" size={20} />
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Chi nhánh</span>
                  <span className="text-xs font-bold text-gray-900 truncate max-w-[120px] block">{shopName.replace('PetCare ', '')}</span>
                </div>
              </div>
            </div>

            {/* Service & Details */}
            <div className="p-4 bg-indigo-50/20 border border-indigo-100 rounded-3xl space-y-2">
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">Gói dịch vụ đăng ký</span>
              <div className="text-lg font-black text-indigo-950">{booking.serviceName}</div>
              {booking.note && (
                <div className="text-xs text-indigo-850 mt-1 italic">
                  <strong>Khách hàng dặn dò:</strong> "{booking.note}"
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Pet & Customer Profiles */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <User size={18} className="text-gray-500" />
              Thông tin Khách hàng & Thú cưng
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pet Card */}
              <div className="p-4 bg-gray-50/50 border border-gray-200/80 rounded-2xl space-y-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">🐾 Hồ sơ vật nuôi</span>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 border border-indigo-200 flex items-center justify-center font-extrabold text-indigo-600 text-lg">
                    {booking.petName.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-gray-900">{booking.petName}</h4>
                    <p className="text-xs text-gray-500 font-semibold">{booking.petBreed}</p>
                  </div>
                </div>
              </div>

              {/* Customer Card */}
              <div className="p-4 bg-gray-50/50 border border-gray-200/80 rounded-2xl space-y-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">👤 Thông tin chủ nuôi</span>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-teal-100 border border-teal-200 flex items-center justify-center font-extrabold text-teal-600 text-lg">
                    {booking.customerName.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-gray-900">{booking.customerName}</h4>
                    <p className="text-xs text-gray-500 font-bold font-mono">{booking.customerPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Audit status history timeline */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <ClipboardList size={18} className="text-gray-500" />
              Lịch sử vòng đời & Nhật ký thay đổi ({booking.statusHistory.length})
            </h3>

            <div className="relative pl-6 border-l-2 border-indigo-50 space-y-5 ml-3 pt-1">
              {booking.statusHistory.map((hist, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline point */}
                  <div className="absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full border-4 border-white bg-indigo-500 shadow-sm flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BG[hist.status]}`}>
                        {STATUS_LABELS[hist.status]}
                      </span>
                      <span className="text-[11px] font-bold text-gray-500">{hist.changedBy}</span>
                      <span className="text-[10px] text-gray-400 font-semibold font-mono">{hist.changedAt}</span>
                    </div>
                    {hist.note && (
                      <p className="text-xs text-gray-600 font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100 leading-relaxed max-w-2xl mt-1">
                        👉 {hist.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Card 5: Resource Assignment (Staff & Room) Form */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              🎯 Điều phối nhân sự & Phòng
            </h3>

            <form onSubmit={handleAssignResources} className="space-y-4">
              {/* Staff selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600">Giao việc cho Groomer / Chăm sóc</label>
                <select
                  value={assignedStaffId}
                  onChange={e => setAssignedStaffId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 bg-white font-semibold"
                >
                  <option value="">-- Chưa chỉ định --</option>
                  {petCareStaffOptions.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.fullName} ({staff.position})
                    </option>
                  ))}
                </select>
              </div>

              {/* Room selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600">Phòng thực hiện</label>
                <select
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 bg-white font-semibold"
                >
                  <option value="">-- Chưa chỉ định --</option>
                  {roomOptions.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Tải trọng: {r.capacity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Notes */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-gray-600">Ghi chú check-in lễ tân</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lông hơi rối nhẹ, cần chải kĩ..."
                  value={checkinNote}
                  onChange={e => setCheckinNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 bg-gray-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600">Ghi chú kỹ thuật viên chăm sóc</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bé sấy rất ngoan, lông đã xả bóng..."
                  value={serviceNote}
                  onChange={e => setServiceNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 bg-gray-50/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-50 cursor-pointer active:scale-95 transition-all"
              >
                💾 Lưu phân bổ & Ghi chú
              </button>
            </form>
          </div>

          {/* Card 6: Photo documentation */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              📸 Nhật ký hình ảnh làm dịch vụ
            </h3>

            {/* Before photo */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-600">Ảnh khi Check-in (Before)</label>
              <input
                type="text"
                placeholder="Link ảnh (URL)..."
                value={beforePhotoUrl}
                onChange={e => setBeforePhotoUrl(e.target.value)}
                className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none"
              />
              <div className="rounded-2xl overflow-hidden aspect-video border border-gray-100 bg-gray-50 flex items-center justify-center p-1">
                {beforePhotoUrl ? (
                  <img src={beforePhotoUrl} alt="Before" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-[10px] text-gray-400 font-semibold italic">Chưa đăng ảnh Trước dịch vụ</span>
                )}
              </div>
            </div>

            {/* After photo */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-gray-600">Ảnh khi Hoàn thành (After)</label>
              <input
                type="text"
                placeholder="Link ảnh (URL)..."
                value={afterPhotoUrl}
                onChange={e => setAfterPhotoUrl(e.target.value)}
                className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none"
              />
              <div className="rounded-2xl overflow-hidden aspect-video border border-gray-100 bg-gray-50 flex items-center justify-center p-1">
                {afterPhotoUrl ? (
                  <img src={afterPhotoUrl} alt="After" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-[10px] text-gray-400 font-semibold italic">Chưa đăng ảnh Sau dịch vụ</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
