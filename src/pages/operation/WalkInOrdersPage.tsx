import { useState } from 'react'
import { Search, Plus, Trash2, Check, ShoppingBag } from 'lucide-react'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'

interface CartLine { skuId: string; productName: string; variant: string; price: number; qty: number; skuCode: string }

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Tiền mặt' },
  { id: 'momo', label: 'MoMo' },
  { id: 'transfer', label: 'Chuyển khoản' },
]

export default function WalkInOrdersPage() {
  const { currentUser } = useAuthContext()
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [payMethod, setPayMethod] = useState('cash')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [done, setDone] = useState(false)

  const allSKUs = PRODUCT_MOCK_LIST.flatMap(p =>
    p.skus.map(s => ({
      skuId: s.id, skuCode: s.sku, productName: p.name,
      variant: Object.values(s.attributes).join(' / '),
      price: s.price, stock: s.stock, image: p.images[0],
    }))
  )

  const filtered = search.length > 1
    ? allSKUs.filter(s =>
        s.productName.toLowerCase().includes(search.toLowerCase()) ||
        s.skuCode.toLowerCase().includes(search.toLowerCase())
      )
    : allSKUs.slice(0, 8)

  function addToCart(item: typeof allSKUs[0]) {
    setCart(prev => {
      const existing = prev.find(c => c.skuId === item.skuId)
      if (existing) return prev.map(c => c.skuId === item.skuId ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { skuId: item.skuId, productName: item.productName, variant: item.variant, price: item.price, qty: 1, skuCode: item.skuCode }]
    })
  }

  function updateQty(skuId: string, qty: number) {
    if (qty < 1) setCart(prev => prev.filter(c => c.skuId !== skuId))
    else setCart(prev => prev.map(c => c.skuId === skuId ? { ...c, qty } : c))
  }

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0)

  if (done) {
    return (
      <div className="max-w-sm mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Đơn hàng tạo thành công!</h2>
        <p className="text-sm text-gray-500 mb-1">Mã đơn: <span className="font-bold text-primary-600">ORD-{String(Date.now()).slice(-4)}</span></p>
        <p className="text-sm font-bold text-gray-900 mb-6">{formatPrice(subtotal)}</p>
        <button onClick={() => { setCart([]); setDone(false); setCustomerName(''); setCustomerPhone('') }} className="btn-primary w-full justify-center">
          Tạo đơn mới
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Đơn hàng tại quầy</h1>
        <p className="text-sm text-gray-500">Tạo đơn hàng bán lẻ trực tiếp cho khách walk-in</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* Left — product search */}
        <div className="md:col-span-3 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="form-input pl-9" placeholder="Tìm sản phẩm theo tên hoặc mã SKU..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(item => (
              <div key={item.skuId} className="card p-3 flex items-center gap-3">
                <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 truncate">{item.productName}</div>
                  <div className="text-[10px] text-gray-400 truncate">{item.variant}</div>
                  <div className="text-xs font-bold text-primary-600">{formatPrice(item.price)}</div>
                </div>
                <button onClick={() => addToCart(item)}
                  disabled={item.stock === 0}
                  className="shrink-0 w-7 h-7 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-200 text-white rounded-lg flex items-center justify-center transition-colors">
                  <Plus size={13} />
                </button>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">Không tìm thấy sản phẩm</div>
          )}
        </div>

        {/* Right — cart */}
        <div className="md:col-span-2 space-y-3">
          {/* Customer info */}
          <div className="card p-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Thông tin khách hàng</h3>
            <input className="form-input text-sm" placeholder="Tên khách (tuỳ chọn)" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            <input className="form-input text-sm" placeholder="SĐT (tuỳ chọn)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
          </div>

          {/* Cart items */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag size={14} /> Giỏ hàng ({cart.length})
              </h3>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs text-red-400 hover:text-red-600">Xóa tất cả</button>
              )}
            </div>
            {cart.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">Chưa có sản phẩm</div>
            ) : (
              <div className="divide-y max-h-60 overflow-y-auto">
                {cart.map(line => (
                  <div key={line.skuId} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{line.productName}</div>
                      <div className="text-[10px] text-gray-400">{line.variant}</div>
                      <div className="text-xs font-bold text-primary-600">{formatPrice(line.price)}</div>
                    </div>
                    <div className="flex items-center border rounded-lg">
                      <button onClick={() => updateQty(line.skuId, line.qty - 1)} className="px-2 py-1 text-gray-400 hover:bg-gray-50 text-sm">−</button>
                      <span className="px-2 text-xs font-bold">{line.qty}</span>
                      <button onClick={() => updateQty(line.skuId, line.qty + 1)} className="px-2 py-1 text-gray-400 hover:bg-gray-50 text-sm">+</button>
                    </div>
                    <div className="text-xs font-bold text-gray-900 w-16 text-right">{formatPrice(line.price * line.qty)}</div>
                    <button onClick={() => updateQty(line.skuId, 0)} className="text-gray-300 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            {cart.length > 0 && (
              <div className="px-4 py-3 border-t bg-gray-50 space-y-3">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Tổng cộng</span>
                  <span className="text-primary-600 text-base">{formatPrice(subtotal)}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.id} onClick={() => setPayMethod(m.id)}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${payMethod === m.id ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setDone(true)} className="w-full btn-primary justify-center py-2.5 bg-green-500 hover:bg-green-600">
                  <Check size={14} /> Thanh toán {formatPrice(subtotal)}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
