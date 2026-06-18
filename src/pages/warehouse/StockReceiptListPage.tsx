import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus, Search, Eye, CheckCircle, XCircle, FileText, Filter } from 'lucide-react'
import { STOCK_RECEIPTS, saveStockReceipts } from '@/data/stockReceiptMockData'
import { INVENTORY_ITEMS, INVENTORY_TRANSACTIONS, saveInventory } from '@/data/inventoryMockData'
import { formatPrice } from '@/utils/format'
import type { StockReceipt, StockReceiptItem, StockReceiptStatus } from '@/types'

const STATUS_MAP: Record<StockReceiptStatus, { label: string; badge: string }> = {
  draft: { label: 'Nháp', badge: 'badge-gray' },
  pending_approval: { label: 'Chờ duyệt', badge: 'badge-orange' },
  price_negotiating: { label: 'Thương lượng giá', badge: 'badge-purple' },
  approved: { label: 'Đã duyệt', badge: 'badge-blue' },
  completed: { label: 'Hoàn thành', badge: 'badge-green' },
  cancelled: { label: 'Đã hủy', badge: 'badge-red' },
}

export default function StockReceiptListPage() {
  const location = useLocation()
  const prefix = location.pathname.startsWith('/admin') ? '/admin/inventory' : '/warehouse'
  const [receipts, setReceipts] = useState(STOCK_RECEIPTS)
  const [filterStatus, setFilterStatus] = useState<StockReceiptStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = receipts
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .filter(r => !search || r.id.toLowerCase().includes(search.toLowerCase()) || r.supplierName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const pendingCount = receipts.filter(r => r.status === 'pending_approval').length
  const selected = selectedId ? receipts.find(r => r.id === selectedId) : null

  const [receivingReceipt, setReceivingReceipt] = useState<StockReceipt | null>(null)
  const [receivingItems, setReceivingItems] = useState<StockReceiptItem[]>([])

  function approve(id: string) {
    const next = receipts.map(r => r.id === id ? { ...r, status: 'approved' as const, approvedBy: 'Admin PetCare', approvedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') } : r)
    setReceipts(next)
    saveStockReceipts(next)
  }

  function startReceiving(r: StockReceipt) {
    setReceivingReceipt(r)
    const today = new Date()
    const expiry = new Date()
    expiry.setFullYear(today.getFullYear() + 2)
    const expiryStr = expiry.toISOString().slice(0, 10)
    
    const mapped = r.items.map((item, idx) => {
      const suffix = String(idx + 1).padStart(2, '0')
      const suggestedBatch = `LOT-${today.toISOString().slice(2, 10).replace(/-/g, '')}-${suffix}`
      return {
        ...item,
        receivedQty: item.receivedQty || item.orderedQty,
        batchNumber: item.batchNumber || suggestedBatch,
        expiryDate: item.expiryDate || expiryStr
      }
    })
    setReceivingItems(mapped)
  }

  function confirmStockIn() {
    if (!receivingReceipt) return

    const nextReceipts = receipts.map(r => {
      if (r.id !== receivingReceipt.id) return r
      return {
        ...r,
        items: receivingItems,
        status: 'completed' as const,
        approvedBy: r.approvedBy || 'Admin PetCare',
        approvedAt: r.approvedAt || new Date().toISOString().slice(0, 16).replace('T', ' ')
      }
    })
    setReceipts(nextReceipts)
    saveStockReceipts(nextReceipts)

    const updatedInventory = [...INVENTORY_ITEMS]
    const updatedTx = [...INVENTORY_TRANSACTIONS]

    receivingItems.forEach(item => {
      const invIndex = updatedInventory.findIndex(i => i.skuId === item.skuId && i.shopId === 'warehouse')
      const quantityToAdd = item.receivedQty

      if (invIndex > -1) {
        updatedInventory[invIndex] = {
          ...updatedInventory[invIndex],
          quantity: updatedInventory[invIndex].quantity + quantityToAdd,
          lastUpdated: new Date().toISOString().slice(0, 10)
        }
      } else {
        updatedInventory.push({
          skuId: item.skuId,
          skuCode: item.skuCode,
          productName: item.productName,
          shopId: 'warehouse',
          quantity: quantityToAdd,
          minStock: 10,
          lastUpdated: new Date().toISOString().slice(0, 10)
        })
      }

      const txId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      updatedTx.push({
        id: txId,
        type: 'stock_in',
        skuId: item.skuId,
        skuCode: item.skuCode,
        productName: item.productName,
        shopId: 'warehouse',
        quantity: quantityToAdd,
        note: `Nhập kho từ phiếu ${receivingReceipt.id} (NCC: ${receivingReceipt.supplierName}) - Lô: ${item.batchNumber}`,
        createdBy: 'Bùi Văn Khánh',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      })
    })

    saveInventory(updatedInventory, updatedTx)
    setReceivingReceipt(null)
    setReceivingItems([])
  }

  function cancel(id: string) {
    const next = receipts.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r)
    setReceipts(next)
    saveStockReceipts(next)
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Phiếu Nhập Kho (GRN)</h1>
          <p className="text-sm text-gray-500">
            {receipts.length} phiếu · {pendingCount > 0 && <span className="text-amber-600 font-semibold">{pendingCount} chờ duyệt</span>}
          </p>
        </div>
        <Link to={`${prefix}/receipts/new`} className="btn-primary">
          <Plus size={15} /> Tạo phiếu nhập
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {(['all', 'draft', 'pending_approval', 'approved', 'completed', 'cancelled'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterStatus === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {s === 'all' ? 'Tất cả' : STATUS_MAP[s].label}
              {s === 'pending_approval' && pendingCount > 0 && <span className="ml-1 badge-orange text-[10px]">{pendingCount}</span>}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9 text-sm" placeholder="Tìm mã phiếu, NCC..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className={`card overflow-hidden flex-1 ${selected ? 'max-w-[60%]' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Mã phiếu</th>
                  <th className="table-th">Nhà cung cấp</th>
                  <th className="table-th text-center">Số SKU</th>
                  <th className="table-th text-right">Tổng giá trị</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th">Ngày tạo</th>
                  <th className="table-th text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(r => (
                  <tr key={r.id} className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedId === r.id ? 'bg-primary-50/30 border-l-2 border-l-primary-500' : ''}`}
                    onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}>
                    <td className="table-td">
                      <span className="font-mono text-xs font-bold text-primary-600">{r.id}</span>
                      {r.poReference && (
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {r.inboundType === 'adjustment' ? `Lý do: ${r.poReference}` : `Mã tham chiếu: ${r.poReference}`}
                        </div>
                      )}
                    </td>
                    <td className="table-td text-xs font-medium text-gray-800 max-w-40 truncate">{r.supplierName}</td>
                    <td className="table-td text-center text-sm font-bold text-gray-700">{r.items.length}</td>
                    <td className="table-td text-right text-sm font-bold text-gray-900">{formatPrice(r.totalValue)}</td>
                    <td className="table-td"><span className={STATUS_MAP[r.status].badge}>{STATUS_MAP[r.status].label}</span></td>
                    <td className="table-td text-xs text-gray-400">{r.createdAt.split(' ')[0]}</td>
                    <td className="table-td text-center">
                      <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                        {r.status === 'pending_approval' && (
                          <>
                            <button onClick={() => approve(r.id)} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Duyệt">
                              <CheckCircle size={15} />
                            </button>
                            <button onClick={() => cancel(r.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Hủy">
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        {r.status === 'approved' && (
                          <button onClick={() => startReceiving(r)} className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                            Nhập kho
                          </button>
                        )}
                        <button onClick={() => setSelectedId(r.id)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm">Không có phiếu nhập kho nào</div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-[40%] card p-5 space-y-4 animate-slideIn sticky top-4 self-start">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">{selected.id}</h3>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">×</button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Trạng thái</div>
                  <span className={STATUS_MAP[selected.status].badge}>{STATUS_MAP[selected.status].label}</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Ngày tạo</div>
                  <div className="font-medium">{selected.createdAt}</div>
                </div>
                
                <div className="col-span-2">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Phân loại / Nguồn hàng</div>
                  <div className="font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] rounded-lg border border-primary-100 uppercase tracking-wider font-extrabold">
                      {selected.inboundType === 'transfer' ? 'Chuyển kho' :
                       selected.inboundType === 'return' ? 'Khách trả' :
                       selected.inboundType === 'sample' ? 'Hàng tặng' :
                       selected.inboundType === 'adjustment' ? 'Cân đối' : 'NCC'}
                    </span>
                    <span className="truncate">{selected.supplierName}</span>
                  </div>
                </div>

                {selected.poReference && (
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">
                      {selected.inboundType === 'adjustment' ? 'Lý do điều chỉnh' : 'Mã tham chiếu'}
                    </div>
                    <div className="font-medium text-gray-800 text-xs truncate" title={selected.poReference}>
                      {selected.poReference}
                    </div>
                  </div>
                )}

                {selected.referenceId && (
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Mã liên kết gốc</div>
                    <div className="font-mono font-bold text-indigo-600 text-xs truncate" title={selected.referenceId}>
                      {selected.referenceId}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Người tạo</div>
                  <div className="font-medium">{selected.createdBy}</div>
                </div>
                {selected.approvedBy && (
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Người duyệt</div>
                    <div className="font-medium">{selected.approvedBy}</div>
                  </div>
                )}
              </div>

              {selected.note && (
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">📋 {selected.note}</div>
              )}

              <div>
                <div className="text-xs font-bold text-gray-800 mb-2">Chi tiết hàng hóa ({selected.items.length} SKU)</div>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-gray-900">{item.productName}</div>
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            <span className="text-[9px] font-mono bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-bold">
                              {item.skuCode}
                            </span>
                            {item.batchNumber && (
                              <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded border border-indigo-100 font-bold">
                                Lô: {item.batchNumber}
                              </span>
                            )}
                            {item.expiryDate && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded border border-emerald-100 font-bold">
                                HSD: {item.expiryDate}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold">{item.receivedQty}/{item.orderedQty}</div>
                          <div className="text-[10px] text-gray-400">{formatPrice(item.unitCost)}/sp</div>
                        </div>
                      </div>
                      {item.receivedQty < item.orderedQty && (
                        <div className="text-[10px] text-amber-600 font-semibold">⚠️ Thiếu {item.orderedQty - item.receivedQty} sp</div>
                      )}
                      {item.note && <div className="text-[10px] text-gray-500 italic">Ghi chú: {item.note}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600">Tổng giá trị</span>
                <span className="text-base font-black text-primary-600">{formatPrice(selected.totalValue)}</span>
              </div>

              {/* Actions */}
              {selected.status === 'pending_approval' && (
                <div className="flex gap-2 pt-2">
                  <button onClick={() => approve(selected.id)} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5">
                    <CheckCircle size={14} /> Duyệt phiếu
                  </button>
                  <button onClick={() => cancel(selected.id)} className="py-2.5 px-4 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors">
                    Hủy
                  </button>
                </div>
              )}
              {selected.status === 'approved' && (
                <button onClick={() => startReceiving(selected)} className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors">
                  ✅ Tiến hành nhập kho thực tế
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Modal: Xác nhận nhập kho thực tế */}
      {receivingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl p-6 space-y-4 animate-scaleUp shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-150 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <span>📥</span> Xác nhận nhập kho thực tế
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Phiếu nhập: <strong className="font-mono text-primary-650">{receivingReceipt.id}</strong> · Nhà cung cấp: <strong>{receivingReceipt.supplierName}</strong>
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => { setReceivingReceipt(null); setReceivingItems([]); }} 
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">Tên sản phẩm / SKU</th>
                    <th className="py-2.5 px-2 text-center w-20">SL Đặt</th>
                    <th className="py-2.5 px-2 text-center w-24">SL Thực Nhận</th>
                    <th className="py-2.5 px-2 w-32">Số Lô <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-2 w-36">Hạn sử dụng <span className="text-rose-500">*</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {receivingItems.map((item, idx) => {
                    const isMismatch = item.receivedQty !== item.orderedQty
                    return (
                      <tr key={idx} className={`hover:bg-slate-50/30 ${isMismatch ? 'bg-amber-50/10' : ''}`}>
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-800">{item.productName}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.skuCode}</div>
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-gray-600">
                          {item.orderedQty}
                        </td>
                        <td className="py-3 px-2">
                          <input 
                            type="number"
                            min={0}
                            className="form-input text-center text-xs py-1 px-1.5 font-bold border-gray-300 w-16 mx-auto block"
                            value={item.receivedQty}
                            onChange={e => {
                              const val = +e.target.value
                              setReceivingItems(prev => prev.map((itm, i) => i === idx ? { ...itm, receivedQty: val } : itm))
                            }}
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input 
                            type="text"
                            required
                            placeholder="Nhập mã lô"
                            className="form-input text-xs font-mono py-1 px-2 border-gray-300 uppercase w-28"
                            value={item.batchNumber || ''}
                            onChange={e => {
                              const val = e.target.value.toUpperCase()
                              setReceivingItems(prev => prev.map((itm, i) => i === idx ? { ...itm, batchNumber: val } : itm))
                            }}
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input 
                            type="date"
                            required
                            className="form-input text-[11px] py-1 px-2 border-gray-300 w-32 font-medium"
                            value={item.expiryDate || ''}
                            onChange={e => {
                              const val = e.target.value
                              setReceivingItems(prev => prev.map((itm, i) => i === idx ? { ...itm, expiryDate: val } : itm))
                            }}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-150">
              <button 
                type="button" 
                onClick={() => { setReceivingReceipt(null); setReceivingItems([]); }} 
                className="btn-secondary text-xs px-4 py-2"
              >
                Hủy bỏ
              </button>
              <button 
                type="button" 
                onClick={confirmStockIn}
                disabled={receivingItems.some(i => !i.batchNumber || !i.expiryDate)}
                className="btn-primary text-xs px-5 py-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                📥 Hoàn tất Nhập kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
