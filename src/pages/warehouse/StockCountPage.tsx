import { useState } from 'react'
import { ClipboardCheck, CheckCircle, AlertTriangle, Plus, Search } from 'lucide-react'
import { INVENTORY_ITEMS } from '@/data/inventoryMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import type { StockCountStatus } from '@/types'

interface CountItem {
  skuId: string; skuCode: string; productName: string
  systemQty: number; actualQty: number; variance: number; note: string
}

interface CountSession {
  id: string; warehouseId: string; warehouseName: string
  items: CountItem[]; status: StockCountStatus
  createdBy: string; createdAt: string; countDate: string; note: string
}

const STATUS_MAP: Record<StockCountStatus, { label: string; badge: string }> = {
  planned: { label: 'Đã lên kế hoạch', badge: 'badge-gray' },
  in_progress: { label: 'Đang kiểm', badge: 'badge-blue' },
  pending_review: { label: 'Chờ duyệt', badge: 'badge-orange' },
  approved: { label: 'Đã duyệt', badge: 'badge-green' },
  adjusted: { label: 'Đã điều chỉnh', badge: 'badge-green' },
}

const SHOPS = [
  { id: 'warehouse', name: 'Kho Trung Tâm' },
  ...SHOP_MOCK_LIST.map(s => ({ id: s.id, name: s.name })),
]

// Initial mock sessions
const INITIAL_SESSIONS: CountSession[] = [
  {
    id: 'SC-001', warehouseId: 'warehouse', warehouseName: 'Kho Trung Tâm',
    items: [
      { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', systemQty: 120, actualQty: 118, variance: -2, note: 'Có thể do đếm nhầm lần trước' },
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', systemQty: 200, actualQty: 200, variance: 0, note: '' },
      { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', systemQty: 150, actualQty: 148, variance: -2, note: '2 túi bị rách, đã loại' },
    ],
    status: 'approved', createdBy: 'Bùi Văn Khánh', createdAt: '2026-05-25 08:00', countDate: '2026-05-25',
    note: 'Kiểm kê định kỳ cuối tháng 5',
  },
  {
    id: 'SC-002', warehouseId: 'SH01', warehouseName: 'Chi nhánh Q.1',
    items: [
      { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', systemQty: 25, actualQty: 25, variance: 0, note: '' },
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', systemQty: 3, actualQty: 3, variance: 0, note: '' },
    ],
    status: 'adjusted', createdBy: 'Nguyễn Thị Cẩm', createdAt: '2026-05-28 14:00', countDate: '2026-05-28',
    note: 'Kiểm kê SH01',
  },
]

export default function StockCountPage() {
  const [sessions, setSessions] = useState<CountSession[]>(INITIAL_SESSIONS)
  const [mode, setMode] = useState<'list' | 'create' | 'counting'>('list')
  const [selectedSession, setSelectedSession] = useState<CountSession | null>(null)

  // Create form states
  const [newWarehouseId, setNewWarehouseId] = useState('warehouse')
  const [newNote, setNewNote] = useState('')
  const [countItems, setCountItems] = useState<CountItem[]>([])
  const [toast, setToast] = useState('')

  function startNewCount() {
    const items = INVENTORY_ITEMS
      .filter(i => i.shopId === newWarehouseId)
      .map(i => ({
        skuId: i.skuId, skuCode: i.skuCode, productName: i.productName,
        systemQty: i.quantity, actualQty: i.quantity, variance: 0, note: '',
      }))
    setCountItems(items)
    setMode('counting')
  }

  function updateActualQty(idx: number, actualQty: number) {
    setCountItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      return { ...item, actualQty, variance: actualQty - item.systemQty }
    }))
  }

  function updateItemNote(idx: number, note: string) {
    setCountItems(prev => prev.map((item, i) => i !== idx ? item : { ...item, note }))
  }

  function submitCount() {
    const today = new Date()
    const newSession: CountSession = {
      id: `SC-${String(sessions.length + 1).padStart(3, '0')}`,
      warehouseId: newWarehouseId,
      warehouseName: SHOPS.find(s => s.id === newWarehouseId)?.name ?? '',
      items: countItems,
      status: 'pending_review',
      createdBy: 'Bùi Văn Khánh',
      createdAt: today.toISOString().replace('T', ' ').slice(0, 16),
      countDate: today.toISOString().slice(0, 10),
      note: newNote,
    }
    setSessions([newSession, ...sessions])
    setToast(`Phiên kiểm kê ${newSession.id} đã gửi chờ duyệt!`)
    setMode('list')
    setCountItems([])
    setNewNote('')
    setTimeout(() => setToast(''), 3000)
  }

  const totalVariance = countItems.reduce((s, i) => s + Math.abs(i.variance), 0)
  const itemsWithDiff = countItems.filter(i => i.variance !== 0)

  return (
    <div className="space-y-5 animate-fadeIn">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="font-semibold text-sm">{toast}</span>
        </div>
      )}

      {/* List Mode */}
      {mode === 'list' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Kiểm Kê Kho</h1>
              <p className="text-sm text-gray-500">{sessions.length} phiên kiểm kê</p>
            </div>
            <button onClick={() => setMode('create')} className="btn-primary">
              <Plus size={15} /> Tạo phiên kiểm kê
            </button>
          </div>

          {/* Sessions list */}
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="card p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedSession(selectedSession?.id === s.id ? null : s)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-primary-600">{s.id}</span>
                      <span className={STATUS_MAP[s.status].badge}>{STATUS_MAP[s.status].label}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-800">{s.warehouseName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {s.items.length} SKU đã kiểm · Ngày kiểm: {s.countDate} · Tạo bởi: {s.createdBy}
                    </div>
                  </div>
                  <div className="text-right">
                    {s.items.some(i => i.variance !== 0) ? (
                      <div className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                        <AlertTriangle size={12} />
                        {s.items.filter(i => i.variance !== 0).length} chênh lệch
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-600 font-bold">✓ Khớp hoàn toàn</div>
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                {selectedSession?.id === s.id && (
                  <div className="mt-4 border-t border-gray-100 pt-4 animate-slideIn">
                    {s.note && <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600 mb-3">📋 {s.note}</div>}
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="table-th">SKU</th>
                          <th className="table-th">Sản phẩm</th>
                          <th className="table-th text-right">Sổ sách</th>
                          <th className="table-th text-right">Thực tế</th>
                          <th className="table-th text-right">Chênh lệch</th>
                          <th className="table-th">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {s.items.map((item, i) => (
                          <tr key={i} className={item.variance !== 0 ? 'bg-amber-50/30' : ''}>
                            <td className="table-td font-mono text-xs text-gray-400">{item.skuCode}</td>
                            <td className="table-td text-xs">{item.productName}</td>
                            <td className="table-td text-right font-bold text-sm">{item.systemQty}</td>
                            <td className="table-td text-right font-bold text-sm">{item.actualQty}</td>
                            <td className="table-td text-right">
                              <span className={`text-sm font-black ${item.variance > 0 ? 'text-emerald-600' : item.variance < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                {item.variance > 0 ? '+' : ''}{item.variance}
                              </span>
                            </td>
                            <td className="table-td text-xs text-gray-500 max-w-32 truncate">{item.note || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create Mode */}
      {mode === 'create' && (
        <>
          <div className="flex items-center gap-3">
            <button onClick={() => setMode('list')} className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl shadow-sm">
              <ClipboardCheck size={18} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tạo Phiên Kiểm Kê Mới</h1>
              <p className="text-sm text-gray-500">Chọn kho cần kiểm kê</p>
            </div>
          </div>

          <div className="card p-5 space-y-4 max-w-lg">
            <div>
              <label className="form-label">Kho / Chi nhánh kiểm kê <span className="text-rose-500">*</span></label>
              <select className="form-input" value={newWarehouseId} onChange={e => setNewWarehouseId(e.target.value)}>
                {SHOPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Hiện có {INVENTORY_ITEMS.filter(i => i.shopId === newWarehouseId).length} SKU tại kho này
              </p>
            </div>
            <div>
              <label className="form-label">Ghi chú</label>
              <textarea rows={2} className="form-input resize-none" placeholder="VD: Kiểm kê định kỳ tháng 6..." value={newNote} onChange={e => setNewNote(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setMode('list')} className="btn-secondary">Hủy</button>
              <button onClick={startNewCount} className="btn-primary">
                <ClipboardCheck size={15} /> Bắt đầu kiểm kê
              </button>
            </div>
          </div>
        </>
      )}

      {/* Counting Mode */}
      {mode === 'counting' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Đang kiểm kê: {SHOPS.find(s => s.id === newWarehouseId)?.name}
              </h1>
              <p className="text-sm text-gray-500">{countItems.length} SKU cần kiểm đếm</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode('list')} className="btn-secondary">Hủy</button>
              <button onClick={submitCount} className="btn-primary">
                <CheckCircle size={15} /> Gửi kết quả kiểm kê
              </button>
            </div>
          </div>

          {/* Summary bar */}
          <div className="flex gap-3">
            <div className="card p-3 flex-1 text-center">
              <div className="text-2xl font-black text-gray-900">{countItems.length}</div>
              <div className="text-xs text-gray-500">Tổng SKU</div>
            </div>
            <div className="card p-3 flex-1 text-center">
              <div className={`text-2xl font-black ${itemsWithDiff.length > 0 ? 'text-amber-500' : 'text-emerald-600'}`}>{itemsWithDiff.length}</div>
              <div className="text-xs text-gray-500">Chênh lệch</div>
            </div>
            <div className="card p-3 flex-1 text-center">
              <div className="text-2xl font-black text-gray-700">{totalVariance}</div>
              <div className="text-xs text-gray-500">Tổng sai lệch</div>
            </div>
          </div>

          {/* Count table */}
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="table-th">#</th>
                  <th className="table-th">SKU</th>
                  <th className="table-th">Sản phẩm</th>
                  <th className="table-th text-right">Tồn sổ sách</th>
                  <th className="table-th w-28">Thực tế đếm</th>
                  <th className="table-th text-right">Chênh lệch</th>
                  <th className="table-th w-48">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {countItems.map((item, idx) => (
                  <tr key={idx} className={item.variance !== 0 ? 'bg-amber-50/30' : 'hover:bg-gray-50/50'}>
                    <td className="table-td text-xs text-gray-400">{idx + 1}</td>
                    <td className="table-td font-mono text-xs text-gray-500">{item.skuCode}</td>
                    <td className="table-td text-xs font-medium">{item.productName}</td>
                    <td className="table-td text-right font-bold text-sm text-gray-600">{item.systemQty}</td>
                    <td className="table-td">
                      <input type="number" min={0} className={`form-input text-sm py-1.5 w-24 font-bold ${item.variance !== 0 ? 'border-amber-400 bg-amber-50' : ''}`}
                        value={item.actualQty} onChange={e => updateActualQty(idx, +e.target.value)} />
                    </td>
                    <td className="table-td text-right">
                      <span className={`text-sm font-black ${item.variance > 0 ? 'text-emerald-600' : item.variance < 0 ? 'text-red-500' : 'text-gray-300'}`}>
                        {item.variance > 0 ? '+' : ''}{item.variance}
                      </span>
                    </td>
                    <td className="table-td">
                      <input className="form-input text-xs py-1.5" placeholder="Ghi chú..."
                        value={item.note} onChange={e => updateItemNote(idx, e.target.value)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
