import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, AlertTriangle, CheckCircle, Calendar, Clock, 
  DollarSign, MapPin, User, ClipboardList, Info, Sparkles
} from 'lucide-react'
import { BOOKING_MOCK_LIST, saveBookings, STATUS_LABELS } from '@/data/bookingMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { USER_MOCK_LIST } from '@/data/userMockData'
import { SERVICE_MOCK_LIST } from '@/data/serviceMockData'
import { PET_MOCK_LIST } from '@/data/petMockData'
import { formatPrice } from '@/utils/format'
import type { Booking, BookingStatus } from '@/types'

export default function BookingFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id

  // Customer selection modes: 'existing' | 'manual'
  const [customerMode, setCustomerMode] = useState<'existing' | 'manual'>('existing')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  // Pet selection modes: 'existing' | 'manual'
  const [petMode, setPetMode] = useState<'existing' | 'manual'>('existing')
  const [selectedPetId, setSelectedPetId] = useState('')
  const [petName, setPetName] = useState('')
  const [petBreed, setPetBreed] = useState('')

  // Core Booking details
  const [serviceId, setServiceId] = useState('')
  const [shopId, setShopId] = useState('SH01')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [price, setPrice] = useState<number>(0)
  const [duration, setDuration] = useState<number>(30)
  const [status, setStatus] = useState<BookingStatus>('pending')
  const [note, setNote] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Get active customers list for selection
  const customers = USER_MOCK_LIST.filter(u => u.role === 'customer' && u.status === 'active')

  // Get pets owned by the selected customer
  const customerPets = PET_MOCK_LIST.filter(p => p.ownerId === selectedCustomerId)

  // Load existing booking details for Edit Mode
  useEffect(() => {
    if (isEditMode && id) {
      const b = BOOKING_MOCK_LIST.find(x => x.id === id)
      if (b) {
        // Check if customer exists in user list
        const customerExists = USER_MOCK_LIST.some(u => u.id === b.customerId)
        if (customerExists) {
          setCustomerMode('existing')
          setSelectedCustomerId(b.customerId)
        } else {
          setCustomerMode('manual')
          setCustomerName(b.customerName)
          setCustomerPhone(b.customerPhone)
        }

        // Check if pet exists in pet list
        const petExists = PET_MOCK_LIST.some(p => p.id === b.petId)
        if (petExists) {
          setPetMode('existing')
          setSelectedPetId(b.petId)
        } else {
          setPetMode('manual')
          setPetName(b.petName)
          setPetBreed(b.petBreed)
        }

        setServiceId(b.serviceId)
        setShopId(b.shopId)
        setDate(b.date)
        setStartTime(b.startTime)
        setPrice(b.price)
        setDuration(b.duration)
        setStatus(b.status)
        setNote(b.note || '')
      } else {
        setErrorMsg('Không tìm thấy mã đặt lịch yêu cầu!')
      }
    } else {
      // Default initial date is tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setDate(tomorrow.toISOString().split('T')[0])
    }
  }, [isEditMode, id])

  // React to customer change to automatically preset details or auto-filter pets
  useEffect(() => {
    if (customerMode === 'existing' && selectedCustomerId) {
      const cust = USER_MOCK_LIST.find(u => u.id === selectedCustomerId)
      if (cust) {
        setCustomerName(cust.fullName)
        setCustomerPhone(cust.phone)
      }
      // If customer has registered pets, select the first one by default, otherwise set petMode to manual
      const pets = PET_MOCK_LIST.filter(p => p.ownerId === selectedCustomerId)
      if (pets.length > 0) {
        setPetMode('existing')
        setSelectedPetId(pets[0].id)
      } else {
        setPetMode('manual')
        setSelectedPetId('')
      }
    }
  }, [selectedCustomerId, customerMode])

  // React to pet change to grab pet details
  useEffect(() => {
    if (petMode === 'existing' && selectedPetId) {
      const pet = PET_MOCK_LIST.find(p => p.id === selectedPetId)
      if (pet) {
        setPetName(pet.name)
        setPetBreed(pet.breed)
      }
    }
  }, [selectedPetId, petMode])

  // React to service selection to auto-fill base price and duration
  const handleServiceChange = (id: string) => {
    setServiceId(id)
    const svc = SERVICE_MOCK_LIST.find(s => s.id === id)
    if (svc) {
      setPrice(svc.price)
      setDuration(svc.duration)
    }
  }

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (customerMode === 'existing' && !selectedCustomerId) {
      setErrorMsg('Vui lòng chọn một khách hàng có sẵn!')
      return
    }
    if (customerMode === 'manual' && (!customerName.trim() || !customerPhone.trim())) {
      setErrorMsg('Vui lòng nhập đầy đủ họ tên và SĐT của khách hàng!')
      return
    }
    if (petMode === 'existing' && !selectedPetId) {
      setErrorMsg('Vui lòng chọn một thú cưng đã đăng ký!')
      return
    }
    if (petMode === 'manual' && !petName.trim()) {
      setErrorMsg('Vui lòng nhập tên của thú cưng!')
      return
    }
    if (!serviceId) {
      setErrorMsg('Vui lòng lựa chọn gói dịch vụ đăng ký!')
      return
    }
    if (!date) {
      setErrorMsg('Vui lòng chọn ngày thực hiện đặt hẹn!')
      return
    }

    const selectedService = SERVICE_MOCK_LIST.find(s => s.id === serviceId)
    const serviceName = selectedService ? selectedService.name : 'Dịch vụ'

    // Compute end time based on start time and duration
    const [startHour, startMin] = startTime.split(':').map(Number)
    const totalMinutes = startHour * 60 + startMin + duration
    const endHour = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
    const endMin = (totalMinutes % 60).toString().padStart(2, '0')
    const endTime = `${endHour}:${endMin}`

    const finalBooking: Booking = {
      id: id || `BK-0${Date.now().toString().slice(-4)}`,
      customerId: customerMode === 'existing' ? selectedCustomerId : `CUST-${Date.now().toString().slice(-3)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      petId: petMode === 'existing' ? selectedPetId : `PET-${Date.now().toString().slice(-3)}`,
      petName: petName.trim(),
      petBreed: petBreed.trim() || 'Hỗn chủng (Mixed)',
      serviceId,
      serviceName,
      shopId,
      date,
      startTime,
      endTime,
      duration,
      price,
      status,
      note: note.trim(),
      createdAt: isEditMode
        ? BOOKING_MOCK_LIST.find(b => b.id === id)?.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 16)
        : new Date().toISOString().replace('T', ' ').slice(0, 16),
      statusHistory: isEditMode
        ? BOOKING_MOCK_LIST.find(b => b.id === id)?.statusHistory || []
        : [{ status: 'pending', changedBy: 'Admin PetCare', changedAt: new Date().toISOString().replace('T', ' ').slice(0, 16), note: 'Tạo mới từ trang Admin' }]
    }

    let nextList = [...BOOKING_MOCK_LIST]
    if (isEditMode) {
      nextList = nextList.map(b => b.id === id ? finalBooking : b)
    } else {
      nextList.push(finalBooking)
    }

    saveBookings(nextList)

    setToastMsg(isEditMode ? 'Cập nhật lịch đặt chỗ thành công!' : 'Tạo mới lịch đặt chỗ thành công!')
    setErrorMsg('')
    setTimeout(() => {
      setToastMsg('')
      navigate('/admin/bookings')
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn text-sm">
      {/* Floating success Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800 animate-bounce">
          <CheckCircle size={20} className="text-emerald-400 shrink-0" />
          <span className="font-semibold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Floating error alert */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
          <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Lỗi nhập liệu:</span> {errorMsg}
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-700 font-extrabold text-lg px-1">×</button>
        </div>
      )}

      {/* Breadcrumb Header Bar */}
      <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl border border-gray-100 p-4 rounded-3xl shadow-sm">
        <button
          onClick={() => navigate('/admin/bookings')}
          className="p-3 border border-gray-200 bg-white hover:bg-gray-50 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider select-none">
            <span>Admin</span>
            <span>/</span>
            <span className="text-indigo-600">{isEditMode ? 'Chỉnh sửa đặt lịch' : 'Tạo mới'}</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">
            {isEditMode ? `Cấu hình Booking: ${id}` : 'Tạo Lịch Đặt Mới'}
          </h1>
        </div>
      </div>

      {/* Form Submission */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Forms (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Customer Profile details */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <User size={18} className="text-indigo-500" />
              Thông tin Chủ nuôi / Khách đặt hàng
            </h3>

            {/* Selector mode toggler */}
            {!isEditMode && (
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-max">
                <button
                  type="button"
                  onClick={() => setCustomerMode('existing')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    customerMode === 'existing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Chọn khách có sẵn
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('manual')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    customerMode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Nhập khách vãng lai
                </button>
              </div>
            )}

            {customerMode === 'existing' ? (
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Lọc chọn Khách hàng <span className="text-rose-500">*</span></label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  disabled={isEditMode}
                  className="w-full text-sm px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white font-semibold"
                >
                  <option value="">-- Chọn khách hàng thành viên --</option>
                  {customers.map(cust => (
                    <option key={cust.id} value={cust.id}>
                      {cust.fullName} ({cust.phone}) – {cust.email}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-600">Họ và tên khách <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn A..."
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-gray-50/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-600">Số điện thoại <span className="text-rose-500">*</span></label>
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0901234567..."
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-gray-50/50 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Pet profile details */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              🐾 Thông tin thú cưng chăm sóc
            </h3>

            {/* Mode selection toggler for Pet */}
            {!isEditMode && customerMode === 'existing' && (
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-max">
                <button
                  type="button"
                  onClick={() => setPetMode('existing')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    petMode === 'existing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Chọn thú cưng có sẵn
                </button>
                <button
                  type="button"
                  onClick={() => setPetMode('manual')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    petMode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Nhập nhanh thú cưng mới
                </button>
              </div>
            )}

            {petMode === 'existing' && customerMode === 'existing' ? (
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Chọn thú cưng của khách <span className="text-rose-500">*</span></label>
                <select
                  value={selectedPetId}
                  onChange={e => setSelectedPetId(e.target.value)}
                  disabled={isEditMode}
                  className="w-full text-sm px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white font-semibold"
                >
                  <option value="">-- Chọn vật nuôi --</option>
                  {customerPets.map(pet => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.breed}) – Cân nặng: {pet.weight}kg
                    </option>
                  ))}
                  {customerPets.length === 0 && (
                    <option value="" disabled>Khách hàng này chưa có thú cưng đăng ký!</option>
                  )}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-600">Tên của thú cưng <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Milo, Lu..."
                    value={petName}
                    onChange={e => setPetName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-gray-50/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-600">Chủng loại giống (Breed)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Poodle, Golden, Mèo Anh lông ngắn..."
                    value={petBreed}
                    onChange={e => setPetBreed(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-gray-50/50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Date, Time & Service select */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <ClipboardList size={18} className="text-indigo-500" />
              Chi tiết lịch hẹn & Dịch vụ đăng ký
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Service Select box */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Lựa chọn gói dịch vụ <span className="text-rose-500">*</span></label>
                <select
                  value={serviceId}
                  onChange={e => handleServiceChange(e.target.value)}
                  className="w-full text-sm px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white font-semibold"
                >
                  <option value="">-- Lựa chọn dịch vụ --</option>
                  {SERVICE_MOCK_LIST.map(svc => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} – Giá gốc từ: {formatPrice(svc.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Applied Shop select box */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Chi nhánh tiếp nhận <span className="text-rose-500">*</span></label>
                <select
                  value={shopId}
                  onChange={e => setShopId(e.target.value)}
                  className="w-full text-sm px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white font-semibold"
                >
                  {SHOP_MOCK_LIST.map(shop => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Appointment Date */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Ngày làm dịch vụ <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-gray-50/50 font-bold"
                  />
                </div>
              </div>

              {/* Appointment time */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Giờ đặt bắt đầu <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white font-mono font-bold"
                  >
                    {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Card 4: Price & duration overrides */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              ⚙️ Giá bán lẻ & Thời gian dự kiến
            </h3>

            {/* Editable price */}
            <div className="space-y-2">
              <label className="block font-bold text-gray-600">Tổng thanh toán (VND)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                <input
                  type="number"
                  required
                  min={0}
                  step={10000}
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none font-mono font-bold text-indigo-700 bg-gray-50/50"
                />
              </div>
            </div>

            {/* Editable duration */}
            <div className="space-y-2">
              <label className="block font-bold text-gray-600">Thời lượng (Phút)</label>
              <input
                type="number"
                required
                min={5}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none font-mono font-bold text-gray-800 bg-gray-50/50"
              />
            </div>

            {/* Edit Booking Status */}
            <div className="space-y-2">
              <label className="block font-bold text-gray-600">Trạng thái Booking</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as BookingStatus)}
                className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-2xl focus:outline-none bg-white font-semibold text-gray-700"
              >
                {Object.entries(STATUS_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Card 5: Booking Memo note & Submit buttons */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="block font-bold text-gray-600">Ghi chú của khách hàng</label>
              <textarea
                rows={3}
                placeholder="Nhập ghi chú yêu cầu riêng (Ví dụ: bé sợ tiếng ồn lớn, sấy nhẹ lông)..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-gray-200 rounded-2xl focus:outline-none bg-gray-50/30 resize-none leading-relaxed"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 flex gap-2 items-start">
              <Sparkles size={16} className="text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[11px] text-gray-500 leading-normal">
                Giá dịch vụ sẽ tự động tính toán từ giá cơ sở ban đầu của gói đã chọn. Bạn có thể ghi đè trực tiếp giá bán ở khung bên trên nếu có chiết khấu thủ công.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                🚀 {isEditMode ? 'Lưu cập nhật' : 'Tạo lịch hẹn ngay'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/bookings')}
                className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm rounded-2xl transition-all cursor-pointer animate-pulse-subtle"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
