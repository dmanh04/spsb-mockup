import { useState } from 'react'
import { Plus, Edit, MapPin, Phone, Users, CalendarCheck } from 'lucide-react'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { USER_MOCK_LIST } from '@/data/userMockData'
import { BOOKING_MOCK_LIST } from '@/data/bookingMockData'

const STATUS_COLORS: Record<string, string> = {
  active: 'badge-green', inactive: 'badge-gray', renovating: 'badge-orange',
}
const STATUS_LABELS: Record<string, string> = {
  active: 'Hoạt động', inactive: 'Tạm đóng', renovating: 'Đang sửa',
}

export default function ShopsPage() {
  const [selectedShop, setSelectedShop] = useState<string | null>(null)

  const shopsData = SHOP_MOCK_LIST.map(shop => ({
    ...shop,
    staffCount: USER_MOCK_LIST.filter(u => u.shopId === shop.id && u.role !== 'customer').length,
    todayBookings: BOOKING_MOCK_LIST.filter(b => b.shopId === shop.id && b.date === '2026-05-31').length,
    head: USER_MOCK_LIST.find(u => u.id === shop.shopHeadId),
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý Chi nhánh</h1>
          <p className="text-sm text-gray-500">{SHOP_MOCK_LIST.filter(s => s.status === 'active').length}/{SHOP_MOCK_LIST.length} chi nhánh đang hoạt động</p>
        </div>
        <button className="btn-primary"><Plus size={15} /> Thêm chi nhánh</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {shopsData.map(shop => (
          <div key={shop.id}
            onClick={() => setSelectedShop(selectedShop === shop.id ? null : shop.id)}
            className={`card p-5 cursor-pointer transition-all hover:shadow-lg ${selectedShop === shop.id ? 'border-primary-400 bg-primary-50/30' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900">{shop.name}</h3>
                <span className={STATUS_COLORS[shop.status]}>{STATUS_LABELS[shop.status]}</span>
              </div>
              <button className="text-gray-400 hover:text-primary-600 p-1"><Edit size={15} /></button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <span>{shop.address}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-gray-400" />
                <span>{shop.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs border-t pt-3">
              <div>
                <div className="font-bold text-gray-900">{shop.staffCount}</div>
                <div className="text-gray-400">Nhân viên</div>
              </div>
              <div>
                <div className="font-bold text-gray-900">{shop.todayBookings}</div>
                <div className="text-gray-400">Booking hôm nay</div>
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {shop.openTime}–{shop.closeTime}
                </div>
                <div className="text-gray-400">Giờ mở</div>
              </div>
            </div>

            {shop.head && (
              <div className="mt-3 pt-3 border-t flex items-center gap-2">
                <img src={shop.head.avatar} alt="" className="w-6 h-6 rounded-full" />
                <span className="text-xs text-gray-600">Quản lý: <strong>{shop.head.fullName}</strong></span>
              </div>
            )}

            {selectedShop === shop.id && (
              <div className="mt-4 pt-3 border-t space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Thông tin chi tiết</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>⏰ Giờ mở cửa: {shop.openTime} – {shop.closeTime}</div>
                  <div>📅 Tạo ngày: {shop.createdAt}</div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="btn-primary text-xs py-1.5 flex-1 justify-center">Xem chi tiết</button>
                  <button className="btn-secondary text-xs py-1.5">Sửa</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
