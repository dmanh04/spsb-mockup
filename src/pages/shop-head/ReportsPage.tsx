import { useState } from 'react'
import { Download, TrendingUp, Calendar, Users } from 'lucide-react'
import { BarChart, LineChart } from '@/components/shared/SVGChart'
import { BOOKING_MOCK_LIST, STATUS_LABELS } from '@/data/bookingMockData'
import { USER_MOCK_LIST } from '@/data/userMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'

const TABS = ['Doanh thu', 'Booking', 'Nhân viên']

export default function ShopHeadReportsPage() {
  const { currentUser } = useAuthContext()
  const [tab, setTab] = useState(0)
  const [period, setPeriod] = useState('month')

  const shopBookings = BOOKING_MOCK_LIST.filter(b => b.shopId === currentUser?.shopId)
  const shopRevenue = shopBookings.filter(b => b.status === 'paid').reduce((s, b) => s + b.price, 0)
  const staffList = USER_MOCK_LIST.filter(u => u.shopId === currentUser?.shopId && (u.role === 'petcare_staff' || u.role === 'operation_staff'))

  const WEEKLY_BOOKINGS = [
    { label: 'T2', value: 8 }, { label: 'T3', value: 12 }, { label: 'T4', value: 10 },
    { label: 'T5', value: 14 }, { label: 'T6', value: 18 }, { label: 'T7', value: 15 }, { label: 'CN', value: 10 },
  ]

  const DAILY_REVENUE = Array.from({ length: 7 }, (_, i) => ({
    label: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i],
    value: [12, 18, 14, 22, 26, 19, 13][i] ?? 0,
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Báo cáo Chi nhánh</h1>
          <p className="text-sm text-gray-500">Phân tích hoạt động chi nhánh {currentUser?.shopId}</p>
        </div>
        <div className="flex gap-2">
          <select className="form-input w-auto text-sm py-2" value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
          </select>
          <button className="btn-secondary text-sm py-2"><Download size={14} /> Xuất PDF</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Booking', value: shopBookings.length, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
          { label: 'Doanh thu', value: formatPrice(shopRevenue), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Nhân viên', value: staffList.length, icon: Users, color: 'text-purple-600 bg-purple-50' },
          { label: 'Rating', value: '4.8/5', icon: TrendingUp, color: 'text-yellow-600 bg-yellow-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.color.split(' ')[1]}`}>
            <div className={`text-xl font-black ${s.color.split(' ')[0]}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === i ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Revenue tab */}
      {tab === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Doanh thu theo ngày (triệu đồng)</h3>
            <BarChart data={DAILY_REVENUE.map(d => ({ ...d, color: '#10B981' }))} height={100} />
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Top dịch vụ</h3>
            <div className="space-y-3">
              {[
                { name: 'Spa Premium', revenue: 8600000, pct: 80 },
                { name: 'Cắt tỉa Full', revenue: 5200000, pct: 48 },
                { name: 'Tắm & Sấy', revenue: 3400000, pct: 31 },
              ].map(s => (
                <div key={s.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{s.name}</span>
                    <span className="font-bold">{formatPrice(s.revenue)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded h-1.5">
                    <div className="bg-primary-500 h-1.5 rounded" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking tab */}
      {tab === 1 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Booking theo ngày trong tuần</h3>
          <BarChart data={WEEKLY_BOOKINGS.map(d => ({ ...d, color: '#3B82F6' }))} height={100} />
        </div>
      )}

      {/* Staff tab */}
      {tab === 2 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Hiệu suất nhân viên</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="table-th">Nhân viên</th>
                  <th className="table-th">Booking</th>
                  <th className="table-th">Doanh thu</th>
                  <th className="table-th">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {staffList.slice(0, 5).map((s, i) => (
                  <tr key={s.id}>
                    <td className="table-td">{s.fullName}</td>
                    <td className="table-td">{[15, 12, 9, 7, 5][i]}</td>
                    <td className="table-td font-medium text-primary-600">{formatPrice([3200000, 2100000, 1400000, 900000, 600000][i])}</td>
                    <td className="table-td text-yellow-500 font-bold">★ {[4.9, 4.7, 4.8, 4.6, 4.5][i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
