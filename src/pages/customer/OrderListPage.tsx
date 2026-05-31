import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import { ORDER_MOCK_LIST, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/data/orderMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'

export default function OrderListPage() {
  const { currentUser } = useAuthContext()
  const myOrders = ORDER_MOCK_LIST.filter(o => o.customerId === currentUser?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  if (myOrders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package size={40} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">Chưa có đơn hàng nào</h2>
        <Link to="/customer/products" className="btn-primary mt-4 inline-flex">Mua sắm ngay</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Đơn hàng của tôi</h1>
      <div className="space-y-3">
        {myOrders.map(order => (
          <Link key={order.id} to={`/customer/orders/${order.id}`}
            className="card p-4 hover:shadow-md transition-shadow group block">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="font-mono text-sm font-bold text-primary-600">{order.id}</span>
                <div className="text-xs text-gray-400 mt-0.5">{order.createdAt}</div>
              </div>
              <span className={ORDER_STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</span>
            </div>
            <div className="space-y-1 mb-3">
              {order.items.slice(0, 2).map(item => (
                <div key={item.skuId} className="text-xs text-gray-600">
                  {item.productName} <span className="text-gray-400">({item.variantLabel})</span> × {item.quantity}
                </div>
              ))}
              {order.items.length > 2 && (
                <div className="text-xs text-gray-400">+{order.items.length - 2} sản phẩm khác</div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-gray-500">Tổng: </span>
                <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
