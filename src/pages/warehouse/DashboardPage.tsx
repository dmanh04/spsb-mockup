import { Link } from 'react-router-dom'
import { AlertTriangle, TrendingDown, Package, ArrowLeftRight } from 'lucide-react'
import { INVENTORY_ITEMS, INVENTORY_TRANSACTIONS } from '@/data/inventoryMockData'
import { TRANSFER_MOCK_LIST } from '@/data/transferMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'

export default function WarehouseDashboardPage() {
  const warehouseItems = INVENTORY_ITEMS.filter(i => i.shopId === 'warehouse')
  const lowStock = INVENTORY_ITEMS.filter(i => i.quantity <= i.minStock && i.quantity > 0)
  const outOfStock = INVENTORY_ITEMS.filter(i => i.quantity === 0)
  const pendingTransfers = TRANSFER_MOCK_LIST.filter(t => t.status === 'pending')
  const recentTx = [...INVENTORY_TRANSACTIONS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  const TX_LABELS: Record<string, string> = {
    stock_in: 'Nhập kho', stock_out: 'Xuất kho', transfer_in: 'Nhận hàng', transfer_out: 'Xuất chuyển', adjustment: 'Điều chỉnh',
  }
  const TX_COLORS: Record<string, string> = {
    stock_in: 'text-green-600', stock_out: 'text-red-500', transfer_in: 'text-blue-600', transfer_out: 'text-orange-500', adjustment: 'text-gray-500',
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Kho</h1>
        <p className="text-sm text-gray-500">Kho trung tâm · Tổng quan tồn kho</p>
      </div>

      {/* Alerts */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="space-y-2">
          {outOfStock.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
              <AlertTriangle size={16} className="text-red-500 shrink-0" />
              <span className="text-sm text-red-700 font-medium">{outOfStock.length} SKU đã hết hàng</span>
              <Link to="/warehouse/stock-in" className="ml-auto text-xs text-red-600 underline">Nhập hàng</Link>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-3">
              <TrendingDown size={16} className="text-orange-500 shrink-0" />
              <span className="text-sm text-orange-700 font-medium">{lowStock.length} SKU sắp hết hàng (dưới mức tối thiểu)</span>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'SKU trong kho', value: warehouseItems.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Sắp hết hàng', value: lowStock.length, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Hết hàng', value: outOfStock.length, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Phiếu chờ duyệt', value: pendingTransfers.length, icon: ArrowLeftRight, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs font-medium text-gray-600 mt-1">{s.label}</div>
              </div>
              <s.icon size={18} className={s.color + ' opacity-60'} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Inventory by shop */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-900">Tồn kho theo chi nhánh</h2>
          </div>
          <div className="p-4 space-y-3">
            {['warehouse', 'SH01', 'SH02', 'SH03'].map(shopId => {
              const items = INVENTORY_ITEMS.filter(i => i.shopId === shopId)
              const lowItems = items.filter(i => i.quantity <= i.minStock)
              const shopName = shopId === 'warehouse' ? 'Kho trung tâm' : (SHOP_MOCK_LIST.find(s => s.id === shopId)?.name.replace('PetCare ', '') ?? shopId)
              return (
                <div key={shopId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{shopName}</div>
                    <div className="text-xs text-gray-400">{items.length} SKU đang theo dõi</div>
                  </div>
                  <div className="text-right">
                    {lowItems.length > 0 && (
                      <div className="text-xs text-orange-500 font-medium">{lowItems.length} SKU cần bổ sung</div>
                    )}
                    <div className="text-xs text-gray-400 mt-0.5">Tổng SL: {items.reduce((s, i) => s + i.quantity, 0)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Giao dịch gần đây</h2>
            <Link to="/warehouse/history" className="text-xs text-primary-600 hover:underline">Xem tất cả</Link>
          </div>
          <div className="divide-y">
            {recentTx.map(tx => (
              <div key={tx.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-semibold ${TX_COLORS[tx.type]}`}>{TX_LABELS[tx.type]}</span>
                  <span className={`text-sm font-bold ${tx.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                  </span>
                </div>
                <div className="text-xs text-gray-700 truncate">{tx.productName}</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs text-gray-400">{tx.skuCode}</span>
                  <span className="text-xs text-gray-400">{tx.createdAt.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock table */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-500" /> Cần chú ý ({lowStock.length + outOfStock.length} SKU)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="table-th">SKU</th>
                  <th className="table-th">Sản phẩm</th>
                  <th className="table-th">Chi nhánh</th>
                  <th className="table-th">Tồn kho</th>
                  <th className="table-th">Mức tối thiểu</th>
                  <th className="table-th">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...outOfStock, ...lowStock].map((item, i) => {
                  const shopName = item.shopId === 'warehouse' ? 'Kho TT' : (SHOP_MOCK_LIST.find(s => s.id === item.shopId)?.name.replace('PetCare ', '') ?? item.shopId)
                  return (
                    <tr key={`${item.skuId}-${item.shopId}-${i}`} className="hover:bg-gray-50">
                      <td className="table-td font-mono text-xs text-gray-500">{item.skuCode}</td>
                      <td className="table-td text-xs">{item.productName}</td>
                      <td className="table-td text-xs">{shopName}</td>
                      <td className="table-td">
                        <span className={`text-sm font-bold ${item.quantity === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="table-td text-xs text-gray-500">{item.minStock}</td>
                      <td className="table-td">
                        <span className={item.quantity === 0 ? 'badge-red' : 'badge-orange'}>
                          {item.quantity === 0 ? 'Hết hàng' : 'Sắp hết'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
