import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Plus, Check, X, Truck, ArrowRight, Search, Eye, CheckCircle, XCircle, FileText, AlertTriangle } from 'lucide-react'
import { TRANSFER_MOCK_LIST, saveTransfers } from '@/data/transferMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { INVENTORY_ITEMS, INVENTORY_TRANSACTIONS, saveInventory } from '@/data/inventoryMockData'
import { STOCK_ISSUES, saveStockIssues } from '@/data/stockIssueMockData'
import type { StockTransfer, TransferStatus } from '@/types'
import { useAuthContext } from '@/auth/AuthContext'

const STATUS_LABELS: Record<TransferStatus, string> = {
  pending: 'Chờ duyệt', approved: 'Đã duyệt', picking: 'Đang lấy hàng', shipped: 'Đã xuất hàng',
  in_transit: 'Đang vận chuyển', received: 'Đã nhận', completed: 'Hoàn thành',
  rejected: 'Từ chối', partially_received: 'Nhận một phần',
}
const STATUS_COLORS: Record<TransferStatus, string> = {
  pending: 'badge-orange', approved: 'badge-blue', picking: 'badge-blue', shipped: 'badge-blue',
  in_transit: 'badge-blue', received: 'badge-green', completed: 'badge-green',
  rejected: 'badge-red', partially_received: 'badge-orange',
}

function shopName(id: string | 'warehouse') {
  if (id === 'warehouse') return 'Kho trung tâm'
  return SHOP_MOCK_LIST.find(s => s.id === id)?.name.replace('PetCare ', '') ?? id
}

export default function TransfersPage() {
  const { currentUser } = useAuthContext()
  const role = currentUser?.role ?? 'warehouse_manager'
  const isShopHead = role === 'shop_head'
  const myShopId = currentUser?.shopId ?? 'SH01'

  const location = useLocation()
  const navigate = useNavigate()
  const prefix = location.pathname.startsWith('/admin') ? '/admin/inventory' : location.pathname.startsWith('/shop-head') ? '/shop-head' : '/warehouse'

  const [transfers, setTransfers] = useState(TRANSFER_MOCK_LIST)
  const [filter, setFilter] = useState<TransferStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({})
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectReasonText, setRejectReasonText] = useState('')
  const [rejectingTransferId, setRejectingTransferId] = useState<string | null>(null)

  const selected = selectedId ? transfers.find(t => t.id === selectedId) : null

  useEffect(() => {
    if (selected) {
      const eq: Record<string, number> = {}
      selected.items.forEach(item => {
        eq[item.skuId] = item.quantity
      })
      setEditedQuantities(eq)
    }
  }, [selectedId])

  const myTransfers = transfers.filter(t => !isShopHead || t.fromShopId === myShopId || t.toShopId === myShopId)
  const filtered = myTransfers
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => {
      if (!search) return true
      const s = search.toLowerCase()
      return (
        t.id.toLowerCase().includes(s) ||
        shopName(t.fromShopId).toLowerCase().includes(s) ||
        shopName(t.toShopId).toLowerCase().includes(s) ||
        (t.note && t.note.toLowerCase().includes(s)) ||
        t.requestedBy.toLowerCase().includes(s)
      )
    })

  const pendingCount = myTransfers.filter(t => t.status === 'pending').length

  function approveTransfer(id: string) {
    const transfer = transfers.find(t => t.id === id)
    if (!transfer) return

    const next = transfers.map(t => {
      if (t.id !== id) return t
      const updatedItems = t.items.map(item => ({
        ...item,
        quantity: editedQuantities[item.skuId] ?? item.quantity
      }))
      return {
        ...t,
        items: updatedItems,
        status: 'approved' as const,
        approvedBy: currentUser?.fullName ?? 'Bùi Văn Khánh',
        approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      }
    })
    setTransfers(next)
    saveTransfers(next)
    showToast(`Đã duyệt yêu cầu chuyển kho ${id}`)
  }

  function submitRejectTransfer() {
    if (!rejectingTransferId) return
    if (!rejectReasonText.trim()) {
      alert('Vui lòng nhập lý do từ chối!')
      return
    }
    const next = transfers.map(t => {
      if (t.id !== rejectingTransferId) return t
      return {
        ...t,
        status: 'rejected' as const,
        rejectReason: rejectReasonText.trim()
      }
    })
    setTransfers(next)
    saveTransfers(next)
    setIsRejectModalOpen(false)
    setRejectReasonText('')
    setRejectingTransferId(null)
    setSelectedId(null)
    showToast(`Đã từ chối phiếu yêu cầu`)
  }

  function showToast(msg: string) {
    alert(msg)
  }

  function updateStatus(id: string, newStatus: TransferStatus) {
    const transfer = transfers.find(t => t.id === id)
    if (!transfer) return

    const next = transfers.map(t => {
      if (t.id !== id) return t
      const updated: StockTransfer = { ...t, status: newStatus }
      if (newStatus === 'approved') {
        updated.approvedBy = currentUser?.fullName ?? 'Bùi Văn Khánh'
      }
      return updated
    })
    setTransfers(next)
    saveTransfers(next)

    // Stock adjustments on shipment and receipt
    const updatedInventory = [...INVENTORY_ITEMS]
    const updatedTx = [...INVENTORY_TRANSACTIONS]
    const todayStr = new Date().toISOString().replace('T', ' ').slice(0, 16)

    if (newStatus === 'shipped') {
      // Deduct items from the sender (fromShopId)
      transfer.items.forEach(item => {
        const invItemIdx = updatedInventory.findIndex(
          i => i.skuId === item.skuId && i.shopId === transfer.fromShopId
        )
        if (invItemIdx > -1) {
          updatedInventory[invItemIdx] = {
            ...updatedInventory[invItemIdx],
            quantity: Math.max(0, updatedInventory[invItemIdx].quantity - item.quantity),
            lastUpdated: todayStr.split(' ')[0]
          }
        }
        // Log transaction for sender
        updatedTx.unshift({
          id: `TX-OUT${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'transfer_out',
          skuId: item.skuId,
          skuCode: item.skuCode,
          productName: item.productName,
          shopId: transfer.fromShopId,
          quantity: -item.quantity,
          note: `Xuất kho chuyển hàng đến ${shopName(transfer.toShopId)} (Phiếu: ${transfer.id})`,
          createdBy: currentUser?.fullName ?? 'Bùi Văn Khánh',
          createdAt: todayStr,
          transferId: transfer.id
        })
      })
      saveInventory(updatedInventory, updatedTx)

      // Auto-create Goods Issue Note (Phiếu xuất kho)
      const issueId = `GIN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(STOCK_ISSUES.length + 1).padStart(3, '0')}`
      const newIssue = {
        id: issueId,
        type: 'transfer' as const,
        warehouseId: transfer.fromShopId,
        targetShopId: transfer.toShopId,
        items: transfer.items.map(item => ({
          skuId: item.skuId,
          skuCode: item.skuCode,
          productName: item.productName,
          quantity: item.quantity,
          unitCost: 0,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate
        })),
        totalValue: 0,
        status: 'completed' as const,
        reason: `Xuất kho chuyển hàng về chi nhánh ${shopName(transfer.toShopId)} theo phiếu ${transfer.id}`,
        createdBy: currentUser?.fullName ?? 'Bùi Văn Khánh',
        createdAt: todayStr,
        approvedBy: currentUser?.fullName ?? 'Bùi Văn Khánh',
        approvedAt: todayStr,
        note: `Tự động tạo khi xuất kho phiếu chuyển hàng ${transfer.id}`
      }
      const updatedIssues = [newIssue, ...STOCK_ISSUES]
      saveStockIssues(updatedIssues)
      alert(`Đã xuất kho thành công! Tự động khởi tạo Phiếu xuất kho: ${issueId}. Bạn có thể xem trong danh sách Phiếu xuất kho.`)
    } else if (newStatus === 'received') {
      // Add items to the receiver (toShopId)
      transfer.items.forEach(item => {
        const invItemIdx = updatedInventory.findIndex(
          i => i.skuId === item.skuId && i.shopId === transfer.toShopId
        )
        if (invItemIdx > -1) {
          updatedInventory[invItemIdx] = {
            ...updatedInventory[invItemIdx],
            quantity: updatedInventory[invItemIdx].quantity + item.quantity,
            lastUpdated: todayStr.split(' ')[0]
          }
        } else {
          updatedInventory.push({
            skuId: item.skuId,
            skuCode: item.skuCode,
            productName: item.productName,
            shopId: transfer.toShopId,
            quantity: item.quantity,
            minStock: 5,
            lastUpdated: todayStr.split(' ')[0]
          })
        }
        // Log transaction for receiver
        updatedTx.unshift({
          id: `TX-IN${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'transfer_in',
          skuId: item.skuId,
          skuCode: item.skuCode,
          productName: item.productName,
          shopId: transfer.toShopId,
          quantity: item.quantity,
          note: `Nhận hàng chuyển từ ${shopName(transfer.fromShopId)} (Phiếu: ${transfer.id})`,
          createdBy: currentUser?.fullName ?? 'Bùi Văn Khánh',
          createdAt: todayStr,
          transferId: transfer.id
        })
      })
      saveInventory(updatedInventory, updatedTx)
    }
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Phiếu chuyển kho</h1>
          {pendingCount > 0 && <p className="text-sm text-orange-600">{pendingCount} phiếu đang chờ duyệt</p>}
        </div>
        <Link to={`${prefix}/transfers/new`} className="btn-primary">
          <Plus size={15} /> Tạo phiếu mới
        </Link>
      </div>

      {/* Filter tabs & Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {(['all', 'pending', 'approved', 'shipped', 'received', 'rejected'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filter === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {s === 'all' ? 'Tất cả' : STATUS_LABELS[s]}
              {s === 'pending' && pendingCount > 0 && <span className="ml-1 badge-orange text-[10px]">{pendingCount}</span>}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9 text-sm" placeholder="Tìm kiếm phiếu chuyển..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-5">
        {/* Table view (Left side when selected) */}
        <div className={`card overflow-hidden flex-1 ${selected ? 'max-w-[60%]' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Mã phiếu</th>
                  <th className="table-th">Từ kho</th>
                  <th className="table-th text-center">Đến kho</th>
                  <th className="table-th text-center">Số SKU</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th">Ngày yêu cầu</th>
                  <th className="table-th text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(t => (
                  <tr key={t.id} className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedId === t.id ? 'bg-primary-50/30 border-l-2 border-l-primary-500' : ''}`}
                    onClick={() => setSelectedId(t.id === selectedId ? null : t.id)}>
                    <td className="table-td">
                      <span className="font-mono text-xs font-bold text-primary-600">{t.id}</span>
                    </td>
                    <td className="table-td text-xs font-medium text-gray-800">{shopName(t.fromShopId)}</td>
                    <td className="table-td text-xs font-medium text-gray-800">{shopName(t.toShopId)}</td>
                    <td className="table-td text-center text-sm font-bold text-gray-700">{t.items.length}</td>
                    <td className="table-td">
                      <span className={STATUS_COLORS[t.status]}>{STATUS_LABELS[t.status]}</span>
                    </td>
                    <td className="table-td text-xs text-gray-400">{t.requestedAt.split(' ')[0]}</td>
                    <td className="table-td text-center">
                      <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                        {t.status === 'pending' && !isShopHead && (
                          <>
                            <button onClick={() => approveTransfer(t.id)} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Duyệt">
                              <CheckCircle size={15} />
                            </button>
                            <button onClick={() => { setRejectingTransferId(t.id); setIsRejectModalOpen(true); setRejectReasonText(''); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Từ chối">
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        {t.status === 'approved' && !isShopHead && (
                          <button onClick={() => updateStatus(t.id, 'shipped')} className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                            Xuất kho
                          </button>
                        )}
                        {t.status === 'shipped' && (isShopHead ? t.toShopId === myShopId : true) && (
                          <button onClick={() => updateStatus(t.id, 'received')} className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                            Nhận hàng
                          </button>
                        )}
                        <button onClick={() => setSelectedId(t.id)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm">Không có phiếu chuyển kho nào</div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-[40%] card p-5 space-y-4 animate-slideIn sticky top-4 self-start">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">{selected.id}</h3>
              <div className="flex items-center gap-2">
                <Link to={`${prefix}/transfers/${selected.id}`} className="text-xs text-primary-600 hover:underline font-semibold" title="Xem trang chi tiết đầy đủ">Chi tiết →</Link>
                <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 text-lg font-bold ml-1">×</button>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {/* Route Display */}
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <div className="flex items-center justify-between gap-2 text-center">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Nguồn</span>
                    <span className="font-semibold text-xs text-gray-800">{shopName(selected.fromShopId)}</span>
                  </div>
                  <ArrowRight size={14} className="text-primary-500" />
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Đích</span>
                    <span className="font-semibold text-xs text-gray-800">{shopName(selected.toShopId)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Trạng thái</div>
                  <span className={STATUS_COLORS[selected.status]}>{STATUS_LABELS[selected.status]}</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Ngày yêu cầu</div>
                  <div className="font-medium">{selected.requestedAt}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Người yêu cầu</div>
                  <div className="font-medium">{selected.requestedBy}</div>
                </div>
                {selected.approvedBy && (
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Người duyệt</div>
                    <div className="font-medium">{selected.approvedBy}</div>
                  </div>
                )}
              </div>

              {selected.rejectReason && (
                <div className="bg-rose-50 border border-rose-250/30 rounded-xl p-3 text-xs text-rose-800">
                  <strong>Lý do từ chối:</strong> {selected.rejectReason}
                </div>
              )}

              {selected.note && (
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">📋 {selected.note}</div>
              )}

              <div>
                <div className="text-xs font-bold text-gray-800 mb-2">Hàng hóa cần chuyển ({selected.items.length} SKU)</div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selected.items.map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-2.5 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-gray-900">{item.productName}</div>
                        <div className="text-[9px] text-gray-400 font-mono mt-0.5">
                          {item.skuCode}
                          {item.batchNumber && <span className="text-indigo-600 font-bold ml-2">Lô: {item.batchNumber}</span>}
                        </div>
                      </div>
                      
                      {selected.status === 'pending' && !isShopHead ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400">SL duyệt:</span>
                          <input
                            type="number"
                            min={1}
                            className="form-input text-xs py-0.5 px-1.5 w-16 text-center font-bold"
                            value={editedQuantities[item.skuId] ?? item.quantity}
                            onChange={e => setEditedQuantities(prev => ({ ...prev, [item.skuId]: Math.max(1, parseInt(e.target.value) || 1) }))}
                          />
                        </div>
                      ) : (
                        <span className="font-bold text-sm bg-white border px-2 py-0.5 rounded shadow-sm text-gray-700">×{item.quantity}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions inside Detail Panel */}
              {selected.status === 'pending' && !isShopHead && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => approveTransfer(selected.id)} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5">
                    <CheckCircle size={13} /> Duyệt
                  </button>
                  <button onClick={() => { setRejectingTransferId(selected.id); setIsRejectModalOpen(true); setRejectReasonText(''); }} className="py-2 px-3 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1">
                    <XCircle size={13} /> Từ chối
                  </button>
                </div>
              )}
              {selected.status === 'approved' && !isShopHead && (
                <button onClick={() => updateStatus(selected.id, 'shipped')} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md">
                  <Truck size={13} /> Xuất kho (Tạo phiếu xuất)
                </button>
              )}
              {selected.status === 'shipped' && (isShopHead ? selected.toShopId === myShopId : true) && (
                <button onClick={() => updateStatus(selected.id, 'received')} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5">
                  <CheckCircle size={13} /> Xác nhận Đã nhận hàng
                </button>
              )}
              {(selected.status === 'shipped' || selected.status === 'completed' || selected.status === 'received' || selected.status === 'partially_received') && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex items-center justify-between mt-2 font-bold">
                  <span>📄 Đã liên kết phiếu xuất kho</span>
                  <Link to={`${prefix}/issues`} className="underline font-bold text-blue-900">Xem phiếu xuất →</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 border border-gray-100 animate-scaleUp">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              ⚠️ Từ chối yêu cầu chuyển kho
            </h3>
            <p className="text-xs text-gray-500">
              Vui lòng nhập lý do từ chối yêu cầu cấp hàng này.
            </p>
            <textarea
              className="form-input text-xs py-2 px-3 rounded-xl min-h-24 resize-none w-full"
              placeholder="Nhập lý do từ chối..."
              value={rejectReasonText}
              onChange={e => setRejectReasonText(e.target.value)}
            />
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => { setIsRejectModalOpen(false); setRejectReasonText(''); setRejectingTransferId(null); }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitRejectTransfer}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Xác nhận Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
