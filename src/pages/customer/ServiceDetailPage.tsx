import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, CalendarDays, Users } from 'lucide-react'
import { SERVICE_MOCK_LIST, SERVICE_CATEGORY_LABELS } from '@/data/serviceMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { formatPrice } from '@/utils/format'

const CATEGORY_ICONS: Record<string, string> = {
  grooming: '✂️', bathing: '🛁', spa: '💆', boarding: '🏠', nail: '💅', ear: '👂',
}

const SIZE_WEIGHT: Record<string, string> = {
  small: '< 5kg', medium: '5–15kg', large: '15–30kg', xlarge: '> 30kg',
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const svc = SERVICE_MOCK_LIST.find(s => s.id === id)
  const availableShops = SHOP_MOCK_LIST.filter(sh => svc?.shopIds.includes(sh.id))

  if (!svc) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-lg font-semibold text-gray-700">Không tìm thấy dịch vụ</h2>
        <Link to="/customer/services" className="btn-secondary mt-4 inline-flex">← Quay lại</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/customer/services" className="hover:text-primary-600 flex items-center gap-1">
          <ArrowLeft size={14} /> Dịch vụ
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{svc.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left */}
        <div className="md:col-span-3 space-y-5">
          <img src={svc.image} alt={svc.name} className="w-full h-56 object-cover rounded-2xl bg-gray-50" />

          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{CATEGORY_ICONS[svc.category]}</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{svc.name}</h1>
                <span className="badge-blue text-xs">{SERVICE_CATEGORY_LABELS[svc.category]}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{svc.description}</p>
          </div>

          {/* What's included */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Bao gồm trong dịch vụ</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {svc.category === 'grooming' && ['Tắm sạch với sữa tắm chuyên dụng', 'Sấy khô hoàn toàn', 'Cắt tỉa lông theo yêu cầu', 'Vệ sinh tai cơ bản', 'Cắt móng'].map(item => (
                <li key={item} className="flex items-center gap-2"><span className="text-green-500">✓</span>{item}</li>
              ))}
              {svc.category === 'spa' && ['Tắm thảo dược thư giãn', 'Massage toàn thân', 'Xông hơi dưỡng ẩm', 'Cắt tỉa & làm đẹp lông', 'Vệ sinh tai & mắt', 'Cắt móng chuyên nghiệp'].map(item => (
                <li key={item} className="flex items-center gap-2"><span className="text-green-500">✓</span>{item}</li>
              ))}
              {svc.category === 'bathing' && ['Tắm với sữa tắm phù hợp loại lông', 'Sấy khô hoàn toàn', 'Chải lông'].map(item => (
                <li key={item} className="flex items-center gap-2"><span className="text-green-500">✓</span>{item}</li>
              ))}
              {(svc.category === 'nail' || svc.category === 'ear') && ['Cắt móng an toàn', 'Làm sạch tai', 'Vệ sinh mắt'].map(item => (
                <li key={item} className="flex items-center gap-2"><span className="text-green-500">✓</span>{item}</li>
              ))}
            </ul>
          </div>

          {/* Available shops */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users size={14} /> Có tại {availableShops.length} chi nhánh
            </h3>
            <div className="space-y-2">
              {availableShops.map(sh => (
                <div key={sh.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{sh.name}</span>
                  <span className="text-gray-400 text-xs">{sh.openTime}–{sh.closeTime}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Pricing */}
        <div className="md:col-span-2 space-y-4">
          <div className="card p-4 sticky top-20">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Bảng giá theo kích thước</h3>
            <div className="space-y-3">
              {svc.pricingMatrix.map(p => (
                <div key={p.size} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.label}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {p.duration} phút
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary-600">{formatPrice(p.price)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t space-y-2">
              <Link
                to={`/customer/booking?serviceId=${svc.id}`}
                className="btn-primary w-full justify-center py-3"
              >
                <CalendarDays size={15} /> Đặt lịch dịch vụ này
              </Link>
              <Link to="/customer/services" className="btn-secondary w-full justify-center">
                Xem dịch vụ khác
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
