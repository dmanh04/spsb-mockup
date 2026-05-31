import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, Phone, Calendar, Star, Briefcase, Award } from 'lucide-react'
import { USER_MOCK_LIST, ROLE_LABELS, ROLE_COLORS } from '@/data/userMockData'
import { BOOKING_MOCK_LIST } from '@/data/bookingMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'
import type { User } from '@/types'

export default function StaffPage() {
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'

  const [staffs] = useState<User[]>(() => USER_MOCK_LIST)
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('all')

  // Filter staff belonging to this shop (excluding shop head and customers)
  const shopStaffList = staffs
    .filter(u => u.shopId === shopId && u.role !== 'shop_head' && u.role !== 'customer')
    .filter(u => {
      const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          (u.position ?? '').toLowerCase().includes(search.toLowerCase())
      const matchTab = filterTab === 'all' || u.status === filterTab
      return matchSearch && matchTab
    })

  // --- Dynamic Stats calculation ---
  const todayStr = '2026-05-31'
  
  const getTodayBookingsCount = (staffId: string) =>
    BOOKING_MOCK_LIST.filter(b => b.assignedStaffId === staffId && b.date === todayStr).length

  const getCompletedBookingsCount = (staffId: string) =>
    BOOKING_MOCK_LIST.filter(b => b.assignedStaffId === staffId && (b.status === 'paid' || b.status === 'completed')).length

  const getStaffRating = (staffId: string) => {
    const ratings: Record<string, number> = { U020: 4.8, U021: 4.9, U022: 4.7, U010: 4.6 }
    return ratings[staffId] ?? 4.5
  }

  const getStaffTenureMonths = (hireDateStr?: string) => {
    if (!hireDateStr) return 0
    const hire = new Date(hireDateStr)
    const current = new Date('2026-05-31')
    return (current.getFullYear() - hire.getFullYear()) * 12 + (current.getMonth() - hire.getMonth())
  }

  return (
    <div className="space-y-5 min-h-[calc(100vh-140px)] animate-fadeIn">
      
      {/* Top Title bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nhân viên chi nhánh</h1>
          <p className="text-sm text-gray-500">
            Quản lý {shopStaffList.length} nhân sự thuộc văn phòng chi nhánh {shopId}
          </p>
        </div>
        <Link 
          to="/shop-head/staff/new"
          className="btn-primary flex items-center gap-1.5 shadow-md shadow-indigo-100"
        >
          <UserPlus size={15} /> Thêm nhân viên mới
        </Link>
      </div>

      {/* Filters and Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            className="form-input pl-9 text-xs rounded-xl focus:border-indigo-500" 
            placeholder="Tìm nhân viên theo tên hoặc chức danh..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>

        {/* Status Tabs */}
        <div className="flex bg-gray-150 p-1 rounded-xl w-fit">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'active', label: 'Hoạt động' },
            { id: 'inactive', label: 'Tạm nghỉ' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === tab.id 
                  ? 'bg-white shadow-sm text-gray-800' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Staff cards grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {shopStaffList.map(s => {
          const todayBookings = getTodayBookingsCount(s.id)
          const completedCount = getCompletedBookingsCount(s.id)
          const rating = getStaffRating(s.id)
          const tenure = getStaffTenureMonths(s.hireDate)

          return (
            <Link 
              key={s.id} 
              to={`/shop-head/staff/${s.id}/edit`}
              className={`bg-white rounded-3xl border border-gray-150 p-5 shadow-sm hover:shadow-md hover:border-indigo-150 cursor-pointer transition-all flex flex-col justify-between block group ${
                s.status === 'inactive' ? 'opacity-70 bg-gray-50/50' : ''
              }`}
            >
              <div>
                <div className="flex items-start gap-4">
                  <img 
                    src={s.avatar} 
                    alt={s.fullName} 
                    className="w-14 h-14 rounded-full border border-gray-200 object-cover shrink-0" 
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors text-base truncate block max-w-[130px]">
                        {s.fullName}
                      </span>
                      
                      <div className={`w-2 h-2 rounded-full shrink-0 ${s.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    </div>
                    
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">
                      {s.position || 'Nhân viên'}
                    </div>
                    
                    <span className={`text-[8px] font-black uppercase tracking-wider mt-1.5 px-2 py-0.5 rounded-full inline-block ${ROLE_COLORS[s.role]}`}>
                      {ROLE_LABELS[s.role]}
                    </span>
                  </div>
                </div>

                {/* Rating Stars */}
                {s.role === 'petcare_staff' && (
                  <div className="flex items-center gap-1 mt-3 bg-yellow-50/70 border border-yellow-100 rounded-xl px-2.5 py-1 w-fit">
                    <Star size={11} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-black text-yellow-700">{rating} · Chuyên nghiệp</span>
                  </div>
                )}

                {/* Dynamic Workplace Performance Indicators */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] border-t border-gray-100 pt-3.5 mt-4">
                  <div>
                    <div className="font-black text-gray-950 font-mono text-sm leading-none">{todayBookings}</div>
                    <div className="text-gray-400 font-bold uppercase tracking-wider text-[8px] mt-1.5">Lịch hôm nay</div>
                  </div>
                  <div>
                    <div className="font-black text-gray-950 font-mono text-sm leading-none">{completedCount}</div>
                    <div className="text-gray-400 font-bold uppercase tracking-wider text-[8px] mt-1.5">Đã hoàn tất</div>
                  </div>
                  <div>
                    <div className="font-black text-gray-950 font-mono text-sm leading-none">
                      {tenure > 12 ? `${Math.floor(tenure / 12)}n ${tenure % 12}th` : `${tenure} tháng`}
                    </div>
                    <div className="text-gray-400 font-bold uppercase tracking-wider text-[8px] mt-1.5">Thâm niên</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-[10px] font-bold text-gray-400 font-mono border-t border-gray-100/50 pt-2 flex items-center justify-between">
                <span>📞 {s.phone}</span>
                <span className="opacity-80">Vào làm: {s.hireDate || '—'}</span>
              </div>
            </Link>
          )
        })}
      </div>

      {shopStaffList.length === 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-sm font-bold">Không tìm thấy tài khoản nhân viên nào</p>
        </div>
      )}

    </div>
  )
}
