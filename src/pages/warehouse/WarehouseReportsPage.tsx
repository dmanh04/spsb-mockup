import { useState } from 'react'
import { 
  Download, Package, ArrowDown, ArrowUp, ArrowLeftRight, 
  Search, AlertTriangle, CheckCircle, Trash2, Calendar, FileText
} from 'lucide-react'
import { BarChart } from '@/components/shared/SVGChart'
import { INVENTORY_TRANSACTIONS, INVENTORY_ITEMS, saveInventory } from '@/data/inventoryMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { STOCK_RECEIPTS } from '@/data/stockReceiptMockData'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { formatPrice } from '@/utils/format'

export default function WarehouseReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'expiry' | 'stockcard'>('overview')
  const [toast, setToast] = useState('')

  // Expiry states
  const [expirySearch, setExpirySearch] = useState('')
  
  // Stock Card states
  const [selectedShopId, setSelectedShopId] = useState('warehouse')
  const [selectedSkuId, setSelectedSkuId] = useState('')

  // Helper functions
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const shopName = (id: string) => {
    if (id === 'warehouse') return 'Kho trung tâm'
    return SHOP_MOCK_LIST.find(s => s.id === id)?.name.replace('PetCare ', '') ?? id
  }

  // --- TAB 1: OVERVIEW METRICS ---
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

  const movementByProduct = INVENTORY_TRANSACTIONS.reduce((acc, t) => {
    if (!acc[t.productName]) acc[t.productName] = 0
    acc[t.productName] += Math.abs(t.quantity)
    return acc
  }, {} as Record<string, number>)
  const topProducts = Object.entries(movementByProduct).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // --- TAB 2: BATCH & EXPIRY DATES ---
  // Compile batch/expiry lines from STOCK_RECEIPTS
  const getBatchItems = () => {
    const list: Array<{
      skuId: string
      skuCode: string
      productName: string
      batchNumber: string
      expiryDate: string
      unitCost: number
      qtyInStock: number
      receiptId: string
      daysLeft: number
    }> = []

    STOCK_RECEIPTS.forEach(receipt => {
      // Only compile from completed or approved receipts
      if (receipt.status !== 'completed' && receipt.status !== 'approved') return

      receipt.items.forEach(item => {
        if (!item.batchNumber || !item.expiryDate) return

        // Verify if this batch is still physically in stock at warehouse
        const invItem = INVENTORY_ITEMS.find(i => i.skuId === item.skuId && i.shopId === 'warehouse')
        if (!invItem || invItem.quantity <= 0) return

        // Compute days left
        const expDate = new Date(item.expiryDate)
        const today = new Date()
        today.setHours(0,0,0,0)
        const diffTime = expDate.getTime() - today.getTime()
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // Check if duplicate batch code already compiled
        const dupIdx = list.findIndex(l => l.batchNumber === item.batchNumber && l.skuId === item.skuId)
        if (dupIdx > -1) return // Already processed

        list.push({
          skuId: item.skuId,
          skuCode: item.skuCode,
          productName: item.productName,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          unitCost: item.unitCost,
          qtyInStock: invItem.quantity, // approximate with warehouse stock
          receiptId: receipt.id,
          daysLeft
        })
      })
    })

    return list.filter(item => 
      item.batchNumber.toLowerCase().includes(expirySearch.toLowerCase()) ||
      item.productName.toLowerCase().includes(expirySearch.toLowerCase()) ||
      item.skuCode.toLowerCase().includes(expirySearch.toLowerCase())
    )
  }

  const batchItems = getBatchItems()

  function handleLiquidation(batchNumber: string, skuId: string, qty: number, prodName: string, skuCode: string) {
    if (!confirm(`Bạn có chắc chắn muốn xuất hủy/thanh lý toàn bộ ${qty} sản phẩm của lô ${batchNumber}?`)) return

    const updatedInventory = INVENTORY_ITEMS.map(item => {
      if (item.skuId === skuId && item.shopId === 'warehouse') {
        return {
          ...item,
          quantity: 0,
          lastUpdated: new Date().toISOString().slice(0, 10)
        }
      }
      return item
    })

    const todayStr = new Date().toISOString().replace('T', ' ').slice(0, 16)
    const updatedTx = [
      {
        id: `TX-DIS${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'stock_out' as const,
        skuId,
        skuCode,
        productName: prodName,
        shopId: 'warehouse',
        quantity: -qty,
        note: `Thanh lý hủy lô hết hạn/cận date: ${batchNumber}`,
        createdBy: 'Bùi Văn Khánh',
        createdAt: todayStr
      },
      ...INVENTORY_TRANSACTIONS
    ]

    saveInventory(updatedInventory, updatedTx)
    showToast(`Đã hủy thành công lô cận date ${batchNumber}!`)
  }

  // --- TAB 3: STOCK CARD & VALUATION ---
  const allSKUs = PRODUCT_MOCK_LIST.flatMap(p =>
    p.skus.map(sku => ({
      skuId: sku.id,
      skuCode: sku.sku,
      productName: p.name,
      variantName: Object.values(sku.attributes).join(' / '),
      fullName: `${p.name} (${Object.values(sku.attributes).join(' / ')})`
    }))
  )

  const buildStockCard = () => {
    if (!selectedSkuId) return null

    const currentQty = INVENTORY_ITEMS.find(
      i => i.skuId === selectedSkuId && i.shopId === selectedShopId
    )?.quantity ?? 0

    // Filter transactions chronologically
    const skuTx = INVENTORY_TRANSACTIONS
      .filter(t => t.skuId === selectedSkuId && t.shopId === selectedShopId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

    const totalDelta = skuTx.reduce((sum, tx) => sum + tx.quantity, 0)
    const startingBalance = Math.max(0, currentQty - totalDelta)

    let balanceAccumulator = startingBalance
    const ledger = skuTx.map(tx => {
      balanceAccumulator += tx.quantity
      return {
        ...tx,
        runningBalance: balanceAccumulator
      }
    })

    return {
      startingBalance,
      endingBalance: currentQty,
      ledger: ledger.reverse() // Display newest first for users
    }
  }

  const stockCardData = buildStockCard()

  // Valuation calculation
  const getValuationList = () => {
    const shopItems = INVENTORY_ITEMS.filter(i => i.shopId === selectedShopId)
    let totalValue = 0

    const list = shopItems.map(item => {
      const productSku = allSKUs.find(s => s.skuId === item.skuId)
      const cost = item.unitPrice || Math.round((PRODUCT_MOCK_LIST.flatMap(p => p.skus).find(s => s.id === item.skuId)?.price ?? 100000) * 0.65)
      const subtotal = item.quantity * cost
      totalValue += subtotal

      return {
        ...item,
        fullName: productSku?.fullName ?? item.productName,
        cost,
        subtotal
      }
    })

    return { list, totalValue }
  }

  const valuationData = getValuationList()

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="font-semibold text-sm">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Báo cáo & Phân tích Kho</h1>
          <p className="text-sm text-gray-500">Giám sát lượng biến động hàng hóa, lô sử dụng và giá trị tài sản tồn kho</p>
        </div>
        <button className="btn-secondary text-sm py-2"><Download size={14} /> Xuất PDF báo cáo</button>
      </div>

      {/* Tab select */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Thống kê Tổng quan
        </button>
        <button
          onClick={() => setActiveTab('expiry')}
          className={`py-2.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'expiry' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Cảnh báo Hạn sử dụng
        </button>
        <button
          onClick={() => {
            setActiveTab('stockcard')
            if (allSKUs.length > 0 && !selectedSkuId) {
              setSelectedSkuId(allSKUs[0].skuId)
            }
          }}
          className={`py-2.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'stockcard' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Thẻ kho & Định giá tồn kho
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <>
          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Tổng nhập kho (tháng)', value: totalIn + 1240, icon: ArrowDown, color: 'text-green-600 bg-green-50' },
              { label: 'Tổng xuất kho (tháng)', value: totalOut + 980, icon: ArrowUp, color: 'text-red-500 bg-red-50' },
              { label: 'Lượt chuyển kho', value: transfers.length + 12, icon: ArrowLeftRight, color: 'text-blue-600 bg-blue-50' },
              { label: 'SKU đang theo dõi', value: INVENTORY_ITEMS.filter(i => i.shopId === 'warehouse').length, icon: Package, color: 'text-indigo-600 bg-indigo-50' },
            ].map(s => (
              <div key={s.label} className={`card p-4 ${s.color.split(' ')[1]} border border-gray-150`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`text-2xl font-black ${s.color.split(' ')[0]}`}>{s.value}</div>
                    <div className="text-xs text-gray-500 mt-1 font-semibold">{s.label}</div>
                  </div>
                  <s.icon size={18} className={s.color.split(' ')[0] + ' opacity-60'} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Monthly in */}
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Nhập kho theo tháng (đơn vị)</h3>
              <BarChart data={MONTHLY_IN} height={80} />
            </div>

            {/* Monthly out */}
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Xuất kho theo tháng (đơn vị)</h3>
              <BarChart data={MONTHLY_OUT} height={80} />
            </div>

            {/* Top products */}
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Top sản phẩm biến động nhiều nhất</h3>
              <div className="space-y-3">
                {topProducts.map(([name, count], i) => (
                  <div key={name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold w-5 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-450' : 'text-gray-300'}`}>#{i + 1}</span>
                        <span className="text-gray-700 truncate max-w-44 font-semibold">{name}</span>
                      </div>
                      <span className="font-bold text-gray-950 shrink-0">{count}</span>
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
              <h3 className="text-sm font-bold text-gray-900 mb-3">Phân bổ tồn kho theo điểm</h3>
              <BarChart data={[
                { label: 'Kho TT', value: INVENTORY_ITEMS.filter(i => i.shopId === 'warehouse').reduce((s,i)=>s+i.quantity, 0), color: '#3B82F6' },
                ...SHOP_MOCK_LIST.map((s, i) => ({ 
                  label: s.name.replace('PetCare Chi nhánh ', ''), 
                  value: INVENTORY_ITEMS.filter(item => item.shopId === s.id).reduce((sum, item)=>sum+item.quantity, 0), 
                  color: ['#10B981', '#F59E0B', '#8B5CF6'][i] ?? '#9ca3af'
                })),
              ]} height={80} />
            </div>
          </div>
        </>
      )}

      {/* TAB 2: EXPIRY CODE */}
      {activeTab === 'expiry' && (
        <div className="space-y-4">
          <div className="flex gap-3 bg-white p-3 rounded-2xl border">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="form-input pl-9 text-sm"
                placeholder="Tìm kiếm theo lô hàng, mã SKU, tên sản phẩm..."
                value={expirySearch}
                onChange={e => setExpirySearch(e.target.value)}
              />
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Số lô (Lot #)</th>
                  <th className="table-th">Sản phẩm</th>
                  <th className="table-th">Mã SKU</th>
                  <th className="table-th">Hạn sử dụng</th>
                  <th className="table-th text-center">Tồn kho</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batchItems.map((item, i) => {
                  let alertClass = 'badge-green'
                  let alertLabel = 'An toàn'
                  if (item.daysLeft <= 0) {
                    alertClass = 'badge-red'
                    alertLabel = 'Hết hạn'
                  } else if (item.daysLeft <= 90) {
                    alertClass = 'badge-orange animate-pulse'
                    alertLabel = `Cận date (${item.daysLeft} ngày)`
                  } else {
                    alertLabel = `Còn hạn (${item.daysLeft} ngày)`
                  }

                  return (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="table-td font-mono text-xs font-bold text-primary-650">{item.batchNumber}</td>
                      <td className="table-td text-xs font-bold text-gray-800">{item.productName}</td>
                      <td className="table-td font-mono text-xs text-gray-400">{item.skuCode}</td>
                      <td className="table-td font-semibold text-xs text-gray-600">{item.expiryDate}</td>
                      <td className="table-td text-center font-bold text-gray-900">{item.qtyInStock}</td>
                      <td className="table-td">
                        <span className={alertClass}>{alertLabel}</span>
                      </td>
                      <td className="table-td text-center">
                        {item.daysLeft <= 90 ? (
                          <button
                            onClick={() => handleLiquidation(item.batchNumber, item.skuId, item.qtyInStock, item.productName, item.skuCode)}
                            className="text-[10px] font-bold bg-red-50 text-red-650 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 mx-auto"
                          >
                            <Trash2 size={11} /> Hủy/Thanh lý
                          </button>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {batchItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-400 text-sm font-semibold">
                      Không có lô hàng nào cần chú ý hoặc khớp bộ lọc
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK CARD & VALUATION */}
      {activeTab === 'stockcard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Controls Panel (Top/Left) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide border-b pb-2">Bộ lọc Thẻ kho</h3>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Chọn kho / Chi nhánh</label>
                <select
                  className="form-input text-xs font-bold"
                  value={selectedShopId}
                  onChange={e => setSelectedShopId(e.target.value)}
                >
                  <option value="warehouse">Kho tổng (Trung tâm)</option>
                  {SHOP_MOCK_LIST.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Chọn sản phẩm SKU</label>
                <select
                  className="form-input text-xs"
                  value={selectedSkuId}
                  onChange={e => setSelectedSkuId(e.target.value)}
                >
                  {allSKUs.map(sku => (
                    <option key={sku.skuId} value={sku.skuId}>{sku.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Valuation Summary Card */}
            <div className="card p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/30 border border-indigo-150 shadow-sm text-xs">
              <h3 className="text-sm font-black text-indigo-900 uppercase tracking-wide border-b border-indigo-200 pb-2 flex items-center gap-1.5">
                📊 Giá trị tài sản tồn kho
              </h3>
              <div className="mt-3.5 space-y-2">
                <div className="flex justify-between items-center text-gray-600 font-semibold">
                  <span>Tổng số mặt hàng SKU:</span>
                  <strong className="text-gray-900 text-sm font-black">{valuationData.list.length}</strong>
                </div>
                <div className="flex justify-between items-center text-gray-600 font-semibold">
                  <span>Tổng lượng tồn kho:</span>
                  <strong className="text-gray-900 text-sm font-black">{valuationData.list.reduce((s, i) => s + i.quantity, 0)}</strong>
                </div>
                <div className="border-t border-indigo-200 pt-2.5 flex justify-between items-center text-indigo-950">
                  <span className="font-extrabold text-xs uppercase">Tổng giá trị tồn:</span>
                  <strong className="text-lg font-black">{formatPrice(valuationData.totalValue)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Ledger Table (Right side) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Stock Card Panel */}
            <div className="card">
              <div className="card-header bg-gray-50/50 py-3 px-4 flex items-center justify-between border-b">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  Thẻ kho chi tiết: {allSKUs.find(s => s.skuId === selectedSkuId)?.fullName || 'SKU'}
                </h3>
                <div className="text-xs font-semibold text-gray-500">
                  Kho: <strong className="text-gray-800">{shopName(selectedShopId)}</strong>
                </div>
              </div>

              {stockCardData ? (
                <div className="p-4 space-y-4">
                  {/* Balance highlights */}
                  <div className="grid grid-cols-3 gap-3 text-center border-b pb-3">
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-bold">Tồn đầu kỳ</div>
                      <div className="text-lg font-black text-gray-700 mt-0.5">{stockCardData.startingBalance}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-bold">Lượt biến động</div>
                      <div className="text-lg font-black text-indigo-650 mt-0.5">{stockCardData.ledger.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-bold">Tồn cuối kỳ</div>
                      <div className="text-lg font-black text-emerald-600 mt-0.5">{stockCardData.endingBalance}</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/80 border-b">
                        <tr>
                          <th className="px-3 py-2 font-bold text-gray-500">Ngày giao dịch</th>
                          <th className="px-3 py-2 font-bold text-gray-500">Mã giao dịch</th>
                          <th className="px-3 py-2 font-bold text-gray-500">Loại biến động</th>
                          <th className="px-3 py-2 text-right font-bold text-gray-500">Thay đổi</th>
                          <th className="px-3 py-2 text-right font-bold text-gray-500">Tồn sau GD</th>
                          <th className="px-3 py-2 font-bold text-gray-500">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-gray-700">
                        {stockCardData.ledger.map((row, idx) => {
                          let typeLabel = 'Biến động'
                          let typeClass = 'bg-gray-100 text-gray-650'
                          if (row.type === 'stock_in') { typeLabel = 'Nhập kho'; typeClass = 'bg-emerald-50 text-emerald-700' }
                          if (row.type === 'stock_out') { typeLabel = 'Xuất kho'; typeClass = 'bg-rose-50 text-rose-700' }
                          if (row.type === 'transfer_in') { typeLabel = 'Nhận chuyển'; typeClass = 'bg-blue-50 text-blue-700' }
                          if (row.type === 'transfer_out') { typeLabel = 'Xuất chuyển'; typeClass = 'bg-amber-50 text-amber-700' }
                          if (row.type === 'adjustment') { typeLabel = 'Cân đối'; typeClass = 'bg-purple-50 text-purple-700' }

                          const isPlus = row.quantity > 0

                          return (
                            <tr key={row.id} className="hover:bg-slate-50/50">
                              <td className="px-3 py-2 font-mono text-[10px] text-gray-400">{row.createdAt}</td>
                              <td className="px-3 py-2 font-mono font-bold text-gray-700">{row.id}</td>
                              <td className="px-3 py-2">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${typeClass}`}>{typeLabel}</span>
                              </td>
                              <td className={`px-3 py-2 text-right font-bold font-mono ${isPlus ? 'text-emerald-600' : 'text-red-500'}`}>
                                {isPlus ? `+${row.quantity}` : row.runningBalance === stockCardData.startingBalance ? `0` : row.quantity}
                              </td>
                              <td className="px-3 py-2 text-right font-black text-gray-900 font-mono">{row.runningBalance}</td>
                              <td className="px-3 py-2 text-[10px] text-gray-400 italic max-w-32 truncate" title={row.note}>"{row.note}"</td>
                            </tr>
                          )
                        })}
                        {stockCardData.ledger.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                              Chưa ghi nhận biến động giao dịch nào cho sản phẩm này tại kho đã chọn.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 italic">Vui lòng chọn sản phẩm để xem thẻ kho</div>
              )}
            </div>

            {/* Valuation List Panel */}
            <div className="card">
              <div className="card-header bg-gray-50/50 py-3 px-4 border-b">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                  Bảng kê định giá tồn kho chi tiết (Chi nhánh: {shopName(selectedShopId)})
                </h3>
              </div>
              <div className="p-2 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-3 py-2 font-bold text-gray-500">Mã SKU</th>
                      <th className="px-3 py-2 font-bold text-gray-500">Tên mặt hàng</th>
                      <th className="px-3 py-2 text-right font-bold text-gray-500">Số lượng tồn</th>
                      <th className="px-3 py-2 text-right font-bold text-gray-500">Đơn giá vốn</th>
                      <th className="px-3 py-2 text-right font-bold text-gray-500">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-gray-700">
                    {valuationData.list.map(item => (
                      <tr key={item.skuId} className="hover:bg-slate-50/30">
                        <td className="px-3 py-2 font-mono text-[11px] text-gray-450">{item.skuCode}</td>
                        <td className="px-3 py-2 font-semibold text-gray-800">{item.fullName}</td>
                        <td className="px-3 py-2 text-right font-bold text-gray-900">{item.quantity}</td>
                        <td className="px-3 py-2 text-right font-mono text-gray-500">{formatPrice(item.cost)}</td>
                        <td className="px-3 py-2 text-right font-mono font-black text-indigo-700">{formatPrice(item.subtotal)}</td>
                      </tr>
                    ))}
                    {valuationData.list.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400 italic">Chưa có hàng hóa nào tại chi nhánh này</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
