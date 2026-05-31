import { useState } from 'react'
import { Search, AlertTriangle } from 'lucide-react'
import { INVENTORY_ITEMS } from '@/data/inventoryMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'

export default function AdminInventoryPage() {
  const [filterShop, setFilterShop] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  const SHOPS = [
    { id: 'warehouse', name: 'Kho TT' },
    ...SHOP_MOCK_LIST.map(s => ({ id: s.id, name: s.name.replace('PetCare ', '') })),
  ]

  const filtered = INVENTORY_ITEMS
    .filter(i => filterShop === 'all' || i.shopId === filterShop)
    .filter(i => {
      if (filterStatus === 'low') return i.quantity > 0 && i.quantity <= i.minStock
      if (filterStatus === 'out') return i.quantity === 0
      return true
    })
    .filter(i => !search || i.productName.toLowerCase().includes(search.toLowerCase()) || i.skuCode.toLowerCase().includes(search.toLowerCase()))

  const outOfStock = INVENTORY_ITEMS.filter(i => i.quantity === 0)
  const lowStock = INVENTORY_ITEMS.filter(i => i.quantity > 0 && i.quantity <= i.minStock)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tồn kho Toàn hệ thống</h1>
        <p className="text-sm text-gray-500">{INVENTORY_ITEMS.length} SKU đang theo dõi</p>
      </div>

      {/* Alert row */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {outOfStock.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-sm text-red-700 font-medium">{outOfStock.length} SKU hết hàng</span>
              <button onClick={() => setFilterStatus('out')} className="text-xs text-red-500 underline">Lọc</button>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
              <AlertTriangle size={14} className="text-orange-500" />
              <span className="text-sm text-orange-700 font-medium">{lowStock.length} SKU sắp hết</span>
              <button onClick={() => setFilterStatus('low')} className="text-xs text-orange-500 underline">Lọc</button>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9 text-sm" placeholder="Tìm sản phẩm, mã SKU..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input w-auto text-sm" value={filterShop} onChange={e => setFilterShop(e.target.value)}>
          <option value="all">Tất cả chi nhánh</option>
          {SHOPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="form-input w-auto text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="low">Sắp hết</option>
          <option value="out">Hết hàng</option>
        </select>
        {(filterShop !== 'all' || filterStatus !== 'all' || search) && (
          <button onClick={() => { setFilterShop('all'); setFilterStatus('all'); setSearch('') }} className="btn-secondary text-sm py-2">Xóa bộ lọc</button>
        )}
      </div>

      <p className="text-xs text-gray-500">{filtered.length} kết quả</p>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th">Sản phẩm</th>
              <th className="table-th">SKU</th>
              <th className="table-th">Chi nhánh</th>
              <th className="table-th text-right">Tồn kho</th>
              <th className="table-th text-right">Tối thiểu</th>
              <th className="table-th">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((item, idx) => {
              const isOut = item.quantity === 0
              const isLow = !isOut && item.quantity <= item.minStock
              const shopName = item.shopId === 'warehouse' ? 'Kho TT' : (SHOP_MOCK_LIST.find(s => s.id === item.shopId)?.name.replace('PetCare ', '') ?? item.shopId)
              return (
                <tr key={`${item.skuId}-${item.shopId}-${idx}`} className={`hover:bg-gray-50 ${isOut ? 'opacity-60' : ''}`}>
                  <td className="table-td text-sm font-medium">{item.productName}</td>
                  <td className="table-td font-mono text-xs text-gray-400">{item.skuCode}</td>
                  <td className="table-td text-xs">{shopName}</td>
                  <td className="table-td text-right">
                    <span className={`text-sm font-bold ${isOut ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-green-600'}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="table-td text-right text-xs text-gray-400">{item.minStock}</td>
                  <td className="table-td">
                    {isOut ? <span className="badge-red">Hết hàng</span>
                      : isLow ? <span className="badge-orange">Sắp hết</span>
                      : <span className="badge-green">Còn hàng</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">Không có dữ liệu</div>
        )}
      </div>
    </div>
  )
}
