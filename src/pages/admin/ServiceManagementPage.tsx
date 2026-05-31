import { useState } from 'react'
import { Plus, Edit, Eye, EyeOff, Scissors } from 'lucide-react'
import { SERVICE_MOCK_LIST, SERVICE_CATEGORY_LABELS } from '@/data/serviceMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { formatPrice } from '@/utils/format'

const CAT_ICONS: Record<string, string> = {
  grooming: '✂️', bathing: '🛁', spa: '💆', boarding: '🏠', nail: '💅', ear: '👂',
}

export default function ServiceManagementPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [services, setServices] = useState(SERVICE_MOCK_LIST)

  function toggleStatus(id: string) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Scissors size={18} /> Quản lý Dịch vụ</h1>
          <p className="text-sm text-gray-500">{services.length} dịch vụ · {services.filter(s => s.status === 'active').length} đang hoạt động</p>
        </div>
        <button className="btn-primary"><Plus size={15} /> Thêm dịch vụ</button>
      </div>

      <div className="space-y-3">
        {services.map(svc => (
          <div key={svc.id} className={`card overflow-hidden ${svc.status === 'inactive' ? 'opacity-60' : ''}`}>
            <div className="p-4 flex items-center gap-4">
              <img src={svc.image} alt="" className="w-14 h-14 object-cover rounded-xl shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xl">{CAT_ICONS[svc.category]}</span>
                  <span className="font-semibold text-gray-900">{svc.name}</span>
                  <span className={`badge text-[10px] ${svc.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                    {svc.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="badge-blue">{SERVICE_CATEGORY_LABELS[svc.category]}</span>
                  <span>Từ {formatPrice(Math.min(...svc.pricingMatrix.map(p => p.price)))}</span>
                  <span>{svc.duration}–{Math.max(...svc.pricingMatrix.map(p => p.duration))} phút</span>
                  <span>{svc.shopIds.length} chi nhánh</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setExpanded(expanded === svc.id ? null : svc.id)} className="btn-secondary text-xs py-1.5">
                  {expanded === svc.id ? 'Ẩn' : 'Bảng giá'}
                </button>
                <button className="btn-secondary text-xs py-1.5"><Edit size={12} /> Sửa</button>
                <button onClick={() => toggleStatus(svc.id)}
                  className={`p-2 rounded-lg border transition-colors ${svc.status === 'active' ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}>
                  {svc.status === 'active' ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {expanded === svc.id && (
              <div className="border-t">
                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between">
                  <span>Bảng giá theo kích thước thú cưng</span>
                  <span>Chi nhánh: {svc.shopIds.map(id => SHOP_MOCK_LIST.find(s => s.id === id)?.name.replace('PetCare ', '')).join(', ')}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y">
                  {svc.pricingMatrix.map(p => (
                    <div key={p.size} className="p-4 text-center hover:bg-blue-50 transition-colors">
                      <div className="text-xs text-gray-500 mb-1">{p.label}</div>
                      <div className="text-base font-black text-primary-600">{formatPrice(p.price)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">⏱ {p.duration} phút</div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-gray-50 border-t">
                  <p className="text-xs text-gray-500">{svc.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {svc.petTypes.map(pt => (
                      <span key={pt} className="badge-gray text-[10px]">{pt === 'dog' ? '🐕 Chó' : '🐈 Mèo'}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
