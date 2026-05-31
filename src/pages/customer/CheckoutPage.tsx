import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, CreditCard, Banknote, Smartphone, ChevronRight, MapPin, Tag, ShieldCheck } from 'lucide-react'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { VOUCHER_MOCK_LIST } from '@/data/voucherMockData'
import { formatPrice } from '@/utils/format'

const CART_ITEMS = [
  { skuId: 'P001-S3', qty: 2 },
  { skuId: 'P005-S3', qty: 1 },
]

const PAYMENT_METHODS = [
  { id: 'momo', label: 'Ví MoMo', icon: Smartphone, color: 'text-pink-600' },
  { id: 'transfer', label: 'Chuyển khoản', icon: CreditCard, color: 'text-blue-600' },
  { id: 'cash', label: 'Tiền mặt khi nhận hàng', icon: Banknote, color: 'text-green-600' },
]

const STEPS = ['Địa chỉ', 'Thanh toán', 'Xác nhận']

export default function CheckoutPage() {
  const [step, setStep] = useState(0)
  const [address, setAddress] = useState({ name: 'Nguyễn Văn An', phone: '0901234567', street: '12 Nguyễn Trãi', ward: 'P.Bến Thành', district: 'Q.1', note: '' })
  const [payMethod, setPayMethod] = useState('momo')
  const [voucherCode, setVoucherCode] = useState('PETCARE50K')
  const [voucherApplied, setVoucherApplied] = useState<typeof VOUCHER_MOCK_LIST[0] | null>(VOUCHER_MOCK_LIST[0])
  const [voucherInput, setVoucherInput] = useState('PETCARE50K')
  const [submitted, setSubmitted] = useState(false)

  const items = CART_ITEMS.map(ci => {
    const product = PRODUCT_MOCK_LIST.find(p => p.skus.some(s => s.id === ci.skuId))
    const sku = product?.skus.find(s => s.id === ci.skuId)
    return { ...ci, product, sku }
  }).filter(i => i.product && i.sku)

  const subtotal = items.reduce((s, i) => s + i.sku!.price * i.qty, 0)
  const discount = voucherApplied ? (voucherApplied.type === 'fixed' ? voucherApplied.value : Math.min(subtotal * voucherApplied.value / 100, voucherApplied.maxDiscount ?? Infinity)) : 0
  const total = subtotal - discount

  function applyVoucher() {
    const v = VOUCHER_MOCK_LIST.find(v => v.code === voucherInput && v.status === 'active')
    setVoucherApplied(v ?? null)
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check size={36} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h2>
        <p className="text-sm text-gray-500 mb-1">Mã đơn hàng: <span className="font-bold text-primary-600">ORD-{String(Date.now()).slice(-4)}</span></p>
        <p className="text-sm text-gray-500 mb-2">Tổng tiền: <span className="font-bold">{formatPrice(total)}</span></p>
        <p className="text-xs text-gray-400 mb-6">
          {payMethod === 'momo' ? 'Vui lòng hoàn tất thanh toán MoMo trong 15 phút' : payMethod === 'transfer' ? 'Chuyển khoản đến STK 9021000234567 MB Bank — Tên: PETCARE SYSTEM' : 'Thanh toán khi nhận hàng'}
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/customer/orders" className="btn-primary">Xem đơn hàng</Link>
          <Link to="/customer" className="btn-secondary">Về trang chủ</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Thanh toán</h1>

      {/* Step indicator */}
      <div className="flex items-center">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${i < step ? 'bg-primary-500 border-primary-500 text-white' : i === step ? 'border-primary-500 text-primary-600 bg-white' : 'border-gray-200 text-gray-300'}`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs mt-1 ${i === step ? 'text-primary-600 font-medium' : i < step ? 'text-gray-500' : 'text-gray-300'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-3 -mt-4 ${i < step ? 'bg-primary-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* Left — form */}
        <div className="md:col-span-3 space-y-4">
          {/* Step 0: Address */}
          {step === 0 && (
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><MapPin size={15} /> Địa chỉ giao hàng</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="form-label">Họ tên người nhận</label>
                  <input className="form-input" value={address.name} onChange={e => setAddress(a => ({ ...a, name: e.target.value }))} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="form-label">Số điện thoại</label>
                  <input className="form-input" value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Số nhà, tên đường</label>
                  <input className="form-input" value={address.street} onChange={e => setAddress(a => ({ ...a, street: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Phường/Xã</label>
                  <input className="form-input" value={address.ward} onChange={e => setAddress(a => ({ ...a, ward: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Quận/Huyện</label>
                  <select className="form-input" value={address.district} onChange={e => setAddress(a => ({ ...a, district: e.target.value }))}>
                    <option value="Q.1">Quận 1</option>
                    <option value="Q.3">Quận 3</option>
                    <option value="Q.Bình Thạnh">Bình Thạnh</option>
                    <option value="Q.7">Quận 7</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="form-label">Ghi chú cho shipper (tuỳ chọn)</label>
                  <input className="form-input" placeholder="Gọi trước 30 phút, giao giờ hành chính..." value={address.note} onChange={e => setAddress(a => ({ ...a, note: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="card p-5 space-y-3">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2"><CreditCard size={15} /> Phương thức thanh toán</h2>
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payMethod === m.id ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="accent-primary-500" />
                    <m.icon size={20} className={m.color} />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{m.label}</span>
                      {m.id === 'momo' && <p className="text-xs text-gray-400">Quét mã QR thanh toán ngay sau khi đặt hàng</p>}
                      {m.id === 'transfer' && <p className="text-xs text-gray-400">STK: 9021000234567 — MB Bank — PETCARE SYSTEM</p>}
                      {m.id === 'cash' && <p className="text-xs text-gray-400">Thanh toán khi shipper giao hàng đến tay</p>}
                    </div>
                    {payMethod === m.id && <Check size={16} className="text-primary-500" />}
                  </label>
                ))}
              </div>

              {/* Voucher */}
              <div className="card p-4 space-y-3">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Tag size={15} /> Mã giảm giá</h2>
                <div className="flex gap-2">
                  <input className="form-input flex-1" placeholder="Nhập mã voucher..." value={voucherInput} onChange={e => setVoucherInput(e.target.value.toUpperCase())} />
                  <button onClick={applyVoucher} className="btn-primary shrink-0 py-2">Áp dụng</button>
                </div>
                {voucherApplied ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-sm font-bold text-green-700">{voucherApplied.code}</span>
                      <span className="text-xs text-green-600 ml-2">— {voucherApplied.name}</span>
                    </div>
                    <span className="text-sm font-bold text-green-700">-{formatPrice(discount)}</span>
                  </div>
                ) : voucherInput && (
                  <p className="text-xs text-red-500">Mã không hợp lệ hoặc đã hết hạn</p>
                )}

                <div className="space-y-1">
                  <p className="text-xs text-gray-400 font-medium">Voucher khả dụng:</p>
                  {VOUCHER_MOCK_LIST.filter(v => v.status === 'active').map(v => (
                    <button key={v.id} onClick={() => { setVoucherInput(v.code); setVoucherApplied(v) }}
                      className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-primary-50 rounded-lg border hover:border-primary-300 transition-colors">
                      <div>
                        <span className="text-xs font-bold text-primary-600">{v.code}</span>
                        <span className="text-xs text-gray-500 ml-2">{v.name}</span>
                      </div>
                      <span className="text-xs font-bold text-green-600">
                        {v.type === 'percent' ? `-${v.value}%` : `-${v.value / 1000}k`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Xác nhận đơn hàng</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">{address.name} — {address.phone}</div>
                    <div className="text-gray-500">{address.street}, {address.ward}, {address.district}, TP.HCM</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-gray-400 shrink-0" />
                  <span className="text-gray-700">{PAYMENT_METHODS.find(m => m.id === payMethod)?.label}</span>
                </div>
                {voucherApplied && (
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-gray-400 shrink-0" />
                    <span className="text-green-700 font-medium">Voucher {voucherApplied.code} — -{formatPrice(discount)}</span>
                  </div>
                )}
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2 text-xs text-blue-700">
                <ShieldCheck size={14} /> Giao dịch được bảo mật bởi SSL 256-bit
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary">← Quay lại</button>
            ) : (
              <Link to="/customer/cart" className="btn-secondary">← Giỏ hàng</Link>
            )}
            {step < 2 ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary">
                Tiếp theo <ChevronRight size={15} />
              </button>
            ) : (
              <button onClick={() => setSubmitted(true)} className="btn-primary bg-green-500 hover:bg-green-600 px-8">
                <Check size={15} /> Đặt hàng ({formatPrice(total)})
              </button>
            )}
          </div>
        </div>

        {/* Right — summary */}
        <div className="md:col-span-2">
          <div className="card p-4 sticky top-20 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Tóm tắt ({items.length} sản phẩm)</h3>
            <div className="space-y-3">
              {items.map(({ skuId, qty, product, sku }) => (
                <div key={skuId} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img src={product!.images[0]} className="w-12 h-12 object-cover rounded-lg" alt="" />
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{qty}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 line-clamp-1">{product!.name}</div>
                    <div className="text-[10px] text-gray-400">{Object.values(sku!.attributes).join(' / ')}</div>
                  </div>
                  <div className="text-xs font-bold text-gray-900 shrink-0">{formatPrice(sku!.price * qty)}</div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-gray-600"><span>Phí vận chuyển</span><span className="text-green-600">Miễn phí</span></div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t">
                <span>Tổng cộng</span>
                <span className="text-primary-600 text-base">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
