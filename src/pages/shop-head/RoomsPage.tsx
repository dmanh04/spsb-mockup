import { useState } from 'react'
import { Plus, Wrench, CheckCircle } from 'lucide-react'
import { ROOM_MOCK_LIST, ROOM_CATEGORIES } from '@/data/roomMockData'
import { useAuthContext } from '@/auth/AuthContext'

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
  const [selectedCat, setSelectedCat] = useState<string | null>(null)

  const shopCategories = ROOM_CATEGORIES.filter(c => c.shopId === shopId)
  const shopRooms = ROOM_MOCK_LIST
    .filter(r => r.shopId === shopId)
    .filter(r => !selectedCat || r.categoryId === selectedCat)

  const available = ROOM_MOCK_LIST.filter(r => r.shopId === shopId && r.status === 'available').length
  const total = ROOM_MOCK_LIST.filter(r => r.shopId === shopId).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý phòng</h1>
          <p className="text-sm text-gray-500">{available}/{total} phòng đang trống</p>
        </div>
        <button className="btn-primary"><Plus size={15} /> Thêm phòng</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(STATUS_LABELS).map(([status, label]) => {
          const count = ROOM_MOCK_LIST.filter(r => r.shopId === shopId && r.status === status).length
          return (
            <div key={status} className="card p-3 text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${STATUS_DOT[status]}`} />
              <div className="text-xl font-black text-gray-900">{count}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          )
        })}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto">
        <button onClick={() => setSelectedCat(null)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${!selectedCat ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200'}`}>
          Tất cả
        </button>
        {shopCategories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${selectedCat === cat.id ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200'}`}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Rooms grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopRooms.map(room => (
          <div key={room.id} className={`card p-4 ${room.status === 'occupied' ? 'border-orange-200' : room.status === 'maintenance' ? 'border-gray-200 opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{room.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ROOM_CATEGORIES.find(c => c.id === room.categoryId)?.color }} />
                  <span className="text-xs text-gray-500">{room.categoryName}</span>
                </div>
              </div>
              <span className={STATUS_COLORS[room.status]}>{STATUS_LABELS[room.status]}</span>
            </div>

            <div className="text-xs text-gray-500 mb-3">
              Sức chứa: {room.capacity} thú cưng
            </div>

            {room.equipment.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {room.equipment.map(eq => (
                  <span key={eq} className="badge-gray text-[10px]">{eq}</span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {room.status === 'maintenance' ? (
                <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100">
                  <CheckCircle size={12} /> Đánh dấu sẵn sàng
                </button>
              ) : room.status === 'available' ? (
                <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100">
                  <Wrench size={12} /> Bảo trì
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
