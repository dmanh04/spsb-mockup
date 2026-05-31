import { useState } from 'react'
import { Plus, Trash2, Check, AlertTriangle } from 'lucide-react'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { INVENTORY_ITEMS } from '@/data/inventoryMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { formatPrice } from '@/utils/format'

interface LineItem { skuId: string; skuCode: string; productName: string; qty: number; currentStock: number }

const REASONS = ['Xuất bán tại quầy', 'Chuyển cho chi nhánh', 'Hàng hỏng/hết hạn', 'Trả nhà cung cấp', 'Kiểm kê điều chỉnh']

export default function StockOutPage() {
  const [reason, setReason] = useState('')
  const [targetShop, setTargetShop] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<LineItem[]>([])
  const [submitted, setSubmitted] = useState(false)

  const warehouseItems = INVENTORY_ITEMS.filter(i => i.shopId === 'warehouse')

  function addItem() {
    setItems(prev => [...prev, { skuId: '', skuCode: '', productName: '', qty: 1, currentStock: 0 }])
  }

  function updateItem(idx: number, skuId: string) {
    const inv = warehouseItems.find(i => i.skuId === skuId)
    const product = PRODUCT_MOCK_LIST.find(p => p.skus.some(s => s.id === skuId))
    const sku = product?.skus.find(s => s.id === skuId)
    setItems(prev => prev.map((item, i) => i !== idx ? item : {
      ...item, skuId, skuCode: inv?.skuCode ?? '', productName: `${product?.name ?? ''} — ${Object.values(sku?.attributes ?? {}).join('/')}`, currentStock: inv?.quantity ?? 0,
    }))
  }

  function updateQty(idx: number, qty: number) {
    setItems(prev => prev.map((item, i) => i !== idx ? item : { ...item, qty }))
  }

  const hasStockWarning = items.some(i => i.qty > i.currentStock)

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Xuất kho thành công!</h2>
        <p className="text-sm text-gray-500 mb-6">{items.length} SKU đã được xuất kho</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setSubmitted(false); setItems([]); setNote('') }} className="btn-primary">Xuất tiếp</button>
          <button onClick={() => window.history.back()} className="btn-secondary">Quay lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Xuất kho</h1>

      {/* Header */}
      <div className="card p-4 grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Lý do xuất kho</label>
          <select className="form-input" value={reason} onChange={e => setReason(e.target.value)}>
            <option value="">-- Chọn lý do --</option>
            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Chi nhánh nhận (nếu có)</label>
          <select className="form-input" value={targetShop} onChange={e => setTargetShop(e.target.value)}>
            <option value="">-- Không có --</option>
            {SHOP_MOCK_LIST.map(s => <option key={s.id} value={s.id}>{s.name.replace('PetCare ', '')}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="form-label">Ghi chú</label>
          <input className="form-input" placeholder="Ghi chú thêm..." value={note} onChange={e => setNote(e.target.value)} />
        </div>
      </div>

      {/* Line items */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Danh sách hàng xuất</h2>
          <button onClick={addItem} className="btn-primary text-sm py-1.5"><Plus size={13} /> Thêm SKU</button>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Bấm "Thêm SKU" để bắt đầu</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="table-th">SKU / Sản phẩm</th>
                <th className="table-th w-24">Tồn hiện tại</th>
                <th className="table-th w-24">Số lượng xuất</th>
                <th className="table-th w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, idx) => {
                const isOver = item.qty > item.currentStock && item.skuId
                return (
                  <tr key={idx} className={isOver ? 'bg-red-50' : ''}>
                    <td className="table-td">
                      <select className="form-input text-sm py-1" value={item.skuId} onChange={e => updateItem(idx, e.target.value)}>
                        <option value="">-- Chọn SKU --</option>
                        {warehouseItems.map(i => {
                          const p = PRODUCT_MOCK_LIST.find(p => p.skus.some(s => s.id === i.skuId))
                          const s = p?.skus.find(s => s.id === i.skuId)
                          return (
                            <option key={i.skuId} value={i.skuId}>
                              {p?.name} — {Object.values(s?.attributes ?? {}).join('/')} (Còn: {i.quantity})
                            </option>
                          )
                        })}
                      </select>
                    </td>
                    <td className="table-td">
                      <span className={`text-sm font-bold ${item.currentStock < 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                        {item.skuId ? item.currentStock : '—'}
                      </span>
                    </td>
                    <td className="table-td">
                      <input type="number" min={1} max={item.currentStock || 999} className={`form-input text-sm py-1 w-20 ${isOver ? 'border-red-400' : ''}`}
                        value={item.qty} onChange={e => updateQty(idx, +e.target.value)} />
                      {isOver && <div className="text-[10px] text-red-500 mt-0.5">Vượt tồn kho!</div>}
                    </td>
                    <td className="table-td">
                      <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-400"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {hasStockWarning && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertTriangle size={15} /> Có SKU vượt quá tồn kho hiện tại. Vui lòng kiểm tra lại.
        </div>
      )}

      {items.length > 0 && (
        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={() => setItems([])}>Xóa tất cả</button>
          <button
            className="btn-primary"
            disabled={hasStockWarning || items.some(i => !i.skuId || i.qty < 1) || !reason}
            onClick={() => setSubmitted(true)}
          >
            <Check size={15} /> Xác nhận xuất kho ({items.length} SKU)
          </button>
        </div>
      )}
    </div>
  )
}
