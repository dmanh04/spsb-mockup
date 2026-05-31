import { useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { USER_MOCK_LIST, ROLE_LABELS, ROLE_COLORS } from '@/data/userMockData'
import { BOOKING_MOCK_LIST } from '@/data/bookingMockData'
import { useAuthContext } from '@/auth/AuthContext'

export default function StaffPage() {
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'
  const [search, setSearch] = useState('')

  const staffList = USER_MOCK_LIST
    .filter(u => u.shopId === shopId && u.role !== 'shop_head' && u.role !== 'customer' && u.role !== 'admin')
    .filter(u => !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || (u.position ?? '').toLowerCase().includes(search.toLowerCase()))

  const todayStr = '2026-05-31'
  const todayBookingsByStaff = (staffId: string) =>
    BOOKING_MOCK_LIST.filter(b => b.assignedStaffId === staffId && b.date === todayStr).length

  const completedByStaff = (staffId: string) =>
    BOOKING_MOCK_LIST.filter(b => b.assignedStaffId === staffId && (b.status === 'paid' || b.status === 'completed')).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nhân viên chi nhánh</h1>
          <p className="text-sm text-gray-500">{staffList.length} nhân viên</p>
        </div>
        <button className="btn-primary"><UserPlus size={15} /> Thêm nhân viên</button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="form-input pl-9" placeholder="Tìm theo tên, chức vụ..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.map(s => (
          <div key={s.id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <img src={s.avatar} alt="" className="w-12 h-12 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{s.fullName}</div>
                <div className="text-xs text-gray-500">{s.position}</div>
                <span className={`${ROLE_COLORS[s.role]} text-[10px] mt-1`}>{ROLE_LABELS[s.role]}</span>
              </div>
              <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${s.status === 'active' ? 'bg-green-400' : 'bg-gray-300'}`} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs border-t pt-3">
              <div>
                <div className="font-bold text-gray-900">{todayBookingsByStaff(s.id)}</div>
                <div className="text-gray-400">Hôm nay</div>
              </div>
              <div>
                <div className="font-bold text-gray-900">{completedByStaff(s.id)}</div>
                <div className="text-gray-400">Đã xong</div>
              </div>
              <div>
                <div className={`font-bold ${s.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                  {s.status === 'active' ? 'Hoạt động' : 'Nghỉ'}
                </div>
                <div className="text-gray-400">Trạng thái</div>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-400">
              📞 {s.phone} · Vào làm: {s.hireDate}
            </div>
          </div>
        ))}
      </div>

      {staffList.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">👥</div>
          <p className="text-sm">Không tìm thấy nhân viên</p>
        </div>
      )}
    </div>
  )
}
