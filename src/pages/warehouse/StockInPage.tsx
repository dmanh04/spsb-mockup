import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2, CheckCircle, AlertTriangle, Sparkles, Package } from 'lucide-react'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { SUPPLIER_MOCK_LIST } from '@/data/supplierMockData'
import { STOCK_RECEIPTS, saveStockReceipts } from '@/data/stockReceiptMockData'
import { formatPrice } from '@/utils/format'
import type { StockReceiptItem, StockReceiptStatus } from '@/types'

export default function CreateStockReceiptPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefix = location.pathname.startsWith('/admin') ? '/admin/inventory' : '/warehouse'

  const [supplierId, setSupplierId] = useState('')
  const [poReference, setPoReference] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<StockReceiptItem[]>([])
  const [saveAs, setSaveAs] = useState<'draft' | 'pending_approval'>('pending_approval')
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const allSKUs = PRODUCT_MOCK_LIST.flatMap(p =>
    p.skus.map(sku => ({
      skuId: sku.id,
      skuCode: sku.sku,
      productName: `${p.name} — ${Object.values(sku.attributes).join('/')}`,
      price: sku.price,
    }))
  )

  const supplier = SUPPLIER_MOCK_LIST.find(s => s.id === supplierId)
  const totalValue = items.reduce((s, i) => s + i.receivedQty * i.unitCost, 0)
  const totalItems = items.reduce((s, i) => s + i.receivedQty, 0)

  function addItem() {
    setItems(prev => [...prev, { skuId: '', skuCode: '', productName: '', orderedQty: 1, receivedQty: 1, unitCost: 0 }])
  }

  function updateItem(idx: number, field: string, value: string | number) {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      if (field === 'skuId' && typeof value === 'string') {
        const sku = allSKUs.find(s => s.skuId === value)
        if (sku) {
          return { ...item, skuId: sku.skuId, skuCode: sku.skuCode, productName: sku.productName, unitCost: Math.round(sku.price * 0.65) }
        }
        return { ...item, skuId: value }
      }
      return { ...item, [field]: value }
    }))
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!supplierId) { setError('Vui lòng chọn nhà cung cấp'); return }
    if (items.length === 0) { setError('Vui lòng thêm ít nhất 1 SKU'); return }
    if (items.some(i => !i.skuId)) { setError('Có SKU chưa được chọn sản phẩm'); return }
    if (items.some(i => i.receivedQty < 1)) { setError('Số lượng nhận phải >= 1'); return }

    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const newId = `GRN-${dateStr}-${String(STOCK_RECEIPTS.length + 1).padStart(3, '0')}`

    const receipt = {
      id: newId,
      supplierId,
      supplierName: supplier?.name || '',
      warehouseId: 'warehouse',
      poReference: poReference || undefined,
      items,
      totalValue,
      status: saveAs as StockReceiptStatus,
      createdBy: 'Bùi Văn Khánh',
      createdAt: today.toISOString().replace('T', ' ').slice(0, 16),
      note,
    }

    const next = [receipt, ...STOCK_RECEIPTS]
    saveStockReceipts(next)

    setToast(`Phiếu nhập kho ${newId} đã được tạo thành công!`)
    setTimeout(() => navigate(`${prefix}/receipts`), 1500)
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12 animate-fadeIn">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="font-semibold text-sm">{toast}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <span className="font-semibold">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 font-bold">×</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`${prefix}/receipts`)} className="p-2.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-all shadow-sm">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phiếu nhập kho / Tạo mới</div>
          <h1 className="text-xl font-bold text-gray-900">Tạo Phiếu Nhập Kho (GRN)</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Form (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Supplier Info */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Package size={16} className="text-primary-500" /> Thông tin chung
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nhà cung cấp <span className="text-rose-500">*</span></label>
                <select className="form-input" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {SUPPLIER_MOCK_LIST.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Số PO tham chiếu</label>
                <input className="form-input" placeholder="VD: PO-2026061" value={poReference} onChange={e => setPoReference(e.target.value)} />
              </div>
            </div>

            {supplier && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-center gap-2 text-xs">
                <Sparkles size={14} className="text-blue-500 shrink-0" />
                <span className="text-blue-900 font-medium">
                  {supplier.name} · {supplier.contactPerson} · {supplier.phone}
                </span>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="card overflow-hidden">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Danh sách hàng nhập ({items.length} SKU)</h3>
              <button type="button" onClick={addItem} className="btn-primary text-sm py-1.5">
                <Plus size={13} /> Thêm SKU
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-3xl mb-2">📦</div>
                <div className="text-sm text-gray-400 font-medium">Bấm "Thêm SKU" để bắt đầu thêm hàng nhập</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="table-th">SKU / Sản phẩm</th>
                      <th className="table-th w-24">SL đặt</th>
                      <th className="table-th w-24">SL nhận</th>
                      <th className="table-th w-32">Đơn giá nhập</th>
                      <th className="table-th w-32">Thành tiền</th>
                      <th className="table-th w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, idx) => {
                      const mismatch = item.skuId && item.receivedQty < item.orderedQty
                      return (
                        <tr key={idx} className={mismatch ? 'bg-amber-50/30' : ''}>
                          <td className="table-td">
                            <select className="form-input text-sm py-1.5" value={item.skuId} onChange={e => updateItem(idx, 'skuId', e.target.value)}>
                              <option value="">-- Chọn SKU --</option>
                              {allSKUs.map(s => (
                                <option key={s.skuId} value={s.skuId}>{s.productName}</option>
                              ))}
                            </select>
                            {item.skuCode && <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{item.skuCode}</div>}
                          </td>
                          <td className="table-td">
                            <input type="number" min={1} className="form-input text-sm py-1.5 w-20" value={item.orderedQty}
                              onChange={e => updateItem(idx, 'orderedQty', +e.target.value)} />
                          </td>
                          <td className="table-td">
                            <input type="number" min={0} className={`form-input text-sm py-1.5 w-20 ${mismatch ? 'border-amber-400' : ''}`}
                              value={item.receivedQty} onChange={e => updateItem(idx, 'receivedQty', +e.target.value)} />
                            {mismatch && <div className="text-[10px] text-amber-600 mt-0.5">Thiếu {item.orderedQty - item.receivedQty}</div>}
                          </td>
                          <td className="table-td">
                            <input type="number" min={0} className="form-input text-sm py-1.5 w-28" value={item.unitCost}
                              onChange={e => updateItem(idx, 'unitCost', +e.target.value)} />
                          </td>
                          <td className="table-td text-sm font-bold text-gray-900">{formatPrice(item.receivedQty * item.unitCost)}</td>
                          <td className="table-td">
                            <button type="button" onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                    <tr>
                      <td className="table-td font-bold text-gray-700" colSpan={2}>Tổng cộng</td>
                      <td className="table-td font-bold text-gray-700">{totalItems}</td>
                      <td className="table-td"></td>
                      <td className="table-td text-base font-black text-primary-600">{formatPrice(totalValue)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Note */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">📝 Ghi chú & Xác nhận</h3>
            <div>
              <label className="form-label">Ghi chú phiếu nhập</label>
              <textarea rows={3} className="form-input resize-none text-sm" placeholder="VD: Nhập hàng định kỳ tháng 6..."
                value={note} onChange={e => setNote(e.target.value)} />
            </div>

            <div>
              <label className="form-label">Lưu phiếu dưới dạng</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                  <input type="radio" name="saveAs" checked={saveAs === 'pending_approval'}
                    onChange={() => setSaveAs('pending_approval')} className="w-3.5 h-3.5 text-primary-600" />
                  <div>
                    <div className="text-xs font-bold">Gửi duyệt ngay</div>
                    <div className="text-[10px] text-gray-400">Phiếu sẽ chờ Admin duyệt</div>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                  <input type="radio" name="saveAs" checked={saveAs === 'draft'}
                    onChange={() => setSaveAs('draft')} className="w-3.5 h-3.5 text-primary-600" />
                  <div>
                    <div className="text-xs font-bold">Lưu nháp</div>
                    <div className="text-[10px] text-gray-400">Chỉnh sửa thêm trước khi gửi</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card p-5 space-y-3 bg-gradient-to-br from-primary-50/30 to-white">
            <h3 className="text-sm font-bold text-gray-900">Tóm tắt phiếu</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Nhà cung cấp</span><span className="font-medium truncate ml-2">{supplier?.name || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Số SKU</span><span className="font-bold">{items.filter(i => i.skuId).length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tổng SL nhận</span><span className="font-bold">{totalItems}</span></div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-bold text-gray-700">Tổng giá trị</span>
                <span className="text-lg font-black text-primary-600">{formatPrice(totalValue)}</span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="space-y-2">
            <button type="submit" disabled={items.length === 0}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2">
              🚀 {saveAs === 'draft' ? 'Lưu nháp' : 'Tạo & Gửi duyệt'}
            </button>
            <button type="button" onClick={() => navigate(`${prefix}/receipts`)}
              className="w-full py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm rounded-xl transition-all cursor-pointer">
              Hủy bỏ
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
