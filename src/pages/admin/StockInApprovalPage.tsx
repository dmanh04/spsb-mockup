import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Package, DollarSign, ArrowRight, AlertTriangle, Grid3X3, Eye, TrendingUp, TrendingDown } from 'lucide-react'
import { STOCK_RECEIPTS, saveStockReceipts } from '@/data/stockReceiptMockData'
import { INVENTORY_ITEMS, INVENTORY_TRANSACTIONS, saveInventory } from '@/data/inventoryMockData'
import { formatPrice } from '@/utils/format'
import { addNotification } from '@/data/notificationMockData'
import type { StockReceipt, StockReceiptStatus } from '@/types'

const STATUS_LABELS: Record<StockReceiptStatus, string> = {
  draft: 'Nháp', pending_approval: 'Chờ duyệt', price_negotiating: 'Đang thương lượng',
  approved: 'Đã duyệt - Chờ hàng', completed: 'Hoàn tất', cancelled: 'Đã hủy',
}
const STATUS_COLORS: Record<StockReceiptStatus, string> = {
  draft: 'bg-gray-50 text-gray-600 border-gray-200',
  pending_approval: 'bg-amber-50 text-amber-700 border-amber-200',
  price_negotiating: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function StockInApprovalPage() {
  const [receipts, setReceipts] = useState<StockReceipt[]>([...STOCK_RECEIPTS])
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'completed'>('pending')
  const [selectedReceipt, setSelectedReceipt] = useState<StockReceipt | null>(null)
  const [toast, setToast] = useState('')
  const [estimatedPrices, setEstimatedPrices] = useState<Record<string, number>>({})
  const [actualPrices, setActualPrices] = useState<Record<string, number>>({})
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({})
  const [batchNumbers, setBatchNumbers] = useState<Record<string, string>>({})

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const pendingReceipts = receipts.filter(r => r.status === 'pending_approval' || r.status === 'price_negotiating')
  const approvedReceipts = receipts.filter(r => r.status === 'approved')
  const completedReceipts = receipts.filter(r => r.status === 'completed' || r.status === 'cancelled')

  const tabReceipts = activeTab === 'pending' ? pendingReceipts : activeTab === 'approved' ? approvedReceipts : completedReceipts

  function openReceipt(receipt: StockReceipt) {
    setSelectedReceipt(receipt)
    const ep: Record<string, number> = {}
    const ap: Record<string, number> = {}
    const rq: Record<string, number> = {}
    const bn: Record<string, string> = {}
    receipt.items.forEach(item => {
      ep[item.skuId] = item.estimatedCost || 0
      ap[item.skuId] = item.actualCost || item.estimatedCost || 0
      rq[item.skuId] = item.receivedQty || item.orderedQty
      bn[item.skuId] = item.batchNumber || ''
    })
    setEstimatedPrices(ep)
    setActualPrices(ap)
    setReceivedQuantities(rq)
    setBatchNumbers(bn)
  }

  function handleApproveWithEstimatedPrice() {
    if (!selectedReceipt) return
    const updated = receipts.map(r => {
      if (r.id !== selectedReceipt.id) return r
      const updatedItems = r.items.map(item => ({
        ...item,
        estimatedCost: estimatedPrices[item.skuId] || 0,
      }))
      const estimatedTotal = updatedItems.reduce((s, i) => s + i.orderedQty * (i.estimatedCost || 0), 0)
      return {
        ...r, items: updatedItems, status: 'approved' as StockReceiptStatus,
        estimatedTotalValue: estimatedTotal,
        approvedBy: 'Admin PetCare', approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      }
    })
    setReceipts(updated); saveStockReceipts(updated)
    setSelectedReceipt(null)
    showToast(`Đã duyệt phiếu ${selectedReceipt.id} với giá dự kiến`)
  }

  function handleReject() {
    if (!selectedReceipt) return
    const updated = receipts.map(r =>
      r.id === selectedReceipt.id ? { ...r, status: 'cancelled' as StockReceiptStatus } : r
    )
    setReceipts(updated); saveStockReceipts(updated)
    setSelectedReceipt(null)
    showToast(`Đã từ chối phiếu ${selectedReceipt.id}`)
  }

  function handleCompleteWithActualPrice() {
    if (!selectedReceipt) return

    // 1. Update stock receipt details and status
    const updated = receipts.map(r => {
      if (r.id !== selectedReceipt.id) return r
      const updatedItems = r.items.map(item => ({
        ...item,
        actualCost: actualPrices[item.skuId] || 0,
        unitCost: actualPrices[item.skuId] || 0,
        receivedQty: receivedQuantities[item.skuId] ?? item.orderedQty,
        batchNumber: batchNumbers[item.skuId] || '',
      }))
      const actualTotal = updatedItems.reduce((s, i) => s + i.receivedQty * (i.actualCost || 0), 0)
      return {
        ...r,
        items: updatedItems,
        status: 'completed' as StockReceiptStatus,
        totalValue: actualTotal,
        actualTotalValue: actualTotal,
      }
    })
    setReceipts(updated)
    saveStockReceipts(updated)

    // 2. Increment stock at central warehouse in INVENTORY_ITEMS
    const updatedInventoryItems = [...INVENTORY_ITEMS]
    const updatedTransactions = [...INVENTORY_TRANSACTIONS]

    selectedReceipt.items.forEach(item => {
      const recQty = receivedQuantities[item.skuId] ?? item.orderedQty
      const batchNum = batchNumbers[item.skuId] || ''
      const actCost = actualPrices[item.skuId] || 0

      // Find or create in central warehouse
      const existingIdx = updatedInventoryItems.findIndex(
        inv => inv.skuId === item.skuId && inv.shopId === 'warehouse'
      )
      if (existingIdx > -1) {
        updatedInventoryItems[existingIdx].quantity += recQty
        updatedInventoryItems[existingIdx].lastUpdated = new Date().toISOString().slice(0, 10)
      } else {
        updatedInventoryItems.push({
          skuId: item.skuId,
          skuCode: item.skuCode || '',
          productName: item.productName,
          shopId: 'warehouse',
          quantity: recQty,
          minStock: item.itemType === 'cage' ? 5 : 15,
          category: item.itemType,
          lastUpdated: new Date().toISOString().slice(0, 10)
        })
      }

      // Log transaction
      const txId = `TX-GRN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
      updatedTransactions.push({
        id: txId,
        type: 'stock_in',
        skuId: item.skuId,
        skuCode: item.skuCode || '',
        productName: item.productName,
        shopId: 'warehouse',
        quantity: recQty,
        note: `Nhập hàng từ phiếu ${selectedReceipt.id} - Lô: ${batchNum || 'N/A'} - Đơn giá thực tế: ${formatPrice(actCost)}`,
        createdBy: 'Bùi Văn Khánh',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      })
    })

    // 3. Save inventory and auto-sync catalog stock
    saveInventory(updatedInventoryItems, updatedTransactions)

    // Notify
    addNotification({
      type: 'inventory',
      title: `Nhập kho hoàn tất: ${selectedReceipt.id}`,
      body: `Phiếu nhập kho ${selectedReceipt.id} từ nhà cung cấp ${selectedReceipt.supplierName} đã hoàn tất nhận hàng và cập nhật tồn kho trung tâm.`,
      link: '/admin/inventory',
      forRoles: ['admin']
    })

    setSelectedReceipt(null)
    showToast(`Đã hoàn tất nhập kho ${selectedReceipt.id} và cập nhật tồn kho!`)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-gray-900 to-slate-800 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideIn border border-slate-700">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <DollarSign size={24} className="text-amber-600" />
          Duyệt Yêu Cầu Nhập Kho
        </h1>
        <p className="text-xs text-gray-500 mt-1">Thương lượng giá, duyệt phiếu và nhập giá thực tế khi hàng về kho.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Chờ duyệt', value: pendingReceipts.length, color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
          { label: 'Đã duyệt - Chờ hàng', value: approvedReceipts.length, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: Package },
          { label: 'Hoàn tất', value: completedReceipts.filter(r => r.status === 'completed').length, color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle },
          { label: 'Đã hủy', value: completedReceipts.filter(r => r.status === 'cancelled').length, color: 'text-rose-600 bg-rose-50 border-rose-200', icon: XCircle },
        ].map((stat, i) => (
          <div key={i} className={`card p-4 border ${stat.color.split(' ').slice(1).join(' ')}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stat.label}</div>
                <div className={`text-2xl font-black mt-1 ${stat.color.split(' ')[0]}`}>{stat.value}</div>
              </div>
              <stat.icon size={20} className={stat.color.split(' ')[0]} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {[
          { key: 'pending', label: `Chờ duyệt (${pendingReceipts.length})`, active: activeTab === 'pending' },
          { key: 'approved', label: `Chờ nhập kho (${approvedReceipts.length})`, active: activeTab === 'approved' },
          { key: 'completed', label: `Đã xử lý (${completedReceipts.length})`, active: activeTab === 'completed' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              tab.active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Receipts List */}
      <div className="space-y-3">
        {tabReceipts.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-sm text-gray-500 font-bold">Không có phiếu nào trong danh sách</div>
          </div>
        ) : (
          tabReceipts.map(receipt => (
            <div key={receipt.id} className="card p-5 hover:shadow-md transition-all cursor-pointer" onClick={() => openReceipt(receipt)}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-black text-gray-900">{receipt.id}</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg border ${STATUS_COLORS[receipt.status]}`}>
                      {STATUS_LABELS[receipt.status]}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <strong>NCC:</strong> {receipt.supplierName} • <strong>Ngày tạo:</strong> {receipt.createdAt} • <strong>Người tạo:</strong> {receipt.createdBy}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><Package size={10} /> {receipt.items.filter(i => i.itemType === 'product').length} sản phẩm</span>
                    <span className="flex items-center gap-1"><Grid3X3 size={10} /> {receipt.items.filter(i => i.itemType === 'cage').length} chuồng</span>
                    <span>{receipt.items.reduce((s, i) => s + i.orderedQty, 0)} đơn vị</span>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl flex items-center gap-1 transition-all">
                  <Eye size={12} /> Chi tiết
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-gray-100 animate-scaleIn max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  📋 Chi tiết phiếu {selectedReceipt.id}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedReceipt.supplierName} • {selectedReceipt.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-[10px] font-bold rounded-lg border ${STATUS_COLORS[selectedReceipt.status]}`}>
                  {STATUS_LABELS[selectedReceipt.status]}
                </span>
                <button onClick={() => setSelectedReceipt(null)} className="p-1 text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-y-auto flex-1 p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-200/80 text-[11px] font-bold">
                      <th className="table-th text-slate-500 py-3 pl-4">Loại</th>
                      <th className="table-th text-slate-500 py-3">Mặt hàng</th>
                      <th className="table-th text-slate-500 py-3">SL đặt</th>
                      {(selectedReceipt.status === 'pending_approval' || selectedReceipt.status === 'price_negotiating') && (
                        <th className="table-th text-slate-500 py-3">Giá dự kiến (đ)</th>
                      )}
                      {selectedReceipt.status === 'approved' && (
                        <>
                          <th className="table-th text-slate-500 py-3">Giá dự kiến</th>
                          <th className="table-th text-slate-500 py-3">Giá thực tế (đ)</th>
                          <th className="table-th text-slate-500 py-3 text-center">SL thực nhận</th>
                          <th className="table-th text-slate-500 py-3">Mã lô (Batch)</th>
                        </>
                      )}
                      {selectedReceipt.status === 'completed' && (
                        <>
                          <th className="table-th text-slate-500 py-3">Giá dự kiến</th>
                          <th className="table-th text-slate-500 py-3">Giá thực tế</th>
                          <th className="table-th text-slate-500 py-3 text-center">SL nhận</th>
                          <th className="table-th text-slate-500 py-3">Mã lô (Batch)</th>
                          <th className="table-th text-slate-500 py-3">Chênh lệch</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedReceipt.items.map((item, idx) => {
                      const estimated = estimatedPrices[item.skuId] || 0
                      const actual = actualPrices[item.skuId] || 0
                      const diff = actual && estimated ? ((actual - estimated) / estimated * 100) : 0

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 pl-4">
                            {item.itemType === 'cage' ? (
                              <span className="px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 text-[9px] font-bold rounded-lg">Chuồng</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold rounded-lg">SP</span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="text-xs font-bold text-gray-900">{item.productName}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{item.skuCode}</div>
                          </td>
                          <td className="py-3 text-xs font-bold text-gray-800">{item.orderedQty}</td>

                          {(selectedReceipt.status === 'pending_approval' || selectedReceipt.status === 'price_negotiating') && (
                            <td className="py-3">
                              <input
                                type="number"
                                min={0}
                                className="form-input text-xs py-1 px-2 w-32 border-amber-300 font-bold text-amber-800 bg-amber-50/50"
                                placeholder="Nhập giá..."
                                value={estimated || ''}
                                onChange={e => setEstimatedPrices(prev => ({ ...prev, [item.skuId]: +e.target.value }))}
                              />
                            </td>
                          )}

                          {selectedReceipt.status === 'approved' && (
                            <>
                              <td className="py-3 text-xs font-medium text-gray-600">
                                {item.estimatedCost ? formatPrice(item.estimatedCost) : '—'}
                              </td>
                              <td className="py-3">
                                <input
                                  type="number"
                                  min={0}
                                  className="form-input text-xs py-1 px-2 w-32 border-emerald-300 font-bold text-emerald-800 bg-emerald-50/50"
                                  placeholder="Nhập giá thực tế..."
                                  value={actual || ''}
                                  onChange={e => setActualPrices(prev => ({ ...prev, [item.skuId]: +e.target.value }))}
                                />
                              </td>
                              <td className="py-3 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  className="form-input text-xs py-1 px-2 w-16 text-center border-gray-300 font-semibold"
                                  value={receivedQuantities[item.skuId] ?? item.orderedQty}
                                  onChange={e => setReceivedQuantities(prev => ({ ...prev, [item.skuId]: +e.target.value }))}
                                />
                              </td>
                              <td className="py-3">
                                <input
                                  type="text"
                                  className="form-input text-xs py-1 px-2 w-28 border-gray-300 font-mono text-gray-700"
                                  placeholder="Nhập mã lô..."
                                  value={batchNumbers[item.skuId] || ''}
                                  onChange={e => setBatchNumbers(prev => ({ ...prev, [item.skuId]: e.target.value }))}
                                />
                              </td>
                            </>
                          )}

                          {selectedReceipt.status === 'completed' && (
                            <>
                              <td className="py-3 text-xs text-gray-600">{item.estimatedCost ? formatPrice(item.estimatedCost) : '—'}</td>
                              <td className="py-3 text-xs font-bold text-gray-900">{item.actualCost ? formatPrice(item.actualCost) : '—'}</td>
                              <td className="py-3 text-xs text-center font-bold text-gray-800">{item.receivedQty}</td>
                              <td className="py-3 text-xs font-mono text-gray-500">{item.batchNumber || '—'}</td>
                              <td className="py-3">
                                {item.estimatedCost && item.actualCost ? (
                                  <span className={`text-[10px] font-bold flex items-center gap-0.5 ${diff > 0 ? 'text-rose-600' : diff < 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {diff > 0 ? <TrendingUp size={10} /> : diff < 0 ? <TrendingDown size={10} /> : null}
                                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                                  </span>
                                ) : '—'}
                              </td>
                            </>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              {selectedReceipt.status === 'approved' && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-bold text-emerald-800">Tổng giá dự kiến: {formatPrice(selectedReceipt.estimatedTotalValue || 0)}</div>
                  <div className="text-xs text-emerald-600">Nhập giá thực tế cho từng mặt hàng khi hàng đã về kho.</div>
                </div>
              )}

              {selectedReceipt.status === 'completed' && (
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Giá dự kiến</span>
                    <span className="font-bold text-gray-700">{formatPrice(selectedReceipt.estimatedTotalValue || 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Giá thực tế</span>
                    <span className="font-black text-gray-900">{formatPrice(selectedReceipt.actualTotalValue || 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Chênh lệch</span>
                    {selectedReceipt.estimatedTotalValue && selectedReceipt.actualTotalValue ? (
                      <span className={`font-bold ${(selectedReceipt.actualTotalValue - selectedReceipt.estimatedTotalValue) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatPrice(selectedReceipt.actualTotalValue - selectedReceipt.estimatedTotalValue)}
                      </span>
                    ) : '—'}
                  </div>
                </div>
              )}

              {selectedReceipt.note && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600">
                  <strong>Ghi chú:</strong> {selectedReceipt.note}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-100 bg-slate-50 flex gap-2 shrink-0">
              <button type="button" onClick={() => setSelectedReceipt(null)} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                Đóng
              </button>

              {(selectedReceipt.status === 'pending_approval' || selectedReceipt.status === 'price_negotiating') && (
                <>
                  <button
                    type="button"
                    onClick={handleReject}
                    className="py-2.5 px-5 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle size={13} /> Từ chối
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveWithEstimatedPrice}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle size={13} /> Duyệt & Đặt Giá Dự Kiến
                  </button>
                </>
              )}

              {selectedReceipt.status === 'approved' && (
                <button
                  type="button"
                  onClick={handleCompleteWithActualPrice}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle size={13} /> Xác Nhận Nhập Kho (Giá Thực Tế)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
