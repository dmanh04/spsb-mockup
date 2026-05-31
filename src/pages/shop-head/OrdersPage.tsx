import { useState } from 'react'
import { Package } from 'lucide-react'
import { ORDER_MOCK_LIST, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/data/orderMockData'
import { BOOKING_MOCK_LIST } from '@/data/bookingMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'

export default function ShopHeadOrdersPage() {
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'
  const [tab, setTab] = useState<'orders' | 'paid_services'>('orders')

  const shopOrders = ORDER_MOCK_LIST.filter(o => o.shopId === shopId)
  const paidServices = BOOKING_MOCK_LIST.filter(b => b.shopId === shopId && b.status === 'paid')
  const shopRevenue = shopOrders.reduce((s, o) => s + o.total, 0) + paidServices.reduce((s, b) => s + b.price, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Đơn hàng & Doanh thu</h1>
        <p className="text-sm text-gray-500">Tổng doanh thu: <span className="font-bold text-primary-600">{formatPrice(shopRevenue)}</span></p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('orders')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'orders' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
          Đơn hàng ({shopOrders.length})
        </button>
        <button onClick={() => setTab('paid_services')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'paid_services' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
          Dịch vụ đã thu ({paidServices.length})
        </button>
      </div>

      {tab === 'orders' && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="table-th">Mã đơn</th>
                <th className="table-th">Khách hàng</th>
                <th className="table-th">Sản phẩm</th>
                <th className="table-th">Thanh toán</th>
                <th className="table-th">Trạng thái</th>
                <th className="table-th text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {shopOrders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="table-td font-mono text-xs text-primary-600">{o.id}</td>
                  <td className="table-td">
                    <div className="text-sm font-medium">{o.customerName}</div>
                    <div className="text-xs text-gray-400">{o.createdAt}</div>
                  </td>
                  <td className="table-td text-xs text-gray-600">
                    {o.items.slice(0, 2).map(i => i.productName).join(', ')}
                    {o.items.length > 2 && ` +${o.items.length - 2}`}
                  </td>
                  <td className="table-td text-xs capitalize">{o.paymentMethod}</td>
                  <td className="table-td"><span className={ORDER_STATUS_COLORS[o.status]}>{ORDER_STATUS_LABELS[o.status]}</span></td>
                  <td className="table-td text-right font-bold text-sm">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {shopOrders.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              <Package size={28} className="mx-auto mb-2 text-gray-300" />
              Không có đơn hàng nào
            </div>
          )}
        </div>
      )}

      {tab === 'paid_services' && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="table-th">Mã booking</th>
                <th className="table-th">Thú cưng / Khách</th>
                <th className="table-th">Dịch vụ</th>
                <th className="table-th">Ngày</th>
                <th className="table-th">Nhân viên</th>
                <th className="table-th text-right">Doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paidServices.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="table-td font-mono text-xs text-primary-600">{b.id}</td>
                  <td className="table-td">
                    <div className="text-sm font-medium">{b.petName}</div>
                    <div className="text-xs text-gray-400">{b.customerName}</div>
                  </td>
                  <td className="table-td text-xs">{b.serviceName}</td>
                  <td className="table-td text-xs">{b.date}</td>
                  <td className="table-td text-xs">{b.assignedStaffName ?? '—'}</td>
                  <td className="table-td text-right font-bold text-sm text-green-600">{formatPrice(b.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
