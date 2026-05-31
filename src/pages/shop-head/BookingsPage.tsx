import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, CalendarCheck, Plus, X, UserPlus, Info, AlertTriangle, ShieldCheck } from 'lucide-react'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_COLORS, saveBookings } from '@/data/bookingMockData'
import { USER_MOCK_LIST } from '@/data/userMockData'
import { ROOM_MOCK_LIST } from '@/data/roomMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'
import type { BookingStatus, Booking } from '@/types'

const ALL_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'checked_in', 'in_progress', 'completed', 'paid', 'cancelled', 'no_show']

const SERVICES = [
  { id: 'SV_BOARDING', name: 'Dịch vụ Khách sạn & Nội trú Thú cưng (Pet Boarding)', price: 750000, isBoarding: true },
  { id: 'SV001', name: 'Cắt tỉa & Tắm cơ bản', price: 150000, isBoarding: false },
  { id: 'SV002', name: 'Spa Premium', price: 380000, isBoarding: false },
  { id: 'SV003', name: 'Tắm & Sấy', price: 100000, isBoarding: false },
  { id: 'SV004', name: 'Cắt móng & Vệ sinh tai', price: 60000, isBoarding: false }
]

export default function ShopHeadBookingsPage() {
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'

  // Reactive state from mutable list
  const [bookingsList, setBookingsList] = useState<Booking[]>(() => BOOKING_MOCK_LIST)
  
  // Filters
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all')
  const [filterDate, setFilterDate] = useState('')

  // Walk-in registration states
  const [showWalkInDrawer, setShowWalkInDrawer] = useState(false)
  const [successAlert, setSuccessAlert] = useState('')

  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [petName, setPetName] = useState('')
  const [petBreed, setPetBreed] = useState('')
  const [serviceId, setServiceId] = useState('SV_BOARDING')
  const [assignedStaffId, setAssignedStaffId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [note, setNote] = useState('')
  const [instantCheckIn, setInstantCheckIn] = useState(true)

  // Boarding Diet walk-in states
  const [dietFoodType, setDietFoodType] = useState('Hạt cá hồi hữu cơ cao cấp Royal Canin')
  const [dietFeedTimes, setDietFeedTimes] = useState(2)
  const [dietPortionWeight, setDietPortionWeight] = useState(150)
  const [dietWaterFrequency, setDietWaterFrequency] = useState('Thay nước lọc RO mỗi 4 tiếng')
  const [dietAllergies, setDietAllergies] = useState('')

  const staffList = USER_MOCK_LIST.filter(u =>
    u.shopId === shopId && (u.role === 'petcare_staff' || u.role === 'operation_staff')
  )

  const roomList = ROOM_MOCK_LIST.filter(r => r.shopId === shopId)

  // Filter suggested rooms based on selected service
  const selectedService = SERVICES.find(s => s.id === serviceId)
  const isSelectedBoarding = selectedService?.isBoarding ?? false
  const suggestedRoomCategory = isSelectedBoarding ? 'RC_BOARDING' : (serviceId === 'SV002' ? 'RC02' : 'RC01')

  const filteredBookings = bookingsList
    .filter(b => b.shopId === shopId)
    .filter(b => filterStatus === 'all' || b.status === filterStatus)
    .filter(b => !filterDate || b.date === filterDate)
    .filter(b =>
      !search ||
      b.petName.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.customerPhone.includes(search)
    )
    .sort((a, b) => b.date.localeCompare(a.date) || a.startTime.localeCompare(b.startTime))

  const stats = {
    total: filteredBookings.length,
    pending: filteredBookings.filter(b => b.status === 'pending').length,
    paid: filteredBookings.filter(b => b.status === 'paid').length,
    revenue: filteredBookings.filter(b => b.status === 'paid').reduce((s, b) => s + b.price, 0),
  }

  function handleCreateWalkIn(e: React.FormEvent) {
    e.preventDefault()

    const service = SERVICES.find(s => s.id === serviceId)
    if (!service) return

    const staff = USER_MOCK_LIST.find(u => u.id === assignedStaffId)
    const room = ROOM_MOCK_LIST.find(r => r.id === roomId)
    
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const newBookingStatus: BookingStatus = instantCheckIn ? 'checked_in' : 'confirmed'

    const newBooking: Booking = {
      id: `BK-WK${Math.floor(100 + Math.random() * 900)}`,
      customerId: `U-WK-${Date.now()}`,
      customerName: custName,
      customerPhone: custPhone,
      petId: `PET-WK-${Date.now()}`,
      petName: petName,
      petBreed: petBreed || 'Chưa rõ',
      serviceId: service.id,
      serviceName: service.name,
      shopId: shopId,
      assignedStaffId: staff?.id,
      assignedStaffName: staff?.fullName,
      roomId: room?.id,
      roomName: room?.name,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      endTime: '18:00',
      duration: service.isBoarding ? 600 : 60,
      price: service.price,
      status: newBookingStatus,
      statusHistory: [
        { status: 'pending', changedBy: 'Lễ tân', changedAt: nowStr, note: 'Khách vãng lai đến quầy đăng ký trực tiếp' },
        { 
          status: newBookingStatus, 
          changedBy: 'Lễ tân', 
          changedAt: nowStr, 
          note: instantCheckIn ? 'Nhận thú cưng, check-in gán chuồng trực tiếp tại quầy' : 'Đã xác nhận gán ca phục vụ' 
        }
      ],
      note: note || '',
      checkinNote: instantCheckIn ? 'Khách tiếp nhận trực tiếp vãng lai, sức khỏe tốt.' : undefined,
      boardingDiet: service.isBoarding ? {
        foodType: dietFoodType,
        feedTimes: Number(dietFeedTimes),
        portionWeight: Number(dietPortionWeight),
        waterFrequency: dietWaterFrequency,
        allergies: dietAllergies || undefined
      } : undefined,
      createdAt: nowStr,
    }

    const updatedBookings = [...bookingsList, newBooking]
    saveBookings(updatedBookings)
    setBookingsList(updatedBookings)

    // Reset Form
    setCustName('')
    setCustPhone('')
    setPetName('')
    setPetBreed('')
    setServiceId('SV_BOARDING')
    setAssignedStaffId('')
    setRoomId('')
    setNote('')
    setInstantCheckIn(true)
    setDietFoodType('Hạt cá hồi hữu cơ cao cấp Royal Canin')
    setDietFeedTimes(2)
    setDietPortionWeight(150)
    setDietWaterFrequency('Thay nước lọc RO mỗi 4 tiếng')
    setDietAllergies('')
    setShowWalkInDrawer(false)

    setSuccessAlert('Đã tiếp nhận khách vãng lai và tạo lịch check-in thành công!')
    setTimeout(() => setSuccessAlert(''), 4000)
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tiếp nhận Lịch hẹn & Vận hành</h1>
          <p className="text-sm text-gray-500">{filteredBookings.length} booking chi nhánh ngày hôm nay</p>
        </div>
        <button
          onClick={() => { setShowWalkInDrawer(true); setSuccessAlert(''); }}
          className="btn-primary py-2 px-4 text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-100 hover:scale-102 transition-transform"
        >
          <Plus size={14} /> Tiếp nhận Khách vãng lai
        </button>
      </div>

      {/* Success Alert */}
      {successAlert && (
        <div className="bg-emerald-50 border border-emerald-250/30 text-emerald-800 rounded-2xl p-4 flex items-center gap-2 text-sm font-extrabold animate-pulse">
          <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
          <span>{successAlert}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng booking lọc', value: stats.total, color: 'text-blue-600' },
          { label: 'Yêu cầu chờ duyệt', value: stats.pending, color: 'text-orange-500' },
          { label: 'Đã hoàn thành thu tiền', value: stats.paid, color: 'text-green-600' },
          { label: 'Doanh thu ngày', value: formatPrice(stats.revenue), color: 'text-indigo-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 rounded-2xl border border-gray-150 shadow-sm bg-white">
            <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 font-bold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* BOOKINGS LIST AREA */}
        <div className="flex-1 space-y-4 w-full">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 bg-white/50 p-3 rounded-2xl border border-gray-150">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="form-input pl-9 text-sm" placeholder="Tìm mã, tên thú cưng, SĐT..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-input w-auto text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value as BookingStatus | 'all')}>
              <option value="all">Tất cả trạng thái</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <input type="date" className="form-input w-auto text-sm" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            {(filterStatus !== 'all' || filterDate || search) && (
              <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterDate('') }} className="btn-secondary text-sm py-2 px-3">Xóa bộ lọc</button>
            )}
          </div>

          {/* Bookings Table List */}
          <div className="card overflow-x-auto rounded-3xl border border-gray-150 shadow-sm bg-white">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider select-none">
                <tr>
                  <th className="px-4 py-3">Mã / Ngày</th>
                  <th className="px-4 py-3">Thú cưng & Chủ nuôi</th>
                  <th className="px-4 py-3">Dịch vụ</th>
                  <th className="px-4 py-3">Giờ</th>
                  <th className="px-4 py-3">Kỹ thuật viên</th>
                  <th className="px-4 py-3">Phòng/Suite</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Chi phí</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map(b => {
                  const isBoarding = b.serviceName.toLowerCase().includes('nội trú') || b.serviceName.toLowerCase().includes('boarding') || b.serviceName.toLowerCase().includes('khách sạn')
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors text-xs">
                      <td className="px-4 py-3.5">
                        <Link to={`/shop-head/bookings/${b.id}`} className="font-mono font-black text-indigo-600 hover:underline">
                          {b.id}
                        </Link>
                        <div className="text-[10px] text-gray-400 font-bold mt-0.5">{b.date}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-gray-900 text-sm">{b.petName}</span>
                          {isBoarding && (
                            <span className="bg-amber-50 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-wide">🏨 Nội trú</span>
                          )}
                        </div>
                        <div className="text-gray-400 font-semibold mt-0.5">{b.customerName} · <span className="font-mono">{b.customerPhone}</span></div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-700 max-w-40 truncate" title={b.serviceName}>
                        {b.serviceName}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-gray-650">{b.startTime}</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-800">
                        {b.assignedStaffName ?? <span className="text-amber-500 font-extrabold flex items-center gap-0.5"><Info size={11} /> Chờ gán</span>}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-600">
                        {b.roomName ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-block font-black px-2.5 py-0.5 rounded-full text-[9px] ${STATUS_COLORS[b.status]}`}>
                          {STATUS_LABELS[b.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-gray-800">{formatPrice(b.price)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <Link 
                          to={`/shop-head/bookings/${b.id}`} 
                          className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-xl transition-all shadow-sm"
                        >
                          Điều phối & Nhật ký
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredBookings.length === 0 && (
              <div className="p-12 text-center">
                <CalendarCheck size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400 font-bold">Không tìm thấy lịch hẹn nào tương ứng bộ lọc</p>
              </div>
            )}
          </div>
        </div>

        {/* --- DYNAMIC SLIDING DRAWER FOR WALK-IN dropping off --- */}
        {showWalkInDrawer && (
          <div className="w-full lg:w-96 shrink-0 bg-white rounded-3xl border border-gray-200 p-5 shadow-lg animate-slideIn flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                    🧑‍⚕️ Đón tiếp Khách vãng lai
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                    Nhập thông tin trực tiếp tại quầy
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWalkInDrawer(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateWalkIn} className="space-y-3 text-xs leading-normal">
                
                {/* 1. Customer Section */}
                <div className="space-y-2.5 border-b border-gray-100 pb-3">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider block">1. Thông tin Chủ nuôi</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Tên khách hàng</label>
                      <input 
                        required
                        type="text" 
                        className="form-input py-1.5 px-2.5 rounded-lg border-gray-200"
                        placeholder="Nguyễn Văn A"
                        value={custName}
                        onChange={e => setCustName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Số điện thoại</label>
                      <input 
                        required
                        type="text" 
                        className="form-input py-1.5 px-2.5 rounded-lg border-gray-200 font-mono"
                        placeholder="09..."
                        value={custPhone}
                        onChange={e => setCustPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Pet Info Section */}
                <div className="space-y-2.5 border-b border-gray-100 pb-3">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider block">2. Hồ sơ Thú cưng</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Tên thú cưng</label>
                      <input 
                        required
                        type="text" 
                        className="form-input py-1.5 px-2.5 rounded-lg border-gray-200"
                        placeholder="Milo / Lu"
                        value={petName}
                        onChange={e => setPetName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Giống / Loài</label>
                      <input 
                        required
                        type="text" 
                        className="form-input py-1.5 px-2.5 rounded-lg border-gray-200"
                        placeholder="Poodle / Mèo Anh"
                        value={petBreed}
                        onChange={e => setPetBreed(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Service Choice Section */}
                <div className="space-y-2.5 border-b border-gray-100 pb-3">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider block">3. Dịch vụ Đăng ký</span>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Dịch vụ yêu cầu</label>
                    <select
                      className="form-input py-1.5 px-2.5 rounded-lg border-gray-200"
                      value={serviceId}
                      onChange={e => {
                        setServiceId(e.target.value)
                        setRoomId('') // Reset room allocation on service change
                      }}
                    >
                      {SERVICES.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {formatPrice(s.price)}</option>
                      ))}
                    </select>
                  </div>

                  {isSelectedBoarding && (
                    <div className="space-y-2.5 mt-2">
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 text-[9px] font-semibold text-amber-800 flex items-start gap-1">
                        <AlertTriangle size={11} className="text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                        <span>Dịch vụ nội trú được hệ thống khuyến nghị gán phòng chuồng Lưu trú Suite chuyên dụng để phục vụ qua đêm.</span>
                      </div>

                      <div className="bg-indigo-50/40 p-2.5 rounded-2xl border border-indigo-100/50 space-y-2">
                        <span className="text-[9px] font-black text-indigo-900 uppercase tracking-wider block">🍽️ Thiết lập Dinh dưỡng & Ăn uống</span>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wide block">Loại thức ăn chuyên dụng</label>
                          <input 
                            type="text" 
                            className="form-input py-1 px-2 text-[11px] rounded-lg bg-white" 
                            value={dietFoodType} 
                            onChange={e => setDietFoodType(e.target.value)} 
                            placeholder="Hạt Royal Canin, pate tươi heo bò..." 
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wide block">Số bữa / ngày</label>
                            <input 
                              type="number" 
                              className="form-input py-1 px-2 text-[11px] rounded-lg bg-white" 
                              value={dietFeedTimes} 
                              onChange={e => setDietFeedTimes(Number(e.target.value))} 
                              min={1} 
                              max={6} 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wide block">Khối lượng (g / bữa)</label>
                            <input 
                              type="number" 
                              className="form-input py-1 px-2 text-[11px] rounded-lg bg-white" 
                              value={dietPortionWeight} 
                              onChange={e => setDietPortionWeight(Number(e.target.value))} 
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wide block">Tần suất thay nước sạch</label>
                          <input 
                            type="text" 
                            className="form-input py-1 px-2 text-[11px] rounded-lg bg-white" 
                            value={dietWaterFrequency} 
                            onChange={e => setDietWaterFrequency(e.target.value)} 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-rose-500 uppercase tracking-wide block">Cảnh báo dị ứng & Kiêng cữ</label>
                          <input 
                            type="text" 
                            className="form-input py-1 px-2 text-[11px] rounded-lg bg-white border-rose-200 focus:border-rose-400 text-rose-800" 
                            value={dietAllergies} 
                            onChange={e => setDietAllergies(e.target.value)} 
                            placeholder="Không dùng hạt gà, nhạy cảm lactose..." 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Staff & Room allocation Section */}
                <div className="space-y-2.5 border-b border-gray-100 pb-3">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider block">4. Điều phối & gán vị trí</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Kỹ thuật viên</label>
                      <select
                        required
                        className="form-input py-1.5 px-2 rounded-lg border-gray-200"
                        value={assignedStaffId}
                        onChange={e => setAssignedStaffId(e.target.value)}
                      >
                        <option value="">-- Chọn nhân viên --</option>
                        {staffList.map(u => (
                          <option key={u.id} value={u.id}>{u.fullName} ({u.position})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Phòng / Chuồng gán</label>
                      <select
                        required
                        className="form-input py-1.5 px-2 rounded-lg border-gray-200"
                        value={roomId}
                        onChange={e => setRoomId(e.target.value)}
                      >
                        <option value="">-- Chọn phòng --</option>
                        {roomList.map(r => {
                          const isRecommended = r.categoryId === suggestedRoomCategory
                          return (
                            <option
                              key={r.id}
                              value={r.id}
                              className={isRecommended ? 'text-indigo-600 font-bold' : ''}
                            >
                              {r.name} ({r.categoryName}){isRecommended ? ' [Gợi ý] ' : ''}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 5. Ghi chú & Tùy chọn */}
                <div className="space-y-2 pb-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Ghi chú lưu ý</label>
                    <input 
                      type="text" 
                      className="form-input py-1.5 px-2.5 rounded-lg border-gray-200"
                      placeholder="Bé hay sủa, đồ ăn riêng..."
                      value={note}
                      onChange={e => setNote(e.target.value)}
                    />
                  </div>

                  <label className="flex items-center gap-2 font-bold text-indigo-750 select-none cursor-pointer mt-2 bg-indigo-50/40 p-2 rounded-xl border border-indigo-100/50">
                    <input 
                      type="checkbox"
                      checked={instantCheckIn}
                      onChange={e => setInstantCheckIn(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-650 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Thực hiện Check-in ngay lập tức</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-2.5 text-xs font-bold justify-center rounded-2xl shadow-md shadow-indigo-150 flex items-center gap-1.5"
                >
                  <UserPlus size={13} /> Nhận thú cưng & Lưu hồ sơ
                </button>

              </form>

            </div>

            {/* Drawer Closing */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowWalkInDrawer(false)}
                className="w-full btn-secondary py-2 text-xs font-bold justify-center rounded-xl"
              >
                Đóng bảng tiếp đón
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  )
}
