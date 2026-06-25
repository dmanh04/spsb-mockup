import { useState } from 'react'
import { Plus, Search, ArrowUpRight, CheckCircle, Clock, AlertTriangle, X, ChevronRight, Boxes, FileText, Warehouse, Eye, Info, Package, ShoppingBag } from 'lucide-react'
import { TRANSFER_MOCK_LIST, saveTransfers } from '@/data/transferMockData'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { ROOM_CATEGORIES, ROOM_MOCK_LIST, saveRooms } from '@/data/roomMockData'
import { INVENTORY_ITEMS, INVENTORY_TRANSACTIONS, saveInventory } from '@/data/inventoryMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'
import type { StockTransfer, TransferItem, TransferStatus, InventoryItem, InventoryTransaction, Room } from '@/types'

const STATUS_LABELS: Record<TransferStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  picking: 'Đang soạn hàng',
  shipped: 'Đã xuất kho',
  in_transit: 'Đang vận chuyển',
  received: 'Đã nhận',
  completed: 'Hoàn tất',
  rejected: 'Từ chối',
  partially_received: 'Nhận thiếu'
}

const STATUS_COLORS: Record<TransferStatus, string> = {
  pending: 'badge-orange',
  approved: 'badge-blue',
  picking: 'badge-blue',
  shipped: 'badge-blue',
  in_transit: 'badge-orange',
  received: 'badge-green',
  completed: 'badge-green',
  rejected: 'badge-red',
  partially_received: 'badge-orange'
}

const STATUS_DOTS: Record<TransferStatus, string> = {
  pending: 'bg-orange-400',
  approved: 'bg-blue-400',
  picking: 'bg-blue-400',
  shipped: 'bg-blue-400',
  in_transit: 'bg-orange-400',
  received: 'bg-green-400',
  completed: 'bg-green-500',
  rejected: 'bg-red-500',
  partially_received: 'bg-orange-500'
}

// Default physical specifications for new cages generated from transfer
const CAGE_DEFAULT_SPECS: Record<string, { capacity: number; size: 'S' | 'M' | 'L' | 'XL'; material: string; costPrice: number }> = {
  RC01: { capacity: 1, size: 'M', material: 'Inox 304', costPrice: 780000 },
  RC02: { capacity: 1, size: 'L', material: 'Inox 304', costPrice: 1150000 },
  RC03: { capacity: 2, size: 'S', material: 'Nhựa PP', costPrice: 280000 },
  RC_BOARDING: { capacity: 4, size: 'L', material: 'Gỗ thông tự nhiên', costPrice: 1150000 },
  RC04: { capacity: 1, size: 'M', material: 'Inox 304', costPrice: 780000 },
  RC05: { capacity: 1, size: 'L', material: 'Inox 304', costPrice: 1150000 }
}

export default function StockTransferRequestPage() {
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'

  const [transfers, setTransfers] = useState<StockTransfer[]>(() => TRANSFER_MOCK_LIST)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [successAlert, setSuccessAlert] = useState('')
  const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null)

  // Drawer states
  const [showCreateDrawer, setShowCreateDrawer] = useState(false)
  const [showReceivePanel, setShowReceivePanel] = useState<StockTransfer | null>(null)

  // Request creation states
  const [draftItems, setDraftItems] = useState<Omit<TransferItem, 'receivedQty' | 'batchNumber' | 'expiryDate'>[]>([])
  const [requestNote, setRequestNote] = useState('')
  const [itemType, setItemType] = useState<'product' | 'cage'>('product')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedCageCatId, setSelectedCageCatId] = useState('')
  const [itemQty, setItemQty] = useState('10')

  // Receive confirmation states
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({}) // skuId -> receivedQty
  const [receiveNote, setReceiveNote] = useState('')

  const shopTransfers = transfers.filter(t => t.toShopId === shopId || t.fromShopId === shopId)

  const filteredTransfers = shopTransfers
    .filter(t => {
      if (filterStatus === 'all') return true
      return t.status === filterStatus
    })
    .filter(t => {
      if (!search) return true
      return t.id.toLowerCase().includes(search.toLowerCase()) || 
             (t.requestedBy || '').toLowerCase().includes(search.toLowerCase())
    })

  // Counters
  const countPending = shopTransfers.filter(t => t.status === 'pending').length
  const countInTransit = shopTransfers.filter(t => ['shipped', 'in_transit'].includes(t.status)).length
  const countCompleted = shopTransfers.filter(t => t.status === 'completed').length

  // Add Item to Draft list
  function handleAddItemToDraft() {
    const qtyVal = Number(itemQty)
    if (isNaN(qtyVal) || qtyVal <= 0) return

    if (itemType === 'product') {
      if (!selectedProductId) return
      // Find SKU details
      let matchSku: any = null;
      (PRODUCT_MOCK_LIST as any[]).forEach((p: any) => {
        const found = (p.skus as any[]).find(s => s.id === selectedProductId)
        if (found) {
          matchSku = {
            sku: found.sku,
            price: found.price,
            name: `${p.name} (${Object.values(found.attributes).join(' / ')})`
          }
        }
      })
      if (!matchSku) return

      // Check if duplicate
      if (draftItems.some(i => i.skuId === selectedProductId)) {
        alert('Mặt hàng này đã có trong danh sách yêu cầu!')
        return
      }

      setDraftItems([
        ...draftItems,
        {
          skuId: selectedProductId,
          skuCode: matchSku.sku,
          productName: matchSku.name,
          itemType: 'product',
          quantity: qtyVal
        }
      ])
    } else {
      if (!selectedCageCatId) return
      const cat = ROOM_CATEGORIES.find(c => c.id === selectedCageCatId)
      if (!cat) return

      if (draftItems.some(i => i.skuId === selectedCageCatId)) {
        alert('Loại chuồng này đã có trong danh sách yêu cầu!')
        return
      }

      setDraftItems([
        ...draftItems,
        {
          skuId: selectedCageCatId,
          skuCode: `CAGE-${cat.name.toUpperCase().replace(/\s+/g, '-')}`,
          productName: cat.name,
          itemType: 'cage',
          quantity: qtyVal
        }
      ])
    }

    // Reset item selectors
    setSelectedProductId('')
    setSelectedCageCatId('')
    setItemQty('10')
  }

  // Remove item from draft
  function handleRemoveDraftItem(skuId: string) {
    setDraftItems(draftItems.filter(i => i.skuId !== skuId))
  }

  // Submit transfer request to warehouse
  function handleSubmitTransferRequest(e: React.FormEvent) {
    e.preventDefault()
    if (draftItems.length === 0) {
      alert('Vui lòng thêm ít nhất một mặt hàng yêu cầu!')
      return
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const newRequest: StockTransfer = {
      id: `TF-RQ${Math.floor(1000 + Math.random() * 9000)}`,
      fromShopId: 'warehouse',
      toShopId: shopId,
      items: draftItems.map(i => ({
        ...i,
        receivedQty: 0
      })),
      status: 'pending',
      requestedBy: currentUser?.fullName ?? 'Shop Head',
      requestedAt: nowStr,
      note: requestNote || 'Yêu cầu xin cấp hàng bổ sung'
    }

    const updated = [newRequest, ...transfers]
    setTransfers(updated)
    saveTransfers(updated)

    // Reset create states
    setDraftItems([])
    setRequestNote('')
    setShowCreateDrawer(false)
    setSuccessAlert(`Đã tạo phiếu xin nhập kho "${newRequest.id}" thành công!`)
    setTimeout(() => setSuccessAlert(''), 3000)
  }

  // Initiate Receiving Shipment
  function handleStartReceive(transfer: StockTransfer) {
    setSelectedTransfer(null)
    setShowReceivePanel(transfer)
    
    // Initialize received quantity map to matching requested quantity
    const qtyMap: Record<string, number> = {}
    transfer.items.forEach(item => {
      qtyMap[item.skuId] = item.quantity
    })
    setReceivedQtys(qtyMap)
    setReceiveNote('')
  }

  // Confirm Receipt of Goods
  function handleConfirmReceive(e: React.FormEvent) {
    e.preventDefault()
    if (!showReceivePanel) return

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
    let isFullyReceived = true
    const updatedItems = showReceivePanel.items.map(item => {
      const recQty = receivedQtys[item.skuId] ?? 0
      if (recQty < item.quantity) {
        isFullyReceived = false
      }
      return {
        ...item,
        receivedQty: recQty
      }
    })

    const finalStatus: TransferStatus = isFullyReceived ? 'completed' : 'partially_received'

    // 1. Update StockTransfer status & quantities
    const updatedTransfers = transfers.map(t => {
      if (t.id === showReceivePanel.id) {
        return {
          ...t,
          items: updatedItems,
          status: finalStatus,
          receivedAt: nowStr,
          note: `${t.note} · Nhận hàng: ${receiveNote || 'Đã kiểm đếm'}`
        }
      }
      return t
    })

    // 2. Perform Stock increase updates & physical instantiation
    let newPhysicalCages: Room[] = []
    const updatedInventoryList = [...INVENTORY_ITEMS]
    const updatedTransactions = [...INVENTORY_TRANSACTIONS]

    updatedItems.forEach(item => {
      const recQty = item.receivedQty ?? 0
      if (recQty <= 0) return

      if (item.itemType === 'product') {
        // Product inventory update
        const invItemIdx = updatedInventoryList.findIndex(i => i.skuId === item.skuId && i.shopId === shopId)
        if (invItemIdx >= 0) {
          updatedInventoryList[invItemIdx].quantity += recQty
          updatedInventoryList[invItemIdx].lastUpdated = nowStr.split(' ')[0]
        } else {
          updatedInventoryList.push({
            skuId: item.skuId,
            skuCode: item.skuCode,
            productName: item.productName,
            shopId: shopId,
            quantity: recQty,
            minStock: 5,
            lastUpdated: nowStr.split(' ')[0]
          })
        }

        // Write inventory transaction
        updatedTransactions.unshift({
          id: `TX-IN${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'transfer_in',
          skuId: item.skuId,
          skuCode: item.skuCode,
          productName: item.productName,
          shopId: shopId,
          quantity: recQty,
          note: `Nhập chuyển kho từ phiếu ${showReceivePanel.id}`,
          createdBy: currentUser?.fullName ?? 'Shop Head',
          createdAt: nowStr,
          transferId: showReceivePanel.id
        })
      } else {
        // Cage physical instantiation
        const catId = item.skuId
        const catDetails = CAGE_DEFAULT_SPECS[catId] ?? { capacity: 1, size: 'M' as const, material: 'Inox 304', costPrice: 780000 }
        
        for (let idx = 0; idx < recQty; idx++) {
          const serialNo = `SN-CAGE-${catId}-${Math.floor(1000 + Math.random() * 9000)}`
          const cageId = `R-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
          const cageName = `Chuồng ${item.productName} (Nhập TF-${showReceivePanel.id.substring(3)})`
          
          newPhysicalCages.push({
            id: cageId,
            name: cageName,
            categoryId: catId,
            categoryName: item.productName,
            shopId: shopId,
            capacity: catDetails.capacity,
            status: 'available',
            equipment: [],
            size: catDetails.size,
            material: catDetails.material,
            condition: 'new',
            costPrice: catDetails.costPrice,
            serialNumber: serialNo,
            stock: 1,
            minStock: 0
          })
        }
      }
    })

    // Save stock transfer list
    setTransfers(updatedTransfers)
    saveTransfers(updatedTransfers)

    // Save inventory changes
    saveInventory(updatedInventoryList, updatedTransactions)

    // Save newly instantiated cages (rooms)
    if (newPhysicalCages.length > 0) {
      const mergedRooms = [...ROOM_MOCK_LIST, ...newPhysicalCages]
      saveRooms(mergedRooms)
    }

    setShowReceivePanel(null)
    setSuccessAlert(`Nhận hàng thành công! Đã cập nhật tồn kho${newPhysicalCages.length > 0 ? ` và tạo ${newPhysicalCages.length} thực thể Chuồng dịch vụ` : ''}.`)
    setTimeout(() => setSuccessAlert(''), 4000)
  }

  return (
    <div className="relative flex flex-col md:flex-row gap-6 min-h-[calc(100vh-140px)] animate-fadeIn">
      
      {/* MAIN VIEW AREA */}
      <div className="flex-1 space-y-5">
        
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Yêu cầu nhập kho (Stock Import Request)</h1>
            <p className="text-sm text-gray-500">Xin cấp sản phẩm và chuồng dịch vụ từ kho tổng về chi nhánh {shopId}</p>
          </div>
          
          <button
            onClick={() => { setShowCreateDrawer(true); setSelectedTransfer(null); setShowReceivePanel(null); }}
            className="btn-primary py-2 px-4 text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-100 hover:scale-102 transition-transform"
          >
            <Plus size={14} /> Tạo phiếu yêu cầu nhập
          </button>
        </div>

        {/* Success Alert */}
        {successAlert && (
          <div className="bg-emerald-50 border border-emerald-250/30 text-emerald-800 rounded-2xl p-4 flex items-center gap-2 text-sm font-extrabold animate-pulse">
            <CheckCircle size={18} className="text-emerald-600 shrink-0" />
            <span>{successAlert}</span>
          </div>
        )}

        {/* Stats counter row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Yêu cầu chờ duyệt', value: countPending, color: 'text-orange-500', icon: Clock },
            { label: 'Đơn đang vận chuyển', value: countInTransit, color: 'text-blue-500', icon: Warehouse },
            { label: 'Phiếu đã hoàn tất', value: countCompleted, color: 'text-emerald-600', icon: CheckCircle }
          ].map(m => (
            <div key={m.label} className="bg-white rounded-2xl p-4 border border-gray-150 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-gray-900">{m.value}</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mt-0.5">{m.label}</div>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-50 border shrink-0 ${m.color}`}>
                <m.icon size={16} />
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-gray-150 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              className="form-input pl-9 text-xs py-2 rounded-xl" 
              placeholder="Tìm kiếm theo mã phiếu, người lập..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'picking', 'shipped', 'in_transit', 'received', 'completed', 'partially_received', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  filterStatus === status 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {status === 'all' ? 'Tất cả trạng thái' : STATUS_LABELS[status as TransferStatus]}
              </button>
            ))}
          </div>
        </div>

        {/* Transfers Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTransfers.map(tf => {
            const isDestination = tf.toShopId === shopId
            const canConfirmReceive = isDestination && ['shipped', 'in_transit'].includes(tf.status)
            
            return (
              <div 
                key={tf.id}
                onClick={() => {
                  setSelectedTransfer(tf)
                  setShowCreateDrawer(false)
                  setShowReceivePanel(null)
                }}
                className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer border-gray-150 hover:border-indigo-150 ${
                  selectedTransfer?.id === tf.id ? 'ring-2 ring-indigo-600 border-indigo-600' : ''
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="font-mono font-black text-gray-900 text-sm">{tf.id}</span>
                      <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Lập lúc: {tf.requestedAt}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOTS[tf.status]}`} />
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_COLORS[tf.status]}`}>
                        {STATUS_LABELS[tf.status]}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] font-semibold text-gray-650 bg-slate-50 border rounded-xl p-3 mb-3 space-y-1">
                    <div>Nguồn gửi: <span className="font-bold text-gray-800">{tf.fromShopId === 'warehouse' ? 'Kho Tổng' : tf.fromShopId}</span></div>
                    <div>Đích nhận: <span className="font-bold text-gray-800">{tf.toShopId === 'warehouse' ? 'Kho Tổng' : tf.toShopId}</span></div>
                    <div>Người yêu cầu: <span className="font-bold text-gray-800">{tf.requestedBy}</span></div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wide">Chi tiết sản phẩm / chuồng ({tf.items.length}):</span>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1 divide-y divide-gray-100">
                      {tf.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs py-1 first:pt-0">
                          <span className="font-bold text-gray-700 truncate max-w-[180px]">
                            {item.itemType === 'cage' ? '🏡 ' : '📦 '} {item.productName}
                          </span>
                          <span className="text-gray-400 font-bold font-mono">
                            {item.quantity} cái {item.receivedQty ? ` (Đã nhận ${item.receivedQty})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {tf.status === 'rejected' && tf.rejectReason && (
                  <div className="mb-3 bg-red-50 border border-red-100 rounded-xl p-2.5 text-[10.5px] font-semibold text-red-700 flex gap-1.5">
                    <AlertTriangle size={12} className="shrink-0 mt-0.5 text-red-500" />
                    <span><span className="font-extrabold">Lý do từ chối:</span> {tf.rejectReason}</span>
                  </div>
                )}

                <div className="border-t pt-3 flex items-center justify-between" onClick={e => e.stopPropagation()}>
                  <span className="text-[10px] font-bold text-gray-400 italic truncate max-w-[160px]">"{tf.note}"</span>
                  {canConfirmReceive ? (
                    <button
                      onClick={() => handleStartReceive(tf)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <CheckCircle size={12} /> Nhận hàng
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedTransfer(tf)}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                    >
                      Chi tiết <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredTransfers.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400">
            <Boxes size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-bold">Chưa có phiếu yêu cầu chuyển kho nào</p>
          </div>
        )}
      </div>

      {/* --- SLIDING RIGHT DRAWER FOR CREATING NEW TRANSFER REQUEST --- */}
      {showCreateDrawer && (
        <div className="w-full md:w-96 shrink-0 bg-white rounded-3xl border border-gray-200 p-5 shadow-lg animate-slideIn flex flex-col justify-between space-y-4">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h2 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                  🏢 Lập yêu cầu nhập kho
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                  Gửi phiếu xin cấp hàng cho Warehouse
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCreateDrawer(false)} 
                className="text-gray-400 hover:text-gray-650"
              >
                <X size={16} />
              </button>
            </div>

            {/* Add Item form */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5 space-y-3 shrink-0 text-xs font-semibold text-gray-700">
              <span className="text-[9px] font-black text-slate-800 uppercase tracking-wide block">➕ Thêm mặt hàng vào phiếu yêu cầu</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-extrabold text-gray-400 uppercase">Loại hàng</label>
                  <select
                    className="form-input text-xs py-1.5 px-2 bg-white"
                    value={itemType}
                    onChange={e => {
                      setItemType(e.target.value as any)
                      setSelectedProductId('')
                      setSelectedCageCatId('')
                    }}
                  >
                    <option value="product">Hàng để bán</option>
                    <option value="cage">Chuồng</option>
                  </select>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[9px] font-extrabold text-gray-400 uppercase">Số lượng xin</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input text-xs py-1.5 px-2 bg-white"
                    value={itemQty}
                    onChange={e => setItemQty(e.target.value)}
                  />
                </div>
              </div>

              {itemType === 'product' ? (
                <div className="space-y-0.5">
                  <label className="text-[9px] font-extrabold text-gray-400 uppercase">Chọn Sản phẩm / SKU</label>
                  <select
                    className="form-input text-xs py-1.5 px-2 bg-white w-full"
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                  >
                    <option value="">-- Chọn SKU sản phẩm --</option>
                    {PRODUCT_MOCK_LIST.flatMap(p => 
                      p.skus.map(s => (
                        <option key={s.id} value={s.id}>
                          {p.name} - {Object.values(s.attributes).join(' / ')}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <label className="text-[9px] font-extrabold text-gray-400 uppercase">Chọn Loại chuồng</label>
                  <select
                    className="form-input text-xs py-1.5 px-2 bg-white w-full"
                    value={selectedCageCatId}
                    onChange={e => setSelectedCageCatId(e.target.value)}
                  >
                    <option value="">-- Chọn phân loại chuồng --</option>
                    {ROOM_CATEGORIES.filter(c => c.shopId === shopId).map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddItemToDraft}
                disabled={itemType === 'product' ? !selectedProductId : !selectedCageCatId}
                className="w-full py-2 bg-indigo-50 border border-indigo-150 text-indigo-700 disabled:opacity-50 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors"
              >
                Thêm vào danh sách yêu cầu
              </button>
            </div>

            {/* Draft list (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide block">Danh sách yêu cầu ({draftItems.length})</span>
              
              {draftItems.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed text-gray-400">
                  Chưa có mặt hàng nào. Vui lòng thêm từ form trên.
                </div>
              ) : (
                <div className="divide-y border rounded-2xl bg-white overflow-hidden shadow-sm">
                  {draftItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 text-xs">
                      <div>
                        <div className="font-bold text-gray-800">
                          {item.itemType === 'cage' ? '🏡 ' : '📦 '} {item.productName}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.skuCode}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-indigo-650 bg-slate-50 px-2 py-0.5 rounded font-mono text-[13px]">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDraftItem(item.skuId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Note text field */}
            <div className="space-y-1 shrink-0 text-xs">
              <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wide block">Ghi chú phiếu yêu cầu</label>
              <textarea
                placeholder="Ghi lý do hoặc ghi chú chi tiết..."
                className="form-input text-xs py-2 px-3 rounded-xl min-h-16 resize-none w-full"
                value={requestNote}
                onChange={e => setRequestNote(e.target.value)}
              />
            </div>

          </div>

          {/* Drawer actions footer */}
          <div className="pt-3 border-t shrink-0 flex gap-2">
            <button
              onClick={handleSubmitTransferRequest}
              disabled={draftItems.length === 0}
              className="flex-1 btn-primary py-2.5 text-xs font-black justify-center rounded-2xl disabled:opacity-50 flex items-center gap-1"
            >
              <ArrowUpRight size={13} /> Gửi yêu cầu nhập
            </button>
            <button
              onClick={() => { setShowCreateDrawer(false); setDraftItems([]); }}
              className="btn-secondary py-2.5 text-xs font-bold justify-center rounded-2xl"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      {/* --- SLIDING RIGHT DRAWER FOR RECEIVING SHIPMENT --- */}
      {showReceivePanel && (
        <div className="w-full md:w-96 shrink-0 bg-white rounded-3xl border border-gray-200 p-5 shadow-lg animate-slideIn flex flex-col justify-between space-y-4">
          <form onSubmit={handleConfirmReceive} className="space-y-4 flex-1 flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h2 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                  📥 Kiểm nhận hàng: {showReceivePanel.id}
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                  Nhập số lượng thực nhận từ Warehouse
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowReceivePanel(null)} 
                className="text-gray-400 hover:text-gray-650"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide block">Kiểm đếm sản phẩm & chuồng</span>
              
              <div className="space-y-2.5">
                {showReceivePanel.items.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-150/60 rounded-2xl p-3 space-y-2 text-xs font-semibold">
                    <div className="flex justify-between font-bold text-gray-800 border-b pb-1.5">
                      <span>{item.itemType === 'cage' ? '🏡 Chuồng: ' : '📦 Sản phẩm: '}{item.productName}</span>
                      <span className="font-mono text-indigo-700">Xin: {item.quantity} cái</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-gray-500 font-extrabold uppercase">Thực nhận tại chi nhánh</label>
                      <input 
                        type="number" 
                        min="0"
                        max={item.quantity}
                        required
                        className="form-input text-xs py-1 px-2 rounded-lg bg-white w-20 text-center font-bold"
                        value={receivedQtys[item.skuId] ?? item.quantity}
                        onChange={e => {
                          const val = Math.min(item.quantity, Math.max(0, parseInt(e.target.value) || 0))
                          setReceivedQtys({
                            ...receivedQtys,
                            [item.skuId]: val
                          })
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wide block">Ghi chú nhận hàng (bất thường / thiếu hụt)</label>
                <textarea
                  placeholder="Ghi nhận tình trạng hàng hóa nhận được..."
                  className="form-input text-xs py-2 px-3 rounded-xl min-h-16 resize-none w-full"
                  value={receiveNote}
                  onChange={e => setReceiveNote(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-3 border-t shrink-0 flex gap-2">
              <button
                type="submit"
                className="flex-1 btn-primary py-2.5 text-xs font-black justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1"
              >
                <CheckCircle size={13} /> Xác nhận nhận hàng
              </button>
              <button
                type="button"
                onClick={() => setShowReceivePanel(null)}
                className="btn-secondary py-2.5 text-xs font-bold justify-center rounded-2xl"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- SLIDING RIGHT DRAWER FOR DETAILED PROFILE TIMELINE --- */}
      {selectedTransfer && !showReceivePanel && !showCreateDrawer && (
        <div className="w-full md:w-96 shrink-0 bg-white rounded-3xl border border-gray-200 p-5 shadow-lg animate-slideIn flex flex-col justify-between space-y-4">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h2 className="text-sm font-black text-gray-800 font-mono">
                  Phiếu chuyển: {selectedTransfer.id}
                </h2>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: STATUS_DOTS[selectedTransfer.status] }} />
                  <span>{STATUS_LABELS[selectedTransfer.status]}</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedTransfer(null)} 
                className="text-gray-400 hover:text-gray-650"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs font-semibold text-gray-650">
              
              <div className="bg-slate-50 border rounded-2xl p-3.5 space-y-2">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide block">Thông tin cơ bản</span>
                <div className="grid grid-cols-2 gap-y-2">
                  <div>
                    <div className="text-[9px] font-extrabold text-gray-400 uppercase">Trạng thái</div>
                    <div className="text-gray-900 font-bold mt-0.5">{STATUS_LABELS[selectedTransfer.status]}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-extrabold text-gray-400 uppercase">Người lập yêu cầu</div>
                    <div className="text-gray-900 font-bold mt-0.5">{selectedTransfer.requestedBy}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-extrabold text-gray-400 uppercase">Từ (Nguồn)</div>
                    <div className="text-gray-900 font-bold mt-0.5">{selectedTransfer.fromShopId === 'warehouse' ? 'Kho Tổng (Warehouse)' : selectedTransfer.fromShopId}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-extrabold text-gray-400 uppercase">Đến (Đích)</div>
                    <div className="text-gray-900 font-bold mt-0.5">{selectedTransfer.toShopId === 'warehouse' ? 'Kho Tổng (Warehouse)' : selectedTransfer.toShopId}</div>
                  </div>
                </div>
              </div>

              {/* Items requested */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide block">Danh sách mặt hàng</span>
                <div className="divide-y border rounded-2xl bg-white overflow-hidden">
                  {selectedTransfer.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 text-xs">
                      <div>
                        <div className="font-bold text-gray-800">
                          {item.itemType === 'cage' ? '🏡 ' : '📦 '} {item.productName}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.skuCode}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-gray-900 font-mono text-[12px]">{item.quantity} cái</div>
                        {item.receivedQty !== undefined && (
                          <div className="text-[9px] font-extrabold text-emerald-600 mt-0.5">Nhận thực tế: {item.receivedQty} cái</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status history timeline */}
              <div className="space-y-2 border-t pt-3">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide block">Timeline trạng thái phiếu</span>
                <div className="relative pl-5 border-l-2 border-slate-100 ml-2 space-y-4 py-1 text-xs">
                  
                  {/* Step 1: Requested */}
                  <div className="relative">
                    <div className="absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white" />
                    <div>
                      <div className="font-bold text-gray-800">Đã gửi yêu cầu nhập kho</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedTransfer.requestedAt} · Lập bởi {selectedTransfer.requestedBy}</div>
                      <div className="text-[10.5px] italic text-gray-500 mt-1">"Ghi chú: {selectedTransfer.note}"</div>
                    </div>
                  </div>

                  {/* Step 2: Approved (if status isn't pending / rejected) */}
                  {selectedTransfer.status !== 'pending' && selectedTransfer.status !== 'rejected' && (
                    <div className="relative">
                      <div className="absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border border-white" />
                      <div>
                        <div className="font-bold text-gray-800">Đã phê duyệt yêu cầu</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {selectedTransfer.approvedAt && <span>{selectedTransfer.approvedAt} · </span>}
                          Phê duyệt bởi <span className="text-blue-700 font-bold">{selectedTransfer.approvedBy ?? 'Warehouse Manager'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Picking */}
                  {['picking', 'shipped', 'in_transit', 'received', 'completed', 'partially_received'].includes(selectedTransfer.status) && (
                    <div className="relative">
                      <div className="absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full bg-violet-400 border border-white" />
                      <div>
                        <div className="font-bold text-gray-800">Kho đang soạn hàng</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">Warehouse Manager đang kiểm kê và đóng gói hàng hóa</div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Shipped / In Transit */}
                  {['shipped', 'in_transit', 'received', 'completed', 'partially_received'].includes(selectedTransfer.status) && (
                    <div className="relative">
                      <div className="absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full bg-orange-400 border border-white" />
                      <div>
                        <div className="font-bold text-gray-800">Đã xuất kho &amp; Đang vận chuyển</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {selectedTransfer.shippedAt && <span>{selectedTransfer.shippedAt} · </span>}
                          Đã đóng gói và bàn giao shipper
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Received / Completed */}
                  {['received', 'completed', 'partially_received'].includes(selectedTransfer.status) && (
                    <div className="relative">
                      <div className="absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                      <div>
                        <div className="font-bold text-gray-800">
                          {selectedTransfer.status === 'partially_received' ? 'Nhận hàng thiếu tại chi nhánh' : 'Hoàn tất nhận hàng tại chi nhánh'}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {selectedTransfer.receivedAt && <span>Thời gian: {selectedTransfer.receivedAt}</span>}
                        </div>
                        {selectedTransfer.status === 'completed' && (
                          <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-1.5 mt-1.5">
                            ✅ Tất cả mặt hàng đã được kiểm đếm, cập nhật tồn kho chi nhánh thành công.
                          </div>
                        )}
                        {selectedTransfer.status === 'partially_received' && (
                          <div className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-lg p-1.5 mt-1.5">
                            ⚠️ Nhận hàng thiếu — có SKU được giao không đủ số lượng yêu cầu.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rejected State */}
                  {selectedTransfer.status === 'rejected' && (
                    <div className="relative">
                      <div className="absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />
                      <div>
                        <div className="font-bold text-red-700">Yêu cầu bị từ chối</div>
                        {selectedTransfer.rejectReason ? (
                          <div className="text-[10.5px] mt-1 bg-red-50 border border-red-100 rounded-lg p-2 text-red-700 font-semibold">
                            <span className="font-extrabold">Lý do: </span>{selectedTransfer.rejectReason}
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-400 mt-0.5">Warehouse từ chối cấp hàng — không có lý do bổ sung.</div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>

          {/* Drawer footer closing */}
          <div className="pt-2 border-t shrink-0">
            <button 
              type="button" 
              onClick={() => setSelectedTransfer(null)} 
              className="w-full btn-secondary py-2 text-xs font-bold justify-center rounded-xl"
            >
              Đóng chi tiết phiếu
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
