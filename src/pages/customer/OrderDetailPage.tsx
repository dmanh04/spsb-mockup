import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, CreditCard } from 'lucide-react'
import { ORDER_MOCK_LIST, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/data/orderMockData'
import { formatPrice } from '@/utils/format'

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Tiền mặt', transfer: 'Chuyển khoản', card: 'Thẻ ngân hàng', momo: 'Ví MoMo',
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const order = ORDER_MOCK_LIST.find(o => o.id === id)

  if (!order) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3">🔍</div>
        <h2 className="text-lg font-semibold text-gray-700">Không tìm thấy đơn hàng</h2>
        <Link to="/customer/orders" className="btn-secondary mt-4 inline-flex">← Quay lại</Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/customer/orders" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Đơn hàng {order.id}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">{order.createdAt}</span>
            <span className={ORDER_STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-900">Sản phẩm ({order.items.length})</h3>
        </div>
        <div className="divide-y">
          {order.items.map(item => (
            <div key={item.skuId} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                <div className="text-xs text-gray-500">{item.variantLabel}</div>
              </div>
              <div className="text-right text-sm">
                <div className="text-gray-400">×{item.quantity}</div>
                <div className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment summary */}
      <div className="card p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Thanh toán</h3>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tạm tính</span><span>{formatPrice(order.subtotal)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Giảm giá {order.voucherId && `(${order.voucherId})`}</span>
            <span>-{formatPrice(order.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
          <span>Tổng cộng</span>
          <span className="text-primary-600 text-base">{formatPrice(order.total)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 pt-1">
          <CreditCard size={13} />
          <span>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
        </div>
      </div>

      {/* Shipping */}
      {order.shippingAddress && (
        <div className="card p-4">
          <div className="flex items-start gap-2 text-sm">
            <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-gray-900 mb-0.5">Địa chỉ giao hàng</div>
              <div className="text-gray-600">{order.shippingAddress}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
