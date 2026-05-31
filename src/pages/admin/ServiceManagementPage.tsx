import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Eye, EyeOff, Search, Filter, Stethoscope, Home, Scissors, Activity, ChevronDown, CheckCircle2 } from 'lucide-react'
import { SERVICE_MOCK_LIST, SERVICE_CATEGORY_LABELS, saveServices } from '@/data/serviceMockData'
import type { Service } from '@/types'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { formatPrice } from '@/utils/format'

const CAT_ICONS: Record<string, any> = {
  grooming: <Scissors size={18} className="text-blue-500" />, 
  bathing: <Activity size={18} className="text-teal-500" />, 
  spa: <Activity size={18} className="text-purple-500" />, 
  boarding: <Home size={18} className="text-amber-500" />, 
  nail: <Scissors size={18} className="text-pink-500" />, 
  ear: <Activity size={18} className="text-orange-500" />,
  checkup: <Stethoscope size={18} className="text-red-500" />,
}

const CAT_COLORS: Record<string, string> = {
  grooming: 'bg-blue-50 text-blue-700 border-blue-200',
  bathing: 'bg-teal-50 text-teal-700 border-teal-200',
  spa: 'bg-purple-50 text-purple-700 border-purple-200',
  boarding: 'bg-amber-50 text-amber-700 border-amber-200',
  nail: 'bg-pink-50 text-pink-700 border-pink-200',
  ear: 'bg-orange-50 text-orange-700 border-orange-200',
  checkup: 'bg-red-50 text-red-700 border-red-200',
}

const TABS = [
  { id: 'all', label: 'Tất cả dịch vụ' },
  { id: 'spa_grooming', label: 'Spa & Làm đẹp', categories: ['grooming', 'bathing', 'spa', 'nail', 'ear'] },
  { id: 'boarding', label: 'Lưu trú', categories: ['boarding'] },
  { id: 'checkup', label: 'Thăm khám', categories: ['checkup'] },
]

export default function ServiceManagementPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [services, setServices] = useState(SERVICE_MOCK_LIST)

  function toggleStatus(id: string) {
    const updated: Service[] = services.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' as const : 'active' as const } : s)
    setServices(updated)
    saveServices(updated)
  }

  const filteredServices = useMemo(() => {
    return services.filter(svc => {
      const matchesSearch = svc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            SERVICE_CATEGORY_LABELS[svc.category]?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const tab = TABS.find(t => t.id === activeTab)
      const matchesTab = activeTab === 'all' ? true : tab?.categories?.includes(svc.category)
      
      return matchesSearch && matchesTab
    })
  }, [services, searchQuery, activeTab])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header section with modern glassmorphism effect */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-3">
            <CheckCircle2 size={16} /> Quản lý danh mục
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dịch vụ & Bảng giá</h1>
          <p className="text-gray-500 mt-2 font-medium">
            Quản lý {services.length} dịch vụ · {services.filter(s => s.status === 'active').length} đang hoạt động
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
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
          <button className="p-2.5 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <Filter size={18} />
          </button>
          <button 
            onClick={() => navigate('/admin/services/new')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Thêm dịch vụ</span>
          </button>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-300 ${
              activeTab === tab.id 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="ml-2 py-0.5 px-2 bg-white/20 rounded-full text-xs">
                {tab.id === 'all' ? services.length : services.filter(s => tab.categories?.includes(s.category)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredServices.map(svc => (
          <div 
            key={svc.id} 
            className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 group ${svc.status === 'inactive' ? 'opacity-60 grayscale-[0.2]' : ''}`}
          >
            <div className="p-5 flex flex-col lg:flex-row gap-5 lg:items-center">
              {/* Image & Basic Info */}
              <div className="flex items-start lg:items-center gap-5 flex-1 min-w-0">
                <div className="relative shrink-0">
                  <img src={svc.image} alt={svc.name} className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-2xl shadow-sm group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white ${svc.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${CAT_COLORS[svc.category]}`}>
                      {CAT_ICONS[svc.category]}
                      {SERVICE_CATEGORY_LABELS[svc.category]}
                    </div>
                    {svc.status === 'inactive' && (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold border border-gray-200">
                        Đang tạm dừng
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                    {svc.name}
                  </h3>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 lg:line-clamp-1 max-w-2xl">
                    {svc.description}
                  </p>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 lg:gap-6 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                <div className="flex flex-col gap-1 pr-4 lg:pr-6 lg:border-r border-gray-100">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Giá từ</span>
                  <span className="text-lg font-black text-gray-900">
                    {formatPrice(Math.min(...svc.pricingMatrix.map(p => p.price)))}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 pr-4 lg:pr-6 lg:border-r border-gray-100">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Thời gian</span>
                  <span className="text-sm font-bold text-gray-700">
                    {svc.duration} – {Math.max(...svc.pricingMatrix.map(p => p.duration))} phút
                  </span>
                </div>

                <div className="flex flex-col gap-1 pr-4 lg:pr-6 lg:border-r border-gray-100 hidden sm:flex">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Áp dụng cho</span>
                  <div className="flex items-center gap-1">
                    {svc.petTypes.map(pt => (
                      <span key={pt} className="text-sm font-medium bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200">
                        {pt === 'dog' ? '🐕 Chó' : pt === 'cat' ? '🐈 Mèo' : 'Khác'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0 justify-end">
                  <button 
                    onClick={() => setExpanded(expanded === svc.id ? null : svc.id)} 
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      expanded === svc.id 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Bảng giá <ChevronDown size={16} className={`transition-transform duration-300 ${expanded === svc.id ? 'rotate-180' : ''}`} />
                  </button>
                  <button 
                    onClick={() => navigate(`/admin/services/${svc.id}/edit`)}
                    className="p-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-xl transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => toggleStatus(svc.id)}
                    className={`p-2 rounded-xl border transition-colors ${
                      svc.status === 'active' 
                        ? 'bg-white border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100' 
                        : 'bg-white border-gray-200 text-gray-400 hover:text-green-600 hover:bg-green-50 hover:border-green-100'
                    }`}
                    title={svc.status === 'active' ? 'Tạm dừng dịch vụ' : 'Kích hoạt dịch vụ'}
                  >
                    {svc.status === 'active' ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Pricing Matrix */}
            <div 
              className={`transition-all duration-500 ease-in-out overflow-hidden bg-gray-50/50 ${
                expanded === svc.id ? 'max-h-[800px] opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-5 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Bảng giá chi tiết theo phân loại
                  </h4>
                  <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm inline-flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Chi nhánh áp dụng:</span>
                    {svc.shopIds.map(id => SHOP_MOCK_LIST.find(s => s.id === id)?.name.replace('PetCare ', '')).join(', ')}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {svc.pricingMatrix.map(p => (
                    <div key={p.size} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group/price">
                      <div className="text-sm font-semibold text-gray-500 mb-2 group-hover/price:text-indigo-600 transition-colors">
                        {p.label}
                      </div>
                      <div className="text-2xl font-black text-gray-900 mb-1">
                        {formatPrice(p.price)}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium bg-gray-50 w-max px-2 py-1 rounded-lg">
                        <Activity size={14} className="text-gray-400" /> {p.duration} phút
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredServices.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Không tìm thấy dịch vụ nào</h3>
            <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
          </div>
        )}
      </div>
    </div>
  )
}
