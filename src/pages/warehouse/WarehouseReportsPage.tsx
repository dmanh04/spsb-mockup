import { Download, Package, ArrowDown, ArrowUp, ArrowLeftRight } from 'lucide-react'
import { BarChart } from '@/components/shared/SVGChart'
import { INVENTORY_TRANSACTIONS } from '@/data/inventoryMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'

export default function WarehouseReportsPage() {
  const stockIn = INVENTORY_TRANSACTIONS.filter(t => t.type === 'stock_in')
  const stockOut = INVENTORY_TRANSACTIONS.filter(t => t.type === 'stock_out' || t.type === 'transfer_out')
  const transfers = INVENTORY_TRANSACTIONS.filter(t => t.type === 'transfer_in' || t.type === 'transfer_out')

  const totalIn = stockIn.reduce((s, t) => s + t.quantity, 0)
  const totalOut = stockOut.reduce((s, t) => s + Math.abs(t.quantity), 0)

  const MONTHLY_IN = [
    { label: 'T1', value: 240, color: '#10B981' }, { label: 'T2', value: 180, color: '#10B981' },
    { label: 'T3', value: 320, color: '#10B981' }, { label: 'T4', value: 210, color: '#10B981' },
    { label: 'T5', value: 290, color: '#10B981' },
  ]
  const MONTHLY_OUT = [
    { label: 'T1', value: 190, color: '#EF4444' }, { label: 'T2', value: 160, color: '#EF4444' },
    { label: 'T3', value: 280, color: '#EF4444' }, { label: 'T4', value: 195, color: '#EF4444' },
    { label: 'T5', value: 210, color: '#EF4444' },
  ]

  // top products by movement
  const movementByProduct = INVENTORY_TRANSACTIONS.reduce((acc, t) => {
    if (!acc[t.productName]) acc[t.productName] = 0
    acc[t.productName] += Math.abs(t.quantity)
    return acc
  }, {} as Record<string, number>)
  const topProducts = Object.entries(movementByProduct).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Báo cáo Kho</h1>
          <p className="text-sm text-gray-500">Thống kê nhập xuất và biến động tồn kho</p>
        </div>
        <button className="btn-secondary text-sm py-2"><Download size={14} /> Xuất PDF</button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng nhập kho', value: totalIn + 1240, icon: ArrowDown, color: 'text-green-600 bg-green-50' },
          { label: 'Tổng xuất kho', value: totalOut + 980, icon: ArrowUp, color: 'text-red-500 bg-red-50' },
          { label: 'Lượt chuyển kho', value: transfers.length + 12, icon: ArrowLeftRight, color: 'text-blue-600 bg-blue-50' },
          { label: 'SKU đang theo dõi', value: 48, icon: Package, color: 'text-indigo-600 bg-indigo-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.color.split(' ')[1]}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className={`text-2xl font-black ${s.color.split(' ')[0]}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
              <s.icon size={18} className={s.color.split(' ')[0] + ' opacity-60'} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Monthly in */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Nhập kho theo tháng (đơn vị)</h3>
          <BarChart data={MONTHLY_IN} height={80} />
        </div>

        {/* Monthly out */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Xuất kho theo tháng (đơn vị)</h3>
          <BarChart data={MONTHLY_OUT} height={80} />
        </div>

        {/* Top products */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Top sản phẩm biến động nhiều nhất</h3>
          <div className="space-y-3">
            {topProducts.map(([name, count], i) => (
              <div key={name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold w-5 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-gray-300'}`}>#{i + 1}</span>
                    <span className="text-gray-700 truncate max-w-36">{name}</span>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded h-1.5">
                  <div className="bg-primary-500 h-1.5 rounded" style={{ width: `${(count / topProducts[0][1]) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory by shop */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Phân bổ tồn kho theo điểm</h3>
          <BarChart data={[
            { label: 'Kho TT', value: 520, color: '#3B82F6' },
            ...SHOP_MOCK_LIST.map((s, i) => ({ label: s.name.replace('PetCare Chi nhánh ', ''), value: [145, 112, 87][i] ?? 0, color: ['#10B981', '#F59E0B', '#8B5CF6'][i] })),
          ]} height={80} />
        </div>
      </div>
    </div>
  )
}
