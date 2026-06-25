import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { INVENTORY_ITEMS } from '@/data/inventoryMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { TRANSFER_MOCK_LIST, saveTransfers } from '@/data/transferMockData'
import { useAuthContext } from '@/auth/AuthContext'

const SHOPS = [
  { id: 'warehouse', name: 'Kho Trung Tâm' },
  ...SHOP_MOCK_LIST.map(s => ({ id: s.id, name: s.name })),
]

interface LocalTransferItem { 
  skuId: string
  skuCode: string
  productName: string
  itemType: 'product' | 'cage'
  quantity: number
  currentStock: number
}

export default function CreateTransferPage() {
  const { currentUser } = useAuthContext()
  const role = currentUser?.role ?? 'warehouse_manager'
  const isShopHead = role === 'shop_head'
  const myShopId = currentUser?.shopId ?? 'SH01'

  const navigate = useNavigate()
  const location = useLocation()
  const prefix = location.pathname.startsWith('/admin') ? '/admin/inventory' : location.pathname.startsWith('/shop-head') ? '/shop-head' : '/warehouse'

  const [fromShopId] = useState('warehouse')
  const [toShopId, setToShopId] = useState(isShopHead ? myShopId : '')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<LocalTransferItem[]>([])
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const sourceItems = INVENTORY_ITEMS.filter(i => i.shopId === fromShopId)
  const hasOverStock = items.some(i => i.skuId && i.quantity > i.currentStock)

  function addItem() {
    setItems(prev => [...prev, { skuId: '', skuCode: '', productName: '', itemType: 'product', quantity: 1, currentStock: 0 }])
  }

  function updateItem(idx: number, skuId: string) {
    const inv = sourceItems.find(i => i.skuId === skuId)
    let prodName = ''
    if (inv) {
      prodName = inv.productName
    } else {
      const product = PRODUCT_MOCK_LIST.find(p => p.skus.some(s => s.id === skuId))
      const sku = product?.skus.find(s => s.id === skuId)
      if (product && sku) {
        prodName = `${product.name} — ${Object.values(sku.attributes).join('/')}`
      }
    }
    
    setItems(prev => prev.map((item, i) => i !== idx ? item : {
      ...item, 
      skuId, 
      skuCode: inv?.skuCode ?? skuId, 
      productName: prodName || skuId, 
      currentStock: inv?.quantity ?? 0,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!toShopId) { setError('Chọn kho/chi nhánh đích'); return }
    if (fromShopId === toShopId) { setError('Kho nguồn và đích không được trùng'); return }
    if (items.length === 0) { setError('Thêm ít nhất 1 SKU'); return }
    if (items.some(i => !i.skuId)) { setError('Có SKU chưa chọn'); return }
    if (hasOverStock) { setError('Có SKU vượt tồn kho'); return }

    const newId = `TF-RQ${Math.floor(1000 + Math.random() * 9000)}`
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)

    const transfer = {
      id: newId,
      fromShopId,
      toShopId,
      items: items.map(i => ({ 
        skuId: i.skuId, 
        skuCode: i.skuCode, 
        productName: i.productName, 
        itemType: i.itemType,
        quantity: i.quantity,
      })),
      status: 'pending' as const,
      requestedBy: currentUser?.fullName ?? 'Bùi Văn Khánh',
      requestedAt: now,
      note,
    }

    const next = [transfer, ...TRANSFER_MOCK_LIST]
    saveTransfers(next)

    setToast(`Yêu cầu chuyển kho ${newId} đã được tạo!`)
    setTimeout(() => navigate(`${prefix}/transfers`), 1500)
  }

  const fromName = SHOPS.find(s => s.id === fromShopId)?.name ?? ''
  const toName = SHOPS.find(s => s.id === toShopId)?.name ?? '...'

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12 animate-fadeIn">
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
          <button onClick={() => setError('')} className="ml-auto text-red-400 font-bold">×</button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`${prefix}/transfers`)} className="p-2.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl shadow-sm">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Chuyển kho / Tạo mới</div>
          <h1 className="text-xl font-bold text-gray-900">Yêu cầu nhập hàng về chi nhánh</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Route visualization */}
        <div className="card p-6">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">🔄 Tuyến cấp hàng về chi nhánh</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="form-label text-xs font-bold text-gray-400 uppercase">Kho xuất nguồn</label>
              <div className="form-input bg-gray-50 font-bold text-slate-700 text-sm py-2">
                Kho Trung Tâm (Bắt buộc)
              </div>
            </div>
            <div className="flex flex-col items-center pt-5">
              <div className="flex gap-1 mb-1">
                {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 bg-primary-300 rounded-full" />)}
              </div>
              <ArrowRight size={20} className="text-primary-500" />
            </div>
            <div className="flex-1">
              <label className="form-label text-xs font-bold text-gray-400 uppercase">Chi nhánh nhận <span className="text-rose-500">*</span></label>
              <select className="form-input text-xs font-bold" value={toShopId} onChange={e => setToShopId(e.target.value)}>
                <option value="">-- Chọn chi nhánh nhận --</option>
                {SHOPS.filter(s => s.id !== 'warehouse').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          {toShopId && (
            <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 font-medium text-center">
              📦 Kho Trung Tâm → 🚚 → 📦 {toName}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Hàng hóa yêu cầu ({items.length} mặt hàng)</h3>
            <button type="button" onClick={addItem} className="btn-primary text-sm py-1.5"><Plus size={13} /> Thêm mặt hàng</button>
          </div>

          {items.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-3xl mb-2">🔄</div>
              <div className="text-sm text-gray-400">Chưa có mặt hàng nào. Thêm mặt hàng cần chuyển ở nút trên.</div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="table-th">Loại hàng & SKU / Sản phẩm</th>
                  <th className="table-th w-24">Tồn kho nguồn</th>
                  <th className="table-th w-24">SL yêu cầu</th>
                  <th className="table-th w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item, idx) => {
                  const isOver = item.skuId && item.quantity > item.currentStock
                  return (
                    <tr key={idx} className={isOver ? 'bg-red-50/30' : ''}>
                      <td className="table-td">
                        <div className="flex gap-2">
                          <select 
                            className="form-input text-xs py-1 px-1.5 w-32 bg-slate-50 font-bold shrink-0" 
                            value={item.itemType}
                            onChange={e => {
                              const type = e.target.value as 'product' | 'cage'
                              setItems(prev => prev.map((it, i) => i !== idx ? it : {
                                ...it,
                                itemType: type,
                                skuId: '',
                                skuCode: '',
                                productName: '',
                                currentStock: 0,
                                batchNumber: '',
                                expiryDate: ''
                              }))
                            }}
                          >
                            <option value="product">Hàng để bán</option>
                            <option value="cage">Chuồng</option>
                          </select>
                          
                          {item.itemType === 'product' ? (
                            <select className="form-input text-xs py-1" value={item.skuId} onChange={e => updateItem(idx, e.target.value)}>
                              <option value="">-- Chọn SKU sản phẩm --</option>
                              {sourceItems.filter(w => w.category !== 'cage').map(w => {
                                const p = PRODUCT_MOCK_LIST.find(p => p.skus.some(s => s.id === w.skuId))
                                const s = p?.skus.find(s => s.id === w.skuId)
                                return <option key={w.skuId} value={w.skuId}>{p?.name} — {Object.values(s?.attributes ?? {}).join('/')} (Còn: {w.quantity})</option>
                              })}
                            </select>
                          ) : (
                            <select className="form-input text-xs py-1" value={item.skuId} onChange={e => updateItem(idx, e.target.value)}>
                              <option value="">-- Chọn loại chuồng --</option>
                              {sourceItems.filter(w => w.category === 'cage' || w.skuId.startsWith('CAGE')).map(w => (
                                <option key={w.skuId} value={w.skuId}>{w.productName} (Còn: {w.quantity})</option>
                              ))}
                            </select>
                          )}
                        </div>
                        {item.skuCode && <div className="text-[10px] text-gray-400 mt-1.5 font-mono">{item.skuCode}</div>}
                      </td>
                      <td className="table-td font-bold text-sm">{item.skuId ? item.currentStock : '—'}</td>
                      <td className="table-td">
                        <input type="number" min={1} className={`form-input text-sm py-1 w-20 ${isOver ? 'border-red-400' : ''}`}
                          value={item.quantity} onChange={e => setItems(prev => prev.map((it, i) => i !== idx ? it : { ...it, quantity: Math.max(1, +e.target.value) }))} />
                        {isOver && <div className="text-[10px] text-red-500 mt-0.5">Vượt tồn!</div>}
                      </td>
                      <td className="table-td">
                        <button type="button" onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Note */}
        <div className="card p-5">
          <label className="form-label">Ghi chú phiếu chuyển</label>
          <textarea rows={2} className="form-input resize-none" placeholder="VD: Gửi gấp cho chi nhánh..." value={note} onChange={e => setNote(e.target.value)} />
        </div>

        {hasOverStock && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle size={15} /> Có SKU vượt quá tồn kho nguồn. Vui lòng kiểm tra lại.
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(`${prefix}/transfers`)} className="btn-secondary">Hủy bỏ</button>
          <button type="submit" disabled={items.length === 0 || hasOverStock || !toShopId}
            className="btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed">
            <CheckCircle size={15} /> Tạo yêu cầu nhập về shop
          </button>
        </div>
      </form>
    </div>
  )
}
