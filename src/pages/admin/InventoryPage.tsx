import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search, AlertTriangle, Plus, ClipboardList, History, Package,
  ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Boxes, TrendingDown
} from 'lucide-react'
import { INVENTORY_ITEMS, INVENTORY_TRANSACTIONS } from '@/data/inventoryMockData'
import { STOCK_RECEIPTS } from '@/data/stockReceiptMockData'
import { STOCK_ISSUES } from '@/data/stockIssueMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { formatPrice } from '@/utils/format'

export default function AdminInventoryPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'balances' | 'transactions'>('overview')
  const [filterShop, setFilterShop] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  const SHOPS = [
    { id: 'warehouse', name: 'Kho TT' },
    ...SHOP_MOCK_LIST.map(s => ({ id: s.id, name: s.name.replace('PetCare ', '') })),
  ]

  const filteredItems = INVENTORY_ITEMS
    .filter(i => filterShop === 'all' || i.shopId === filterShop)
    .filter(i => {
      if (filterStatus === 'low') return i.quantity > 0 && i.quantity <= i.minStock
      if (filterStatus === 'out') return i.quantity === 0
      return true
    })
    .filter(i => !search || i.productName.toLowerCase().includes(search.toLowerCase()) || i.skuCode.toLowerCase().includes(search.toLowerCase()))

  const filteredTransactions = INVENTORY_TRANSACTIONS
    .filter(t => filterShop === 'all' || t.shopId === filterShop)
    .filter(t => !search || t.productName.toLowerCase().includes(search.toLowerCase()) || t.skuCode.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const outOfStock = INVENTORY_ITEMS.filter(i => i.quantity === 0)
  const lowStock = INVENTORY_ITEMS.filter(i => i.quantity > 0 && i.quantity <= i.minStock)
  const totalSKUs = new Set(INVENTORY_ITEMS.map(i => i.skuCode)).size
  const pendingReceipts = STOCK_RECEIPTS.filter(r => r.status === 'pending_approval').length
  const pendingIssues = STOCK_ISSUES.filter(r => r.status === 'pending_approval').length

  return (
    <div className="space-y-6 text-sm animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/70 backdrop-blur-xl border border-gray-100 p-5 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý Kho Toàn hệ thống</h1>
          <p className="text-gray-500 mt-1 font-medium">
            {totalSKUs} SKU · {INVENTORY_TRANSACTIONS.length} giao dịch · {pendingReceipts + pendingIssues > 0 && <span className="text-amber-600">{pendingReceipts + pendingIssues} phiếu chờ duyệt</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin/inventory/adjust')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95 cursor-pointer">
            <Plus size={16} /> Cân đối tồn kho
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-150 pb-px">
        {[
          { key: 'overview', label: 'Tổng quan', icon: Boxes },
          { key: 'balances', label: 'Tồn kho chi tiết', icon: ClipboardList },
          { key: 'transactions', label: 'Nhật ký giao dịch', icon: History },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm transition-all border-b-2 -mb-px cursor-pointer ${
              activeTab === tab.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5 animate-slideIn">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Tổng SKU', value: totalSKUs, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { label: 'Hết hàng', value: outOfStock.length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
              { label: 'Sắp hết', value: lowStock.length, icon: TrendingDown, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
              { label: 'Phiếu chờ duyệt', value: pendingReceipts + pendingIssues, icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-5 shadow-sm`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-xs font-bold text-gray-600 mt-1">{s.label}</div>
                  </div>
                  <s.icon size={20} className={`${s.color} opacity-60`} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Phiếu nhập kho', path: '/admin/inventory/receipts', icon: ArrowDownToLine, count: pendingReceipts, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200' },
              { label: 'Phiếu xuất kho', path: '/admin/inventory/issues', icon: ArrowUpFromLine, count: pendingIssues, color: 'text-red-500 bg-red-50 hover:bg-red-100 border-red-200' },
              { label: 'Phiếu chuyển kho', path: '/admin/inventory/transfers', icon: ArrowLeftRight, count: 0, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200' },
              { label: 'Kiểm kê kho', path: '/admin/inventory/stock-count', icon: ClipboardList, count: 0, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200' },
            ].map(a => (
              <Link key={a.path} to={a.path} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${a.color}`}>
                <a.icon size={20} />
                <div>
                  <div className="text-sm font-bold">{a.label}</div>
                  {a.count > 0 && <div className="text-xs font-semibold opacity-75">{a.count} chờ duyệt</div>}
                </div>
              </Link>
            ))}
          </div>

          {/* Inventory by branch */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Tồn kho theo chi nhánh</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Chi nhánh</th>
                    <th className="px-5 py-3 text-right">Tổng SKU</th>
                    <th className="px-5 py-3 text-right">Tổng SL</th>
                    <th className="px-5 py-3 text-right">Hết hàng</th>
                    <th className="px-5 py-3 text-right">Sắp hết</th>
                    <th className="px-5 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {['warehouse', ...SHOP_MOCK_LIST.map(s => s.id)].map(shopId => {
                    const items = INVENTORY_ITEMS.filter(i => i.shopId === shopId)
                    const out = items.filter(i => i.quantity === 0).length
                    const low = items.filter(i => i.quantity > 0 && i.quantity <= i.minStock).length
                    const total = items.reduce((s, i) => s + i.quantity, 0)
                    const shopName = shopId === 'warehouse' ? 'Kho Trung Tâm' : (SHOP_MOCK_LIST.find(s => s.id === shopId)?.name ?? shopId)
                    return (
                      <tr key={shopId} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-bold text-gray-900 text-sm">{shopName}</td>
                        <td className="px-5 py-3 text-right font-bold text-sm">{items.length}</td>
                        <td className="px-5 py-3 text-right font-mono text-sm">{total}</td>
                        <td className="px-5 py-3 text-right">{out > 0 ? <span className="badge-red text-[10px]">{out}</span> : <span className="text-gray-300">0</span>}</td>
                        <td className="px-5 py-3 text-right">{low > 0 ? <span className="badge-orange text-[10px]">{low}</span> : <span className="text-gray-300">0</span>}</td>
                        <td className="px-5 py-3">
                          {out > 0 ? <span className="badge-red">Cần bổ sung</span> : low > 0 ? <span className="badge-orange">Chú ý</span> : <span className="badge-green">Tốt</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Balances */}
      {activeTab === 'balances' && (
        <div className="space-y-5 animate-slideIn">
          {(outOfStock.length > 0 || lowStock.length > 0) && (
            <div className="flex flex-wrap gap-3">
              {outOfStock.length > 0 && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-2 text-red-800 shadow-sm">
                  <AlertTriangle size={15} className="text-red-500 shrink-0" />
                  <span className="text-xs font-bold">{outOfStock.length} SKU hết hàng</span>
                  <button onClick={() => setFilterStatus('out')} className="text-xs text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer">Lọc</button>
                </div>
              )}
              {lowStock.length > 0 && (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2 shadow-sm">
                  <AlertTriangle size={15} className="text-orange-500 shrink-0" />
                  <span className="text-xs font-bold text-orange-800">{lowStock.length} SKU sắp hết hàng</span>
                  <button onClick={() => setFilterStatus('low')} className="text-xs text-orange-600 hover:text-orange-800 font-bold hover:underline cursor-pointer">Lọc</button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none text-sm font-semibold transition-all"
                placeholder="Tìm sản phẩm, mã SKU..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-semibold"
              value={filterShop} onChange={e => setFilterShop(e.target.value)}>
              <option value="all">Tất cả chi nhánh</option>
              {SHOPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-semibold"
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="low">Sắp hết</option>
              <option value="out">Hết hàng</option>
            </select>
            {(filterShop !== 'all' || filterStatus !== 'all' || search) && (
              <button onClick={() => { setFilterShop('all'); setFilterStatus('all'); setSearch('') }}
                className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-2xl font-bold cursor-pointer">
                Xóa bộ lọc
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500">{filteredItems.length} sản phẩm thỏa mãn bộ lọc</p>

          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Sản phẩm</th>
                  <th className="px-5 py-4">SKU Code</th>
                  <th className="px-5 py-4">Vị trí kho / Shop</th>
                  <th className="px-5 py-4 text-right">Số lượng tồn</th>
                  <th className="px-5 py-4 text-right">Ngưỡng tối thiểu</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {filteredItems.map((item, idx) => {
                  const isOut = item.quantity === 0
                  const isLow = !isOut && item.quantity <= item.minStock
                  const shopLabel = item.shopId === 'warehouse' ? 'Kho TT' : (SHOP_MOCK_LIST.find(s => s.id === item.shopId)?.name.replace('PetCare ', '') ?? item.shopId)
                  return (
                    <tr key={`${item.skuId}-${item.shopId}-${idx}`} className={`hover:bg-gray-50/50 ${isOut ? 'bg-red-50/10' : ''}`}>
                      <td className="px-5 py-4"><div className="text-sm font-bold text-gray-900">{item.productName}</div></td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-400">{item.skuCode}</td>
                      <td className="px-5 py-4 text-xs font-bold text-gray-600">{shopLabel}</td>
                      <td className="px-5 py-4 text-right font-mono">
                        <span className={`text-sm font-extrabold ${isOut ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-green-600'}`}>{item.quantity}</span>
                      </td>
                      <td className="px-5 py-4 text-right text-xs text-gray-400 font-mono">{item.minStock}</td>
                      <td className="px-5 py-4">
                        {isOut ? <span className="badge-red">Hết hàng</span> : isLow ? <span className="badge-orange">Sắp hết</span> : <span className="badge-green">Còn hàng</span>}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button onClick={() => navigate(`/admin/inventory/adjust?skuCode=${item.skuCode}&shopId=${item.shopId}`)}
                          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-all cursor-pointer">
                          Cân đối
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <div className="text-lg">📭</div>
                <div className="font-semibold text-xs">Không tìm thấy tồn kho nào thỏa mãn điều kiện lọc.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Transactions */}
      {activeTab === 'transactions' && (
        <div className="space-y-5 animate-slideIn">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none text-sm font-semibold transition-all"
                placeholder="Tìm giao dịch, mã SKU..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-semibold"
              value={filterShop} onChange={e => setFilterShop(e.target.value)}>
              <option value="all">Tất cả chi nhánh</option>
              {SHOPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <p className="text-xs text-gray-500">{filteredTransactions.length} giao dịch</p>

          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Mã GD</th>
                  <th className="px-5 py-4">Phân loại</th>
                  <th className="px-5 py-4">Sản phẩm / SKU</th>
                  <th className="px-5 py-4">Chi nhánh</th>
                  <th className="px-5 py-4 text-right">Chênh lệch</th>
                  <th className="px-5 py-4">Người thực hiện</th>
                  <th className="px-5 py-4">Thời gian</th>
                  <th className="px-5 py-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {filteredTransactions.map(tx => {
                  const isPositive = tx.quantity > 0
                  const txTypeLabels: Record<string, string> = { stock_in: 'Nhập hàng', stock_out: 'Xuất hàng', transfer_in: 'Nhận chuyển', transfer_out: 'Gửi chuyển', adjustment: 'Cân đối kho' }
                  const txTypeColors: Record<string, string> = { stock_in: 'badge-green', stock_out: 'badge-red', transfer_in: 'badge-blue', transfer_out: 'badge-orange', adjustment: 'badge-gray' }
                  const shopLabel = tx.shopId === 'warehouse' ? 'Kho TT' : (SHOP_MOCK_LIST.find(s => s.id === tx.shopId)?.name.replace('PetCare ', '') ?? tx.shopId)
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4 font-mono text-xs text-gray-900 font-bold">{tx.id}</td>
                      <td className="px-5 py-4 text-xs"><span className={txTypeColors[tx.type] || 'badge-gray'}>{txTypeLabels[tx.type] || tx.type}</span></td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-bold text-gray-900">{tx.productName}</div>
                        <div className="text-[9px] text-gray-400 font-mono mt-0.5">{tx.skuCode}</div>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold">{shopLabel}</td>
                      <td className="px-5 py-4 text-right font-mono font-black">
                        <span className={isPositive ? 'text-green-600' : 'text-red-500'}>{isPositive ? `+${tx.quantity}` : tx.quantity}</span>
                      </td>
                      <td className="px-5 py-4 text-xs">{tx.createdBy}</td>
                      <td className="px-5 py-4 text-xs text-gray-400 font-mono">{tx.createdAt}</td>
                      <td className="px-5 py-4 text-xs text-gray-500 max-w-xs truncate" title={tx.note}>{tx.note}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <div className="text-lg">📋</div>
                <div className="font-semibold text-xs">Chưa có lịch sử giao dịch kho nào.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
