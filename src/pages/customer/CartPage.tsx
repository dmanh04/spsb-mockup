import { Link } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { formatPrice } from '@/utils/format'

// Static mock cart for demo
const CART_ITEMS = [
  { skuId: 'P001-S3', qty: 2 },
  { skuId: 'P005-S3', qty: 1 },
  { skuId: 'P004-S1', qty: 1 },
]

export default function CartPage() {
  const items = CART_ITEMS.map(ci => {
    const product = PRODUCT_MOCK_LIST.find(p => p.skus.some(s => s.id === ci.skuId))
    const sku = product?.skus.find(s => s.id === ci.skuId)
    return { ...ci, product, sku }
  }).filter(i => i.product && i.sku)

  const subtotal = items.reduce((sum, i) => sum + (i.sku!.price * i.qty), 0)
  const discount = 50000 // voucher PETCARE50K
  const total = subtotal - discount

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart size={40} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">Giỏ hàng trống</h2>
        <Link to="/customer/products" className="btn-primary mt-4 inline-flex">Mua sắm ngay</Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Giỏ hàng ({items.length} sản phẩm)</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {items.map(({ skuId, qty, product, sku }) => (
            <div key={skuId} className="card p-4 flex items-center gap-4">
              <img src={product!.images[0]} alt={product!.name} className="w-16 h-16 object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{product!.name}</h3>
                <p className="text-xs text-gray-500">{Object.values(sku!.attributes).join(' / ')}</p>
                <p className="text-sm font-bold text-primary-600 mt-1">{formatPrice(sku!.price)}</p>
              </div>
              <div className="flex items-center border rounded-lg shrink-0">
                <button className="px-2 py-1 text-gray-500 hover:bg-gray-50"><Minus size={13} /></button>
                <span className="px-3 text-sm font-medium">{qty}</span>
                <button className="px-2 py-1 text-gray-500 hover:bg-gray-50"><Plus size={13} /></button>
              </div>
              <div className="text-sm font-bold text-gray-900 w-20 text-right shrink-0">
                {formatPrice(sku!.price * qty)}
              </div>
              <button className="text-gray-300 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit space-y-3 sticky top-20">
          <h3 className="font-semibold text-gray-900">Tóm tắt đơn hàng</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Giảm giá (PETCARE50K)</span><span>-{formatPrice(discount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí vận chuyển</span><span className="text-green-600">Miễn phí</span>
            </div>
          </div>

          {/* Voucher */}
          <div className="flex gap-2">
            <input className="form-input flex-1 text-sm py-2" placeholder="Mã voucher" defaultValue="PETCARE50K" />
            <button className="btn-secondary text-sm py-2 shrink-0">Áp dụng</button>
          </div>

          <div className="pt-3 border-t flex justify-between font-bold text-gray-900">
            <span>Tổng cộng</span>
            <span className="text-primary-600 text-lg">{formatPrice(total)}</span>
          </div>

          <Link to="/customer/checkout" className="btn-primary w-full justify-center py-3">
            Thanh toán <ArrowRight size={15} />
          </Link>
          <Link to="/customer/products" className="btn-secondary w-full justify-center text-sm">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  )
}
