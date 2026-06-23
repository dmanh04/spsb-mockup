import { useState, useMemo } from 'react'
import { 
  Scissors, Activity, Home, Stethoscope, Search, Filter, 
  CheckCircle2, ChevronDown, Sparkles, Layers, Info, Check, HelpCircle
} from 'lucide-react'
import { SERVICE_MOCK_LIST, SERVICE_CATEGORY_LABELS, saveServices } from '@/data/serviceMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'
import type { Service } from '@/types'

const CAT_ICONS: Record<string, any> = {
  grooming: <Scissors size={18} className="text-indigo-500" />, 
  bathing: <Activity size={18} className="text-teal-500" />, 
  spa: <Sparkles size={18} className="text-purple-500" />, 
  boarding: <Home size={18} className="text-amber-500" />, 
  nail: <Scissors size={18} className="text-pink-500" />, 
  ear: <Activity size={18} className="text-orange-500" />,
  checkup: <Stethoscope size={18} className="text-red-500" />,
}

const CAT_COLORS: Record<string, string> = {
  grooming: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  bathing: 'bg-teal-50 text-teal-700 border-teal-200',
  spa: 'bg-purple-50 text-purple-700 border-purple-200',
  boarding: 'bg-amber-50 text-amber-700 border-amber-200',
  nail: 'bg-pink-50 text-pink-700 border-pink-200',
  ear: 'bg-orange-50 text-orange-700 border-orange-200',
  checkup: 'bg-red-50 text-red-700 border-red-200',
}

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'applied', label: 'Đang áp dụng tại CN' },
  { id: 'not_applied', label: 'Chưa áp dụng' },
]

export default function ShopHeadServicesPage() {
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'
  
  const currentShop = useMemo(() => {
    return SHOP_MOCK_LIST.find(s => s.id === shopId)
  }, [shopId])

  const [services, setServices] = useState<Service[]>(SERVICE_MOCK_LIST)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  // Toggle service applied status for this shop
  function toggleServiceApplied(id: string) {
    const updated = services.map(svc => {
      if (svc.id === id) {
        const isCurrentlyApplied = svc.shopIds.includes(shopId)
        const updatedShopIds = isCurrentlyApplied
          ? svc.shopIds.filter(sid => sid !== shopId)
          : [...svc.shopIds, shopId]
        return { ...svc, shopIds: updatedShopIds }
      }
      return svc
    })
    setServices(updated)
    saveServices(updated)
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const systemTotal = services.length
    const systemActive = services.filter(s => s.status === 'active').length
    const branchApplied = services.filter(s => s.shopIds.includes(shopId)).length
    const branchNotApplied = systemTotal - branchApplied

    return {
      systemTotal,
      systemActive,
      branchApplied,
      branchNotApplied
    }
  }, [services, shopId])

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter(svc => {
      // 1. Search Query
      const matchesSearch = svc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            svc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (SERVICE_CATEGORY_LABELS[svc.category] && 
                             SERVICE_CATEGORY_LABELS[svc.category].toLowerCase().includes(searchQuery.toLowerCase()))
      
      // 2. Category Filter
      const matchesCategory = categoryFilter === 'all' || svc.category === categoryFilter

      // 3. Application Tab
      const isApplied = svc.shopIds.includes(shopId)
      let matchesTab = true
      if (activeTab === 'applied') {
        matchesTab = isApplied
      } else if (activeTab === 'not_applied') {
        matchesTab = !isApplied
      }

      return matchesSearch && matchesCategory && matchesTab
    })
  }, [services, searchQuery, categoryFilter, activeTab, shopId])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header section */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-3">
            <Layers size={16} /> {currentShop?.name ?? 'Chi nhánh'}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dịch vụ tại Chi nhánh</h1>
          <p className="text-gray-500 mt-2 font-medium">
            Chọn và áp dụng các dịch vụ phù hợp của hệ thống vào chi nhánh của bạn.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm dịch vụ..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-sm outline-none font-medium"
            />
          </div>
          
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-2xl pl-4 pr-10 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="all">Tất cả danh mục</option>
              {Object.entries(SERVICE_CATEGORY_LABELS).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Info Warning Banner */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
        <Info className="text-indigo-500 shrink-0 mt-0.5" size={18} />
        <div className="text-xs text-indigo-800 leading-relaxed">
          <span className="font-bold">Lưu ý:</span> Danh sách dịch vụ và bảng giá do <strong>Admin hệ thống</strong> định nghĩa toàn diện. Ở vai trò Quản lý chi nhánh, bạn có quyền chọn lựa kích hoạt/hủy kích hoạt dịch vụ tại cửa hàng của mình để hiển thị cho Khách hàng khi đặt lịch hẹn trực tuyến tại chi nhánh này.
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Dịch vụ đang áp dụng', value: stats.branchApplied, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
          { label: 'Chưa áp dụng tại CN', value: stats.branchNotApplied, color: 'text-gray-500 bg-gray-50 border-gray-200/60' },
          { label: 'Tổng dịch vụ hệ thống', value: stats.systemTotal, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        ].map(s => (
          <div key={s.label} className={`border rounded-2xl p-5 ${s.color} transition-all duration-300 hover:shadow-md`}>
            <div className="text-3xl font-black">{s.value}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                isActive 
                  ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              }`}
            >
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {tab.id === 'all' && stats.systemTotal}
                {tab.id === 'applied' && stats.branchApplied}
                {tab.id === 'not_applied' && stats.branchNotApplied}
              </span>
            </button>
          )
        })}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredServices.map(svc => {
          const isApplied = svc.shopIds.includes(shopId)
          const minPrice = Math.min(...svc.pricingMatrix.map(p => p.price))
          const minDuration = Math.min(...svc.pricingMatrix.map(p => p.duration))
          const maxDuration = Math.max(...svc.pricingMatrix.map(p => p.duration))

          return (
            <div 
              key={svc.id}
              className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 group ${!isApplied ? 'bg-gray-50/50 border-gray-200/60' : ''}`}
            >
              <div className="p-5 flex flex-col lg:flex-row gap-5 lg:items-center">
                {/* Left side: Image and details */}
                <div className="flex items-start lg:items-center gap-5 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <img 
                      src={svc.image} 
                      alt={svc.name} 
                      className={`w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-2xl shadow-sm transition-all duration-500 group-hover:scale-105 ${!isApplied ? 'grayscale opacity-75' : ''}`} 
                    />
                    <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white ${isApplied ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${CAT_COLORS[svc.category]}`}>
                        {CAT_ICONS[svc.category]}
                        {SERVICE_CATEGORY_LABELS[svc.category]}
                      </div>
                      
                      {isApplied ? (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold">
                          <Check size={12} /> Đang hoạt động tại CN
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-lg text-xs font-bold">
                          Chưa áp dụng
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1.5 truncate group-hover:text-indigo-600 transition-colors">
                      {svc.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 lg:line-clamp-1 max-w-2xl">
                      {svc.description}
                    </p>
                  </div>
                </div>

                {/* Right side: Prices and Actions */}
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 lg:gap-6 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                  <div className="flex flex-col gap-0.5 pr-4 lg:pr-6 lg:border-r border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Giá chuẩn từ</span>
                    <span className="text-lg font-black text-gray-900">
                      {formatPrice(minPrice)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 pr-4 lg:pr-6 lg:border-r border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Thời gian</span>
                    <span className="text-sm font-bold text-gray-700">
                      {minDuration} – {maxDuration} phút
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 pr-4 lg:pr-6 lg:border-r border-gray-100 hidden sm:flex">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phù hợp cho</span>
                    <div className="flex items-center gap-1">
                      {svc.petTypes.map(pt => (
                        <span key={pt} className="text-xs font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                          {pt === 'dog' ? '🐕 Chó' : pt === 'cat' ? '🐈 Mèo' : 'Khác'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions (Toggle Apply) */}
                  <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0 justify-end">
                    <button 
                      onClick={() => setExpanded(expanded === svc.id ? null : svc.id)} 
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                        expanded === svc.id 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Bảng giá <ChevronDown size={14} className={`transition-transform duration-300 ${expanded === svc.id ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Switch/Toggle Button */}
                    <div className="flex items-center gap-2 border-l pl-4 border-gray-100">
                      <span className="text-xs font-bold text-gray-500 hidden xl:inline">
                        {isApplied ? 'Bật tại CN' : 'Tắt tại CN'}
                      </span>
                      <button
                        onClick={() => toggleServiceApplied(svc.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          isApplied ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                        title={isApplied ? 'Ngừng cung cấp dịch vụ tại chi nhánh này' : 'Áp dụng dịch vụ này cho chi nhánh này'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            isApplied ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible pricing matrix */}
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden bg-gray-50/50 ${
                  expanded === svc.id ? 'max-h-[800px] opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-5 lg:p-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Chi tiết bảng giá dịch vụ gốc (từ Admin)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {svc.pricingMatrix.map(p => (
                      <div key={p.size} className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm hover:border-indigo-300 transition-all">
                        <div className="text-xs font-bold text-gray-400 mb-1.5 uppercase">
                          {p.label}
                        </div>
                        <div className="text-2xl font-black text-gray-900 mb-2">
                          {formatPrice(p.price)}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 w-max px-2 py-1 rounded">
                          <Activity size={12} /> {p.duration} phút
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {filteredServices.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Không có dịch vụ phù hợp</h3>
            <p className="text-gray-500">Hãy thay đổi bộ lọc tìm kiếm hoặc từ khóa.</p>
          </div>
        )}
      </div>
    </div>
  )
}
