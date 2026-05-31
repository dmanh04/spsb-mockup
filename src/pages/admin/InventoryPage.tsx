import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, AlertTriangle, Plus, ClipboardList, History } from 'lucide-react'
import { INVENTORY_ITEMS, INVENTORY_TRANSACTIONS } from '@/data/inventoryMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'

export default function AdminInventoryPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'balances' | 'transactions'>('balances')
  const [filterShop, setFilterShop] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  const SHOPS = [
    { id: 'warehouse', name: 'Kho TT' },
    ...SHOP_MOCK_LIST.map(s => ({ id: s.id, name: s.name.replace('PetCare ', '') })),
  ]

  // Filter items (stock balances tab)
  const filteredItems = INVENTORY_ITEMS
    .filter(i => filterShop === 'all' || i.shopId === filterShop)
    .filter(i => {
      if (filterStatus === 'low') return i.quantity > 0 && i.quantity <= i.minStock
      if (filterStatus === 'out') return i.quantity === 0
      return true
    })
    .filter(i => !search || i.productName.toLowerCase().includes(search.toLowerCase()) || i.skuCode.toLowerCase().includes(search.toLowerCase()))

  // Filter transactions (logs tab)
  const filteredTransactions = INVENTORY_TRANSACTIONS
    .filter(t => filterShop === 'all' || t.shopId === filterShop)
    .filter(t => !search || t.productName.toLowerCase().includes(search.toLowerCase()) || t.skuCode.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const outOfStock = INVENTORY_ITEMS.filter(i => i.quantity === 0)
  const lowStock = INVENTORY_ITEMS.filter(i => i.quantity > 0 && i.quantity <= i.minStock)

  return (
    <div className="space-y-6 text-sm animate-fadeIn">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white/70 backdrop-blur-xl border border-gray-100 p-5 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Tồn kho Toàn hệ thống</h1>
          <p className="text-gray-500 mt-1 font-medium">
            {INVENTORY_ITEMS.length} SKU đang theo dõi · {INVENTORY_TRANSACTIONS.length} giao dịch kho
          </p>
        </div>
        
        <div>
          <button 
            onClick={() => navigate('/admin/inventory/adjust')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Cân đối tồn kho
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex items-center gap-2 border-b border-gray-150 pb-px">
        <button
          onClick={() => setActiveTab('balances')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm transition-all border-b-2 -mb-px cursor-pointer ${
            activeTab === 'balances'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ClipboardList size={16} /> Số dư tồn kho
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm transition-all border-b-2 -mb-px cursor-pointer ${
            activeTab === 'transactions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <History size={16} /> Nhật ký giao dịch kho
        </button>
      </div>

      {/* Active Tab 1: Balances */}
      {activeTab === 'balances' && (
        <div className="space-y-5 animate-slideIn">
          {/* Alerts bar */}
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
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2 text-orange-850 shadow-sm">
                  <AlertTriangle size={15} className="text-orange-500 shrink-0" />
                  <span className="text-xs font-bold">{lowStock.length} SKU sắp hết hàng</span>
                  <button onClick={() => setFilterStatus('low')} className="text-xs text-orange-600 hover:text-orange-800 font-bold hover:underline cursor-pointer">Lọc</button>
                </div>
              )}
            </div>
          )}

          {/* Filters controls */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none text-sm font-semibold transition-all" 
                placeholder="Tìm sản phẩm, mã SKU..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            
            <select 
              className="px-4 py-2 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-semibold" 
              value={filterShop} 
              onChange={e => setFilterShop(e.target.value)}
            >
              <option value="all">Tất cả chi nhánh</option>
              {SHOPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            
            <select 
              className="px-4 py-2 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-semibold" 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="low">Sắp hết</option>
              <option value="out">Hết hàng</option>
            </select>

            {(filterShop !== 'all' || filterStatus !== 'all' || search) && (
              <button 
                onClick={() => { setFilterShop('all'); setFilterStatus('all'); setSearch('') }} 
                className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-2xl font-bold cursor-pointer transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500">{filteredItems.length} sản phẩm thỏa mãn bộ lọc</p>

          {/* Table list */}
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
                      <td className="px-5 py-4">
                        <div className="text-sm font-bold text-gray-900">{item.productName}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-400">{item.skuCode}</td>
                      <td className="px-5 py-4 text-xs font-bold text-gray-600">{shopLabel}</td>
                      <td className="px-5 py-4 text-right font-mono">
                        <span className={`text-sm font-extrabold ${isOut ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-green-600'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-xs text-gray-400 font-mono">{item.minStock}</td>
                      <td className="px-5 py-4">
                        {isOut ? <span className="badge-red">Hết hàng</span>
                          : isLow ? <span className="badge-orange">Sắp hết</span>
                          : <span className="badge-green">Còn hàng</span>}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => navigate(`/admin/inventory/adjust?skuCode=${item.skuCode}&shopId=${item.shopId}`)}
                          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
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

      {/* Active Tab 2: Transactions */}
      {activeTab === 'transactions' && (
        <div className="space-y-5 animate-slideIn">
          {/* Filters controls */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none text-sm font-semibold transition-all" 
                placeholder="Tìm giao dịch, mã SKU..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            
            <select 
              className="px-4 py-2 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-semibold" 
              value={filterShop} 
              onChange={e => setFilterShop(e.target.value)}
            >
              <option value="all">Tất cả chi nhánh</option>
              {SHOPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            {(filterShop !== 'all' || search) && (
              <button 
                onClick={() => { setFilterShop('all'); setSearch('') }} 
                className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-2xl font-bold cursor-pointer transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500">{filteredTransactions.length} giao dịch kho được tìm thấy</p>

          {/* Transactions list */}
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
                  <th className="px-5 py-4">Chi tiết / Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {filteredTransactions.map((tx) => {
                  const isPositive = tx.quantity > 0
                  const txTypeLabels: Record<string, string> = {
                    stock_in: 'Nhập hàng',
                    stock_out: 'Xuất hàng',
                    transfer_in: 'Nhận chuyển',
                    transfer_out: 'Gửi chuyển',
                    adjustment: 'Cân đối kho'
                  }
                  const txTypeColors: Record<string, string> = {
                    stock_in: 'badge-green',
                    stock_out: 'badge-red',
                    transfer_in: 'badge-blue',
                    transfer_out: 'badge-orange',
                    adjustment: 'badge-gray'
                  }
                  const shopLabel = tx.shopId === 'warehouse' ? 'Kho TT' : (SHOP_MOCK_LIST.find(s => s.id === tx.shopId)?.name.replace('PetCare ', '') ?? tx.shopId)
                  
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4 font-mono text-xs text-gray-900 font-bold">{tx.id}</td>
                      <td className="px-5 py-4 text-xs">
                        <span className={txTypeColors[tx.type] || 'badge-gray'}>
                          {txTypeLabels[tx.type] || tx.type}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-bold text-gray-900">{tx.productName}</div>
                        <div className="text-[9px] text-gray-400 font-mono mt-0.5">{tx.skuCode}</div>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-gray-650">{shopLabel}</td>
                      <td className="px-5 py-4 text-right font-mono font-black">
                        <span className={isPositive ? 'text-green-600' : 'text-red-500'}>
                          {isPositive ? `+${tx.quantity}` : tx.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-800">{tx.createdBy}</td>
                      <td className="px-5 py-4 text-xs text-gray-400 font-mono">{tx.createdAt}</td>
                      <td className="px-5 py-4 text-xs text-gray-500 max-w-xs truncate" title={tx.note}>
                        {tx.note}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <div className="text-lg">📋</div>
                <div className="font-semibold text-xs">Chưa có lịch sử giao dịch kho nào được ghi nhận.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
