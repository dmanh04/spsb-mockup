import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, ShoppingCart, Truck, Shield, Tag } from 'lucide-react'
import { getProductById, PRODUCT_REVIEWS, getSKUByAttributes } from '@/data/productMockData'
import SKUVariantSelector from '@/components/product/SKUVariantSelector'
import { formatPrice } from '@/utils/format'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const product = getProductById(id ?? '')
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({})
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-lg font-semibold text-gray-700">Không tìm thấy sản phẩm</h2>
        <Link to="/customer/products" className="btn-secondary mt-4 inline-flex">← Quay lại</Link>
      </div>
    )
  }

  const reviews = PRODUCT_REVIEWS.filter(r => r.productId === product.id)
  const currentSKU = getSKUByAttributes(product, selectedAttrs)
  const allAttrsSelected = product.attributes.every(a => selectedAttrs[a.name])
  const canAddToCart = allAttrsSelected && currentSKU && currentSKU.stock > 0

  function handleAddToCart() {
    if (!canAddToCart) return
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/customer/products" className="hover:text-primary-600 flex items-center gap-1">
          <ArrowLeft size={14} /> Sản phẩm
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border">
            <img src={currentSKU?.image ?? product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-400">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{product.brand}</div>
            <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={14} className={i <= Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                ))}
                <span className="text-sm font-medium text-gray-700 ml-1">{product.rating}</span>
              </div>
              <span className="text-sm text-gray-400">({product.reviewCount} đánh giá)</span>
              <span className="badge-green">{product.category}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

          {/* SKU selector */}
          <div className="card p-4">
            <SKUVariantSelector
              product={product}
              selectedAttrs={selectedAttrs}
              onChange={setSelectedAttrs}
            />
          </div>

          {/* Quantity + Add to cart */}
          {allAttrsSelected && currentSKU && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Số lượng:</span>
                <div className="flex items-center border rounded-lg">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-l-lg">−</button>
                  <span className="px-4 py-1.5 text-sm font-medium border-x">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(currentSKU.stock, q + 1))} className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-r-lg">+</button>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`w-full justify-center py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                  added ? 'bg-green-500 text-white' : canAddToCart ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={16} />
                {added ? 'Đã thêm vào giỏ ✓' : currentSKU.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
              </button>
            </div>
          )}

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Truck, label: 'Giao hàng nhanh', sub: 'Nội thành HCM' },
              { icon: Shield, label: 'Chính hàng 100%', sub: 'Cam kết chất lượng' },
              { icon: Tag, label: 'Đổi trả 7 ngày', sub: 'Nếu lỗi từ nhà SX' },
            ].map(t => (
              <div key={t.label} className="text-center">
                <t.icon size={18} className="mx-auto text-primary-500 mb-1" />
                <div className="text-xs font-semibold text-gray-700">{t.label}</div>
                <div className="text-[10px] text-gray-400">{t.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-900">Đánh giá ({reviews.length})</h2>
          </div>
          <div className="divide-y">
            {reviews.map(r => (
              <div key={r.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                      {r.user[0]}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{r.user}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={11} className={i <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700">{r.comment}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">{r.date}</span>
                  {r.variant && <span className="badge-gray text-[10px]">{r.variant}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
