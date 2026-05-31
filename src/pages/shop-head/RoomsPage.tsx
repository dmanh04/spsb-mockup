import { useState } from 'react'
import { Plus, Wrench, CheckCircle, X, ShieldAlert, AlertTriangle } from 'lucide-react'
import { ROOM_MOCK_LIST, ROOM_CATEGORIES, saveRooms } from '@/data/roomMockData'
import { BOOKING_MOCK_LIST } from '@/data/bookingMockData'
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

  function handleToggleMaintenance(room: Room) {
    if (room.status === 'maintenance') {
      // Bring back to available
      const updated = rooms.map(r => r.id === room.id ? { ...r, status: 'available' as const } : r)
      setRooms(updated)
      saveRooms(updated)
    } else {
      // Check upcoming bookings before putting to maintenance
      const activeBookings = getUpcomingBookings(room.id)
      if (activeBookings.length > 0) {
        // Show warnings sliding dialog or alert panel
        setMaintenanceTarget(room)
      } else {
        // Safe to maintain
        const updated = rooms.map(r => r.id === room.id ? { ...r, status: 'maintenance' as const } : r)
        setRooms(updated)
        saveRooms(updated)
      }
    }
  }

  function confirmMaintenance() {
    if (!maintenanceTarget) return
    const updated = rooms.map(r => r.id === maintenanceTarget.id ? { ...r, status: 'maintenance' as const } : r)
    setRooms(updated)
    saveRooms(updated)
    setMaintenanceTarget(null)
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
            return (
              <div 
                key={room.id} 
                className={`bg-white rounded-3xl border border-gray-150 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  room.status === 'occupied' 
                    ? 'border-orange-200 bg-orange-50/10' 
                    : room.status === 'maintenance' 
                      ? 'border-gray-250 bg-gray-50/50 opacity-80' 
                      : 'hover:border-indigo-150'
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
                        <span key={eq} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">
                          {eq}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct Action Controls */}
                <div className="border-t border-gray-100 pt-3 flex gap-2">
                  {room.status === 'maintenance' ? (
                    <button 
                      onClick={() => handleToggleMaintenance(room)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle size={13} /> Sẵn sàng hoạt động
                    </button>
                  ) : room.status === 'available' ? (
                    <button 
                      onClick={() => handleToggleMaintenance(room)}
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

    </div>
  )
}
