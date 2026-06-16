import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  Plus, Search, Eye, CheckCircle, XCircle, Edit, Trash2, 
  ArrowRight, ShieldCheck, Calendar, Info, FileText, Check, X, AlertTriangle 
} from 'lucide-react'
import { 
  PURCHASE_ORDER_LIST, savePurchaseOrders, Supplier, PurchaseOrder, PurchaseOrderItem 
} from '@/data/supplierMockData'
import { SUPPLIER_MOCK_LIST } from '@/data/supplierMockData'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { INVENTORY_ITEMS, INVENTORY_TRANSACTIONS, saveInventory } from '@/data/inventoryMockData'
import { STOCK_RECEIPTS, saveStockReceipts } from '@/data/stockReceiptMockData'
import { formatPrice } from '@/utils/format'
import { useAuthContext } from '@/auth/AuthContext'

const STATUS_MAP: Record<PurchaseOrder['status'], { label: string; badge: string }> = {
  draft: { label: 'Nháp', badge: 'badge-gray' },
  sent: { label: 'Chờ duyệt', badge: 'badge-orange' },
  confirmed: { label: 'Đã duyệt (Chờ giao)', badge: 'badge-blue' },
  received: { label: 'Đã nhận hàng', badge: 'badge-green' },
  cancelled: { label: 'Đã hủy', badge: 'badge-red' },
}

export default function ReplenishmentsPage() {
  const { currentUser } = useAuthContext()
  const role = currentUser?.role ?? 'warehouse_manager'
  const location = useLocation()
  const navigate = useNavigate()

  const prefix = location.pathname.startsWith('/admin') ? '/admin/inventory' : '/warehouse'
  const isAdmin = role === 'admin'

  const [orders, setOrders] = useState<PurchaseOrder[]>(() => PURCHASE_ORDER_LIST)
  const [filterStatus, setFilterStatus] = useState<PurchaseOrder['status'] | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)
  
  const [formSupplierId, setFormSupplierId] = useState('')
  const [formExpectedDelivery, setFormExpectedDelivery] = useState('')
  const [formNote, setFormNote] = useState('')
  const [formItems, setFormItems] = useState<PurchaseOrderItem[]>([])
  
  // Selection drawer states
  const [showItemPicker, setShowItemPicker] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')

  // Receive fulfillment Modal state
  const [receivingOrder, setReceivingOrder] = useState<PurchaseOrder | null>(null)
  const [receivingItems, setReceivingItems] = useState<{
    skuId: string
    skuCode: string
    productName: string
    orderedQty: number
    receivedQty: number
    unitCost: number
    batchNumber: string
    expiryDate: string
  }[]>([])

  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // Load all SKU options from Catalog
  const catalogSKUs = PRODUCT_MOCK_LIST.flatMap(p =>
    p.skus.map(sku => ({
      skuId: sku.id,
      skuCode: sku.sku,
      productName: p.name,
      variantName: Object.values(sku.attributes).join(' / '),
      fullName: `${p.name} — ${Object.values(sku.attributes).join('/')}`,
      price: sku.price,
    }))
  )

  const activeSuppliers = SUPPLIER_MOCK_LIST.filter(s => s.status === 'active')
  const selected = selectedId ? orders.find(o => o.id === selectedId) : null
  const filtered = orders
    .filter(o => filterStatus === 'all' || o.status === filterStatus)
    .filter(o => {
      const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                          o.supplierName.toLowerCase().includes(search.toLowerCase())
      return matchSearch
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const pendingCount = orders.filter(o => o.status === 'sent').length

  // --- Purchase Order Handlers ---

  function openCreateOrder() {
    setEditingOrder(null)
    setFormSupplierId('')
    setFormExpectedDelivery(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)) // 5 days out
    setFormNote('')
    setFormItems([])
    setIsFormOpen(true)
  }

  function openEditOrder(order: PurchaseOrder) {
    setEditingOrder(order)
    setFormSupplierId(order.supplierId)
    setFormExpectedDelivery(order.expectedDelivery)
    setFormNote(order.note || '')
    setFormItems([...order.items])
    setIsFormOpen(true)
  }

  function addSkuToForm(skuId: string) {
    const matched = catalogSKUs.find(s => s.skuId === skuId)
    if (!matched) return

    // Avoid duplicate
    if (formItems.some(i => i.skuId === skuId)) {
      setError('Sản phẩm đã có trong danh sách')
      setTimeout(() => setError(''), 3000)
      return
    }

    const newItem: PurchaseOrderItem = {
      skuId: matched.skuId,
      skuCode: matched.skuCode,
      productName: `${matched.productName} (${matched.variantName})`,
      qty: 10,
      unitPrice: Math.round(matched.price * 0.65) // Default cost is 65% of MSRP
    }

    setFormItems([...formItems, newItem])
    setShowItemPicker(false)
  }

  function updateFormItem(idx: number, field: keyof PurchaseOrderItem, value: any) {
    setFormItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      return { ...item, [field]: value }
    }))
  }

  function removeFormItem(idx: number) {
    setFormItems(prev => prev.filter((_, i) => i !== idx))
  }

  function saveOrder(submitForApproval: boolean) {
    if (!formSupplierId) {
      setError('Vui lòng chọn Nhà cung cấp')
      return
    }
    if (formItems.length === 0) {
      setError('Vui lòng thêm ít nhất 1 sản phẩm')
      return
    }
    if (formItems.some(i => i.qty <= 0 || i.unitPrice < 0)) {
      setError('Số lượng hoặc giá nhập không hợp lệ')
      return
    }

    const supplier = SUPPLIER_MOCK_LIST.find(s => s.id === formSupplierId)
    const supplierName = supplier ? supplier.name : 'Nhà cung cấp'
    const total = formItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
    const today = new Date().toISOString().slice(0, 10)

    let nextOrders = [...orders]

    if (editingOrder) {
      nextOrders = orders.map(o => {
        if (o.id !== editingOrder.id) return o
        return {
          ...o,
          supplierId: formSupplierId,
          supplierName,
          items: formItems,
          total,
          expectedDelivery: formExpectedDelivery,
          note: formNote,
          status: submitForApproval ? 'sent' : o.status
        }
      })
      showToast(submitForApproval ? 'Đã gửi duyệt yêu cầu bổ sung hàng!' : 'Đã lưu tạm đơn nhập hàng.')
    } else {
      const orderId = `PO-${today.replace(/-/g, '')}-${String(orders.length + 1).padStart(3, '0')}`
      const newPO: PurchaseOrder = {
        id: orderId,
        supplierId: formSupplierId,
        supplierName,
        items: formItems,
        total,
        status: submitForApproval ? 'sent' : 'draft',
        createdAt: today,
        expectedDelivery: formExpectedDelivery,
        note: formNote
      }
      nextOrders = [newPO, ...orders]
      showToast(submitForApproval ? 'Đã tạo và gửi duyệt đơn bổ sung hàng!' : 'Đã tạo nháp đơn bổ sung hàng.')
    }

    setOrders(nextOrders)
    savePurchaseOrders(nextOrders)
    setIsFormOpen(false)
    if (selectedId && editingOrder && selectedId === editingOrder.id) {
      setSelectedId(null)
    }
  }

  function deleteOrder(id: string) {
    if (confirm('Bạn có chắc chắn muốn xóa đơn nháp này?')) {
      const next = orders.filter(o => o.id !== id)
      setOrders(next)
      savePurchaseOrders(next)
      showToast('Đã xóa đơn nháp.')
      setSelectedId(null)
    }
  }

  // --- Admin Approval Handlers ---

  function approveOrder(id: string) {
    const next = orders.map(o => {
      if (o.id !== id) return o
      return { ...o, status: 'confirmed' as const }
    })
    setOrders(next)
    savePurchaseOrders(next)
    showToast('Đã phê duyệt đơn bổ sung hàng. Trạng thái: Chờ giao hàng.')
  }

  function rejectOrder(id: string) {
    const next = orders.map(o => {
      if (o.id !== id) return o
      return { ...o, status: 'cancelled' as const }
    })
    setOrders(next)
    savePurchaseOrders(next)
    showToast('Đã từ chối đơn bổ sung hàng.')
  }

  // --- Fulfillment Handlers (Receiving PO into Warehouse) ---

  function startReceiving(order: PurchaseOrder) {
    setReceivingOrder(order)
    const today = new Date()
    const expiry = new Date()
    expiry.setFullYear(today.getFullYear() + 2)
    const expiryStr = expiry.toISOString().slice(0, 10)

    const itemsMapped = order.items.map((item, idx) => {
      const lotSuffix = String(idx + 1).padStart(2, '0')
      const batchNo = `LOT-${today.toISOString().slice(2, 10).replace(/-/g, '')}-${lotSuffix}`
      return {
        skuId: item.skuId,
        skuCode: item.skuCode,
        productName: item.productName,
        orderedQty: item.qty,
        receivedQty: item.qty,
        unitCost: item.unitPrice,
        batchNumber: batchNo,
        expiryDate: expiryStr
      }
    })
    setReceivingItems(itemsMapped)
  }

  function confirmReceiveFulfillment() {
    if (!receivingOrder) return

    const todayStr = new Date().toISOString().slice(0, 10)
    const grnId = `GRN-${todayStr.replace(/-/g, '')}-${String(STOCK_RECEIPTS.length + 1).padStart(3, '0')}`

    // 1. Update purchase order status to received
    const nextOrders = orders.map(o => {
      if (o.id !== receivingOrder.id) return o
      return { ...o, status: 'received' as const }
    })
    setOrders(nextOrders)
    savePurchaseOrders(nextOrders)

    // 2. Create a StockReceipt (GRN) automatically
    const totalValue = receivingItems.reduce((sum, item) => sum + item.receivedQty * item.unitCost, 0)
    const receiptItems = receivingItems.map(item => ({
      skuId: item.skuId,
      skuCode: item.skuCode,
      productName: item.productName,
      orderedQty: item.orderedQty,
      receivedQty: item.receivedQty,
      unitCost: item.unitCost,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate
    }))

    const newReceipt = {
      id: grnId,
      supplierId: receivingOrder.supplierId,
      supplierName: receivingOrder.supplierName,
      warehouseId: 'warehouse',
      poReference: receivingOrder.id,
      inboundType: 'supplier' as const,
      items: receiptItems,
      totalValue,
      status: 'completed' as const,
      createdBy: currentUser?.fullName ?? 'Warehouse Manager',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      approvedBy: 'System Auto',
      approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      note: `Tự động tạo từ việc nghiệm thu đơn hàng bổ sung ${receivingOrder.id}`
    }

    const nextReceipts = [newReceipt, ...STOCK_RECEIPTS]
    saveStockReceipts(nextReceipts)

    // 3. Update inventory levels & log transactions
    const updatedInventory = [...INVENTORY_ITEMS]
    const updatedTx = [...INVENTORY_TRANSACTIONS]

    receivingItems.forEach(item => {
      const invIdx = updatedInventory.findIndex(
        inv => inv.skuId === item.skuId && inv.shopId === 'warehouse'
      )

      if (invIdx > -1) {
        updatedInventory[invIdx] = {
          ...updatedInventory[invIdx],
          quantity: updatedInventory[invIdx].quantity + item.receivedQty,
          lastUpdated: todayStr
        }
      } else {
        updatedInventory.push({
          skuId: item.skuId,
          skuCode: item.skuCode,
          productName: item.productName,
          shopId: 'warehouse',
          quantity: item.receivedQty,
          minStock: 10,
          lastUpdated: todayStr
        })
      }

      updatedTx.unshift({
        id: `TX-IN${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'stock_in',
        skuId: item.skuId,
        skuCode: item.skuCode,
        productName: item.productName,
        shopId: 'warehouse',
        quantity: item.receivedQty,
        note: `Nhập kho PO nghiệm thu ${receivingOrder.id} - Lô: ${item.batchNumber}`,
        createdBy: currentUser?.fullName ?? 'Warehouse Manager',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        receiptId: grnId
      })
    })

    saveInventory(updatedInventory, updatedTx)

    // Update local state
    setReceivingOrder(null)
    setReceivingItems([])
    showToast(`Đã nhận hàng thành công. Đã tạo phiếu nhập kho ${grnId} & tăng tồn kho trung tâm.`)
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="font-semibold text-sm">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Đơn Bổ Sung Hàng & Nhập Mua (PO)</h1>
          <p className="text-sm text-gray-500">
            Quản lý quy trình đặt mua hàng từ nhà cung cấp bổ sung cho Kho trung tâm
          </p>
        </div>
        <button onClick={openCreateOrder} className="btn-primary">
          <Plus size={15} /> Tạo đơn đặt hàng (PO)
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {(['all', 'draft', 'sent', 'confirmed', 'received', 'cancelled'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterStatus === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {s === 'all' ? 'Tất cả' : STATUS_MAP[s].label}
              {s === 'sent' && pendingCount > 0 && <span className="ml-1 badge-orange text-[10px]">{pendingCount}</span>}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9 text-sm" placeholder="Tìm theo mã đơn, NCC..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-5">
        {/* Table View */}
        <div className={`card overflow-hidden flex-1 ${selected ? 'max-w-[60%]' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Mã đơn PO</th>
                  <th className="table-th">Nhà cung cấp</th>
                  <th className="table-th text-center">Số SKU</th>
                  <th className="table-th text-right">Tổng giá trị</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th">Ngày tạo</th>
                  <th className="table-th text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(o => (
                  <tr key={o.id} className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedId === o.id ? 'bg-primary-50/30 border-l-2 border-l-primary-500' : ''}`}
                    onClick={() => setSelectedId(o.id === selectedId ? null : o.id)}>
                    <td className="table-td font-mono text-xs font-bold text-primary-600">{o.id}</td>
                    <td className="table-td text-xs font-medium text-gray-800">{o.supplierName}</td>
                    <td className="table-td text-center text-sm font-bold text-gray-700">{o.items.length}</td>
                    <td className="table-td text-right text-sm font-bold text-gray-900">{formatPrice(o.total)}</td>
                    <td className="table-td">
                      <span className={STATUS_MAP[o.status].badge}>{STATUS_MAP[o.status].label}</span>
                    </td>
                    <td className="table-td text-xs text-gray-400">{o.createdAt}</td>
                    <td className="table-td text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        {o.status === 'draft' && (
                          <>
                            <button onClick={() => openEditOrder(o)} className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded" title="Chỉnh sửa">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => deleteOrder(o.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded" title="Xóa">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        {o.status === 'sent' && isAdmin && (
                          <>
                            <button onClick={() => approveOrder(o.id)} className="p-1 text-green-500 hover:bg-green-50 rounded" title="Duyệt đơn">
                              <CheckCircle size={14} />
                            </button>
                            <button onClick={() => rejectOrder(o.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Từ chối">
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        {o.status === 'confirmed' && (
                          <button onClick={() => startReceiving(o)} className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100">
                            Nhận hàng
                          </button>
                        )}
                        <button onClick={() => setSelectedId(o.id)} className="p-1 text-gray-400 hover:bg-gray-50 rounded">
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm">Không tìm thấy đơn đặt hàng nào</div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-[40%] card p-5 space-y-4 animate-slideIn sticky top-4 self-start">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-bold text-gray-900">{selected.id}</h3>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-655 text-lg font-bold">×</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 border rounded-2xl p-3.5">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Trạng thái</div>
                  <span className={STATUS_MAP[selected.status].badge}>{STATUS_MAP[selected.status].label}</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Ngày tạo đơn</div>
                  <div className="font-semibold text-gray-800">{selected.createdAt}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Giao hàng dự kiến</div>
                  <div className="font-semibold text-gray-850 flex items-center gap-1">
                    <Calendar size={11} className="text-gray-400" />
                    {selected.expectedDelivery}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Nhà cung cấp</div>
                  <div className="font-bold text-indigo-650 truncate">{selected.supplierName}</div>
                </div>
              </div>

              {selected.note && (
                <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-3 text-gray-700 italic">
                  📋 Ghi chú đơn: {selected.note}
                </div>
              )}

              <div>
                <h4 className="font-black text-gray-800 uppercase tracking-wide mb-2">Sản phẩm đặt mua ({selected.items.length} SKU)</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selected.items.map((item, i) => (
                    <div key={i} className="bg-slate-50 border rounded-xl p-2.5 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-800">{item.productName}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.skuCode}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-gray-800">×{item.qty}</div>
                        <div className="text-[10px] text-gray-400">{formatPrice(item.unitPrice)}/sp</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 flex justify-between items-center text-sm font-bold">
                <span className="text-gray-500">Tổng giá trị dự tính</span>
                <span className="text-base font-black text-indigo-700">{formatPrice(selected.total)}</span>
              </div>

              {/* Actions based on state */}
              {selected.status === 'draft' && (
                <div className="flex gap-2 pt-2 border-t">
                  <button onClick={() => openEditOrder(selected)} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-center flex items-center justify-center gap-1 shadow-md shadow-indigo-100">
                    <Edit size={13} /> Sửa nháp
                  </button>
                  <button onClick={() => {
                    const updated = orders.map(o => o.id === selected.id ? { ...o, status: 'sent' as const } : o)
                    setOrders(updated)
                    savePurchaseOrders(updated)
                    showToast('Đã gửi phê duyệt đơn PO.')
                  }} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-center flex items-center justify-center gap-1 shadow-md shadow-emerald-100">
                    <ShieldCheck size={13} /> Gửi phê duyệt
                  </button>
                </div>
              )}

              {selected.status === 'sent' && isAdmin && (
                <div className="flex gap-2 pt-2 border-t">
                  <button onClick={() => approveOrder(selected.id)} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-1 shadow-md shadow-emerald-100">
                    <Check size={13} /> Phê duyệt PO
                  </button>
                  <button onClick={() => rejectOrder(selected.id)} className="py-2 px-4 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 flex items-center justify-center gap-1">
                    <X size={13} /> Từ chối
                  </button>
                </div>
              )}

              {selected.status === 'confirmed' && (
                <button onClick={() => startReceiving(selected)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-center flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-100 mt-2">
                  📥 Nghiệm thu nhận hàng & Nhập kho
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL: CREATE / EDIT PURCHASE ORDER --- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl p-6 space-y-4 animate-scaleUp shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-gray-900 border-b pb-2 flex items-center justify-between">
              <span>{editingOrder ? `Chỉnh sửa Đơn đặt hàng ${editingOrder.id}` : 'Tạo mới Đơn đặt hàng PO'}</span>
              {error && <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded border border-red-200">{error}</span>}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="md:col-span-2 space-y-1">
                <label className="text-gray-700 font-bold">Chọn Nhà cung cấp (Hoạt động) <span className="text-red-500">*</span></label>
                <select className="form-input text-xs" value={formSupplierId} onChange={e => setFormSupplierId(e.target.value)}>
                  <option value="">-- Lựa chọn nhà cung cấp --</option>
                  {activeSuppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.contactPerson})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 font-bold">Ngày dự kiến giao hàng <span className="text-red-500">*</span></label>
                <input type="date" className="form-input text-xs" value={formExpectedDelivery} onChange={e => setFormExpectedDelivery(e.target.value)} />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-gray-700 font-bold">Ghi chú bổ sung</label>
                <input className="form-input text-xs" placeholder="VD: Nhập thêm lô hạt cho kho Bình Thạnh..." value={formNote} onChange={e => setFormNote(e.target.value)} />
              </div>
            </div>

            {/* Form Items List */}
            <div className="border rounded-2xl overflow-hidden mt-4 bg-gray-50/30">
              <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Danh sách sản phẩm nhập ({formItems.length})</span>
                <button type="button" onClick={() => setShowItemPicker(true)} className="px-3 py-1 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700">
                  + Thêm sản phẩm
                </button>
              </div>

              {formItems.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-xs font-bold">Chưa có sản phẩm nào được chọn</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-100/50 text-[10px] text-gray-500 uppercase border-b font-black">
                      <th className="py-2.5 px-3">Sản phẩm / Biến thể</th>
                      <th className="py-2.5 px-2 text-center w-24">Số lượng</th>
                      <th className="py-2.5 px-2 text-right w-36">Đơn giá nhập (VND)</th>
                      <th className="py-2.5 px-2 text-right w-36">Thành tiền</th>
                      <th className="py-2.5 px-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white font-semibold">
                    {formItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3">
                          <div className="text-gray-900 font-bold text-xs">{item.productName}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.skuCode}</div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <input 
                            type="number" 
                            min="1" 
                            className="form-input text-center py-1 px-1 text-xs w-16 mx-auto block font-bold" 
                            value={item.qty} 
                            onChange={e => updateFormItem(idx, 'qty', Math.max(1, parseInt(e.target.value) || 0))}
                          />
                        </td>
                        <td className="py-3 px-2 text-right">
                          <input 
                            type="number" 
                            min="0" 
                            className="form-input text-right py-1 px-2 text-xs w-28 ml-auto block font-bold text-indigo-700" 
                            value={item.unitPrice} 
                            onChange={e => updateFormItem(idx, 'unitPrice', Math.max(0, parseInt(e.target.value) || 0))}
                          />
                        </td>
                        <td className="py-3 px-2 text-right font-black text-gray-900">
                          {formatPrice(item.qty * item.unitPrice)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button type="button" onClick={() => removeFormItem(idx)} className="text-gray-300 hover:text-red-500">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 font-black">
                    <tr>
                      <td className="py-2.5 px-3" colSpan={3}>Tổng giá trị đơn hàng ước tính:</td>
                      <td className="py-2.5 px-2 text-right text-indigo-700 text-sm">
                        {formatPrice(formItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0))}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            <div className="flex gap-2.5 pt-4 border-t text-xs font-bold">
              <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary flex-1 justify-center py-2.5">
                Hủy bỏ
              </button>
              <button type="button" onClick={() => saveOrder(false)} className="px-5 py-2.5 border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-2xl flex-1 justify-center flex items-center">
                Lưu làm bản nháp
              </button>
              <button type="button" onClick={() => saveOrder(true)} className="btn-primary flex-1 justify-center py-2.5">
                Tạo & Gửi phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ITEM PICKER FOR ADDING TO ORDER --- */}
      {showItemPicker && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 animate-scaleUp shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-gray-900">Tìm kiếm & Chọn SKU mặt hàng</h3>
              <button type="button" onClick={() => setShowItemPicker(false)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">×</button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                className="form-input pl-9 text-xs" 
                placeholder="Gõ tên sản phẩm, mã SKU để tìm..."
                value={pickerSearch}
                onChange={e => setPickerSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {catalogSKUs
                .filter(sku => !pickerSearch || sku.fullName.toLowerCase().includes(pickerSearch.toLowerCase()) || sku.skuCode.toLowerCase().includes(pickerSearch.toLowerCase()))
                .map(sku => (
                  <button
                    key={sku.skuId}
                    type="button"
                    onClick={() => addSkuToForm(sku.skuId)}
                    className="w-full text-left bg-gray-50 border hover:bg-indigo-50/30 hover:border-indigo-200 p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-gray-800">{sku.productName} ({sku.variantName})</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{sku.skuCode}</div>
                    </div>
                    <span className="font-extrabold text-indigo-650 bg-white px-2 py-1 border rounded shadow-sm">
                      {formatPrice(sku.price)}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: RECEIVE & fulfilled PO INTO WAREHOUSE --- */}
      {receivingOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-base font-black text-gray-900">Nghiệm thu nhận hàng PO thực tế</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Đơn PO: <strong className="font-mono text-primary-650">{receivingOrder.id}</strong> · Nhà cung cấp: <strong>{receivingOrder.supplierName}</strong>
                </p>
              </div>
              <button type="button" onClick={() => { setReceivingOrder(null); setReceivingItems([]); }} className="text-gray-400 hover:text-gray-600 text-lg font-bold">×</button>
            </div>

            <div className="bg-indigo-50/40 border border-indigo-100 p-3 rounded-2xl flex gap-2 text-xs text-indigo-900 leading-normal mb-2">
              <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                Vui lòng nhập số lượng thực nhận, mã lô (batch number) và hạn sử dụng tương ứng cho mỗi SKU. Khi nhấn hoàn tất, hệ thống sẽ tự động tạo một phiếu nhập kho <strong>GRN</strong> tương ứng và cập nhật tồn kho trung tâm.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">Tên sản phẩm / SKU</th>
                    <th className="py-2.5 px-2 text-center w-20">SL Đặt</th>
                    <th className="py-2.5 px-2 text-center w-24">SL Thực Nhận</th>
                    <th className="py-2.5 px-2 w-36">Số Lô <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-2 w-36">Hạn sử dụng <span className="text-rose-500">*</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white font-semibold">
                  {receivingItems.map((item, idx) => {
                    const isMismatch = item.receivedQty !== item.orderedQty
                    return (
                      <tr key={idx} className={isMismatch ? 'bg-amber-50/10' : ''}>
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
                            className="form-input text-center text-xs py-1 px-1 border-gray-300 w-16 mx-auto block font-bold"
                            value={item.receivedQty}
                            onChange={e => {
                              const val = Math.max(0, parseInt(e.target.value) || 0)
                              setReceivingItems(prev => prev.map((itm, i) => i === idx ? { ...itm, receivedQty: val } : itm))
                            }}
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input 
                            type="text"
                            required
                            placeholder="Mã lô"
                            className="form-input text-xs font-mono py-1 px-2 border-gray-300 uppercase w-32"
                            value={item.batchNumber}
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
                            className="form-input text-xs py-1 px-2 border-gray-300 w-32 font-medium"
                            value={item.expiryDate}
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

            <div className="flex justify-end gap-2.5 pt-3 border-t">
              <button type="button" onClick={() => { setReceivingOrder(null); setReceivingItems([]); }} className="btn-secondary text-xs px-4 py-2">
                Hủy bỏ
              </button>
              <button 
                type="button" 
                onClick={confirmReceiveFulfillment}
                disabled={receivingItems.some(i => !i.batchNumber || !i.expiryDate)}
                className="btn-primary text-xs px-5 py-2 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold"
              >
                📥 Nhập Kho & Đóng đơn PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
