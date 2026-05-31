import { useState } from 'react'
import { Search, Filter, CalendarCheck } from 'lucide-react'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_COLORS } from '@/data/bookingMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'
import type { BookingStatus } from '@/types'

const ALL_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'checked_in', 'in_progress', 'completed', 'paid', 'cancelled', 'no_show']

export default function ShopHeadBookingsPage() {
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all')
  const [filterDate, setFilterDate] = useState('')

  const bookings = BOOKING_MOCK_LIST
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
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    paid: bookings.filter(b => b.status === 'paid').length,
    revenue: bookings.filter(b => b.status === 'paid').reduce((s, b) => s + b.price, 0),
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Booking Chi nhánh</h1>
        <p className="text-sm text-gray-500">{BOOKING_MOCK_LIST.filter(b => b.shopId === shopId).length} booking tổng cộng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Tổng booking', value: stats.total, color: 'text-blue-600' },
          { label: 'Chờ duyệt', value: stats.pending, color: 'text-orange-500' },
          { label: 'Đã thanh toán', value: stats.paid, color: 'text-green-600' },
          { label: 'Doanh thu', value: formatPrice(stats.revenue), color: 'text-primary-600' },
        ].map(s => (
          <div key={s.label} className="card p-3">
            <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9 text-sm" placeholder="Tìm mã, tên, SĐT..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input w-auto text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value as BookingStatus | 'all')}>
          <option value="all">Tất cả trạng thái</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <input type="date" className="form-input w-auto text-sm" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        {(filterStatus !== 'all' || filterDate || search) && (
          <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterDate('') }} className="btn-secondary text-sm py-2">Xóa bộ lọc</button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th">Mã / Ngày</th>
              <th className="table-th">Thú cưng & Khách</th>
              <th className="table-th">Dịch vụ</th>
              <th className="table-th">Giờ</th>
              <th className="table-th">Nhân viên</th>
              <th className="table-th">Phòng</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th text-right">Giá</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bookings.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="table-td">
                  <div className="font-mono text-xs font-bold text-primary-600">{b.id}</div>
                  <div className="text-xs text-gray-400">{b.date}</div>
                </td>
                <td className="table-td">
                  <div className="text-sm font-medium text-gray-900">{b.petName}</div>
                  <div className="text-xs text-gray-400">{b.customerName} · {b.customerPhone}</div>
                </td>
                <td className="table-td text-xs">{b.serviceName}</td>
                <td className="table-td font-mono text-xs">{b.startTime}</td>
                <td className="table-td text-xs">{b.assignedStaffName ?? <span className="text-orange-400">Chưa gán</span>}</td>
                <td className="table-td text-xs">{b.roomName ?? <span className="text-orange-400">—</span>}</td>
                <td className="table-td"><span className={STATUS_COLORS[b.status]}>{STATUS_LABELS[b.status]}</span></td>
                <td className="table-td text-right text-xs font-bold">{formatPrice(b.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div className="p-8 text-center">
            <CalendarCheck size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">Không có booking nào</p>
          </div>
        )}
      </div>
    </div>
  )
}
