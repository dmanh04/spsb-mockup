import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Plus, Check, X, Truck, ArrowRight, Search, Eye, CheckCircle, XCircle, FileText, AlertTriangle } from 'lucide-react'
import { TRANSFER_MOCK_LIST, saveTransfers } from '@/data/transferMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { INVENTORY_ITEMS, INVENTORY_TRANSACTIONS, saveInventory } from '@/data/inventoryMockData'
import type { StockTransfer, TransferStatus } from '@/types'

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
  const location = useLocation()
  const navigate = useNavigate()
  const prefix = location.pathname.startsWith('/admin') ? '/admin/inventory' : '/warehouse'

  const [transfers, setTransfers] = useState(TRANSFER_MOCK_LIST)
  const [filter, setFilter] = useState<TransferStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = transfers
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

  const pendingCount = transfers.filter(t => t.status === 'pending').length
  const selected = selectedId ? transfers.find(t => t.id === selectedId) : null

  function updateStatus(id: string, newStatus: TransferStatus) {
    const transfer = transfers.find(t => t.id === id)
    if (!transfer) return

    const next = transfers.map(t => {
      if (t.id !== id) return t
      const updated: StockTransfer = { ...t, status: newStatus }
      if (newStatus === 'approved') {
        updated.approvedBy = 'Bùi Văn Khánh'
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
          note: `Xuất chuyển kho đến ${shopName(transfer.toShopId)} (Phiếu: ${transfer.id})`,
          createdBy: 'Bùi Văn Khánh',
          createdAt: todayStr,
          transferId: transfer.id
        })
      })
      saveInventory(updatedInventory, updatedTx)
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
          createdBy: 'Bùi Văn Khánh',
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
                        {t.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(t.id, 'approved')} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Duyệt">
                              <CheckCircle size={15} />
                            </button>
                            <button onClick={() => updateStatus(t.id, 'rejected')} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Từ chối">
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        {t.status === 'approved' && (
                          <button onClick={() => updateStatus(t.id, 'shipped')} className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                            Xuất kho
                          </button>
                        )}
                        {t.status === 'shipped' && (
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
                        <div className="text-[9px] text-gray-400 font-mono mt-0.5">{item.skuCode}</div>
                      </div>
                      <span className="font-bold text-sm bg-white border px-2 py-0.5 rounded shadow-sm text-gray-700">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions inside Detail Panel */}
              {selected.status === 'pending' && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => updateStatus(selected.id, 'approved')} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5">
                    <CheckCircle size={13} /> Duyệt
                  </button>
                  <button onClick={() => updateStatus(selected.id, 'rejected')} className="py-2 px-3 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1">
                    <XCircle size={13} /> Từ chối
                  </button>
                </div>
              )}
              {selected.status === 'approved' && (
                <button onClick={() => updateStatus(selected.id, 'shipped')} className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5">
                  <Truck size={13} /> Đánh dấu Đang vận chuyển
                </button>
              )}
              {selected.status === 'shipped' && (
                <button onClick={() => updateStatus(selected.id, 'received')} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5">
                  <CheckCircle size={13} /> Xác nhận Đã nhận hàng
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
