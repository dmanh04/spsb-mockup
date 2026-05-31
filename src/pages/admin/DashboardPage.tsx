import { TrendingUp, Users, CalendarCheck, Package, Store } from 'lucide-react'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_COLORS } from '@/data/bookingMockData'
import { ORDER_MOCK_LIST, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/data/orderMockData'
import { USER_MOCK_LIST, ROLE_LABELS, ROLE_COLORS } from '@/data/userMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { formatPrice } from '@/utils/format'

const REVENUE_BY_SHOP = [
  { shopId: 'SH01', revenue: 118500000 },
  { shopId: 'SH02', revenue: 89200000 },
  { shopId: 'SH03', revenue: 62800000 },
]

export default function AdminDashboardPage() {
  const totalRevenue = REVENUE_BY_SHOP.reduce((s, b) => s + b.revenue, 0)
  const totalBookings = BOOKING_MOCK_LIST.length
  const totalUsers = USER_MOCK_LIST.filter(u => u.role === 'customer').length
  const activeShops = SHOP_MOCK_LIST.filter(s => s.status === 'active').length

  const recentBookings = [...BOOKING_MOCK_LIST].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
  const recentOrders = [...ORDER_MOCK_LIST].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)

  const usersByRole = Object.entries(
    USER_MOCK_LIST.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Hệ thống</h1>
        <p className="text-sm text-gray-500">Tổng quan toàn bộ hệ thống PetCare</p>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng doanh thu tháng 5', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Tổng booking', value: totalBookings, icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Khách hàng', value: totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Chi nhánh hoạt động', value: `${activeShops}/${SHOP_MOCK_LIST.length}`, icon: Store, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs font-medium text-gray-600 mt-1">{s.label}</div>
              </div>
              <s.icon size={18} className={s.color + ' opacity-60'} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Revenue by branch */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={14} /> Doanh thu theo chi nhánh
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {REVENUE_BY_SHOP.map(item => {
              const shop = SHOP_MOCK_LIST.find(s => s.id === item.shopId)
              const pct = Math.round((item.revenue / totalRevenue) * 100)
              return (
                <div key={item.shopId}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium">{shop?.name.replace('PetCare ', '')}</span>
                    <span className="font-bold text-gray-900">{formatPrice(item.revenue)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{pct}% tổng doanh thu</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Users by role */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Users size={14} /> Người dùng theo role
            </h2>
          </div>
          <div className="divide-y">
            {usersByRole.map(([role, count]) => (
              <div key={role} className="px-4 py-2.5 flex items-center justify-between">
                <span className={`${ROLE_COLORS[role as keyof typeof ROLE_COLORS] ?? 'badge-gray'}`}>{ROLE_LABELS[role] ?? role}</span>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Package size={14} /> Đơn hàng gần đây
            </h2>
          </div>
          <div className="divide-y">
            {recentOrders.map(o => (
              <div key={o.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono text-xs text-primary-600">{o.id}</span>
                  <span className={ORDER_STATUS_COLORS[o.status]}>{ORDER_STATUS_LABELS[o.status]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{o.customerName}</span>
                  <span className="text-xs font-bold text-gray-900">{formatPrice(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-900">Booking gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="table-th">Mã</th>
                <th className="table-th">Thú cưng / Khách</th>
                <th className="table-th">Dịch vụ</th>
                <th className="table-th">Ngày</th>
                <th className="table-th">Giá</th>
                <th className="table-th">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentBookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="table-td font-mono text-xs text-primary-600">{b.id}</td>
                  <td className="table-td">
                    <div className="text-xs font-medium">{b.petName}</div>
                    <div className="text-xs text-gray-400">{b.customerName}</div>
                  </td>
                  <td className="table-td text-xs">{b.serviceName}</td>
                  <td className="table-td text-xs">{b.date} {b.startTime}</td>
                  <td className="table-td text-xs font-medium">{formatPrice(b.price)}</td>
                  <td className="table-td"><span className={STATUS_COLORS[b.status]}>{STATUS_LABELS[b.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
