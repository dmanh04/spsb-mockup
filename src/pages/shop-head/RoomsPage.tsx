import { useState } from 'react'
import { Plus, Wrench, CheckCircle, X, ShieldAlert, AlertTriangle, Settings, Calendar, History, Info, ChevronRight, Edit3, ArrowRight } from 'lucide-react'
import { ROOM_MOCK_LIST, ROOM_CATEGORIES, saveRooms } from '@/data/roomMockData'
import { BOOKING_MOCK_LIST, saveBookings } from '@/data/bookingMockData'
import { useAuthContext } from '@/auth/AuthContext'
import type { Room } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  available: 'Trống', occupied: 'Đang dùng', maintenance: 'Bảo trì', inactive: 'Ngừng hoạt động',
}
const STATUS_COLORS: Record<string, string> = {
  available: 'badge-green', occupied: 'badge-orange', maintenance: 'badge-gray', inactive: 'badge-red',
}
const STATUS_DOT: Record<string, string> = {
  available: 'bg-green-400', occupied: 'bg-orange-400', maintenance: 'bg-gray-400', inactive: 'bg-red-400',
}

export default function RoomsPage() {
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'

  const [rooms, setRooms] = useState<Room[]>(() => ROOM_MOCK_LIST)
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  
  // Slide panel state for Adding Room
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomCapacity, setNewRoomCapacity] = useState('1')
  const [newRoomCatId, setNewRoomCatId] = useState('')
  const [newRoomEquipment, setNewRoomEquipment] = useState('')

  // Maintenance confirmation state
  const [maintenanceTarget, setMaintenanceTarget] = useState<Room | null>(null)

  // Room Detail Drawer states
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [activeTab, setActiveTab] = useState<'config' | 'schedule' | 'history'>('config')
  
  // States for editing Room details in Drawer
  const [editName, setEditName] = useState('')
  const [editCapacity, setEditCapacity] = useState(1)
  const [editCatId, setEditCatId] = useState('')
  const [editEquipment, setEditEquipment] = useState('')
  const [editStatus, setEditStatus] = useState<Room['status']>('available')

  // State for maintenance notes & reason
  const [maintenanceReason, setMaintenanceReason] = useState('Khử trùng & vệ sinh định kỳ')
  const [maintenanceNote, setMaintenanceNote] = useState('')

  // State for quick reallocation select
  const [reallocateBookingId, setReallocateBookingId] = useState<string | null>(null)
  const [reallocateTargetRoomId, setReallocateTargetRoomId] = useState('')
  const [successAlert, setSuccessAlert] = useState('')
  
  const shopCategories = ROOM_CATEGORIES.filter(c => c.shopId === shopId)
  const shopRooms = rooms
    .filter(r => r.shopId === shopId)
    .filter(r => !selectedCat || r.categoryId === selectedCat)

  const available = rooms.filter(r => r.shopId === shopId && r.status === 'available').length
  const total = rooms.filter(r => r.shopId === shopId).length

  // Check if room has upcoming bookings that are confirmed or in progress
  const getUpcomingBookings = (roomId: string) => {
    return BOOKING_MOCK_LIST.filter(b => b.roomId === roomId && ['confirmed', 'in_progress', 'pending'].includes(b.status))
  }

  // Get past bookings of this room
  const getPastBookings = (roomId: string) => {
    return BOOKING_MOCK_LIST.filter(b => b.roomId === roomId && ['completed', 'paid'].includes(b.status))
  }

  // Get rooms available for reallocation
  const getReallocateRoomOptions = (categoryId: string, excludeRoomId: string) => {
    return rooms.filter(r => r.shopId === shopId && r.categoryId === categoryId && r.id !== excludeRoomId && r.status !== 'maintenance')
  }

  function handleSelectRoom(room: Room) {
    setSelectedRoom(room)
    setEditName(room.name)
    setEditCapacity(room.capacity)
    setEditCatId(room.categoryId)
    setEditEquipment(room.equipment?.join(', ') ?? '')
    setEditStatus(room.status)
    setActiveTab('config')
    setReallocateBookingId(null)
    setReallocateTargetRoomId('')
    setShowAddPanel(false)
    setMaintenanceTarget(null)
  }

  function handleSaveRoomDetail(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRoom) return

    const selectedCategory = ROOM_CATEGORIES.find(c => c.id === editCatId)
    if (!selectedCategory) return

    const updated = rooms.map(r => {
      if (r.id === selectedRoom.id) {
        const isStatusChanging = r.status !== editStatus
        let newLogs = r.maintenanceLogs ? [...r.maintenanceLogs] : []
        
        // If status changed to maintenance
        if (isStatusChanging && editStatus === 'maintenance') {
          newLogs.push({
            id: `M-${Date.now()}`,
            startedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            requestedBy: currentUser?.fullName ?? 'Shop Head',
            reason: maintenanceReason || 'Khử trùng & vệ sinh định kỳ',
            note: maintenanceNote || 'Đã ghi nhận yêu cầu bảo trì.'
          })
        }
        // If status changed from maintenance to available
        else if (isStatusChanging && r.status === 'maintenance' && editStatus === 'available') {
          newLogs = newLogs.map(log => !log.completedAt ? {
            ...log,
            completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            note: (log.note ?? '') + ' -> Bảo trì hoàn tất. Phòng sẵn sàng hoạt động.'
          } : log)
        }

        return {
          ...r,
          name: editName,
          categoryId: editCatId,
          categoryName: selectedCategory.name,
          capacity: editCapacity,
          status: editStatus,
          equipment: editEquipment ? editEquipment.split(',').map(eq => eq.trim()).filter(Boolean) : [],
          maintenanceLogs: newLogs
        }
      }
      return r
    })

    setRooms(updated)
    saveRooms(updated)
    
    // Refresh selected room
    const freshRoom = updated.find(r => r.id === selectedRoom.id)
    if (freshRoom) {
      setSelectedRoom(freshRoom)
    }

    setSuccessAlert(`Đã cập nhật thông tin phòng "${editName}" thành công!`)
    setTimeout(() => setSuccessAlert(''), 3000)
  }

  function handleExecuteReallocate(bookingId: string) {
    if (!reallocateTargetRoomId || !selectedRoom) return
    const targetRoom = rooms.find(r => r.id === reallocateTargetRoomId)
    if (!targetRoom) return

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
    
    // Update BOOKING_MOCK_LIST
    const updatedBookings = BOOKING_MOCK_LIST.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          roomId: targetRoom.id,
          roomName: targetRoom.name,
          statusHistory: [
            ...(b.statusHistory || []),
            { status: b.status, changedBy: currentUser?.fullName ?? 'Shop Head', changedAt: nowStr, note: `Tái điều phối nhanh từ phòng "${selectedRoom.name}" sang "${targetRoom.name}"` }
          ]
        }
      }
      return b
    })

    saveBookings(updatedBookings)

    // Log this to servingHistory of target room in our reactive rooms state
    const updatedRooms = rooms.map(r => {
      if (r.id === targetRoom.id) {
        const matchingBooking = BOOKING_MOCK_LIST.find(bk => bk.id === bookingId)
        if (matchingBooking) {
          const updatedHistory = r.servingHistory ? [...r.servingHistory] : []
          updatedHistory.push({
            bookingId: matchingBooking.id,
            petName: matchingBooking.petName,
            customerName: matchingBooking.customerName,
            serviceName: matchingBooking.serviceName,
            date: matchingBooking.date,
            checkinTime: matchingBooking.startTime,
            checkoutTime: matchingBooking.endTime
          })
          return { ...r, servingHistory: updatedHistory }
        }
      }
      return r
    })

    setRooms(updatedRooms)
    saveRooms(updatedRooms)

    setReallocateBookingId(null)
    setReallocateTargetRoomId('')
    setSuccessAlert('Đã chuyển đổi phòng chuồng nhanh thành công!')
    setTimeout(() => setSuccessAlert(''), 3000)
  }

  function handleToggleMaintenance(room: Room) {
    setSelectedRoom(null) // Close detail drawer to avoid clash
    if (room.status === 'maintenance') {
      // Bring back to available
      const updated = rooms.map(r => {
        if (r.id === room.id) {
          let newLogs = r.maintenanceLogs ? [...r.maintenanceLogs] : []
          newLogs = newLogs.map(log => !log.completedAt ? {
            ...log,
            completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            note: (log.note ?? '') + ' -> Bảo trì hoàn tất. Phòng sẵn sàng hoạt động.'
          } : log)
          return { ...r, status: 'available' as const, maintenanceLogs: newLogs }
        }
        return r
      })
      setRooms(updated)
      saveRooms(updated)
      setSuccessAlert(`Phòng "${room.name}" đã hoạt động trở lại!`)
      setTimeout(() => setSuccessAlert(''), 3000)
    } else {
      // Check upcoming bookings before putting to maintenance
      const activeBookings = getUpcomingBookings(room.id)
      if (activeBookings.length > 0) {
        setMaintenanceTarget(room)
      } else {
        // Safe to maintain, add log
        const updated = rooms.map(r => {
          if (r.id === room.id) {
            const newLogs = r.maintenanceLogs ? [...r.maintenanceLogs] : []
            newLogs.push({
              id: `M-${Date.now()}`,
              startedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              requestedBy: currentUser?.fullName ?? 'Shop Head',
              reason: 'Bảo trì sửa chữa hoặc khử trùng đột xuất',
              note: 'Bắt đầu quy trình bảo trì.'
            })
            return { ...r, status: 'maintenance' as const, maintenanceLogs: newLogs }
          }
          return r
        })
        setRooms(updated)
        saveRooms(updated)
        setSuccessAlert(`Phòng "${room.name}" đã bắt đầu quy trình bảo trì!`)
        setTimeout(() => setSuccessAlert(''), 3000)
      }
    }
  }

  function confirmMaintenance() {
    if (!maintenanceTarget) return
    const updated = rooms.map(r => {
      if (r.id === maintenanceTarget.id) {
        const newLogs = r.maintenanceLogs ? [...r.maintenanceLogs] : []
        newLogs.push({
          id: `M-${Date.now()}`,
          startedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          requestedBy: currentUser?.fullName ?? 'Shop Head',
          reason: 'Bảo trì có lịch hẹn bị ảnh hưởng',
          note: 'Xác nhận ghi nhận bảo trì và tiến hành đổi ca điều phối sau.'
        })
        return { ...r, status: 'maintenance' as const, maintenanceLogs: newLogs }
      }
      return r
    })
    setRooms(updated)
    saveRooms(updated)
    setMaintenanceTarget(null)
    setSuccessAlert(`Đã chuyển phòng "${maintenanceTarget.name}" sang trạng thái bảo trì!`)
    setTimeout(() => setSuccessAlert(''), 3000)
  }

  function handleAddRoom(e: React.FormEvent) {
    e.preventDefault()
    if (!newRoomName || !newRoomCatId) return

    const selectedCategory = ROOM_CATEGORIES.find(c => c.id === newRoomCatId)
    if (!selectedCategory) return

    const newRoom: Room = {
      id: `R-${Date.now()}`,
      name: newRoomName,
      categoryId: newRoomCatId,
      categoryName: selectedCategory.name,
      shopId: shopId,
      capacity: parseInt(newRoomCapacity) || 1,
      status: 'available',
      equipment: newRoomEquipment ? newRoomEquipment.split(',').map(eq => eq.trim()).filter(Boolean) : []
    }

    const updated = [...rooms, newRoom]
    setRooms(updated)
    saveRooms(updated)

    // Reset Form & Close panel
    setNewRoomName('')
    setNewRoomCapacity('1')
    setNewRoomCatId('')
    setNewRoomEquipment('')
    setShowAddPanel(false)
  }

  return (
    <div className="relative flex flex-col md:flex-row gap-6 min-h-[calc(100vh-140px)]">
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 space-y-5">
        {successAlert && (
          <div className="bg-emerald-50 border border-emerald-250/30 text-emerald-800 rounded-2xl p-4 flex items-center gap-2 text-sm font-extrabold animate-pulse">
            <CheckCircle size={18} className="text-emerald-600 shrink-0" />
            <span>{successAlert}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Quản lý phòng</h1>
            <p className="text-sm text-gray-500">{available}/{total} phòng đang trống ở {shopId}</p>
          </div>
          <button 
            onClick={() => { setShowAddPanel(true); setMaintenanceTarget(null) }} 
            className="btn-primary flex items-center gap-1.5 shadow-md shadow-indigo-200"
          >
            <Plus size={15} /> Thêm phòng mới
          </button>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(STATUS_LABELS).map(([status, label]) => {
            const count = rooms.filter(r => r.shopId === shopId && r.status === status).length
            return (
              <div key={status} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-gray-100/50 shadow-sm flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${STATUS_DOT[status]} animate-pulse-subtle`} />
                <div>
                  <div className="text-2xl font-black text-gray-900">{count}</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{label}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button 
            onClick={() => setSelectedCat(null)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              !selectedCat 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            Tất cả danh mục
          </button>
          {shopCategories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                selectedCat === cat.id 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shopRooms.map(room => {
            const upcoming = getUpcomingBookings(room.id)
            const isSelected = selectedRoom?.id === room.id
            return (
              <div 
                key={room.id} 
                onClick={() => handleSelectRoom(room)}
                className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer select-none ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-150 scale-102'
                    : room.status === 'occupied' 
                      ? 'border-orange-200 bg-orange-50/10' 
                      : room.status === 'maintenance' 
                        ? 'border-gray-250 bg-gray-50/50 opacity-80' 
                        : 'border-gray-150 hover:border-indigo-150'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base">{room.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ROOM_CATEGORIES.find(c => c.id === room.categoryId)?.color }} />
                        <span className="text-xs font-bold text-gray-400">{room.categoryName}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_COLORS[room.status]}`}>
                      {STATUS_LABELS[room.status]}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-gray-500 mb-3.5">
                    Sức chứa tối đa: <span className="font-bold text-gray-800">{room.capacity} thú cưng</span>
                  </div>

                  {/* Equipment badges */}
                  {room.equipment && room.equipment.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {room.equipment.map(eq => (
                        <span key={eq} className="bg-gray-100 text-gray-650 text-[10px] font-bold px-2 py-0.5 rounded">
                          {eq}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct Action Controls */}
                <div className="border-t border-gray-100 pt-3 flex gap-2" onClick={e => e.stopPropagation()}>
                  {room.status === 'maintenance' ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleMaintenance(room); }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle size={13} /> Sẵn sàng hoạt động
                    </button>
                  ) : room.status === 'available' ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleMaintenance(room); }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-colors"
                    >
                      <Wrench size={13} /> Yêu cầu bảo trì
                    </button>
                  ) : room.status === 'occupied' ? (
                    <div className="w-full text-center py-1.5 bg-orange-50 border border-orange-100 text-orange-700 rounded-2xl text-[10px] font-extrabold flex items-center justify-center gap-1.5">
                      <AlertTriangle size={11} /> Phòng đang phục vụ lịch hẹn
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        {shopRooms.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">🏢</div>
            <p className="text-sm font-bold">Không tìm thấy phòng dịch vụ nào</p>
          </div>
        )}
      </div>

      {/* --- SLIDING RIGHT DRAWER FOR ADDING NEW ROOM --- */}
      {showAddPanel && (
        <div className="w-full md:w-80 shrink-0 bg-white/95 backdrop-blur-lg rounded-3xl border border-gray-200 p-6 shadow-lg animate-slideIn flex flex-col justify-between">
          <form onSubmit={handleAddRoom} className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                🏢 Thêm phòng mới
              </h2>
              <button 
                type="button" 
                onClick={() => setShowAddPanel(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Tên phòng</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Spa VIP 3" 
                  className="form-input text-sm rounded-xl py-2 px-3 focus:border-indigo-500"
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Danh mục phòng</label>
                <select 
                  required
                  className="form-input text-sm rounded-xl py-2 px-3 focus:border-indigo-500"
                  value={newRoomCatId}
                  onChange={e => setNewRoomCatId(e.target.value)}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {shopCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Sức chứa (thú cưng)</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  className="form-input text-sm rounded-xl py-2 px-3"
                  value={newRoomCapacity}
                  onChange={e => setNewRoomCapacity(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Thiết bị kèm theo</label>
                <textarea 
                  placeholder="Cách nhau bằng dấu phẩy. Ví dụ: Máy massage, Bồn tắm massage..." 
                  className="form-input text-sm rounded-xl py-2 px-3 min-h-16"
                  value={newRoomEquipment}
                  onChange={e => setNewRoomEquipment(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button 
                type="submit" 
                className="flex-1 btn-primary py-2 text-xs font-bold justify-center rounded-2xl"
              >
                Lưu & Kích hoạt
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddPanel(false)}
                className="btn-secondary py-2 text-xs font-bold justify-center rounded-2xl"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- SLIDING RIGHT DRAWER FOR MAINTENANCE CONFLICT WARN --- */}
      {maintenanceTarget && (
        <div className="w-full md:w-80 shrink-0 bg-amber-50/95 border border-amber-200 rounded-3xl p-6 shadow-lg animate-slideIn flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <h2 className="text-sm font-black text-amber-800 flex items-center gap-1.5">
                <ShieldAlert size={16} /> Cảnh báo Bảo trì phòng
              </h2>
              <button 
                type="button" 
                onClick={() => setMaintenanceTarget(null)} 
                className="text-amber-500 hover:text-amber-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 pt-2 text-xs text-amber-850">
              <p className="font-semibold leading-relaxed">
                Phòng <strong className="text-amber-900 text-sm font-black">"{maintenanceTarget.name}"</strong> hiện đang được gán cho các lịch hẹn sắp tới.
              </p>
              
              <div className="bg-amber-100/70 rounded-2xl p-3 border border-amber-200/50 space-y-2">
                <span className="font-bold text-[10px] uppercase text-amber-800 tracking-wider block">Các lịch hẹn bị ảnh hưởng:</span>
                <div className="max-h-40 overflow-y-auto divide-y divide-amber-200/40 space-y-2 pr-1">
                  {getUpcomingBookings(maintenanceTarget.id).map(b => (
                    <div key={b.id} className="pt-2 first:pt-0">
                      <div className="font-bold text-amber-900 font-mono text-[10px]">{b.id} ({b.date} · {b.startTime})</div>
                      <div className="mt-0.5">Khách: {b.customerName} · Pet: {b.petName}</div>
                      <div className="text-[10px] font-bold text-amber-700">{b.serviceName}</div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="font-medium">
                Vui lòng xác nhận để đưa phòng vào bảo trì. Trạng thái phòng sẽ được cập nhật và bạn cần điều chuyển thủ công những lịch hẹn trên sang phòng khác trong phần chi tiết lịch hẹn.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-3">
              <button 
                onClick={confirmMaintenance}
                className="w-full btn-primary bg-amber-600 hover:bg-amber-700 text-white py-2 text-xs font-bold justify-center rounded-2xl"
              >
                Vẫn tiếp tục bảo trì
              </button>
              <button 
                onClick={() => setMaintenanceTarget(null)}
                className="w-full btn-secondary bg-white text-gray-700 border-gray-250 py-2 text-xs font-bold justify-center rounded-2xl"
              >
                Hủy bỏ & Reallocate trước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SLIDING RIGHT DRAWER FOR DETAILED ROOM PROFILE (360° View) --- */}
      {selectedRoom && (
        <div className="w-full md:w-96 shrink-0 bg-white rounded-3xl border border-gray-200 p-5 shadow-lg animate-slideIn flex flex-col justify-between space-y-4">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                  🏢 Chi tiết: {selectedRoom.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ROOM_CATEGORIES.find(c => c.id === selectedRoom.categoryId)?.color }} />
                  <span>{selectedRoom.categoryName}</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedRoom(null)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-gray-100 pb-0.5 text-xs font-bold text-gray-400 select-none shrink-0">
              <button 
                onClick={() => setActiveTab('config')}
                className={`flex-1 pb-2 flex items-center justify-center gap-1 border-b-2 transition-all ${activeTab === 'config' ? 'text-indigo-600 border-indigo-650' : 'border-transparent hover:text-gray-600'}`}
              >
                <Settings size={12} /> Cấu hình
              </button>
              <button 
                onClick={() => setActiveTab('schedule')}
                className={`flex-1 pb-2 flex items-center justify-center gap-1 border-b-2 transition-all ${activeTab === 'schedule' ? 'text-indigo-600 border-indigo-650' : 'border-transparent hover:text-gray-600'}`}
              >
                <Calendar size={12} /> Lịch sắp tới ({getUpcomingBookings(selectedRoom.id).length})
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 pb-2 flex items-center justify-center gap-1 border-b-2 transition-all ${activeTab === 'history' ? 'text-indigo-600 border-indigo-650' : 'border-transparent hover:text-gray-600'}`}
              >
                <History size={12} /> Lịch sử
              </button>
            </div>

            {/* TAB CONTENTS - Scrollable */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 pt-1 text-xs">
              
              {/* TAB 1: CONFIGURATION */}
              {activeTab === 'config' && (
                <form onSubmit={handleSaveRoomDetail} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide block">Tên phòng / Suite</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input text-xs py-1.5 rounded-lg w-full" 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide block">Sức chứa (pet)</label>
                      <input 
                        type="number" 
                        required 
                        min={1} 
                        className="form-input text-xs py-1.5 rounded-lg w-full" 
                        value={editCapacity} 
                        onChange={e => setEditCapacity(Number(e.target.value))} 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide block">Danh mục chuyên dụng</label>
                      <select 
                        required 
                        className="form-input text-xs py-1.5 rounded-lg w-full" 
                        value={editCatId} 
                        onChange={e => setEditCatId(e.target.value)}
                      >
                        {shopCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide block">Trạng thái phòng</label>
                    <select 
                      required 
                      className="form-input text-xs py-1.5 rounded-lg w-full" 
                      value={editStatus} 
                      onChange={e => setEditStatus(e.target.value as Room['status'])}
                    >
                      {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <option key={status} value={status}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {editStatus === 'maintenance' && selectedRoom.status !== 'maintenance' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2.5">
                      <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block flex items-center gap-1"><AlertTriangle size={12} /> Nhật ký lý do bảo trì</span>
                      <div className="space-y-2">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-extrabold text-amber-700 uppercase tracking-wide">Nguyên nhân / Lý do bảo trì</label>
                          <input 
                            type="text" 
                            className="form-input text-[11px] py-1 bg-white border-amber-200 text-amber-900" 
                            value={maintenanceReason} 
                            onChange={e => setMaintenanceReason(e.target.value)} 
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-extrabold text-amber-700 uppercase tracking-wide">Ghi chú chi tiết</label>
                          <input 
                            type="text" 
                            className="form-input text-[11px] py-1 bg-white border-amber-200 text-amber-900" 
                            value={maintenanceNote} 
                            onChange={e => setMaintenanceNote(e.target.value)} 
                            placeholder="Sửa bóng đèn, kiểm tra lỏng ốc..." 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide block">Trang thiết bị kèm theo (dấu phẩy cách)</label>
                    <textarea 
                      className="form-input text-xs py-1.5 rounded-lg min-h-16 resize-none w-full" 
                      value={editEquipment} 
                      onChange={e => setEditEquipment(e.target.value)} 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full btn-primary py-2.5 text-xs font-black justify-center rounded-2xl shadow-md flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <CheckCircle size={13} /> Lưu thông tin phòng
                  </button>
                </form>
              )}

              {/* TAB 2: FUTURE UPCOMING RESERVATIONS */}
              {activeTab === 'schedule' && (
                <div className="space-y-3">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">Timeline lịch sắp tới</span>
                  
                  {getUpcomingBookings(selectedRoom.id).length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-400 border border-dashed border-gray-150">
                      <div className="text-2xl mb-1.5">📅</div>
                      <p className="font-bold text-[11px]">Không có lịch hẹn đặt trước</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {getUpcomingBookings(selectedRoom.id).map(b => {
                        const isReallocatingThis = reallocateBookingId === b.id
                        const reallocOptions = getReallocateRoomOptions(selectedRoom.categoryId, selectedRoom.id)
                        
                        return (
                          <div key={b.id} className="bg-slate-50 border border-slate-150/60 rounded-2xl p-3 space-y-2 shadow-sm">
                            <div className="flex justify-between items-center border-b border-gray-200/50 pb-1.5">
                              <span className="font-mono font-black text-indigo-700">{b.id}</span>
                              <span className="text-[10px] text-gray-500 font-extrabold font-mono">{b.date} · {b.startTime}</span>
                            </div>
                            
                            <div className="font-semibold text-gray-700 text-[11px]">
                              <div>Thú cưng: <strong className="text-gray-900 font-extrabold">{b.petName}</strong> ({b.petBreed})</div>
                              <div>Chủ nuôi: <span className="font-bold text-gray-900">{b.customerName}</span></div>
                              <div className="text-[10px] text-indigo-900 font-bold mt-0.5">{b.serviceName}</div>
                            </div>

                            {/* Reallocation Workflow inline in schedule tab */}
                            {isReallocatingThis ? (
                              <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-2.5 space-y-2 mt-2">
                                <span className="text-[9px] font-black text-indigo-950 uppercase block">🔄 Chọn chuồng/phòng thay thế:</span>
                                <div className="flex gap-2">
                                  <select 
                                    className="form-input text-[11px] py-1 bg-white border-indigo-200 flex-1"
                                    value={reallocateTargetRoomId}
                                    onChange={e => setReallocateTargetRoomId(e.target.value)}
                                  >
                                    <option value="">-- Chọn phòng trống --</option>
                                    {reallocOptions.map(r => (
                                      <option key={r.id} value={r.id}>{r.name} ({STATUS_LABELS[r.status]})</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleExecuteReallocate(b.id)}
                                    disabled={!reallocateTargetRoomId}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-extrabold text-[10px] px-3.5 rounded-xl transition-all"
                                  >
                                    Đổi
                                  </button>
                                </div>
                                <button 
                                  onClick={() => setReallocateBookingId(null)}
                                  className="text-[9px] font-bold text-gray-400 hover:text-gray-600 underline block"
                                >
                                  Hủy bỏ
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end pt-1">
                                <button 
                                  onClick={() => { setReallocateBookingId(b.id); setReallocateTargetRoomId(''); }}
                                  className="text-[9px] font-black text-indigo-650 hover:text-indigo-800 bg-white border border-indigo-200 px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-0.5 transition-colors"
                                >
                                  <ArrowRight size={10} /> Đổi phòng nhanh
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ACTIVITY HISTORY & MAINTENANCE LOGS */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  
                  {/* Maintenance Logs */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wider block">🛠️ Nhật ký bảo trì phòng</span>
                    {!selectedRoom.maintenanceLogs || selectedRoom.maintenanceLogs.length === 0 ? (
                      <p className="text-[10px] text-gray-400 italic font-semibold">Chưa có lịch sử bảo trì.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 border border-gray-100 rounded-xl p-2 bg-slate-50/50">
                        {selectedRoom.maintenanceLogs.map(log => (
                          <div key={log.id} className="bg-white border border-gray-150 rounded-xl p-2.5 text-[10px] leading-normal font-semibold shadow-sm space-y-1">
                            <div className="flex justify-between font-bold text-amber-900 border-b border-gray-50 pb-1">
                              <span>Lý do: {log.reason}</span>
                              <span className="font-mono text-gray-400 text-[8px]">{log.startedAt}</span>
                            </div>
                            <div className="text-gray-600 mt-0.5">Yêu cầu bởi: <span className="font-bold">{log.requestedBy}</span></div>
                            {log.completedAt && (
                              <div className="text-emerald-700 font-bold">Hoàn thành: {log.completedAt}</div>
                            )}
                            <div className="text-gray-500 italic bg-gray-50/80 p-1.5 rounded-lg mt-1 border border-gray-100/50">"{log.note}"</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Past Serving History */}
                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    <span className="text-[9px] font-extrabold text-indigo-650 uppercase tracking-wider block">📜 Lịch sử phục vụ khách hàng</span>
                    {getPastBookings(selectedRoom.id).length === 0 && (!selectedRoom.servingHistory || selectedRoom.servingHistory.length === 0) ? (
                      <p className="text-[10px] text-gray-400 italic font-semibold">Chưa phục vụ lịch hẹn nào.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 border border-gray-100 rounded-xl p-2 bg-slate-50/50">
                        {/* Static history from room itself */}
                        {selectedRoom.servingHistory?.map((h, i) => (
                          <div key={`static-${i}`} className="bg-white border border-gray-150 rounded-xl p-2.5 text-[10px] leading-normal font-semibold shadow-sm">
                            <div className="flex justify-between font-bold text-indigo-900 border-b border-gray-50 pb-1">
                              <span>Pet: {h.petName}</span>
                              <span className="font-mono text-gray-400 text-[8px]">{h.date}</span>
                            </div>
                            <div className="text-gray-650 mt-1">Chủ: {h.customerName} · Dịch vụ: {h.serviceName}</div>
                            <div className="text-gray-400 font-mono text-[9px] mt-0.5">Thời gian: {h.checkinTime} {h.checkoutTime && `– ${h.checkoutTime}`}</div>
                          </div>
                        ))}
                        
                        {/* Dynamic serving history computed from BOOKING_MOCK_LIST */}
                        {getPastBookings(selectedRoom.id).map((h, i) => (
                          <div key={`dynamic-${i}`} className="bg-white border border-gray-150 rounded-xl p-2.5 text-[10px] leading-normal font-semibold shadow-sm mt-2 first:mt-0">
                            <div className="flex justify-between font-bold text-indigo-900 border-b border-gray-50 pb-1">
                              <span>Pet: {h.petName}</span>
                              <span className="font-mono text-gray-400 text-[8px]">{h.date}</span>
                            </div>
                            <div className="text-gray-650 mt-1">Chủ: {h.customerName} · Dịch vụ: {h.serviceName}</div>
                            <div className="text-gray-400 font-mono text-[9px] mt-0.5">Thời gian checkin: {h.startTime} – hoàn thành: {h.endTime}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Drawer footer closing */}
          <div className="pt-2 border-t border-gray-100 shrink-0">
            <button 
              type="button" 
              onClick={() => setSelectedRoom(null)} 
              className="w-full btn-secondary py-2 text-xs font-bold justify-center rounded-xl"
            >
              Đóng hồ sơ chi tiết
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
