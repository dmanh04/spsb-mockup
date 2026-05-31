import { useState, useMemo } from 'react'
import {
  Plus, Edit, MapPin, Phone, Users, CalendarCheck, Search, Grid, Map,
  Trash2, X, Clock, Activity, TrendingUp, User, Award, Shield, CheckCircle2,
  AlertTriangle, Home, Scissors, ChevronRight, Info
} from 'lucide-react'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { USER_MOCK_LIST } from '@/data/userMockData'
import { BOOKING_MOCK_LIST } from '@/data/bookingMockData'
import { ROOM_MOCK_LIST } from '@/data/roomMockData'
import type { Shop, User as UserType, Room, Booking } from '@/types'

// Status styling
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  inactive: 'bg-gray-100 text-gray-500 border-gray-200',
  renovating: 'bg-amber-50 text-amber-600 border-amber-100',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Hoạt động',
  inactive: 'Tạm đóng',
  renovating: 'Đang sửa',
}

// HCMC Map Coordinates for Mock Vector Map
interface MapPoint {
  id: string
  name: string
  x: number // Percentage from left
  y: number // Percentage from top
}

const MOCK_MAP_POINTS: Record<string, MapPoint> = {
  SH01: { id: 'SH01', name: 'PetCare Quận 1', x: 55, y: 48 },
  SH02: { id: 'SH02', name: 'PetCare Quận 3', x: 42, y: 38 },
  SH03: { id: 'SH03', name: 'PetCare Bình Thạnh', x: 68, y: 24 }
}

export default function ShopsPage() {
  // State
  const [shops, setShops] = useState<Shop[]>(SHOP_MOCK_LIST)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  
  // Drawer & Modals state
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'staff' | 'rooms' | 'bookings'>('overview')
  const [isCrudModalOpen, setIsCrudModalOpen] = useState(false)
  const [editingShop, setEditingShop] = useState<Shop | null>(null)

  // CRUD Form State
  const [formName, setFormName] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formOpenTime, setFormOpenTime] = useState('08:00')
  const [formCloseTime, setFormCloseTime] = useState('20:00')
  const [formStatus, setFormStatus] = useState<'active' | 'inactive' | 'renovating'>('active')
  const [formHeadId, setFormHeadId] = useState('')

  // Toast
  const [toastMsg, setToastMsg] = useState('')

  // Available managers (Users with role 'shop_head')
  const availableManagers = useMemo(() => {
    return USER_MOCK_LIST.filter(u => u.role === 'shop_head')
  }, [])

  // Processed Shops data containing counts
  const processedShops = useMemo(() => {
    return shops.map(shop => {
      const staff = USER_MOCK_LIST.filter(u => u.shopId === shop.id && u.role !== 'customer')
      const bookings = BOOKING_MOCK_LIST.filter(b => b.shopId === shop.id && b.date === '2026-05-31')
      const rooms = ROOM_MOCK_LIST.filter(r => r.shopId === shop.id)
      const head = USER_MOCK_LIST.find(u => u.id === shop.shopHeadId)
      const activeBookingsCount = bookings.filter(b => ['pending', 'confirmed', 'checked_in', 'in_progress'].includes(b.status)).length

      return {
        ...shop,
        staffList: staff,
        staffCount: staff.length,
        bookingsList: bookings,
        bookingsCount: bookings.length,
        activeBookingsCount,
        roomsList: rooms,
        roomsCount: rooms.length,
        head
      }
    })
  }, [shops])

  // Filtered Shops list
  const filteredShops = useMemo(() => {
    return processedShops.filter(shop => {
      const matchesSearch = 
        shop.name.toLowerCase().includes(search.toLowerCase()) ||
        shop.address.toLowerCase().includes(search.toLowerCase()) ||
        (shop.head?.fullName || '').toLowerCase().includes(search.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || shop.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [processedShops, search, statusFilter])

  // Global Statistics Widgets values
  const stats = useMemo(() => {
    const total = processedShops.length
    const active = processedShops.filter(s => s.status === 'active').length
    const totalStaff = processedShops.reduce((sum, s) => sum + s.staffCount, 0)
    const todayBookings = processedShops.reduce((sum, s) => sum + s.bookingsCount, 0)
    const totalRooms = ROOM_MOCK_LIST.length
    const occupiedRooms = ROOM_MOCK_LIST.filter(r => r.status === 'occupied').length
    const roomCapacityRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    return { total, active, totalStaff, todayBookings, roomCapacityRate }
  }, [processedShops])

  // Selected Shop object for Detailed Drawer
  const selectedShop = useMemo(() => {
    return processedShops.find(s => s.id === selectedShopId)
  }, [processedShops, selectedShopId])

  // CRUD Actions
  function openAddModal() {
    setEditingShop(null)
    setFormName('')
    setFormAddress('')
    setFormPhone('')
    setFormOpenTime('08:00')
    setFormCloseTime('20:00')
    setFormStatus('active')
    setFormHeadId(availableManagers[0]?.id || '')
    setIsCrudModalOpen(true)
  }

  function openEditModal(shop: Shop, e: React.MouseEvent) {
    e.stopPropagation()
    setEditingShop(shop)
    setFormName(shop.name)
    setFormAddress(shop.address)
    setFormPhone(shop.phone)
    setFormOpenTime(shop.openTime)
    setFormCloseTime(shop.closeTime)
    setFormStatus(shop.status as 'active' | 'inactive' | 'renovating')
    setFormHeadId(shop.shopHeadId || '')
    setIsCrudModalOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim() || !formAddress.trim() || !formPhone.trim()) return

    const selectedManager = availableManagers.find(m => m.id === formHeadId)
    const headName = selectedManager?.fullName || ''

    if (editingShop) {
      // Edit Shop
      setShops(shops.map(s => s.id === editingShop.id ? {
        ...s,
        name: formName,
        address: formAddress,
        phone: formPhone,
        openTime: formOpenTime,
        closeTime: formCloseTime,
        status: formStatus,
        shopHeadId: formHeadId || undefined,
        shopHeadName: headName || undefined
      } : s))
      triggerToast(`Đã cập nhật chi nhánh "${formName}" thành công!`)
    } else {
      // Add Shop
      const newShop: Shop = {
        id: `SH0${shops.length + 1}`,
        name: formName,
        address: formAddress,
        phone: formPhone,
        openTime: formOpenTime,
        closeTime: formCloseTime,
        status: formStatus,
        shopHeadId: formHeadId || undefined,
        shopHeadName: headName || undefined,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setShops([...shops, newShop])
      triggerToast(`Đã thêm chi nhánh mới "${formName}" thành công!`)
    }
    setIsCrudModalOpen(false)
  }

  function handleDelete(shopId: string, name: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (confirm(`Bạn có chắc chắn muốn xóa chi nhánh "${name}"? Tất cả nhân sự & chuồng sẽ được lưu trữ. Thao tác không thể hoàn tác.`)) {
      setShops(shops.filter(s => s.id !== shopId))
      setSelectedShopId(null)
      triggerToast(`Đã xóa chi nhánh "${name}" khỏi hệ thống.`)
    }
  }

  function triggerToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-gray-950 text-white px-4 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-2 border border-gray-800 animate-slideIn">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <MapPin size={22} className="text-red-800" />
            Quản lý Chi nhánh
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Cấu hình địa điểm, giờ đóng/mở cửa, quản lý buồng phòng chăm sóc thú cưng và phân phối nhân sự chi nhánh.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 bg-red-800 hover:bg-red-900 border-none transition-all shadow-md self-start sm:self-auto"
        >
          <Plus size={16} /> Thêm chi nhánh
        </button>
      </div>

      {/* Statistics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Tổng chi nhánh</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-gray-800">{stats.total}</span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                {stats.active} hoạt động
              </span>
            </div>
          </div>
          <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-100">
            <MapPin size={18} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Tổng nhân viên chi nhánh</span>
            <span className="text-xl font-extrabold text-gray-800">{stats.totalStaff} người</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Booking hôm nay</span>
            <span className="text-xl font-extrabold text-gray-800">{stats.todayBookings} lịch hẹn</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
            <CalendarCheck size={18} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Tỉ lệ lấp đầy chuồng</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-gray-800">{stats.roomCapacityRate}%</span>
              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-red-800 rounded-full" style={{ width: `${stats.roomCapacityRate}%` }} />
              </div>
            </div>
          </div>
          <div className="p-3 bg-purple-50 text-purple-800 rounded-xl border border-purple-100">
            <Home size={18} />
          </div>
        </div>
      </div>

      {/* Filter and View mode switcher toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-xs">
        {/* Left Side Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tên chi nhánh, địa chỉ, quản lý..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8.5 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Status Lọc */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-semibold shrink-0">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500 bg-white font-medium text-gray-700"
            >
              <option value="all">Tất cả chi nhánh</option>
              <option value="active">Đang hoạt động</option>
              <option value="renovating">Đang sửa chữa</option>
              <option value="inactive">Tạm đóng cửa</option>
            </select>
          </div>
        </div>

        {/* Right Side Layout View Switcher */}
        <div className="flex items-center gap-1 border border-gray-100 rounded-lg p-1 bg-gray-50 self-start sm:self-auto shrink-0 select-none">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
              viewMode === 'grid' 
                ? 'bg-white text-red-800 shadow-sm font-bold' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Grid size={14} />
            <span>Danh sách</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
              viewMode === 'map' 
                ? 'bg-white text-red-800 shadow-sm font-bold' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Map size={14} />
            <span>Bản đồ</span>
          </button>
        </div>
      </div>

      {/* Grid Mode View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              onClick={() => setSelectedShopId(shop.id)}
              className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                selectedShopId === shop.id ? 'border-red-800 ring-1 ring-red-800/20' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Highlight bar */}
              <div className={`absolute left-0 top-0 w-1.5 h-full transition-colors ${
                shop.status === 'active' ? 'bg-emerald-500' : shop.status === 'renovating' ? 'bg-amber-500' : 'bg-gray-300'
              }`} />

              <div className="space-y-4">
                {/* Name and status badge */}
                <div className="flex items-start justify-between pr-2">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-gray-800 group-hover:text-red-800 transition-colors flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400 group-hover:text-red-700" />
                      {shop.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono">ID: {shop.id}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_COLORS[shop.status]}`}>
                    {STATUS_LABELS[shop.status]}
                  </span>
                </div>

                {/* Location contacts */}
                <div className="space-y-2 text-xs text-gray-500 leading-normal">
                  <div className="flex items-start gap-2 pr-4">
                    <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>{shop.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-gray-400" />
                    <span className="font-semibold text-gray-700">{shop.phone}</span>
                  </div>
                </div>

                {/* Counter Pills Grid */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs border-t border-gray-100 pt-4">
                  <div className="bg-gray-50/50 rounded-lg p-2 border border-gray-100">
                    <div className="font-extrabold text-gray-800">{shop.staffCount}</div>
                    <div className="text-[9px] text-gray-400 font-semibold uppercase mt-0.5">Nhân viên</div>
                  </div>
                  <div className="bg-gray-50/50 rounded-lg p-2 border border-gray-100">
                    <div className="font-extrabold text-gray-800">{shop.bookingsCount}</div>
                    <div className="text-[9px] text-gray-400 font-semibold uppercase mt-0.5">Booking</div>
                  </div>
                  <div className="bg-gray-50/50 rounded-lg p-2 border border-gray-100">
                    <div className="font-extrabold text-gray-800">{shop.openTime}–{shop.closeTime}</div>
                    <div className="text-[9px] text-gray-400 font-semibold uppercase mt-0.5">Giờ mở</div>
                  </div>
                </div>
              </div>

              {/* Manager and Action Buttons Footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
                {shop.head && (
                  <div className="flex items-center gap-2 select-none">
                    <img
                      src={shop.head.avatar || `https://placehold.co/40x40/cccccc/ffffff?text=${shop.head.fullName.charAt(0)}`}
                      alt={shop.head.fullName}
                      className="w-6 h-6 rounded-full border border-gray-100 object-cover"
                    />
                    <div className="text-[11px] text-gray-500">
                      Quản lý: <strong className="text-gray-700 font-bold">{shop.head.fullName}</strong>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedShopId(shop.id)
                      setActiveDetailTab('overview')
                    }}
                    className="text-xs font-bold text-red-800 hover:text-red-900 flex items-center gap-0.5 py-1 px-1.5 hover:bg-red-50 rounded transition-colors"
                  >
                    Xem chi tiết <ChevronRight size={14} />
                  </button>

                  <div className="flex gap-1">
                    <button
                      onClick={(e) => openEditModal(shop, e)}
                      title="Sửa chi nhánh"
                      className="p-2 text-gray-400 hover:text-red-800 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(shop.id, shop.name, e)}
                      title="Xóa chi nhánh"
                      className="p-2 text-gray-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredShops.length === 0 && (
            <div className="col-span-full py-16 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white">
              Không tìm thấy chi nhánh nào phù hợp với bộ lọc tìm kiếm.
            </div>
          )}
        </div>
      )}

      {/* Map Mode View */}
      {viewMode === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mock Interactive Vector Map HCMC */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm lg:col-span-2 flex flex-col justify-between min-h-[480px]">
            <div>
              <h3 className="font-bold text-sm text-gray-800">Bản đồ Định vị Chi nhánh</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Mô phỏng vị trí địa lý của các chi nhánh trên hệ thống PetCare khu vực TP.HCM.</p>
            </div>

            {/* Simulated Geographic Grid Map */}
            <div className="relative w-full h-[360px] bg-gray-50 border border-gray-100 rounded-xl overflow-hidden mt-4 flex items-center justify-center select-none bg-gradient-to-tr from-sky-50/20 via-gray-50 to-emerald-50/10">
              {/* Grid backdrop */}
              <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-30 pointer-events-none">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="border-t border-l border-gray-300/40" />
                ))}
              </div>

              {/* Major city routes simulation */}
              <svg className="absolute inset-0 w-full h-full text-gray-200" xmlns="http://www.w3.org/2000/svg">
                <path d="M 0 100 Q 150 150 300 200 T 600 280" fill="none" stroke="currentColor" strokeWidth="6" className="opacity-40" />
                <path d="M 100 0 Q 180 180 260 360" fill="none" stroke="currentColor" strokeWidth="4" className="opacity-40" />
                <path d="M 280 0 Q 340 120 400 360" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-30" />
              </svg>

              {/* Map pins */}
              {filteredShops.map((shop) => {
                const mapPoint = MOCK_MAP_POINTS[shop.id]
                if (!mapPoint) return null
                const isSelected = selectedShopId === shop.id

                return (
                  <div
                    key={shop.id}
                    onClick={() => setSelectedShopId(shop.id)}
                    className="absolute cursor-pointer transition-all duration-300"
                    style={{ left: `${mapPoint.x}%`, top: `${mapPoint.y}%`, transform: 'translate(-50%, -100%)' }}
                  >
                    {/* Ripple pulse ring */}
                    {shop.status === 'active' && (
                      <span className="absolute -left-1.5 -top-1.5 w-7 h-7 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
                    )}

                    {/* Pin element */}
                    <div className={`p-2.5 rounded-full border shadow-md flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-red-800 border-red-900 text-white scale-125' 
                        : shop.status === 'active'
                        ? 'bg-white border-emerald-300 text-emerald-600 hover:scale-110'
                        : 'bg-white border-amber-300 text-amber-600 hover:scale-110'
                    }`}>
                      <MapPin size={16} className={isSelected ? 'fill-white' : ''} />
                    </div>

                    {/* Floating Info card above pin */}
                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white p-2 rounded-lg text-[10px] w-36 pointer-events-none shadow-xl transition-all ${
                      isSelected ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1 invisible group-hover:visible'
                    }`}>
                      <div className="font-extrabold truncate">{shop.name}</div>
                      <div className="text-[8px] text-gray-400 truncate mt-0.5">{shop.address}</div>
                      <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-800 font-bold text-gray-300">
                        <span>👥 Staff: {shop.staffCount}</span>
                        <span className="text-emerald-400">📅 Live: {shop.bookingsCount}</span>
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-t-4 border-t-gray-900 border-x-4 border-x-transparent" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Performance ranking & Live summary bar */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between min-h-[480px] text-xs">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-gray-800">Thống kê & Xếp hạng</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Xếp hạng tải lượng và khối lượng booking của các chi nhánh hôm nay.</p>
              </div>

              {/* Rating Leaderboard list */}
              <div className="space-y-3 pt-2">
                {processedShops.map((shop, idx) => (
                  <div
                    key={shop.id}
                    onClick={() => setSelectedShopId(shop.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedShopId === shop.id 
                        ? 'bg-red-50/50 border-red-200 ring-1 ring-red-800/10' 
                        : 'border-gray-50 hover:bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Number Circle */}
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 border ${
                        idx === 0
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : idx === 1
                          ? 'bg-gray-100 text-gray-600 border-gray-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-800">{shop.name}</div>
                        <div className="text-[10px] text-gray-400">Dung lượng: {shop.roomsCount} phòng dịch vụ</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-red-800">{shop.bookingsCount} bookings</div>
                      <div className="text-[9px] text-gray-400 font-semibold">Hôm nay</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="rounded-lg bg-red-50/50 border border-red-100 p-3 text-[11px] text-red-800 flex items-start gap-2">
                <Info size={14} className="text-red-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> Bấm trực tiếp vào các điểm ghim định vị trên bản đồ hoặc danh sách xếp hạng để kích hoạt bảng điều khiển chi tiết của chi nhánh đó.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Detailed Shop Drawer */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex justify-end">
          {/* Drawer Panel Container */}
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto animate-slideLeft flex flex-col justify-between border-l border-gray-100">
            {/* Drawer Header */}
            <div>
              <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 bg-gray-50 select-none">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-gray-900">{selectedShop.name}</h2>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[selectedShop.status]}`}>
                      {STATUS_LABELS[selectedShop.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{selectedShop.address}</p>
                </div>
                <button
                  onClick={() => setSelectedShopId(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer tabs switcher */}
              <div className="border-b border-gray-100 bg-white px-6">
                <nav className="flex gap-4 -mb-px text-xs">
                  {(['overview', 'staff', 'rooms', 'bookings'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveDetailTab(tab)}
                      className={`py-3.5 px-1 font-bold border-b-2 transition-all cursor-pointer ${
                        activeDetailTab === tab 
                          ? 'border-red-800 text-red-800' 
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {tab === 'overview' ? 'Tổng quan' : tab === 'staff' ? 'Nhân sự' : tab === 'rooms' ? 'Phòng & Chuồng' : 'Booking Hôm nay'}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Drawer scrollable content */}
            <div className="flex-1 p-6 text-xs overflow-y-auto bg-gray-50/50">
              {/* TAB 1: Overview */}
              {activeDetailTab === 'overview' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Quick summary grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-1 shadow-sm">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Nhân viên trực</span>
                      <div className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
                        <Users size={16} className="text-red-800" />
                        {selectedShop.staffCount} nhân sự
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-1 shadow-sm">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Buồng chăm sóc</span>
                      <div className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
                        <Home size={16} className="text-red-800" />
                        {selectedShop.roomsCount} phòng active
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-1 shadow-sm">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Giờ làm việc</span>
                      <div className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
                        <Clock size={16} className="text-red-800" />
                        {selectedShop.openTime} – {selectedShop.closeTime}
                      </div>
                    </div>
                  </div>

                  {/* Branch Profile Info */}
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-3">
                      <Award size={15} className="text-red-800" />
                      Thông tin cơ bản Chi nhánh
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600 font-medium">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 block font-semibold">Điện thoại liên hệ:</span>
                        <span className="text-gray-800 font-bold">{selectedShop.phone}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 block font-semibold">Ngày khai trương:</span>
                        <span className="text-gray-800">{selectedShop.createdAt}</span>
                      </div>
                      {selectedShop.head && (
                        <div className="space-y-2 col-span-full pt-2 border-t border-gray-100/60">
                          <span className="text-[10px] text-gray-400 block font-semibold">Quản lý trực thuộc:</span>
                          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <img
                              src={selectedShop.head.avatar || 'https://placehold.co/40x40'}
                              alt=""
                              className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                            />
                            <div className="space-y-0.5">
                              <div className="font-bold text-gray-800">{selectedShop.head.fullName}</div>
                              <div className="text-[10px] text-gray-400">Email: {selectedShop.head.email} • SĐT: {selectedShop.head.phone}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Staff */}
              {activeDetailTab === 'staff' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-gray-800">Đội ngũ Nhân viên trực thuộc ({selectedShop.staffCount})</h3>
                    <span className="text-[10px] text-gray-400 font-medium">Chỉ hiển thị nhân viên đang active ca trực</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedShop.staffList.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3 hover:border-gray-200 transition-colors"
                      >
                        <img
                          src={member.avatar || 'https://placehold.co/40x40'}
                          alt={member.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0"
                        />
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="font-bold text-gray-800 truncate">{member.fullName}</div>
                          <div className="text-[10px] text-gray-400 font-medium uppercase truncate">
                            {member.position || (member.role === 'shop_head' ? 'Quản lý' : 'Nhân viên')}
                          </div>
                          <div className="text-[9px] text-gray-400 truncate">{member.email}</div>
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Online" />
                      </div>
                    ))}

                    {selectedShop.staffList.length === 0 && (
                      <div className="col-span-full py-8 text-center text-gray-400 italic bg-white border border-dashed border-gray-200 rounded-xl">
                        Chưa có nhân sự nào được chỉ định trực thuộc chi nhánh này.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Rooms */}
              {activeDetailTab === 'rooms' && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="font-bold text-sm text-gray-800">Danh sách Buồng phòng Dịch vụ ({selectedShop.roomsCount})</h3>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="px-4 py-2.5">Tên phòng</th>
                          <th className="px-4 py-2.5">Phân loại</th>
                          <th className="px-4 py-2.5 text-center">Dung lượng</th>
                          <th className="px-4 py-2.5">Trang thiết bị</th>
                          <th className="px-4 py-2.5">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedShop.roomsList.map((room) => (
                          <tr key={room.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-bold text-gray-800">{room.name}</td>
                            <td className="px-4 py-3 font-medium text-gray-500">{room.categoryName}</td>
                            <td className="px-4 py-3 text-center font-bold text-gray-800">{room.capacity} thú cưng</td>
                            <td className="px-4 py-3 text-gray-400 font-medium">
                              <span className="truncate max-w-[140px] block" title={room.equipment.join(', ')}>
                                {room.equipment.join(', ')}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border ${
                                room.status === 'available'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                  : room.status === 'occupied'
                                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                                  : 'bg-rose-50 text-rose-600 border-rose-100'
                              }`}>
                                {room.status === 'available' ? 'Trống' : room.status === 'occupied' ? 'Đang bận' : 'Bảo trì'}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {selectedShop.roomsList.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                              Không tìm thấy phòng dịch vụ nào thuộc chi nhánh này.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: Bookings */}
              {activeDetailTab === 'bookings' && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="font-bold text-sm text-gray-800">Thông số Lịch hẹn Hôm nay ({selectedShop.bookingsCount})</h3>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="px-4 py-2.5">Slot Giờ</th>
                          <th className="px-4 py-2.5">Thú cưng</th>
                          <th className="px-4 py-2.5">Khách hàng</th>
                          <th className="px-4 py-2.5">Dịch vụ yêu cầu</th>
                          <th className="px-4 py-2.5">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedShop.bookingsList.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-mono font-bold text-gray-800">
                              {booking.startTime} – {booking.endTime}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-gray-800">{booking.petName}</div>
                              <div className="text-[9px] text-gray-400 font-semibold">{booking.petBreed}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-gray-700">{booking.customerName}</div>
                              <div className="text-[9px] text-gray-400 font-mono">{booking.customerPhone}</div>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-600">{booking.serviceName}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border ${
                                booking.status === 'completed' || booking.status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                  : booking.status === 'cancelled'
                                  ? 'bg-gray-100 text-gray-400 border-gray-200'
                                  : 'bg-red-50 text-red-700 border-red-100'
                              }`}>
                                {booking.status === 'completed' ? 'Hoàn tất' : booking.status === 'paid' ? 'Đã thanh toán' : booking.status === 'cancelled' ? 'Hủy lịch' : 'Chờ xử lý'}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {selectedShop.bookingsList.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                              Hôm nay không có lịch hẹn đặt chỗ nào tại chi nhánh này.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={(e) => handleDelete(selectedShop.id, selectedShop.name, e)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 py-1.5 px-3 rounded hover:bg-rose-50 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Xóa chi nhánh này
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedShopId(null)}
                  className="px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 font-semibold"
                >
                  Đóng
                </button>
                <button
                  onClick={(e) => openEditModal(selectedShop, e)}
                  className="px-4 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg font-semibold flex items-center gap-1"
                >
                  <Edit size={13} /> Sửa chi nhánh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRUD Add/Edit Shop Modal Dialog */}
      {isCrudModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden animate-zoomIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50 select-none">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <MapPin size={16} className="text-red-800" />
                {editingShop ? 'Cập nhật thông tin Chi nhánh' : 'Thêm Chi nhánh Mới'}
              </h3>
              <button
                onClick={() => setIsCrudModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs text-gray-700">
              <div className="space-y-1">
                <label className="block font-bold text-gray-600">Tên chi nhánh <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: PetCare Chi nhánh Gò Vấp..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600">Địa chỉ chi nhánh <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Nhập số nhà, tên đường, quận/huyện..."
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 028 3553 4004..."
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-600">Trạng thái hoạt động</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 bg-white font-semibold"
                  >
                    <option value="active">Hoạt động (Active)</option>
                    <option value="renovating">Đang sửa chữa (Renovating)</option>
                    <option value="inactive">Tạm đóng cửa (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600">Giờ mở cửa <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    required
                    value={formOpenTime}
                    onChange={(e) => setFormOpenTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600">Giờ đóng cửa <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    required
                    value={formCloseTime}
                    onChange={(e) => setFormCloseTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600 font-semibold">Người quản lý chi nhánh (Shop Head)</label>
                <select
                  value={formHeadId}
                  onChange={(e) => setFormHeadId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 bg-white font-semibold"
                >
                  <option value="">-- Chưa bổ nhiệm quản lý --</option>
                  {availableManagers.map((mgr) => (
                    <option key={mgr.id} value={mgr.id}>
                      {mgr.fullName} ({mgr.position || 'Shop Head'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCrudModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-bold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg font-bold transition-colors"
                >
                  {editingShop ? 'Lưu thay đổi' : 'Tạo chi nhánh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
