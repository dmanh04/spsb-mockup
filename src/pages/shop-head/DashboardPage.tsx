import { Link } from 'react-router-dom'
import { TrendingUp, CalendarCheck, Users, DoorOpen, AlertCircle, ArrowRight } from 'lucide-react'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_COLORS } from '@/data/bookingMockData'
import { USER_MOCK_LIST } from '@/data/userMockData'
import { LEAVE_REQUEST_MOCK_LIST } from '@/data/leaveRequestMockData'
import { ROOM_MOCK_LIST } from '@/data/roomMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'

const REVENUE_DATA = [
  { month: 'T1', value: 85 }, { month: 'T2', value: 92 }, { month: 'T3', value: 78 },
  { month: 'T4', value: 105 }, { month: 'T5', value: 118 }, { month: 'T6', value: 0 },
]

export default function ShopHeadDashboardPage() {
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'
  const todayStr = '2026-05-31'

  const shopBookings = BOOKING_MOCK_LIST.filter(b => b.shopId === shopId)
  const todayBookings = shopBookings.filter(b => b.date === todayStr)
  const staffList = USER_MOCK_LIST.filter(u => u.shopId === shopId && u.role !== 'shop_head')
  const pendingLeaves = LEAVE_REQUEST_MOCK_LIST.filter(l => l.shopId === shopId && l.status === 'pending')
  const shopRooms = ROOM_MOCK_LIST.filter(r => r.shopId === shopId)

  const todayRevenue = todayBookings
    .filter(b => b.status === 'paid')
    .reduce((sum, b) => sum + b.price, 0)

  const maxRevenue = Math.max(...REVENUE_DATA.map(d => d.value))

  const staffWorkload = staffList
    .filter(s => s.role === 'petcare_staff' || s.role === 'operation_staff')
    .map(s => ({
      ...s,
      bookings: todayBookings.filter(b => b.assignedStaffId === s.id).length,
    }))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Chi nhánh</h1>
        <p className="text-sm text-gray-500">{todayStr} · {currentUser?.position}</p>
      </div>

      {/* Alert: pending leave requests */}
      {pendingLeaves.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-orange-500 shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-orange-800">{pendingLeaves.length} đơn xin nghỉ</span>
            <span className="text-orange-600 ml-2">đang chờ duyệt</span>
          </div>
          <Link to="/shop-head/leave-requests" className="btn-primary text-xs py-1.5 shrink-0 bg-orange-500 hover:bg-orange-600">
            Xem ngay
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Booking hôm nay', value: todayBookings.length, icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Doanh thu hôm nay', value: formatPrice(todayRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Nhân viên', value: staffList.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Phòng trống', value: shopRooms.filter(r => r.status === 'available').length + '/' + shopRooms.length, icon: DoorOpen, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs font-medium text-gray-600 mt-1">{s.label}</div>
              </div>
              <s.icon size={18} className={s.color + ' opacity-60'} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Revenue chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-900">Doanh thu 6 tháng (triệu đồng)</h2>
          </div>
          <div className="p-4">
            <div className="flex items-end gap-2 h-24">
              {REVENUE_DATA.map(d => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400">{d.value > 0 ? d.value : ''}</span>
                  <div className="w-full bg-gray-100 rounded-t" style={{ height: 80 }}>
                    <div
                      className={`w-full rounded-t transition-all ${d.value === 0 ? 'bg-gray-200' : 'bg-primary-400'}`}
                      style={{ height: `${d.value > 0 ? (d.value / maxRevenue) * 100 : 5}%`, marginTop: `${d.value > 0 ? (1 - d.value / maxRevenue) * 80 : 76}px` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff workload */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Workload nhân viên hôm nay</h2>
            <Link to="/shop-head/staff" className="text-xs text-primary-600 hover:underline">Xem tất cả</Link>
          </div>
          <div className="divide-y">
            {staffWorkload.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">Không có nhân viên</div>
            ) : (
              staffWorkload.map(s => (
                <div key={s.id} className="px-4 py-3 flex items-center gap-3">
                  <img src={s.avatar} alt="" className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{s.fullName}</div>
                    <div className="text-xs text-gray-400">{s.position}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${s.bookings > 3 ? 'text-orange-500' : 'text-gray-700'}`}>
                      {s.bookings} booking
                    </div>
                    {s.bookings > 3 && <div className="text-[10px] text-orange-400">Bận</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Today bookings */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Booking hôm nay ({todayBookings.length})</h2>
          <Link to="/shop-head/bookings" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            Tất cả <ArrowRight size={11} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="table-th">Giờ</th>
                <th className="table-th">Thú cưng</th>
                <th className="table-th">Dịch vụ</th>
                <th className="table-th">Nhân viên</th>
                <th className="table-th">Phòng</th>
                <th className="table-th">Trạng thái</th>
                <th className="table-th">Giá</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {todayBookings.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="table-td font-mono text-xs">{b.startTime}</td>
                  <td className="table-td">
                    <div className="text-xs font-medium">{b.petName}</div>
                    <div className="text-xs text-gray-400">{b.petBreed}</div>
                  </td>
                  <td className="table-td text-xs">{b.serviceName}</td>
                  <td className="table-td text-xs">{b.assignedStaffName ?? <span className="text-orange-400">Chưa gán</span>}</td>
                  <td className="table-td text-xs">{b.roomName ?? <span className="text-orange-400">Chưa gán</span>}</td>
                  <td className="table-td"><span className={STATUS_COLORS[b.status]}>{STATUS_LABELS[b.status]}</span></td>
                  <td className="table-td text-xs font-medium">{formatPrice(b.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {todayBookings.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">Không có booking hôm nay</div>
          )}
        </div>
      </div>
    </div>
  )
}
