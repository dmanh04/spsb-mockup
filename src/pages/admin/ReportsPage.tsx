import { useState } from 'react'
import { Download, TrendingUp, CalendarCheck, Users, Package } from 'lucide-react'
import { BarChart, LineChart, DonutChart } from '@/components/shared/SVGChart'
import { BOOKING_MOCK_LIST, STATUS_LABELS } from '@/data/bookingMockData'
import { USER_MOCK_LIST } from '@/data/userMockData'
import { ORDER_MOCK_LIST } from '@/data/orderMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { formatPrice } from '@/utils/format'

const TABS = ['Doanh thu', 'Booking', 'Khách hàng', 'Nhân viên']

const MONTHLY_REVENUE = [
  { label: 'T1', value: 85, color: '#3B82F6' }, { label: 'T2', value: 92, color: '#3B82F6' },
  { label: 'T3', value: 78, color: '#3B82F6' }, { label: 'T4', value: 105, color: '#3B82F6' },
  { label: 'T5', value: 118, color: '#10B981' }, { label: 'T6', value: 8, color: '#D1D5DB' },
]

const WEEKLY_BOOKINGS = [
  { label: 'T2', value: 12 }, { label: 'T3', value: 18 }, { label: 'T4', value: 15 },
  { label: 'T5', value: 22 }, { label: 'T6', value: 28 }, { label: 'T7', value: 35 }, { label: 'CN', value: 30 },
]

export default function AdminReportsPage() {
  const [tab, setTab] = useState(0)
  const [period, setPeriod] = useState('month')

  const totalRevenue = MONTHLY_REVENUE.reduce((s, d) => s + d.value, 0) * 1000000
  const bookingsByStatus = Object.entries(
    BOOKING_MOCK_LIST.reduce((acc, b) => { acc[b.status] = (acc[b.status] ?? 0) + 1; return acc }, {} as Record<string, number>)
  ).map(([status, count]) => ({ label: STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status, value: count, color: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#6B7280', '#EF4444', '#EC4899', '#14B8A6'][Object.keys(BOOKING_MOCK_LIST.reduce((acc, b) => { acc[b.status] = 1; return acc }, {} as Record<string, number>)).indexOf(status)] }))

  const revenueByShop = SHOP_MOCK_LIST.map((shop, i) => ({
    label: shop.name.replace('PetCare Chi nhánh ', ''),
    value: [118, 89, 63][i] ?? 0,
    color: ['#3B82F6', '#10B981', '#F59E0B'][i],
  }))

  const newUsersMonthly = [
    { label: 'T1', value: 23 }, { label: 'T2', value: 31 }, { label: 'T3', value: 19 },
    { label: 'T4', value: 42 }, { label: 'T5', value: 38 }, { label: 'T6', value: 5 },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Báo cáo Hệ thống</h1>
          <p className="text-sm text-gray-500">Phân tích toàn bộ hệ thống PetCare</p>
        </div>
        <div className="flex gap-2">
          <select className="form-input w-auto text-sm py-2" value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm 2026</option>
          </select>
          <button className="btn-secondary text-sm py-2"><Download size={14} /> Xuất Excel</button>
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng doanh thu', value: formatPrice(totalRevenue), change: '+12.5%', up: true, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Tổng booking', value: BOOKING_MOCK_LIST.length, change: '+8.3%', up: true, icon: CalendarCheck, color: 'text-blue-600 bg-blue-50' },
          { label: 'Khách hàng mới', value: 38, change: '-2.1%', up: false, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Đơn hàng', value: ORDER_MOCK_LIST.length, change: '+15.2%', up: true, icon: Package, color: 'text-orange-600 bg-orange-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.color.split(' ')[1]}`}>
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2 rounded-xl ${s.color.split(' ')[1]}`}><s.icon size={16} className={s.color.split(' ')[0]} /></div>
              <span className={`text-xs font-semibold ${s.up ? 'text-green-600' : 'text-red-500'}`}>{s.change}</span>
            </div>
            <div className={`text-xl font-black ${s.color.split(' ')[0]}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === i ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Revenue tab */}
      {tab === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Doanh thu theo tháng (triệu đồng)</h3>
            <BarChart data={MONTHLY_REVENUE} height={100} unit="M" />
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Doanh thu theo chi nhánh (triệu đồng)</h3>
            <BarChart data={revenueByShop} height={100} unit="M" />
          </div>
          <div className="card p-5 md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Xu hướng doanh thu</h3>
            <p className="text-xs text-gray-400 mb-4">Tháng 1–5/2026</p>
            <LineChart data={MONTHLY_REVENUE} color="#3B82F6" height={80} />
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Top dịch vụ theo doanh thu</h3>
            <div className="space-y-3">
              {[
                { name: 'Spa Premium', revenue: 28600000, pct: 85 },
                { name: 'Cắt tỉa Full', revenue: 19200000, pct: 57 },
                { name: 'Cắt tỉa & Tắm', revenue: 15400000, pct: 46 },
                { name: 'Tắm & Sấy', revenue: 9800000, pct: 29 },
              ].map(s => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{s.name}</span>
                    <span className="font-semibold">{formatPrice(s.revenue)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Phương thức thanh toán</h3>
            <DonutChart data={[
              { label: 'MoMo', value: 42, color: '#EC4899' },
              { label: 'Chuyển khoản', value: 28, color: '#3B82F6' },
              { label: 'Tiền mặt', value: 19, color: '#10B981' },
              { label: 'Thẻ ngân hàng', value: 11, color: '#F59E0B' },
            ]} />
          </div>
        </div>
      )}

      {/* Booking tab */}
      {tab === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Booking theo ngày trong tuần</h3>
            <BarChart data={WEEKLY_BOOKINGS} height={100} />
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Trạng thái booking</h3>
            <DonutChart data={bookingsByStatus.filter(b => b.value > 0)} />
          </div>
          <div className="card p-5 md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Booking theo chi nhánh</h3>
            <BarChart data={SHOP_MOCK_LIST.map((shop, i) => ({
              label: shop.name.replace('PetCare Chi nhánh ', ''),
              value: [28, 19, 14][i] ?? 0,
              color: ['#3B82F6', '#10B981', '#F59E0B'][i],
            }))} height={80} />
          </div>
        </div>
      )}

      {/* Customers tab */}
      {tab === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Khách hàng mới theo tháng</h3>
            <BarChart data={newUsersMonthly.map(d => ({ ...d, color: '#8B5CF6' }))} height={100} />
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Phân loại khách hàng</h3>
            <DonutChart data={[
              { label: 'Khách hàng thân thiết (>3 lần)', value: 18, color: '#3B82F6' },
              { label: 'Khách thường xuyên (2–3 lần)', value: 25, color: '#10B981' },
              { label: 'Khách mới (1 lần)', value: 42, color: '#F59E0B' },
            ]} />
          </div>
          <div className="card p-5 md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Top khách hàng chi tiêu nhiều nhất</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="table-th">#</th>
                    <th className="table-th">Khách hàng</th>
                    <th className="table-th">Số lần booking</th>
                    <th className="table-th">Tổng chi tiêu</th>
                    <th className="table-th">Lần cuối</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {USER_MOCK_LIST.filter(u => u.role === 'customer').slice(0, 5).map((u, i) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="table-td">
                        <span className={`text-sm font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300'}`}>#{i + 1}</span>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <img src={u.avatar} alt="" className="w-7 h-7 rounded-full" />
                          <div>
                            <div className="text-sm font-medium">{u.fullName}</div>
                            <div className="text-xs text-gray-400">{u.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-td text-sm font-bold">{[5, 4, 3, 2, 1][i]}</td>
                      <td className="table-td text-sm font-bold text-primary-600">{formatPrice([2450000, 1890000, 1320000, 890000, 450000][i])}</td>
                      <td className="table-td text-xs text-gray-400">{u.lastLogin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Staff tab */}
      {tab === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Số booking theo nhân viên</h3>
            <BarChart data={USER_MOCK_LIST.filter(u => u.role === 'petcare_staff').map((u, i) => ({
              label: u.fullName.split(' ').slice(-1)[0],
              value: [15, 12, 9, 7][i] ?? 0,
              color: '#10B981',
            }))} height={80} />
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Hiệu suất nhân viên tháng 5</h3>
            <div className="space-y-3">
              {USER_MOCK_LIST.filter(u => u.role === 'petcare_staff').slice(0, 4).map((u, i) => {
                const done = [15, 12, 9, 7][i]
                const rating = [4.9, 4.7, 4.8, 4.6][i]
                return (
                  <div key={u.id} className="flex items-center gap-3">
                    <img src={u.avatar} alt="" className="w-8 h-8 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{u.fullName}</span>
                        <span className="text-xs text-yellow-500 font-bold">★ {rating}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(done / 15) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{done} booking</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
