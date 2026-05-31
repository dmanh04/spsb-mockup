import { useState } from 'react'
import { Search, Receipt, CreditCard, Banknote, Smartphone, Check, Printer } from 'lucide-react'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_COLORS } from '@/data/bookingMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'
import type { Booking } from '@/types'

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Tiền mặt', icon: Banknote, color: 'text-green-600' },
  { id: 'momo', label: 'MoMo', icon: Smartphone, color: 'text-pink-600' },
  { id: 'transfer', label: 'Chuyển khoản', icon: CreditCard, color: 'text-blue-600' },
]

export default function CheckoutCounterPage() {
  const { currentUser } = useAuthContext()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Booking | null>(null)
  const [payMethod, setPayMethod] = useState('cash')
  const [paid, setPaid] = useState<string[]>([])
  const [discount, setDiscount] = useState(0)
  const [printInvoice, setPrintInvoice] = useState(false)

  const completedBookings = BOOKING_MOCK_LIST.filter(b =>
    b.shopId === currentUser?.shopId && b.status === 'completed' && !paid.includes(b.id)
  )
  const results = query.length > 1
    ? completedBookings.filter(b => b.id.toLowerCase().includes(query.toLowerCase()) || b.customerPhone.includes(query) || b.petName.toLowerCase().includes(query.toLowerCase()))
    : completedBookings

  function handlePayment() {
    if (!selected) return
    setPaid(prev => [...prev, selected.id])
    if (printInvoice) {
      alert(`📄 In hóa đơn BK-${selected.id}\nDịch vụ: ${selected.serviceName}\nSố tiền: ${formatPrice(selected.price - discount)}\nPhương thức: ${PAYMENT_METHODS.find(m => m.id === payMethod)?.label}`)
    }
    setSelected(null)
    setPrintInvoice(false)
    setDiscount(0)
  }

  const finalAmount = selected ? selected.price - discount : 0

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Checkout & Thu tiền</h1>
        <p className="text-sm text-gray-500">Xử lý thanh toán cho các dịch vụ đã hoàn thành</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="form-input pl-10 py-3 text-base" placeholder="Tìm booking đã hoàn thành..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Completed bookings list */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500">Chờ thu tiền ({results.length})</h2>
          {results.length === 0 ? (
            <div className="card p-6 text-center text-sm text-gray-400">Không có dịch vụ nào cần thu tiền</div>
          ) : (
            results.map(b => (
              <button key={b.id} onClick={() => setSelected(b)}
                className={`w-full card p-4 text-left transition-all hover:shadow-md ${selected?.id === b.id ? 'border-primary-400 bg-primary-50' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold text-primary-600">{b.id}</span>
                  <span className="text-lg font-black text-gray-900">{formatPrice(b.price)}</span>
                </div>
                <div className="text-sm font-medium text-gray-900">{b.petName} — {b.serviceName}</div>
                <div className="text-xs text-gray-500 mt-0.5">{b.customerName} · {b.customerPhone}</div>
                {b.assignedStaffName && <div className="text-xs text-gray-400">NV: {b.assignedStaffName} · {b.startTime}–{b.endTime}</div>}
              </button>
            ))
          )}
        </div>

        {/* Payment panel */}
        {selected ? (
          <div className="card p-5 space-y-4 sticky top-4">
            <div className="flex items-center gap-2 mb-1">
              <Receipt size={18} className="text-primary-500" />
              <h3 className="font-semibold text-gray-900">Thu tiền — {selected.id}</h3>
            </div>

            {/* Invoice preview */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm border">
              <div className="text-center mb-3">
                <div className="font-bold text-gray-900 text-base">HÓA ĐƠN DỊCH VỤ</div>
                <div className="text-xs text-gray-400">PetCare — {currentUser?.shopId}</div>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Dịch vụ</span>
                <span className="font-medium">{selected.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thú cưng</span>
                <span>{selected.petName} ({selected.petBreed})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian</span>
                <span>{selected.date} · {selected.startTime}–{selected.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NV thực hiện</span>
                <span>{selected.assignedStaffName ?? '—'}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Giá dịch vụ</span>
                <span className="font-bold">{formatPrice(selected.price)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-black text-primary-600">
                <span>TỔNG THANH TOÁN</span>
                <span>{formatPrice(finalAmount)}</span>
              </div>
            </div>

            {/* Discount input */}
            <div>
              <label className="form-label">Giảm giá thêm (đ)</label>
              <input type="number" min={0} max={selected.price} className="form-input" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
            </div>

            {/* Payment method */}
            <div>
              <label className="form-label">Phương thức thanh toán</label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(m => (
                  <button key={m.id} onClick={() => setPayMethod(m.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${payMethod === m.id ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <m.icon size={18} className={m.color} />
                    <span className="text-xs font-medium text-gray-700">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {payMethod === 'transfer' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                STK: 9021000234567 — MB Bank — PETCARE SYSTEM<br />
                Nội dung: {selected.id} — {selected.customerName}
              </div>
            )}

            {/* Options */}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="accent-primary-500" checked={printInvoice} onChange={e => setPrintInvoice(e.target.checked)} />
              <Printer size={14} className="text-gray-500" />
              In hóa đơn sau khi thanh toán
            </label>

            <div className="flex gap-2">
              <button onClick={handlePayment} className="flex-1 btn-primary justify-center py-3 bg-green-500 hover:bg-green-600 text-base font-bold">
                <Check size={16} /> Thu tiền {formatPrice(finalAmount)}
              </button>
              <button onClick={() => setSelected(null)} className="btn-secondary">Hủy</button>
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center text-gray-400">
            <Receipt size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Chọn booking đã hoàn thành để thu tiền</p>
          </div>
        )}
      </div>
    </div>
  )
}
