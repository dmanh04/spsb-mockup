import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Download, Plus, Eye, Edit } from 'lucide-react'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_COLORS } from '@/data/bookingMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { formatPrice } from '@/utils/format'
import type { BookingStatus } from '@/types'

export default function BookingManagementPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all')
  const [filterShop, setFilterShop] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [bookings] = useState(BOOKING_MOCK_LIST)

  const filtered = bookings
    .filter(b => filterStatus === 'all' || b.status === filterStatus)
    .filter(b => filterShop === 'all' || b.shopId === filterShop)
    .filter(b => !filterDate || b.date === filterDate)
    .filter(b =>
      !search ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.petName.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.customerPhone.includes(search)
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const totalRevenue = filtered.filter(b => b.status === 'paid').reduce((s, b) => s + b.price, 0)

  const ALL_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'checked_in', 'in_progress', 'completed', 'paid', 'cancelled', 'no_show']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý Booking</h1>
          <p className="text-sm text-gray-500">{bookings.length} booking toàn hệ thống · Doanh thu lọc: <span className="font-bold text-primary-600">{formatPrice(totalRevenue)}</span></p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-sm py-2"><Download size={14} /> Xuất CSV</button>
          <button 
            onClick={() => navigate('/admin/bookings/new')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={14} /> Tạo booking
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9 text-sm" placeholder="Mã, tên, SĐT..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input w-auto text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value as BookingStatus | 'all')}>
          <option value="all">Tất cả trạng thái</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select className="form-input w-auto text-sm" value={filterShop} onChange={e => setFilterShop(e.target.value)}>
          <option value="all">Tất cả chi nhánh</option>
          {SHOP_MOCK_LIST.map(s => <option key={s.id} value={s.id}>{s.name.replace('PetCare ', '')}</option>)}
        </select>
        <input type="date" className="form-input w-auto text-sm" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
      </div>

      <p className="text-xs text-gray-500">{filtered.length} kết quả</p>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th">Mã</th>
              <th className="table-th">Chi nhánh</th>
              <th className="table-th">Thú cưng / Khách</th>
              <th className="table-th">Dịch vụ</th>
              <th className="table-th">Ngày / Giờ</th>
              <th className="table-th">Nhân viên</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th text-right">Giá</th>
              <th className="table-th text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="table-td font-mono text-xs text-indigo-600 font-bold hover:underline cursor-pointer" onClick={() => navigate(`/admin/bookings/${b.id}`)}>{b.id}</td>
                <td className="table-td text-xs">{SHOP_MOCK_LIST.find(s => s.id === b.shopId)?.name.replace('PetCare ', '')}</td>
                <td className="table-td">
                  <div className="text-xs font-medium">{b.petName} ({b.petBreed})</div>
                  <div className="text-xs text-gray-400">{b.customerName} · {b.customerPhone}</div>
                </td>
                <td className="table-td text-xs">{b.serviceName}</td>
                <td className="table-td text-xs">
                  <div>{b.date}</div>
                  <div className="text-gray-400 font-mono">{b.startTime}</div>
                </td>
                <td className="table-td text-xs">{b.assignedStaffName ?? <span className="text-orange-400">—</span>}</td>
                <td className="table-td"><span className={STATUS_COLORS[b.status]}>{STATUS_LABELS[b.status]}</span></td>
                <td className="table-td text-right text-xs font-bold">{formatPrice(b.price)}</td>
                <td className="table-td text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button 
                      onClick={() => navigate(`/admin/bookings/${b.id}`)}
                      className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                      title="Xem chi tiết & Điều phối"
                    >
                      <Eye size={13} />
                    </button>
                    <button 
                      onClick={() => navigate(`/admin/bookings/${b.id}/edit`)}
                      className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">Không có booking nào</div>
        )}
      </div>
    </div>
  )
}
