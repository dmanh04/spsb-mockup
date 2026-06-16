import { useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, X, Truck, Package, CheckCircle, XCircle } from 'lucide-react'
import { TRANSFER_MOCK_LIST, saveTransfers } from '@/data/transferMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { INVENTORY_ITEMS, INVENTORY_TRANSACTIONS, saveInventory } from '@/data/inventoryMockData'
import type { StockTransfer, TransferStatus } from '@/types'

function shopName(id: string) {
  if (id === 'warehouse') return 'Kho trung tâm'
  return SHOP_MOCK_LIST.find(s => s.id === id)?.name ?? id
}

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

export default function TransferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const prefix = location.pathname.startsWith('/admin') ? '/admin/inventory' : '/warehouse'

  const [transfers, setTransfers] = useState(TRANSFER_MOCK_LIST)
  const transfer = transfers.find(t => t.id === id)

  function updateStatus(newStatus: TransferStatus) {
    if (!transfer) return
    const next = transfers.map(t => {
      if (t.id !== transfer.id) return t
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

  if (!transfer) return (
    <div className="text-center py-20 card max-w-md mx-auto mt-12">
      <div className="text-4xl mb-3">⚠️</div>
      <h3 className="text-base font-bold text-gray-900 mb-4">Không tìm thấy phiếu chuyển kho</h3>
      <Link to={`${prefix}/transfers`} className="btn-secondary inline-flex">← Quay lại danh sách</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">
      <div className="flex items-center gap-3">
        <Link to={`${prefix}/transfers`} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
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
            <div className="text-xs text-gray-400">Kho nguồn</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-1">
              {transfer.status === 'shipped' || transfer.status === 'received'
                ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-primary-400 rounded-full" />)
                : Array.from({ length: 5 }).map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-gray-200 rounded-full" />)
              }
            </div>
            <Truck size={18} className={transfer.status === 'shipped' ? 'text-primary-500 animate-pulse' : 'text-gray-300'} />
          </div>
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Package size={20} className="text-blue-500" />
            </div>
            <div className="font-semibold text-gray-900">{shopName(transfer.toShopId)}</div>
            <div className="text-xs text-gray-400">Kho đích</div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card overflow-hidden">
        <div className="card-header bg-gray-50 border-b py-3 px-4">
          <h3 className="text-sm font-semibold text-gray-900">Chi tiết hàng hóa ({transfer.items.length} loại)</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th py-2.5">Sản phẩm</th>
              <th className="table-th py-2.5">Mã SKU</th>
              <th className="table-th py-2.5 text-right">Số lượng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transfer.items.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50/50">
                <td className="table-td py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                <td className="table-td py-3 font-mono text-xs text-gray-400">
                  {item.skuCode}
                  {item.batchNumber && <span className="text-indigo-650 font-bold ml-3">Lô: {item.batchNumber}</span>}
                </td>
                <td className="table-td py-3 text-right font-bold text-gray-900">{item.quantity}</td>
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
            <div className="text-[10px] uppercase font-bold text-gray-400">Yêu cầu bởi</div>
            <div className="font-medium text-gray-800">{transfer.requestedBy}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Ngày yêu cầu</div>
            <div className="font-medium text-gray-800">{transfer.requestedAt}</div>
          </div>
          {transfer.approvedBy && (
            <div className="col-span-2">
              <div className="text-[10px] uppercase font-bold text-gray-400">Duyệt bởi</div>
              <div className="font-medium text-gray-800">{transfer.approvedBy}</div>
            </div>
          )}
        </div>
        {transfer.note && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600">📋 {transfer.note}</div>
        )}
      </div>

      {/* Actions */}
      {transfer.status === 'pending' && (
        <div className="flex gap-3 pt-2">
          <button onClick={() => updateStatus('approved')} className="flex-1 btn-primary justify-center py-2.5 bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle size={16} /> Duyệt phiếu chuyển
          </button>
          <button onClick={() => updateStatus('rejected')} className="btn-secondary px-6 border-red-200 text-red-600 hover:bg-red-50">
            <XCircle size={16} /> Từ chối
          </button>
        </div>
      )}
      {transfer.status === 'approved' && (
        <button onClick={() => updateStatus('shipped')} className="w-full btn-primary justify-center py-2.5 bg-blue-600 hover:bg-blue-700">
          <Truck size={16} /> Đánh dấu Đang vận chuyển
        </button>
      )}
      {transfer.status === 'shipped' && (
        <button onClick={() => updateStatus('received')} className="w-full btn-primary justify-center py-2.5 bg-emerald-600 hover:bg-emerald-700">
          <CheckCircle size={16} /> Xác nhận Đã nhận hàng
        </button>
      )}
    </div>
  )
}
