import { Link } from 'react-router-dom'
import { Scissors, Star, ArrowRight, ShoppingBag, CalendarDays, PawPrint, Sparkles } from 'lucide-react'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { SERVICE_MOCK_LIST } from '@/data/serviceMockData'
import { VOUCHER_MOCK_LIST } from '@/data/voucherMockData'
import { formatPrice } from '@/utils/format'

const SERVICE_ICONS: Record<string, string> = {
  grooming: '✂️', bathing: '🛁', spa: '💆', boarding: '🏠', nail: '💅', ear: '👂',
}

const BANNERS = [
  { title: 'Ưu đãi tháng 6 — Giảm 15% Spa Premium', sub: 'Áp dụng đến 30/06/2026', color: 'from-blue-500 to-indigo-600', emoji: '🐾' },
  { title: 'Gói Grooming Full cho bé cưng của bạn', sub: 'Cắt tỉa + Tắm + Vệ sinh toàn thân', color: 'from-emerald-500 to-teal-600', emoji: '✨' },
  { title: 'Mới: Dịch vụ tắm thảo dược cao cấp', sub: 'Thư giãn toàn diện cho thú cưng', color: 'from-purple-500 to-pink-600', emoji: '🌿' },
]

export default function HomePage() {
  const featuredProducts = PRODUCT_MOCK_LIST.slice(0, 4)
  const featuredServices = SERVICE_MOCK_LIST.slice(0, 4)
  const activeVouchers = VOUCHER_MOCK_LIST.filter(v => v.status === 'active').slice(0, 3)

  return (
    <div className="space-y-10">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 md:p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-200 text-sm font-medium mb-3">
            <Sparkles size={14} /> Hệ thống Pet Care đa chi nhánh
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            Chăm sóc thú cưng <br className="hidden md:block" />tận tâm & chuyên nghiệp
          </h1>
          <p className="text-blue-100 text-sm mb-6 max-w-md">
            Dịch vụ grooming, spa, tắm rửa và chăm sóc toàn diện cho chó mèo yêu của bạn tại 3 chi nhánh TP.HCM
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/customer/booking" className="bg-white text-blue-600 font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
              <CalendarDays size={15} /> Đặt lịch ngay
            </Link>
            <Link to="/customer/services" className="border border-blue-300 text-white font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Scissors size={15} /> Xem dịch vụ
            </Link>
          </div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-8xl opacity-20 select-none">🐾</div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '3 Chi nhánh', sub: 'TP.HCM', icon: '📍' },
          { label: '500+ Khách hàng', sub: 'Tin tưởng mỗi tháng', icon: '❤️' },
          { label: '4.8★ Đánh giá', sub: 'Trung bình hệ thống', icon: '⭐' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-sm font-bold text-gray-900">{s.label}</div>
            <div className="text-xs text-gray-400">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Services */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Dịch vụ nổi bật</h2>
          <Link to="/customer/services" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            Tất cả <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredServices.map(svc => (
            <Link key={svc.id} to={`/customer/services/${svc.id}`}
              className="card p-4 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="text-3xl mb-3">{SERVICE_ICONS[svc.category] ?? '🐾'}</div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{svc.name}</h3>
              <p className="text-xs text-gray-400 mb-2 line-clamp-2">{svc.description}</p>
              <div className="text-sm font-bold text-primary-600">Từ {formatPrice(svc.price)}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Vouchers */}
      {activeVouchers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Ưu đãi đang áp dụng</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeVouchers.map(v => (
              <div key={v.id} className="card p-4 border-l-4 border-l-primary-500 bg-primary-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-primary-700 uppercase tracking-wide mb-1">
                      {v.code}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{v.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      HSD: {v.endDate} · Còn {v.usageLimit - v.usedCount} lượt
                    </div>
                  </div>
                  <div className="text-2xl font-black text-primary-600 shrink-0">
                    {v.type === 'percent' ? `-${v.value}%` : `-${v.value / 1000}k`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Sản phẩm bán chạy</h2>
          <Link to="/customer/products" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            Tất cả <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts.map(p => (
            <Link key={p.id} to={`/customer/products/${p.id}`}
              className="card hover:shadow-md transition-shadow group cursor-pointer overflow-hidden">
              <img src={p.images[0]} alt={p.name} className="w-full h-36 object-cover bg-gray-50" />
              <div className="p-3">
                <div className="text-xs text-gray-400 mb-0.5">{p.brand}</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-primary-600 line-clamp-1">{p.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-gray-600">{p.rating} ({p.reviewCount})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary-600">Từ {formatPrice(p.basePrice)}</span>
                  <span className="text-xs text-gray-400">{p.skus.length} loại</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="card p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <PawPrint size={18} className="text-emerald-600" />
            <span className="font-bold text-gray-900">Tạo hồ sơ thú cưng ngay!</span>
          </div>
          <p className="text-sm text-gray-600">Lưu thông tin sức khỏe, lịch sử dịch vụ và đặt lịch nhanh hơn.</p>
        </div>
        <Link to="/customer/my-pets" className="btn-primary shrink-0">
          <PawPrint size={15} /> Thêm thú cưng
        </Link>
      </div>
    </div>
  )
}
