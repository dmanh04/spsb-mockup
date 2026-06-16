import { Link } from 'react-router-dom'
import {
  AlertTriangle, TrendingDown, Package, ArrowLeftRight,
  ArrowDownToLine, ArrowUpFromLine, ClipboardCheck, Boxes,
  ChevronRight, Clock, FileText
} from 'lucide-react'
import { INVENTORY_ITEMS, INVENTORY_TRANSACTIONS } from '@/data/inventoryMockData'
import { TRANSFER_MOCK_LIST } from '@/data/transferMockData'
import { STOCK_RECEIPTS } from '@/data/stockReceiptMockData'
import { STOCK_ISSUES } from '@/data/stockIssueMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { formatPrice } from '@/utils/format'

export default function WarehouseDashboardPage() {
  const warehouseItems = INVENTORY_ITEMS.filter(i => i.shopId === 'warehouse')
  const lowStock = INVENTORY_ITEMS.filter(i => i.quantity <= i.minStock && i.quantity > 0)
  const outOfStock = INVENTORY_ITEMS.filter(i => i.quantity === 0)
  const pendingTransfers = TRANSFER_MOCK_LIST.filter(t => t.status === 'pending')
  const pendingReceipts = STOCK_RECEIPTS.filter(r => r.status === 'pending_approval')
  const pendingIssues = STOCK_ISSUES.filter(r => r.status === 'pending_approval')
  const recentTx = [...INVENTORY_TRANSACTIONS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)

  const totalInventoryValue = INVENTORY_ITEMS.reduce((s, i) => s + i.quantity * (i.unitPrice || 0), 0)
  const totalSKUs = new Set(INVENTORY_ITEMS.map(i => i.skuCode)).size

  const TX_LABELS: Record<string, string> = {
    stock_in: 'Nhập kho', stock_out: 'Xuất kho', transfer_in: 'Nhận hàng',
    transfer_out: 'Xuất chuyển', adjustment: 'Điều chỉnh',
  }
  const TX_BADGE: Record<string, string> = {
    stock_in: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    stock_out: 'bg-red-50 text-red-600 border-red-200',
    transfer_in: 'bg-blue-50 text-blue-700 border-blue-200',
    transfer_out: 'bg-amber-50 text-amber-700 border-amber-200',
    adjustment: 'bg-gray-100 text-gray-600 border-gray-200',
  }

  const pendingTotal = pendingReceipts.length + pendingIssues.length + pendingTransfers.length

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard Kho</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kho trung tâm · Tổng quan hệ thống tồn kho</p>
        </div>
        <div className="flex gap-2">
          <Link to="/warehouse/receipts/new" className="btn-primary text-sm py-2">
            <ArrowDownToLine size={15} /> Tạo phiếu nhập
          </Link>
          <Link to="/warehouse/issues/new" className="btn-secondary text-sm py-2">
            <ArrowUpFromLine size={15} /> Tạo phiếu xuất
          </Link>
        </div>
      </div>

      {/* Alert Bar */}
      {(outOfStock.length > 0 || lowStock.length > 0 || pendingTotal > 0) && (
        <div className="flex flex-wrap gap-2">
          {outOfStock.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 shadow-sm">
              <AlertTriangle size={15} className="text-red-500 shrink-0" />
              <span className="text-xs font-bold text-red-800">{outOfStock.length} SKU hết hàng</span>
              <Link to="/warehouse/stock-in" className="text-xs text-red-600 font-bold hover:underline">Nhập hàng →</Link>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 shadow-sm">
              <TrendingDown size={15} className="text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-amber-800">{lowStock.length} SKU sắp hết</span>
            </div>
          )}
          {pendingTotal > 0 && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 shadow-sm">
              <Clock size={15} className="text-indigo-500 shrink-0" />
              <span className="text-xs font-bold text-indigo-800">{pendingTotal} phiếu chờ duyệt</span>
            </div>
          )}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng SKU theo dõi', value: totalSKUs, sub: `${warehouseItems.length} tại kho TT`, icon: Boxes, color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50', border: 'border-blue-100' },
          { label: 'Cần bổ sung', value: lowStock.length + outOfStock.length, sub: `${outOfStock.length} hết · ${lowStock.length} sắp hết`, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50', border: 'border-amber-100' },
          { label: 'Phiếu chờ duyệt', value: pendingTotal, sub: `${pendingReceipts.length} nhập · ${pendingIssues.length} xuất · ${pendingTransfers.length} chuyển`, icon: FileText, color: 'text-indigo-600', bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50', border: 'border-indigo-100' },
          { label: 'Giá trị tồn kho', value: totalInventoryValue > 0 ? formatPrice(totalInventoryValue) : '—', sub: 'Ước tính toàn hệ thống', icon: Package, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50', border: 'border-emerald-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-5 shadow-sm`}>
            <div className="flex items-start justify-between">
              <div>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-sm font-bold text-gray-800 mt-1">{s.label}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{s.sub}</div>
              </div>
              <div className={`p-2.5 rounded-xl ${s.bg} ${s.color} opacity-70`}>
                <s.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-bold text-gray-900">Thao tác nhanh</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Tạo phiếu nhập kho (GRN)', path: '/warehouse/receipts/new', icon: ArrowDownToLine, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
              { label: 'Tạo phiếu xuất kho (GIN)', path: '/warehouse/issues/new', icon: ArrowUpFromLine, color: 'text-red-500 bg-red-50 hover:bg-red-100' },
              { label: 'Tạo phiếu chuyển kho', path: '/warehouse/transfers/new', icon: ArrowLeftRight, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
              { label: 'Kiểm kê tồn kho', path: '/warehouse/stock-count', icon: ClipboardCheck, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
              { label: 'Xem tồn kho', path: '/warehouse/stock-in', icon: Boxes, color: 'text-gray-600 bg-gray-50 hover:bg-gray-100' },
            ].map(a => (
              <Link key={a.path} to={a.path} className={`flex items-center justify-between p-3 rounded-xl ${a.color} transition-all group`}>
                <div className="flex items-center gap-3">
                  <a.icon size={16} />
                  <span className="text-sm font-semibold">{a.label}</span>
                </div>
                <ChevronRight size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* Inventory by Branch */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-bold text-gray-900">Tồn kho theo chi nhánh</h2>
          </div>
          <div className="p-4 space-y-3">
            {['warehouse', 'SH01', 'SH02', 'SH03'].map(shopId => {
              const items = INVENTORY_ITEMS.filter(i => i.shopId === shopId)
              const lowItems = items.filter(i => i.quantity <= i.minStock)
              const totalQty = items.reduce((s, i) => s + i.quantity, 0)
              const shopName = shopId === 'warehouse' ? 'Kho trung tâm' : (SHOP_MOCK_LIST.find(s => s.id === shopId)?.name.replace('PetCare ', '') ?? shopId)
              const isWarehouse = shopId === 'warehouse'
              return (
                <div key={shopId} className={`p-3.5 rounded-xl border ${isWarehouse ? 'bg-blue-50/30 border-blue-100' : 'bg-gray-50/50 border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-sm font-bold ${isWarehouse ? 'text-blue-900' : 'text-gray-900'}`}>{shopName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{items.length} SKU · Tổng: {totalQty}</div>
                    </div>
                    <div className="text-right">
                      {lowItems.length > 0 && (
                        <div className="text-xs text-amber-600 font-bold">{lowItems.length} cần bổ sung</div>
                      )}
                      {items.length === 0 && (
                        <div className="text-xs text-gray-400">Chưa có dữ liệu</div>
                      )}
                    </div>
                  </div>
                  {/* Mini bar */}
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${lowItems.length > items.length / 2 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${items.length > 0 ? Math.min(100, ((items.length - lowItems.length) / items.length) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Giao dịch gần đây</h2>
            <Link to="/warehouse/history" className="text-xs text-primary-600 hover:underline font-semibold">Xem tất cả</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentTx.map(tx => (
              <div key={tx.id} className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${TX_BADGE[tx.type]}`}>
                    {TX_LABELS[tx.type]}
                  </span>
                  <span className={`text-sm font-black font-mono ${tx.quantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                  </span>
                </div>
                <div className="text-xs text-gray-800 font-medium truncate">{tx.productName}</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-gray-400 font-mono">{tx.skuCode}</span>
                  <span className="text-[10px] text-gray-400">{tx.createdAt.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Receipts & Issues */}
      {(pendingReceipts.length > 0 || pendingIssues.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Pending Receipts */}
          {pendingReceipts.length > 0 && (
            <div className="card border-amber-100">
              <div className="card-header flex items-center justify-between bg-amber-50/30">
                <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <ArrowDownToLine size={14} /> Phiếu nhập chờ duyệt ({pendingReceipts.length})
                </h2>
                <Link to="/warehouse/receipts" className="text-xs text-amber-700 hover:underline font-semibold">Xem tất cả</Link>
              </div>
              <div className="divide-y divide-gray-100">
                {pendingReceipts.map(r => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary-600">{r.id}</span>
                      <span className="badge-orange text-[10px]">Chờ duyệt</span>
                    </div>
                    <div className="text-xs text-gray-700 mt-0.5">{r.supplierName}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{r.items.length} SKU · {r.createdAt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Issues */}
          {pendingIssues.length > 0 && (
            <div className="card border-red-100">
              <div className="card-header flex items-center justify-between bg-red-50/30">
                <h2 className="text-sm font-bold text-red-900 flex items-center gap-2">
                  <ArrowUpFromLine size={14} /> Phiếu xuất chờ duyệt ({pendingIssues.length})
                </h2>
                <Link to="/warehouse/issues" className="text-xs text-red-700 hover:underline font-semibold">Xem tất cả</Link>
              </div>
              <div className="divide-y divide-gray-100">
                {pendingIssues.map(r => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary-600">{r.id}</span>
                      <span className="badge-orange text-[10px]">Chờ duyệt</span>
                    </div>
                    <div className="text-xs text-gray-700 mt-0.5">{r.reason}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{r.items.length} SKU · {r.createdAt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Low stock table */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              Sản phẩm cần chú ý ({lowStock.length + outOfStock.length} SKU)
            </h2>
            <Link to="/warehouse/receipts/new" className="text-xs text-primary-600 hover:underline font-semibold">Tạo phiếu nhập →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">SKU</th>
                  <th className="table-th">Sản phẩm</th>
                  <th className="table-th">Chi nhánh</th>
                  <th className="table-th text-right">Tồn kho</th>
                  <th className="table-th text-right">Mức tối thiểu</th>
                  <th className="table-th">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...outOfStock, ...lowStock].map((item, i) => {
                  const shopName = item.shopId === 'warehouse' ? 'Kho TT' : (SHOP_MOCK_LIST.find(s => s.id === item.shopId)?.name.replace('PetCare ', '') ?? item.shopId)
                  return (
                    <tr key={`${item.skuId}-${item.shopId}-${i}`} className="hover:bg-gray-50/50">
                      <td className="table-td font-mono text-xs text-gray-500">{item.skuCode}</td>
                      <td className="table-td text-xs font-medium">{item.productName}</td>
                      <td className="table-td text-xs">{shopName}</td>
                      <td className="table-td text-right">
                        <span className={`text-sm font-black ${item.quantity === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="table-td text-right text-xs text-gray-400">{item.minStock}</td>
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
