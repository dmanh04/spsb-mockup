import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, X, Truck, Package } from 'lucide-react'
import { TRANSFER_MOCK_LIST } from '@/data/transferMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'

function shopName(id: string) {
  if (id === 'warehouse') return 'Kho trung tâm'
  return SHOP_MOCK_LIST.find(s => s.id === id)?.name ?? id
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ duyệt', approved: 'Đã duyệt', shipped: 'Đang vận chuyển', received: 'Đã nhận', rejected: 'Từ chối',
}
const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-orange', approved: 'badge-blue', shipped: 'badge-blue', received: 'badge-green', rejected: 'badge-red',
}

export default function TransferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const transfer = TRANSFER_MOCK_LIST.find(t => t.id === id) ?? TRANSFER_MOCK_LIST[0]

  if (!transfer) return (
    <div className="text-center py-20">
      <Link to="/warehouse/transfers" className="btn-secondary inline-flex">← Quay lại</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/warehouse/transfers" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Phiếu chuyển kho {transfer.id}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={STATUS_COLORS[transfer.status]}>{STATUS_LABELS[transfer.status]}</span>
            <span className="text-xs text-gray-400">{transfer.requestedAt}</span>
          </div>
        </div>
      </div>

      {/* Route */}
      <div className="card p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Package size={20} className="text-orange-500" />
            </div>
            <div className="font-semibold text-gray-900">{shopName(transfer.fromShopId)}</div>
            <div className="text-xs text-gray-400">Nguồn</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-1">
              {transfer.status === 'shipped' || transfer.status === 'received'
                ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="w-2 h-2 bg-primary-400 rounded-full" />)
                : Array.from({ length: 5 }).map((_, i) => <div key={i} className="w-2 h-2 bg-gray-200 rounded-full" />)
              }
            </div>
            <Truck size={16} className={transfer.status === 'shipped' ? 'text-primary-500' : 'text-gray-300'} />
          </div>
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Package size={20} className="text-blue-500" />
            </div>
            <div className="font-semibold text-gray-900">{shopName(transfer.toShopId)}</div>
            <div className="text-xs text-gray-400">Đích</div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-900">Hàng hóa ({transfer.items.length} loại)</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th">Sản phẩm</th>
              <th className="table-th">Mã SKU</th>
              <th className="table-th text-right">Số lượng</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transfer.items.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="table-td text-sm font-medium">{item.productName}</td>
                <td className="table-td font-mono text-xs text-gray-400">{item.skuCode}</td>
                <td className="table-td text-right font-bold">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Thông tin phiếu</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-400">Yêu cầu bởi</div>
            <div className="font-medium">{transfer.requestedBy}</div>
          </div>
          {transfer.approvedBy && (
            <div>
              <div className="text-xs text-gray-400">Duyệt bởi</div>
              <div className="font-medium">{transfer.approvedBy}</div>
            </div>
          )}
          <div>
            <div className="text-xs text-gray-400">Ngày tạo</div>
            <div className="font-medium">{transfer.requestedAt}</div>
          </div>
        </div>
        {transfer.note && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">📋 {transfer.note}</div>
        )}
      </div>

      {/* Actions */}
      {transfer.status === 'pending' && (
        <div className="flex gap-3">
          <button className="flex-1 btn-primary justify-center py-3 bg-green-500 hover:bg-green-600">
            <Check size={15} /> Duyệt phiếu
          </button>
          <button className="btn-secondary px-6">
            <X size={15} /> Từ chối
          </button>
        </div>
      )}
      {transfer.status === 'approved' && (
        <button className="w-full btn-primary justify-center py-3 bg-blue-500 hover:bg-blue-600">
          <Truck size={15} /> Đánh dấu Đã xuất hàng
        </button>
      )}
      {transfer.status === 'shipped' && (
        <button className="w-full btn-primary justify-center py-3 bg-green-500 hover:bg-green-600">
          <Check size={15} /> Xác nhận Đã nhận hàng
        </button>
      )}
    </div>
  )
}
