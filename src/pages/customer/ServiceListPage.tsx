import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock, ChevronRight } from 'lucide-react'
import { SERVICE_MOCK_LIST, SERVICE_CATEGORY_LABELS } from '@/data/serviceMockData'
import { formatPrice } from '@/utils/format'

const CATEGORY_ICONS: Record<string, string> = {
  grooming: '✂️', bathing: '🛁', spa: '💆', boarding: '🏠', nail: '💅', ear: '👂',
}

const PET_TYPE_LABELS: Record<string, string> = { dog: 'Chó', cat: 'Mèo', other: 'Khác' }

export default function ServiceListPage() {
  const [selectedCat, setSelectedCat] = useState<string | null>(null)

  const categories = [...new Set(SERVICE_MOCK_LIST.map(s => s.category))]
  const filtered = selectedCat ? SERVICE_MOCK_LIST.filter(s => s.category === selectedCat) : SERVICE_MOCK_LIST

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dịch vụ chăm sóc</h1>
        <p className="text-sm text-gray-500 mt-0.5">Grooming, Spa, Tắm rửa và nhiều hơn nữa</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCat(null)}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${!selectedCat ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
        >
          Tất cả
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selectedCat === cat ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
          >
            {CATEGORY_ICONS[cat]} {SERVICE_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(svc => {
          const minPrice = Math.min(...svc.pricingMatrix.map(p => p.price))
          const maxPrice = Math.max(...svc.pricingMatrix.map(p => p.price))
          return (
            <Link key={svc.id} to={`/customer/services/${svc.id}`}
              className="card hover:shadow-md transition-shadow group overflow-hidden">
              <div className="flex">
                <img src={svc.image} alt={svc.name} className="w-28 h-28 object-cover shrink-0" />
                <div className="p-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{CATEGORY_ICONS[svc.category]}</span>
                    <span className="badge-blue text-[10px]">{SERVICE_CATEGORY_LABELS[svc.category]}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 mb-1">{svc.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{svc.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">Từ</div>
                      <div className="text-sm font-bold text-primary-600">
                        {minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} /> {svc.duration}–{Math.max(...svc.pricingMatrix.map(p => p.duration))} phút
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {svc.petTypes.map(pt => (
                      <span key={pt} className="badge-gray text-[10px]">{PET_TYPE_LABELS[pt]}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* CTA */}
      <div className="card p-5 bg-blue-50 border-blue-200 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Sẵn sàng đặt lịch?</h3>
          <p className="text-sm text-gray-600">Chọn dịch vụ, thú cưng và khung giờ phù hợp</p>
        </div>
        <Link to="/customer/booking" className="btn-primary shrink-0">
          <CalendarDays size={15} /> Đặt lịch ngay
        </Link>
      </div>
    </div>
  )
}
