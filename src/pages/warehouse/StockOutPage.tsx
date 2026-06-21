import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2, CheckCircle, AlertTriangle, Package } from 'lucide-react'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { INVENTORY_ITEMS } from '@/data/inventoryMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { STOCK_ISSUES, saveStockIssues } from '@/data/stockIssueMockData'
import { STOCK_RECEIPTS } from '@/data/stockReceiptMockData'
import { formatPrice } from '@/utils/format'
import type { StockIssueItem, StockIssueType, StockIssueStatus } from '@/types'

const ISSUE_TYPES: { value: StockIssueType; label: string; desc: string; color: string }[] = [
  { value: 'transfer', label: 'Xuất chuyển kho', desc: 'Chuyển hàng sang chi nhánh khác', color: 'border-amber-200 bg-amber-50/50' },
]

const SHOPS = [
  { id: 'warehouse', name: 'Kho Trung Tâm' },
  ...SHOP_MOCK_LIST.map(s => ({ id: s.id, name: s.name })),
]

export default function CreateStockIssuePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefix = location.pathname.startsWith('/admin') ? '/admin/inventory' : '/warehouse'

  const [issueType, setIssueType] = useState<StockIssueType>('transfer')
  const [warehouseId, setWarehouseId] = useState('warehouse')
  const [targetShopId, setTargetShopId] = useState('')
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<StockIssueItem[]>([])
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const warehouseItems = INVENTORY_ITEMS.filter(i => i.shopId === warehouseId)
  const totalValue = items.reduce((s, i) => s + i.quantity * i.unitCost, 0)
  const totalQty = items.reduce((s, i) => s + i.quantity, 0)
  const hasOverStock = items.some(i => {
    if (!i.skuId) return false
    const inv = warehouseItems.find(w => w.skuId === i.skuId)
    return inv ? i.quantity > inv.quantity : false
  })

  const getAvailableBatches = (skuId: string) => {
    const list: { batchNumber: string; expiryDate: string; qty: number }[] = []
    STOCK_RECEIPTS.forEach(r => {
      if (r.status !== 'completed' && r.status !== 'approved') return
      r.items.forEach(item => {
        if (item.skuId === skuId && item.batchNumber && item.expiryDate) {
          const existing = list.find(l => l.batchNumber === item.batchNumber)
          if (existing) {
            existing.qty += item.receivedQty
          } else {
            list.push({ batchNumber: item.batchNumber, expiryDate: item.expiryDate, qty: item.receivedQty })
          }
        }
      })
    })
    return list
  }

  function addItem() {
    setItems(prev => [...prev, { skuId: '', skuCode: '', productName: '', quantity: 1, unitCost: 0, batchNumber: '', expiryDate: '' }])
  }

  function updateItem(idx: number, skuId: string) {
    const inv = warehouseItems.find(i => i.skuId === skuId)
    const product = PRODUCT_MOCK_LIST.find(p => p.skus.some(s => s.id === skuId))
    const sku = product?.skus.find(s => s.id === skuId)
    
    const batches = getAvailableBatches(skuId)
    const defaultBatch = batches[0]

    setItems(prev => prev.map((item, i) => i !== idx ? item : {
      ...item,
      skuId,
      skuCode: inv?.skuCode ?? sku?.sku ?? '',
      productName: `${product?.name ?? ''} — ${Object.values(sku?.attributes ?? {}).join('/')}`,
      unitCost: Math.round((sku?.price ?? 0) * 0.65),
      batchNumber: defaultBatch?.batchNumber || '',
      expiryDate: defaultBatch?.expiryDate || ''
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (items.length === 0) { setError('Thêm ít nhất 1 SKU'); return }
    if (items.some(i => !i.skuId)) { setError('Có SKU chưa chọn sản phẩm'); return }
    if (!reason.trim()) { setError('Vui lòng nhập lý do xuất kho'); return }
    if (hasOverStock) { setError('Có SKU vượt quá tồn kho hiện tại'); return }
    if (!targetShopId) { setError('Vui lòng chọn chi nhánh nhận'); return }

    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const newId = `GIN-${dateStr}-${String(STOCK_ISSUES.length + 1).padStart(3, '0')}`

    const issue = {
      id: newId,
      type: issueType,
      warehouseId,
      targetShopId,
      items,
      totalValue,
      status: 'pending_approval' as StockIssueStatus,
      reason,
      createdBy: 'Bùi Văn Khánh',
      createdAt: today.toISOString().replace('T', ' ').slice(0, 16),
      note,
    }

    const next = [issue, ...STOCK_ISSUES]
    saveStockIssues(next)

    setToast(`Phiếu xuất kho ${newId} đã được tạo!`)
    setTimeout(() => navigate(`${prefix}/issues`), 1500)
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12 animate-fadeIn">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="font-semibold text-sm">{toast}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertTriangle size={16} className="text-red-500" />
          <span className="font-semibold">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 font-bold">×</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`${prefix}/issues`)} className="p-2.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl shadow-sm">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phiếu xuất kho / Tạo mới</div>
          <h1 className="text-xl font-bold text-gray-900">Tạo Phiếu Xuất Kho (GIN)</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Warehouse & Target */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Package size={16} className="text-amber-500" /> Thông tin xuất kho (Chuyển kho chi nhánh)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label text-xs font-bold text-gray-700">Kho xuất <span className="text-rose-500">*</span></label>
                <select className="form-input text-xs" value={warehouseId} onChange={e => setWarehouseId(e.target.value)}>
                  {SHOPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label text-xs font-bold text-gray-700">Chi nhánh nhận <span className="text-rose-500">*</span></label>
                <select className="form-input text-xs" value={targetShopId} onChange={e => setTargetShopId(e.target.value)}>
                  <option value="">-- Chọn chi nhánh nhận --</option>
                  {SHOPS.filter(s => s.id !== warehouseId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="form-label text-xs font-bold text-gray-700">Lý do xuất kho <span className="text-rose-500">*</span></label>
                <input className="form-input text-xs" placeholder="VD: Xuất chuyển kho bổ sung tồn kho định kỳ cho chi nhánh..." value={reason} onChange={e => setReason(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="card overflow-hidden">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Danh sách hàng xuất ({items.length} SKU)</h3>
              <button type="button" onClick={addItem} className="btn-primary text-sm py-1.5"><Plus size={13} /> Thêm SKU</button>
            </div>

            {items.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-3xl mb-2">📤</div>
                <div className="text-sm text-gray-400">Bấm "Thêm SKU" để chọn hàng xuất kho</div>
              </div>
            ) : (
               <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="table-th">SKU / Sản phẩm</th>
                    <th className="table-th w-44">Số lô / HSD</th>
                    <th className="table-th w-24">Tồn hiện tại</th>
                    <th className="table-th w-24">SL xuất</th>
                    <th className="table-th w-32">Đơn giá</th>
                    <th className="table-th w-32">Thành tiền</th>
                    <th className="table-th w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, idx) => {
                    const inv = warehouseItems.find(w => w.skuId === item.skuId)
                    const currentStock = inv?.quantity ?? 0
                    const isOver = item.skuId && item.quantity > currentStock
                    return (
                      <tr key={idx} className={isOver ? 'bg-red-50/30' : ''}>
                        <td className="table-td">
                          <select className="form-input text-sm py-1.5" value={item.skuId} onChange={e => updateItem(idx, e.target.value)}>
                            <option value="">-- Chọn SKU --</option>
                            {warehouseItems.map(w => {
                              const p = PRODUCT_MOCK_LIST.find(p => p.skus.some(s => s.id === w.skuId))
                              const s = p?.skus.find(s => s.id === w.skuId)
                              return <option key={w.skuId} value={w.skuId}>{p?.name} — {Object.values(s?.attributes ?? {}).join('/')} (Còn: {w.quantity})</option>
                            })}
                          </select>
                          {item.skuCode && <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{item.skuCode}</div>}
                        </td>
                        <td className="table-td align-top">
                          {item.skuId ? (
                            <div className="space-y-1">
                              <select
                                className="form-input text-xs font-mono py-1.5 px-1 w-full"
                                value={item.batchNumber || ''}
                                onChange={e => {
                                  const batchNo = e.target.value
                                  const found = getAvailableBatches(item.skuId).find(b => b.batchNumber === batchNo)
                                  setItems(prev => prev.map((it, i) => i !== idx ? it : {
                                    ...it,
                                    batchNumber: batchNo,
                                    expiryDate: found?.expiryDate || ''
                                  }))
                                }}
                              >
                                <option value="">-- Chọn lô --</option>
                                {getAvailableBatches(item.skuId).map(b => (
                                  <option key={b.batchNumber} value={b.batchNumber}>
                                    {b.batchNumber} (Còn: {b.qty})
                                  </option>
                                ))}
                              </select>
                              {item.batchNumber && (
                                <span className="text-[9px] font-bold text-indigo-600 block mt-0.5">
                                  HSD: {item.expiryDate}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="table-td">
                          <span className={`text-sm font-bold ${currentStock < 5 ? 'text-amber-500' : 'text-gray-700'}`}>
                            {item.skuId ? currentStock : '—'}
                          </span>
                        </td>
                        <td className="table-td">
                          <input type="number" min={1} className={`form-input text-sm py-1.5 w-20 ${isOver ? 'border-red-400' : ''}`}
                            value={item.quantity} onChange={e => setItems(prev => prev.map((it, i) => i !== idx ? it : { ...it, quantity: +e.target.value }))} />
                          {isOver && <div className="text-[10px] text-red-500 mt-0.5">Vượt tồn!</div>}
                        </td>
                        <td className="table-td">
                          <input type="number" min={0} className="form-input text-sm py-1.5 w-28" value={item.unitCost}
                            onChange={e => setItems(prev => prev.map((it, i) => i !== idx ? it : { ...it, unitCost: +e.target.value }))} />
                        </td>
                        <td className="table-td text-sm font-bold text-gray-900">{formatPrice(item.quantity * item.unitCost)}</td>
                        <td className="table-td">
                          <button type="button" onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="border-t-2 bg-gray-50">
                  <tr>
                    <td className="table-td font-bold" colSpan={2}>Tổng cộng</td>
                    <td className="table-td font-bold text-red-500">-{totalQty}</td>
                    <td className="table-td"></td>
                    <td className="table-td text-base font-black text-red-500">{formatPrice(totalValue)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">📝 Ghi chú</h3>
            <textarea rows={3} className="form-input resize-none text-sm" placeholder="Ghi chú thêm..." value={note} onChange={e => setNote(e.target.value)} />
          </div>

          {hasOverStock && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-xs text-red-700">
              <AlertTriangle size={14} className="shrink-0" /> Có SKU vượt quá tồn kho. Kiểm tra lại.
            </div>
          )}

          <div className="card p-5 space-y-3 bg-gradient-to-br from-red-50/20 to-white">
            <h3 className="text-sm font-bold text-gray-900">Tóm tắt xuất kho</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Loại xuất</span><span className="font-medium">{ISSUE_TYPES.find(t => t.value === issueType)?.label}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Số SKU</span><span className="font-bold">{items.filter(i => i.skuId).length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tổng SL xuất</span><span className="font-bold text-red-500">-{totalQty}</span></div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-bold">Tổng giá trị</span>
                <span className="text-lg font-black text-red-500">{formatPrice(totalValue)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button type="submit" disabled={items.length === 0 || hasOverStock}
              className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2">
              📤 Tạo phiếu xuất kho
            </button>
            <button type="button" onClick={() => navigate(`${prefix}/issues`)}
              className="w-full py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm rounded-xl cursor-pointer">
              Hủy bỏ
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
