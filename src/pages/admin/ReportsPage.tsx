import React, { useState, useMemo } from 'react'
import { 
  Download, TrendingUp, CalendarCheck, Users, Package, 
  MapPin, Star, ShieldAlert, Activity, ClipboardList, Info 
} from 'lucide-react'
import { BarChart, LineChart, DonutChart } from '@/components/shared/SVGChart'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_BG } from '@/data/bookingMockData'
import { USER_MOCK_LIST } from '@/data/userMockData'
import { ORDER_MOCK_LIST } from '@/data/orderMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { PET_MOCK_LIST } from '@/data/petMockData'
import { ROOM_MOCK_LIST } from '@/data/roomMockData'
import { formatPrice } from '@/utils/format'

const TABS = ['Doanh thu & Bán lẻ', 'Booking & Vận hành', 'Khách hàng & Thú cưng', 'Nhân sự & Đánh giá']

const WEEKLY_BOOKINGS = [
  { label: 'T2', value: 8 },
  { label: 'T3', value: 12 },
  { label: 'T4', value: 10 },
  { label: 'T5', value: 14 },
  { label: 'T6', value: 18 },
  { label: 'T7', value: 15 },
  { label: 'CN', value: 10 },
]

export default function AdminReportsPage() {
  const [tab, setTab] = useState(0)
  const [filterShop, setFilterShop] = useState('all')
  const [period, setPeriod] = useState('month')

  // --- 1. DYNAMIC COMPILATION OF DATA DEPENDING ON FILTERS ---
  
  // Filtered Bookings based on shop
  const filteredBookings = useMemo(() => {
    return BOOKING_MOCK_LIST.filter(b => filterShop === 'all' || b.shopId === filterShop)
  }, [filterShop])

  // Filtered Orders based on shop
  const filteredOrders = useMemo(() => {
    return ORDER_MOCK_LIST.filter(o => filterShop === 'all' || o.shopId === filterShop)
  }, [filterShop])

  // Aggregate Total Revenues (Dynamic combination of paid Bookings + paid Orders)
  const stats = useMemo(() => {
    const bookingRev = filteredBookings
      .filter(b => ['completed', 'paid'].includes(b.status))
      .reduce((sum, b) => sum + b.price, 0)

    const productRev = filteredOrders
      .filter(o => ['paid', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + o.total, 0)

    const completedBookings = filteredBookings.filter(b => ['completed', 'paid'].includes(b.status)).length
    const totalBookings = filteredBookings.length
    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 100

    const newCustomersCount = USER_MOCK_LIST.filter(
      u => u.role === 'customer' && u.status === 'active' && u.createdAt.startsWith('2025')
    ).length

    return {
      bookingRevenue: bookingRev,
      productRevenue: productRev,
      totalRevenue: bookingRev + productRev,
      bookingsCount: totalBookings,
      completionRate,
      newCustomers: newCustomersCount,
      ordersCount: filteredOrders.length
    }
  }, [filteredBookings, filteredOrders])

  // --- 2. MULTI-TAB CHART DATA GENERATORS ---

  // Tab 1: Monthly Revenues chart (combines static target trend and shop ratios)
  const monthlyRevenueData = useMemo(() => {
    // Dynamic variance based on shop
    const factor = filterShop === 'all' ? 1.0 : filterShop === 'SH01' ? 0.45 : filterShop === 'SH02' ? 0.35 : 0.2
    return [
      { label: 'T1', value: Math.round(85 * factor), color: '#3B82F6' },
      { label: 'T2', value: Math.round(92 * factor), color: '#3B82F6' },
      { label: 'T3', value: Math.round(78 * factor), color: '#3B82F6' },
      { label: 'T4', value: Math.round(105 * factor), color: '#3B82F6' },
      { label: 'T5', value: Math.round((stats.totalRevenue / 1000000)), color: '#10B981' },
      { label: 'T6', value: Math.round(112 * factor), color: '#D1D5DB' },
    ]
  }, [filterShop, stats.totalRevenue])

  // Tab 1: Revenues contribution by Shop
  const revenueByShopData = useMemo(() => {
    return SHOP_MOCK_LIST.map((shop, idx) => {
      const shopBookings = BOOKING_MOCK_LIST.filter(b => b.shopId === shop.id && ['completed', 'paid'].includes(b.status))
      const shopOrders = ORDER_MOCK_LIST.filter(o => o.shopId === shop.id && ['paid', 'delivered'].includes(o.status))
      
      const rev = shopBookings.reduce((sum, b) => sum + b.price, 0) + shopOrders.reduce((sum, o) => sum + o.total, 0)
      
      return {
        label: shop.name.replace('PetCare Chi nhánh ', 'CN '),
        value: Math.round(rev / 1000), // in thousand VND for chart
        color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][idx] || '#6B7280'
      }
    })
  }, [])

  // Tab 2: Bookings status Donut chart
  const bookingsStatusData = useMemo(() => {
    const counts = filteredBookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)

    const colors: Record<string, string> = {
      pending: '#F59E0B',
      confirmed: '#3B82F6',
      checked_in: '#06B6D4',
      in_progress: '#8B5CF6',
      completed: '#10B981',
      paid: '#6B7280',
      cancelled: '#EF4444',
      no_show: '#EC4899',
    }

    return Object.entries(counts).map(([status, count]) => ({
      label: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
      value: count,
      color: colors[status] || '#9CA3AF'
    }))
  }, [filteredBookings])

  // Tab 2: Room occupancy rate (dynamic from roomMockData)
  const roomOccupancyData = useMemo(() => {
    const shopRooms = ROOM_MOCK_LIST.filter(r => filterShop === 'all' || r.shopId === filterShop)
    const total = shopRooms.length
    const occupied = shopRooms.filter(r => r.status === 'occupied').length
    const maintenance = shopRooms.filter(r => r.status === 'maintenance').length
    const available = total - occupied - maintenance

    return {
      total,
      occupied,
      maintenance,
      available,
      rate: total > 0 ? Math.round((occupied / total) * 100) : 0
    }
  }, [filterShop])

  // Tab 3: Pet species composition donut
  const petSpeciesData = useMemo(() => {
    const dogs = PET_MOCK_LIST.filter(p => p.species === 'dog').length
    const cats = PET_MOCK_LIST.filter(p => p.species === 'cat').length
    const others = PET_MOCK_LIST.filter(p => p.species === 'other').length

    return [
      { label: '🐕 Chó cảnh', value: dogs, color: '#3B82F6' },
      { label: '🐈 Mèo cảnh', value: cats, color: '#10B981' },
      { label: '🐿️ Thú cưng khác', value: others, color: '#F59E0B' }
    ]
  }, [])

  // Tab 3: Top spending customers table listing
  const topCustomers = useMemo(() => {
    return USER_MOCK_LIST.filter(u => u.role === 'customer').slice(0, 5).map((user, idx) => {
      const customerBookings = BOOKING_MOCK_LIST.filter(b => b.customerId === user.id)
      const customerOrders = ORDER_MOCK_LIST.filter(o => o.customerId === user.id)
      
      const totalSpends = customerBookings.reduce((s, b) => s + b.price, 0) + customerOrders.reduce((s, o) => s + o.total, 0)
      const bookingCount = customerBookings.length
      
      return {
        ...user,
        bookingCount,
        totalSpends
      }
    }).sort((a, b) => b.totalSpends - a.totalSpends)
  }, [])

  // Tab 4: Staff performance matrix (bookings completed, ratings)
  const staffPerformance = useMemo(() => {
    return USER_MOCK_LIST.filter(u => u.role === 'petcare_staff').map((staff, idx) => {
      const doneBookings = BOOKING_MOCK_LIST.filter(
        b => b.assignedStaffId === staff.id && ['completed', 'paid'].includes(b.status)
      )
      
      const doneCount = doneBookings.length
      const rating = [4.9, 4.8, 4.7, 4.6][idx] || 4.5

      return {
        ...staff,
        doneCount,
        rating
      }
    }).sort((a, b) => b.doneCount - a.doneCount)
  }, [])

  return (
    <div className="space-y-6 text-sm animate-fadeIn pb-12">
      {/* Header section with Dynamic Filters */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-100 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Báo cáo & Phân tích Hệ thống</h1>
          <p className="text-gray-500 mt-1 font-medium">
            Phân tích số dư doanh thu, công suất phòng và hiệu suất chuỗi cửa hàng PetCare
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Shop Filter dropdown */}
          <select 
            value={filterShop} 
            onChange={e => setFilterShop(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-semibold"
          >
            <option value="all">Tất cả chi nhánh</option>
            {SHOP_MOCK_LIST.map(s => (
              <option key={s.id} value={s.id}>{s.name.replace('PetCare ', '')}</option>
            ))}
          </select>

          {/* Period Filter dropdown */}
          <select 
            value={period} 
            onChange={e => setPeriod(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-semibold"
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay (2026)</option>
          </select>

          {/* Export button */}
          <button className="flex items-center gap-2 bg-gray-950 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-md cursor-pointer hover:bg-gray-800 transition-colors">
            <Download size={15} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng doanh thu', value: formatPrice(stats.totalRevenue), change: '+12.5%', up: true, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'Lượt Booking hẹn', value: `${stats.bookingsCount} lượt`, change: '+8.3%', up: true, icon: CalendarCheck, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
          { label: 'Khách hàng thành viên', value: `${stats.newCustomers} khách`, change: '+5.4%', up: true, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-100' },
          { label: 'Tỉ lệ hoàn thành lịch', value: `${stats.completionRate}%`, change: '-1.2%', up: false, icon: Package, color: 'text-amber-600 bg-amber-50 border-amber-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-3xl border p-5 shadow-sm space-y-4 ${s.color}`}>
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-2xl bg-white shadow-sm`}><s.icon size={20} className={s.color.split(' ')[0]} /></div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 shadow-sm ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>{s.change}</span>
            </div>
            <div>
              <div className="text-lg font-black text-gray-900 tracking-tight">{s.value}</div>
              <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Tabs control bar */}
      <div className="flex gap-1.5 bg-gray-100 p-1.5 rounded-3xl w-full md:w-max">
        {TABS.map((t, idx) => (
          <button 
            key={idx} 
            onClick={() => setTab(idx)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
              tab === idx 
                ? 'bg-white shadow-md text-gray-900' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* TAB 1: DOANH THU & BÁN LẺ */}
      {tab === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideIn">
          {/* Monthly sales chart */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-500" />
              Doanh thu tổng hợp theo tháng (triệu đồng)
            </h3>
            <div className="pt-2">
              <BarChart data={monthlyRevenueData} height={110} unit="M" />
            </div>
          </div>

          {/* Sales by branches chart */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <MapPin size={16} className="text-indigo-500" />
              Phân bổ doanh thu theo Chi nhánh (nghìn đồng)
            </h3>
            <div className="pt-2">
              <BarChart data={revenueByShopData} height={110} unit="K" />
            </div>
          </div>

          {/* Dynamic Sales Trendline */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3 md:col-span-2">
            <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
              📈 Biểu đồ Xu hướng dòng tiền & Tăng trưởng
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pb-2 border-b border-gray-100">Chu kỳ Tháng 1 – Tháng 6 năm 2026</p>
            <div className="pt-4">
              <LineChart data={monthlyRevenueData.map(d => ({ label: d.label, value: d.value }))} color="#6366F1" height={90} />
            </div>
          </div>

          {/* Top Services ranking contribution */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              🥇 Gói dịch vụ mang lại doanh thu cao nhất
            </h3>
            <div className="space-y-4 pt-1">
              {[
                { name: 'Spa Premium', revenue: stats.bookingRevenue * 0.55, pct: 85, color: 'bg-indigo-600' },
                { name: 'Cắt tỉa & Tắm cơ bản', revenue: stats.bookingRevenue * 0.35, pct: 60, color: 'bg-indigo-500' },
                { name: 'Tắm & Sấy', revenue: stats.bookingRevenue * 0.1, pct: 25, color: 'bg-indigo-400' },
              ].map(s => (
                <div key={s.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <span>{s.name}</span>
                    <span className="text-gray-900 font-extrabold">{formatPrice(s.revenue)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`${s.color} h-2 rounded-full`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods structure */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              💳 Cơ cấu các phương thức thanh toán
            </h3>
            <div className="flex justify-center py-2">
              <DonutChart data={[
                { label: 'MoMo', value: 42, color: '#EC4899' },
                { label: 'Chuyển khoản', value: 28, color: '#3B82F6' },
                { label: 'Tiền mặt', value: 19, color: '#10B981' },
                { label: 'Thẻ ngân hàng', value: 11, color: '#F59E0B' },
              ]} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOOKING & VẬN HÀNH */}
      {tab === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideIn">
          {/* Booking statistics by weekday */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              📅 Tần suất đặt Booking theo ngày trong tuần
            </h3>
            <div className="pt-2">
              <BarChart data={WEEKLY_BOOKINGS.map(w => ({ ...w, color: '#8B5CF6' }))} height={110} />
            </div>
          </div>

          {/* Bookings status composition */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              📊 Cơ cấu trạng thái lịch hẹn hiện tại
            </h3>
            <div className="flex justify-center py-2">
              <DonutChart data={bookingsStatusData.filter(d => d.value > 0)} />
            </div>
          </div>

          {/* Room Capacity & Occupancy indicator */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-3 flex flex-col justify-center">
              <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                ⚡ Tỉ lệ sử dụng phòng dịch vụ
              </h3>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                Được tính toán tự động dựa trên các phòng Spa/Grooming đang ở trạng thái **Đang bận (Occupied)** thời điểm hiện tại.
              </p>
              
              <div className="pt-2">
                <span className="text-xs font-bold text-gray-500 block uppercase">Công suất phòng hôm nay</span>
                <span className="text-3xl font-black text-indigo-600 block mt-0.5">{roomOccupancyData.rate}%</span>
              </div>
            </div>

            {/* Room stats meters */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
              {[
                { label: 'Tổng số phòng', value: roomOccupancyData.total, desc: 'Có trên chi nhánh', color: 'border-gray-200 text-gray-900 bg-gray-50/50' },
                { label: 'Đang bận', value: roomOccupancyData.occupied, desc: 'Pet đang phục vụ', color: 'border-purple-200 text-purple-700 bg-purple-50/10' },
                { label: 'Đang trống', value: roomOccupancyData.available, desc: 'Sẵn sàng đón pet', color: 'border-emerald-250 text-emerald-600 bg-emerald-50/10' },
                { label: 'Bảo trì', value: roomOccupancyData.maintenance, desc: 'Sửa thiết bị', color: 'border-red-200 text-red-600 bg-red-50/10' },
              ].map(r => (
                <div key={r.label} className={`p-4 rounded-2xl border text-center space-y-1 ${r.color}`}>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">{r.label}</span>
                  <span className="text-xl font-extrabold block font-mono">{r.value}</span>
                  <span className="text-[9px] text-gray-400 block leading-none font-medium">{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KHÁCH HÀNG & THÚ CƯNG */}
      {tab === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideIn">
          {/* Customer monthly acquisition */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              👥 Số lượng khách hàng mới gia nhập hệ thống
            </h3>
            <div className="pt-2">
              <BarChart data={[
                { label: 'T1', value: 23, color: '#3B82F6' },
                { label: 'T2', value: 31, color: '#3B82F6' },
                { label: 'T3', value: 19, color: '#3B82F6' },
                { label: 'T4', value: 42, color: '#3B82F6' },
                { label: 'T5', value: stats.newCustomers, color: '#10B981' },
                { label: 'T6', value: 8, color: '#D1D5DB' },
              ]} height={110} />
            </div>
          </div>

          {/* Pet species breakdown donut chart */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              🐾 Cơ cấu giống loài vật nuôi đã đăng ký
            </h3>
            <div className="flex justify-center py-2">
              <DonutChart data={petSpeciesData} />
            </div>
          </div>

          {/* Top Spending Customers leaderboard */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4 md:col-span-2">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              🏆 Bảng xếp hạng 5 Khách hàng chi tiêu nhiều nhất hệ thống
            </h3>
            
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4"># Hạng</th>
                    <th className="px-5 py-4">Khách hàng</th>
                    <th className="px-5 py-4 text-center">Số lượt đặt dịch vụ</th>
                    <th className="px-5 py-4 text-right">Tổng chi tiêu đã thanh toán</th>
                    <th className="px-5 py-4">Hoạt động lần cuối</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                  {topCustomers.map((u, idx) => (
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <span className={`text-sm font-extrabold ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'text-gray-300'}`}>
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} alt={u.fullName} className="w-8 h-8 rounded-full border border-gray-200 shrink-0" />
                          <div>
                            <div className="text-sm font-bold text-gray-900">{u.fullName}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{u.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center font-mono text-sm">{u.bookingCount} lần</td>
                      <td className="px-5 py-4 text-right text-sm font-black text-indigo-600">{formatPrice(u.totalSpends)}</td>
                      <td className="px-5 py-4 text-xs font-bold text-gray-450 font-mono">{u.lastLogin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NHÂN SỰ & ĐÁNH GIÁ */}
      {tab === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideIn">
          {/* Finished bookings per staff bar chart */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              💇‍♂️ Số lượng lịch hẹn đã làm của từng Groomer
            </h3>
            <div className="pt-2">
              <BarChart data={staffPerformance.map(s => ({
                label: s.fullName.split(' ').slice(-1)[0],
                value: s.doneCount,
                color: '#10B981'
              }))} height={110} />
            </div>
          </div>

          {/* Detailed Groomer Rating Metrics */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              ⭐ Bảng hiệu năng & Đánh giá của kỹ thuật viên
            </h3>
            
            <div className="space-y-4 pt-1">
              {staffPerformance.map(s => {
                return (
                  <div key={s.id} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                    <img src={s.avatar} alt={s.fullName} className="w-10 h-10 rounded-full border border-gray-200 shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-gray-900">{s.fullName}</span>
                        <span className="text-xs text-yellow-500 font-extrabold flex items-center gap-1">
                          <Star size={12} className="fill-yellow-500 text-yellow-500" /> {s.rating}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex-1 bg-gray-250 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5 rounded-full animate-pulse-subtle" style={{ width: `${Math.min(100, (s.doneCount / 20) * 100)}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0 font-bold font-mono">{s.doneCount} booking</span>
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
