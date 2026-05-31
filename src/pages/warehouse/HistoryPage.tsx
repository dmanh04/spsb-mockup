import { useState } from 'react'
import { INVENTORY_TRANSACTIONS } from '@/data/inventoryMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import type { InventoryTxType } from '@/types'

const TX_LABELS: Record<InventoryTxType, string> = {
  stock_in: 'Nhập kho', stock_out: 'Xuất kho',
  transfer_in: 'Nhận chuyển', transfer_out: 'Xuất chuyển', adjustment: 'Điều chỉnh',
}
const TX_COLORS: Record<InventoryTxType, string> = {
  stock_in: 'badge-green', stock_out: 'badge-red',
  transfer_in: 'badge-blue', transfer_out: 'badge-orange', adjustment: 'badge-gray',
}
const QTY_SIGN: Record<InventoryTxType, number> = {
  stock_in: 1, stock_out: -1, transfer_in: 1, transfer_out: -1, adjustment: 0,
}

export default function HistoryPage() {
  const [filterType, setFilterType] = useState<InventoryTxType | 'all'>('all')
  const [search, setSearch] = useState('')

  const sorted = [...INVENTORY_TRANSACTIONS].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const filtered = sorted
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => !search || t.productName.toLowerCase().includes(search.toLowerCase()) || t.skuCode.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Lịch sử kho</h1>
        <p className="text-sm text-gray-500">{INVENTORY_TRANSACTIONS.length} giao dịch</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          className="form-input flex-1 min-w-48"
          placeholder="Tìm theo tên sản phẩm, mã SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="form-input w-auto" value={filterType} onChange={e => setFilterType(e.target.value as InventoryTxType | 'all')}>
          <option value="all">Tất cả loại</option>
          {(Object.entries(TX_LABELS) as [InventoryTxType, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th">Mã GD</th>
              <th className="table-th">Loại</th>
              <th className="table-th">Sản phẩm</th>
              <th className="table-th">SKU</th>
              <th className="table-th">Chi nhánh</th>
              <th className="table-th">Số lượng</th>
              <th className="table-th">Ghi chú</th>
              <th className="table-th">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(tx => {
              const sign = QTY_SIGN[tx.type]
              const shopName = tx.shopId === 'warehouse' ? 'Kho TT' : (SHOP_MOCK_LIST.find(s => s.id === tx.shopId)?.name.replace('PetCare ', '') ?? tx.shopId ?? '—')
              return (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="table-td font-mono text-xs text-gray-400">{tx.id}</td>
                  <td className="table-td"><span className={TX_COLORS[tx.type]}>{TX_LABELS[tx.type]}</span></td>
                  <td className="table-td text-xs">{tx.productName}</td>
                  <td className="table-td font-mono text-xs text-gray-400">{tx.skuCode}</td>
                  <td className="table-td text-xs">{shopName}</td>
                  <td className="table-td">
                    <span className={`text-sm font-bold ${sign > 0 ? 'text-green-600' : sign < 0 ? 'text-red-500' : 'text-gray-600'}`}>
                      {sign > 0 ? '+' : sign < 0 ? '-' : '±'}{Math.abs(tx.quantity)}
                    </span>
                  </td>
                  <td className="table-td text-xs text-gray-500 max-w-32 truncate">{tx.note}</td>
                  <td className="table-td text-xs text-gray-400">{tx.createdAt}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">Không có giao dịch nào</div>
        )}
      </div>
    </div>
  )
}
