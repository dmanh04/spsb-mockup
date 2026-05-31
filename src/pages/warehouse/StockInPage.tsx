import { useState } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { formatPrice } from '@/utils/format'

interface LineItem { skuId: string; skuCode: string; productName: string; qty: number; unitCost: number }

export default function StockInPage() {
  const [supplierId, setSupplierId] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<LineItem[]>([])
  const [submitted, setSubmitted] = useState(false)

  // Flat list of all SKUs for selection
  const allSKUs = PRODUCT_MOCK_LIST.flatMap(p =>
    p.skus.map(sku => ({
      skuId: sku.id,
      skuCode: sku.sku,
      productName: `${p.name} — ${Object.values(sku.attributes).join('/')}`,
      price: sku.price,
    }))
  )

  function addItem() {
    setItems(prev => [...prev, { skuId: '', skuCode: '', productName: '', qty: 1, unitCost: 0 }])
  }

  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      if (field === 'skuId' && typeof value === 'string') {
        const sku = allSKUs.find(s => s.skuId === value)
        return sku ? { ...item, skuId: sku.skuId, skuCode: sku.skuCode, productName: sku.productName, unitCost: Math.round(sku.price * 0.7) } : { ...item, skuId: value }
      }
      return { ...item, [field]: value }
    }))
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const total = items.reduce((s, i) => s + i.qty * i.unitCost, 0)

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Nhập kho thành công!</h2>
        <p className="text-sm text-gray-500 mb-6">{items.length} SKU đã được cập nhật tồn kho</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setSubmitted(false); setItems([]); setNote('') }} className="btn-primary">Nhập tiếp</button>
          <button onClick={() => window.history.back()} className="btn-secondary">Quay lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Nhập kho</h1>

      {/* Header info */}
      <div className="card p-4 grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Nhà cung cấp</label>
          <select className="form-input" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
            <option value="">-- Chọn nhà cung cấp --</option>
            <option value="SUP001">Royal Canin Vietnam</option>
            <option value="SUP002">Mars Vietnam (Whiskas/Pedigree)</option>
            <option value="SUP003">Bioline Vietnam</option>
          </select>
        </div>
        <div>
          <label className="form-label">Ghi chú</label>
          <input className="form-input" placeholder="Số PO, lý do nhập..." value={note} onChange={e => setNote(e.target.value)} />
        </div>
      </div>

      {/* Line items */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Danh sách hàng nhập</h2>
          <button onClick={addItem} className="btn-primary text-sm py-1.5">
            <Plus size={13} /> Thêm SKU
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            Bấm "Thêm SKU" để bắt đầu
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="table-th">SKU / Sản phẩm</th>
                <th className="table-th w-24">Số lượng</th>
                <th className="table-th w-32">Giá nhập (đ)</th>
                <th className="table-th w-32">Thành tiền</th>
                <th className="table-th w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="table-td">
                    <select
                      className="form-input text-sm py-1"
                      value={item.skuId}
                      onChange={e => updateItem(idx, 'skuId', e.target.value)}
                    >
                      <option value="">-- Chọn SKU --</option>
                      {allSKUs.map(s => (
                        <option key={s.skuId} value={s.skuId}>{s.productName}</option>
                      ))}
                    </select>
                    {item.skuCode && <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{item.skuCode}</div>}
                  </td>
                  <td className="table-td">
                    <input
                      type="number" min={1} className="form-input text-sm py-1 w-20"
                      value={item.qty}
                      onChange={e => updateItem(idx, 'qty', Number(e.target.value))}
                    />
                  </td>
                  <td className="table-td">
                    <input
                      type="number" min={0} className="form-input text-sm py-1 w-28"
                      value={item.unitCost}
                      onChange={e => updateItem(idx, 'unitCost', Number(e.target.value))}
                    />
                  </td>
                  <td className="table-td text-sm font-semibold text-gray-900">
                    {formatPrice(item.qty * item.unitCost)}
                  </td>
                  <td className="table-td">
                    <button onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t bg-gray-50">
              <tr>
                <td className="table-td font-semibold" colSpan={3}>Tổng giá trị nhập kho</td>
                <td className="table-td text-base font-black text-primary-600">{formatPrice(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {items.length > 0 && (
        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={() => setItems([])}>Xóa tất cả</button>
          <button
            className="btn-primary"
            disabled={items.some(i => !i.skuId || i.qty < 1)}
            onClick={() => setSubmitted(true)}
          >
            <Check size={15} /> Xác nhận nhập kho ({items.length} SKU)
          </button>
        </div>
      )}
    </div>
  )
}
