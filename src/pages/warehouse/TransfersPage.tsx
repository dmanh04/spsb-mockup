import { useState } from 'react'
import { Plus, Check, X, Truck, ArrowRight } from 'lucide-react'
import { TRANSFER_MOCK_LIST } from '@/data/transferMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import type { StockTransfer, TransferStatus } from '@/types'

const STATUS_LABELS: Record<TransferStatus, string> = {
  pending: 'Chờ duyệt', approved: 'Đã duyệt', shipped: 'Đang vận chuyển',
  received: 'Đã nhận', rejected: 'Từ chối',
}
const STATUS_COLORS: Record<TransferStatus, string> = {
  pending: 'badge-orange', approved: 'badge-blue', shipped: 'badge-blue',
  received: 'badge-green', rejected: 'badge-red',
}

function shopName(id: string | 'warehouse') {
  if (id === 'warehouse') return 'Kho trung tâm'
  return SHOP_MOCK_LIST.find(s => s.id === id)?.name.replace('PetCare ', '') ?? id
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState(TRANSFER_MOCK_LIST)
  const [filter, setFilter] = useState<TransferStatus | 'all'>('all')

  const filtered = filter === 'all' ? transfers : transfers.filter(t => t.status === filter)
  const pendingCount = transfers.filter(t => t.status === 'pending').length

  function updateStatus(id: string, newStatus: TransferStatus) {
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, approvedBy: 'Bùi Văn Khánh' } : t))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Phiếu chuyển kho</h1>
          {pendingCount > 0 && <p className="text-sm text-orange-600">{pendingCount} phiếu đang chờ duyệt</p>}
        </div>
        <button className="btn-primary"><Plus size={15} /> Tạo phiếu mới</button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {(['all', 'pending', 'approved', 'received', 'rejected'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {s === 'all' ? 'Tất cả' : STATUS_LABELS[s]}
            {s === 'pending' && pendingCount > 0 && <span className="ml-1 badge-orange text-[10px]">{pendingCount}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(t => (
          <div key={t.id} className={`card p-4 ${t.status === 'pending' ? 'border-orange-200' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-primary-600">{t.id}</span>
                  <span className={STATUS_COLORS[t.status]}>{STATUS_LABELS[t.status]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-medium">{shopName(t.fromShopId)}</span>
                  <ArrowRight size={14} className="text-gray-400" />
                  <span className="font-medium">{shopName(t.toShopId)}</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {t.requestedAt} · Yêu cầu bởi: {t.requestedBy}
                  {t.approvedBy && ` · Duyệt bởi: ${t.approvedBy}`}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
              {t.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-900">{item.productName}</span>
                    <span className="text-gray-400 ml-2 text-xs font-mono">{item.skuCode}</span>
                  </div>
                  <span className="font-bold text-gray-900">×{item.quantity}</span>
                </div>
              ))}
            </div>

            {t.note && <p className="text-xs text-gray-500 italic mb-3">📋 {t.note}</p>}

            {/* Actions */}
            {t.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => updateStatus(t.id, 'approved')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100">
                  <Check size={14} /> Duyệt phiếu
                </button>
                <button onClick={() => updateStatus(t.id, 'rejected')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100">
                  <X size={14} /> Từ chối
                </button>
              </div>
            )}
            {t.status === 'approved' && (
              <button onClick={() => updateStatus(t.id, 'shipped')}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100">
                <Truck size={14} /> Đánh dấu Đã giao
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">Không có phiếu chuyển kho</div>
        )}
      </div>
    </div>
  )
}
