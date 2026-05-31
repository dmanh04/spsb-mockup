import { useState } from 'react'
import { 
  Search, Package, TrendingDown, X, Settings, History, Plus, 
  AlertCircle, ShieldCheck, ArrowUpRight, DollarSign, ListOrdered, 
  CheckCircle, PlusCircle, MinusCircle, FileText
} from 'lucide-react'
import { PRODUCT_MOCK_LIST, saveProducts } from '@/data/productMockData'
import { INVENTORY_ITEMS, INVENTORY_TRANSACTIONS, saveInventory } from '@/data/inventoryMockData'
import { TRANSFER_MOCK_LIST, saveTransfers } from '@/data/transferMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'
import type { Product, SKU, InventoryItem, InventoryTransaction, StockTransfer } from '@/types'

const STATUS_LABELS = {
  in_stock: 'Còn hàng',
  low_stock: 'Sắp hết',
  out_of_stock: 'Hết hàng'
}

const STATUS_COLORS = {
  in_stock: 'badge-green',
  low_stock: 'badge-orange',
  out_of_stock: 'badge-red'
}

export default function ShopHeadProductsPage() {
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'

  // Reactive DB states
  const [productList, setProductList] = useState<Product[]>(() => PRODUCT_MOCK_LIST)
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(() => INVENTORY_ITEMS)
  const [transactionList, setTransactionList] = useState<InventoryTransaction[]>(() => INVENTORY_TRANSACTIONS)
  const [transferList, setTransferList] = useState<StockTransfer[]>(() => TRANSFER_MOCK_LIST)

  // Filtering states
  const [search, setSearch] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [successAlert, setSuccessAlert] = useState('')

  // Selected Product Drawer states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config')

  // Selected Sku inline adjustment states
  const [adjustingSkuId, setAdjustingSkuId] = useState<string | null>(null)
  const [adjustQty, setAdjustQty] = useState('5')
  const [adjustType, setAdjustType] = useState<'add' | 'sub'>('add')
  const [adjustReason, setAdjustReason] = useState('Kiểm kê kho lệch')
  const [adjustNote, setAdjustNote] = useState('')

  // Sku local price & minStock edit states
  const [editingSkuId, setEditingSkuId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('0')
  const [editMinStock, setEditMinStock] = useState('5')

  // Stock Replenishment Request Drawer states
  const [showReplenishDrawer, setShowReplenishDrawer] = useState(false)
  const [repSkuId, setRepSkuId] = useState('')
  const [repQty, setRepQty] = useState('10')
  const [repNote, setRepNote] = useState('')

  // Helper mappings
  const shopInventory = inventoryList.filter(i => i.shopId === shopId)

  const getStockForSku = (skuId: string) =>
    shopInventory.find(i => i.skuId === skuId)?.quantity ?? 0

  const getMinStockForSku = (skuId: string) =>
    shopInventory.find(i => i.skuId === skuId)?.minStock ?? 5

  const getSkuCode = (skuId: string) =>
    shopInventory.find(i => i.skuId === skuId)?.skuCode ?? skuId

  // Stats calculation
  const lowStockSkus = shopInventory.filter(i => i.quantity <= i.minStock)
  const lowStockCount = lowStockSkus.length
  const outOfStockCount = shopInventory.filter(i => i.quantity === 0).length
  const pendingTransfers = transferList.filter(t => t.toShopId === shopId && t.status === 'pending').length

  const filteredProducts = productList
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))
    .filter(p => {
      if (!showLowStock) return true
      return p.skus.some(s => {
        const stock = getStockForSku(s.id)
        const minStock = getMinStockForSku(s.id)
        return stock <= minStock
      })
    })

  // Handle SKU Price & Safety threshold saving
  function handleSaveSkuConfigs(skuId: string) {
    const priceNum = Number(editPrice)
    const minStockNum = Number(editMinStock)

    if (isNaN(priceNum) || priceNum <= 0 || isNaN(minStockNum) || minStockNum < 0) {
      setSuccessAlert('Vui lòng nhập giá trị hợp lệ!')
      setTimeout(() => setSuccessAlert(''), 3000)
      return
    }

    // 1. Update Product price globally in PRODUCT_MOCK_LIST
    const updatedProducts = productList.map(p => {
      if (p.skus.some(s => s.id === skuId)) {
        return {
          ...p,
          skus: p.skus.map(s => s.id === skuId ? { ...s, price: priceNum } : s)
        }
      }
      return p
    })
    setProductList(updatedProducts)
    saveProducts(updatedProducts)

    // 2. Update local minStock inside INVENTORY_ITEMS
    const updatedInventory = inventoryList.map(item => {
      if (item.skuId === skuId && item.shopId === shopId) {
        return { ...item, minStock: minStockNum, lastUpdated: new Date().toISOString().split('T')[0] }
      }
      return item
    })
    setInventoryList(updatedInventory)
    saveInventory(updatedInventory, transactionList)

    setEditingSkuId(null)
    setSuccessAlert('Cấu hình biến thể đã được lưu thành công!')
    setTimeout(() => setSuccessAlert(''), 3000)

    // Refresh selected product reference
    if (selectedProduct) {
      const refreshed = updatedProducts.find(p => p.id === selectedProduct.id)
      if (refreshed) setSelectedProduct(refreshed)
    }
  }

  // Handle local Inventory Stock Adjustment
  function handleSaveStockAdjustment(sku: SKU) {
    const qtyVal = Number(adjustQty)
    if (isNaN(qtyVal) || qtyVal <= 0) return

    const actualDiff = adjustType === 'add' ? qtyVal : -qtyVal
    const currentStock = getStockForSku(sku.id)
    
    if (adjustType === 'sub' && currentStock < qtyVal) {
      setSuccessAlert('Tồn kho hiện tại không đủ để giảm!')
      setTimeout(() => setSuccessAlert(''), 3000)
      return
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const newTxId = `TX-ADJ${Math.floor(1000 + Math.random() * 9000)}`

    // 1. Log Inventory transaction
    const newTx: InventoryTransaction = {
      id: newTxId,
      type: 'adjustment',
      skuId: sku.id,
      skuCode: sku.sku,
      productName: selectedProduct?.name ?? 'Sản phẩm',
      shopId: shopId,
      quantity: actualDiff,
      note: `${adjustReason}${adjustNote ? ` · ${adjustNote}` : ''}`,
      createdBy: currentUser?.fullName ?? 'Shop Head',
      createdAt: nowStr
    }

    const updatedTx = [newTx, ...transactionList]
    setTransactionList(updatedTx)

    // 2. Update INVENTORY_ITEMS list
    const updatedInventory = inventoryList.map(item => {
      if (item.skuId === sku.id && item.shopId === shopId) {
        return {
          ...item,
          quantity: item.quantity + actualDiff,
          lastUpdated: nowStr.split(' ')[0]
        }
      }
      return item
    })

    setInventoryList(updatedInventory)
    saveInventory(updatedInventory, updatedTx)

    setAdjustingSkuId(null)
    setAdjustQty('5')
    setAdjustNote('')
    setSuccessAlert(`Đã điều chỉnh tồn kho cho biến thể [${sku.sku}] thành công!`)
    setTimeout(() => setSuccessAlert(''), 3000)
  }

  // Handle submitting Stock Replenishment Request to Warehouse Manager
  function handleRequestReplenish(e: React.FormEvent) {
    e.preventDefault()
    if (!repSkuId) return

    const qtyNum = Number(repQty)
    if (isNaN(qtyNum) || qtyNum <= 0) return

    // Find the SKU details
    let matchSku: SKU | undefined
    let matchProdName = ''
    productList.forEach(p => {
      const found = p.skus.find(s => s.id === repSkuId)
      if (found) {
        matchSku = found
        matchProdName = p.name
      }
    })

    if (!matchSku) return

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const newTransfer: StockTransfer = {
      id: `TF-WK${Math.floor(100 + Math.random() * 900)}`,
      fromShopId: 'warehouse',
      toShopId: shopId,
      items: [{
        skuId: matchSku.id,
        skuCode: matchSku.sku,
        productName: `${matchProdName} (${Object.values(matchSku.attributes).join(' / ')})`,
        quantity: qtyNum
      }],
      status: 'pending',
      requestedBy: currentUser?.fullName ?? 'Shop Head',
      requestedAt: nowStr,
      note: repNote || 'Yêu cầu cấp thêm hàng chi nhánh định kỳ.'
    }

    const updatedTransfers = [newTransfer, ...transferList]
    setTransferList(updatedTransfers)
    saveTransfers(updatedTransfers)

    // Reset Form & Close
    setRepSkuId('')
    setRepQty('10')
    setRepNote('')
    setShowReplenishDrawer(false)
    setSuccessAlert('Đã gửi yêu cầu cấp hàng đến thủ kho tổng phê duyệt!')
    setTimeout(() => setSuccessAlert(''), 4000)
  }

  // Get transactions for selected product's SKUs
  const getProductTransactions = (product: Product) => {
    const skuIds = product.skus.map(s => s.id)
    return transactionList.filter(tx => tx.shopId === shopId && skuIds.includes(tx.skuId))
  }

  return (
    <div className="relative flex flex-col md:flex-row gap-6 min-h-[calc(100vh-140px)] animate-fadeIn">
      
      {/* MAIN PRODUCTS TABLE AREA */}
      <div className="flex-1 space-y-5">
        
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Quản lý Sản phẩm & Tồn kho</h1>
            <p className="text-sm text-gray-500">Xem, điều chỉnh giá bán cục bộ và báo cáo cấp hàng kho chi nhánh {shopId}</p>
          </div>
          
          <button
            onClick={() => { setShowReplenishDrawer(true); setSelectedProduct(null); }}
            className="btn-primary py-2 px-4 text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-100 hover:scale-102 transition-transform"
          >
            <ArrowUpRight size={14} /> Yêu cầu cấp hàng kho
          </button>
        </div>

        {/* Success alert banner */}
        {successAlert && (
          <div className="bg-emerald-50 border border-emerald-250/30 text-emerald-800 rounded-2xl p-4 flex items-center gap-2 text-sm font-extrabold animate-pulse">
            <CheckCircle size={18} className="text-emerald-600 shrink-0" />
            <span>{successAlert}</span>
          </div>
        )}

        {/* Stats metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tổng số mặt hàng', value: productList.flatMap(p => p.skus).length, color: 'text-blue-600' },
            { label: 'Sản phẩm hết hàng', value: outOfStockCount, color: 'text-red-500' },
            { label: 'Mặt hàng sắp hết', value: lowStockCount, color: 'text-orange-500' },
            { label: 'Yêu cầu chờ thủ kho duyệt', value: pendingTransfers, color: 'text-indigo-600' }
          ].map(m => (
            <div key={m.label} className="card p-4 rounded-2xl border border-gray-150 shadow-sm bg-white">
              <div className={`text-lg font-black ${m.color}`}>{m.value}</div>
              <div className="text-xs text-gray-400 font-bold mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar Filters */}
        <div className="flex gap-3 bg-white/50 p-3 rounded-2xl border border-gray-150">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              className="form-input pl-9 text-sm" 
              placeholder="Tìm kiếm sản phẩm, thương hiệu..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <button
            onClick={() => setShowLowStock(v => !v)}
            className={`btn-secondary text-sm py-2 px-3.5 flex items-center gap-1 transition-all rounded-xl ${
              showLowStock ? 'bg-orange-50 border-orange-300 text-orange-700 font-bold' : ''
            }`}
          >
            <TrendingDown size={13} /> Sắp hết hàng ({lowStockCount})
          </button>
        </div>

        {/* Table Listing */}
        <div className="card overflow-x-auto rounded-3xl border border-gray-150 shadow-sm bg-white">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider select-none">
              <tr>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Phân loại / Biến thể</th>
                <th className="px-4 py-3 font-mono">Barcode SKU</th>
                <th className="px-4 py-3 text-right">Giá bán</th>
                <th className="px-4 py-3 text-center">Tồn kho</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredProducts.flatMap(p =>
                p.skus.map(sku => {
                  const stock = getStockForSku(sku.id)
                  const minStock = getMinStockForSku(sku.id)
                  const isOut = stock === 0
                  const isLow = stock <= minStock && !isOut
                  const isSelected = selectedProduct?.id === p.id

                  let statusKey: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock'
                  if (isOut) statusKey = 'out_of_stock'
                  else if (isLow) statusKey = 'low_stock'

                  return (
                    <tr 
                      key={sku.id} 
                      onClick={() => {
                        setSelectedProduct(p)
                        setActiveTab('config')
                        setAdjustingSkuId(null)
                        setEditingSkuId(null)
                        setShowReplenishDrawer(false)
                      }}
                      className={`hover:bg-indigo-50/20 transition-colors cursor-pointer ${
                        isOut ? 'bg-red-50/5' : ''
                      } ${isSelected ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="px-4 py-3.5 font-semibold">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover border shrink-0 bg-slate-100 shadow-sm" />
                          <div>
                            <div className="text-sm font-extrabold text-gray-900">{p.name}</div>
                            <div className="text-gray-400 font-bold mt-0.5">{p.brand} · <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-semibold">{p.category}</span></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-600">
                        {Object.values(sku.attributes).join(' / ')}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-gray-400 font-bold">
                        {sku.sku}
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-indigo-650">
                        {formatPrice(sku.price)}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold">
                        <span className={`text-[13px] font-black ${
                          isOut ? 'text-rose-500' : isLow ? 'text-orange-500' : 'text-emerald-600'
                        }`}>
                          {stock}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-1">/ tối thiểu {minStock}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block font-black px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${STATUS_COLORS[statusKey]}`}>
                          {STATUS_LABELS[statusKey]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => {
                            setSelectedProduct(p)
                            setActiveTab('config')
                            setAdjustingSkuId(null)
                            setEditingSkuId(null)
                            setShowReplenishDrawer(false)
                          }}
                          className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-xl transition-all shadow-sm"
                        >
                          Chỉnh kho & Giá
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <Package size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-bold">Không tìm thấy sản phẩm nào tương thích bộ lọc</p>
            </div>
          )}
        </div>

      </div>

      {/* --- SLIDING RIGHT DRAWER FOR PRODUCT DETAILS & CONFIG --- */}
      {selectedProduct && (
        <div className="w-full md:w-96 shrink-0 bg-white rounded-3xl border border-gray-200 p-5 shadow-lg animate-slideIn flex flex-col justify-between space-y-4">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <img src={selectedProduct.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover border" />
                <div>
                  <h2 className="text-sm font-black text-gray-800 leading-tight">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                    Thương hiệu: {selectedProduct.brand}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedProduct(null)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-gray-100 pb-0.5 text-xs font-bold text-gray-400 select-none shrink-0">
              <button 
                onClick={() => setActiveTab('config')}
                className={`flex-1 pb-2 flex items-center justify-center gap-1 border-b-2 transition-all ${activeTab === 'config' ? 'text-indigo-600 border-indigo-650' : 'border-transparent hover:text-gray-600'}`}
              >
                <Settings size={12} /> Cấu hình & Kho
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`flex-1 pb-2 flex items-center justify-center gap-1 border-b-2 transition-all ${activeTab === 'logs' ? 'text-indigo-600 border-indigo-650' : 'border-transparent hover:text-gray-600'}`}
              >
                <History size={12} /> Nhật ký kho ({getProductTransactions(selectedProduct).length})
              </button>
            </div>

            {/* TAB CONTENTS - Scrollable */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 pt-1 text-xs">
              
              {/* TAB 1: CONFIGURATION & DIRECT ADJUSTMENTS */}
              {activeTab === 'config' && (
                <div className="space-y-4">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">Các biến thể tại chi nhánh</span>
                  
                  <div className="space-y-3">
                    {selectedProduct.skus.map(sku => {
                      const stock = getStockForSku(sku.id)
                      const minStock = getMinStockForSku(sku.id)
                      const isEditingThis = editingSkuId === sku.id
                      const isAdjustingThis = adjustingSkuId === sku.id

                      return (
                        <div key={sku.id} className="bg-slate-50 border border-slate-150/60 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
                          
                          {/* Sku title & Attributes */}
                          <div className="flex justify-between items-start border-b border-gray-150/40 pb-1.5">
                            <div>
                              <strong className="text-gray-900 font-extrabold text-[12px]">{Object.values(sku.attributes).join(' / ')}</strong>
                              <span className="block text-[9px] text-gray-400 font-mono mt-0.5">Mã SKU: {sku.sku}</span>
                            </div>
                            <span className="font-black text-indigo-700 text-[12px]">{formatPrice(sku.price)}</span>
                          </div>

                          {/* Stock status readout */}
                          <div className="flex justify-between items-center text-[11px] font-semibold text-gray-600">
                            <div>Tồn kho: <strong className="text-gray-950 font-black text-sm">{stock}</strong> / tối thiểu {minStock}</div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingSkuId(sku.id)
                                  setEditPrice(sku.price.toString())
                                  setEditMinStock(minStock.toString())
                                  setAdjustingSkuId(null)
                                }}
                                className="text-[9px] font-black text-indigo-650 hover:underline bg-white border border-indigo-150 px-2 py-0.5 rounded-lg"
                              >
                                Sửa cấu hình
                              </button>
                              <button
                                onClick={() => {
                                  setAdjustingSkuId(sku.id)
                                  setAdjustQty('5')
                                  setAdjustType('add')
                                  setAdjustReason('Kiểm kê kho lệch')
                                  setEditingSkuId(null)
                                }}
                                className="text-[9px] font-black text-emerald-700 hover:underline bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg"
                              >
                                Điều chỉnh kho
                              </button>
                            </div>
                          </div>

                          {/* INLINE CONFIGURATION FORM */}
                          {isEditingThis && (
                            <div className="bg-indigo-50/50 border border-indigo-150 rounded-xl p-3 space-y-2.5 mt-2 animate-fadeIn text-[11px]">
                              <span className="text-[9px] font-black text-indigo-950 uppercase tracking-wide block">✏️ Điều chỉnh Giá & Mức tối thiểu</span>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-extrabold text-gray-400 uppercase">Giá bán lẻ (VND)</label>
                                  <input 
                                    type="number" 
                                    className="form-input text-xs py-1 px-2 rounded-lg bg-white" 
                                    value={editPrice}
                                    onChange={e => setEditPrice(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-extrabold text-gray-400 uppercase">Tồn tối thiểu</label>
                                  <input 
                                    type="number" 
                                    className="form-input text-xs py-1 px-2 rounded-lg bg-white" 
                                    value={editMinStock}
                                    onChange={e => setEditMinStock(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-1.5 pt-1.5 border-t border-indigo-100">
                                <button 
                                  onClick={() => setEditingSkuId(null)}
                                  className="text-[9px] font-bold text-gray-400 hover:text-gray-600 px-2 py-1 rounded"
                                >
                                  Hủy
                                </button>
                                <button 
                                  onClick={() => handleSaveSkuConfigs(sku.id)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] px-3 py-1 rounded-xl shadow-sm"
                                >
                                  Lưu lại
                                </button>
                              </div>
                            </div>
                          )}

                          {/* INLINE INVENTORY ADJUSTMENT FORM */}
                          {isAdjustingThis && (
                            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3 space-y-2.5 mt-2 animate-fadeIn text-[11px]">
                              <span className="text-[9px] font-black text-emerald-900 uppercase tracking-wide block">📦 Điều chỉnh tồn kho thực tế</span>
                              
                              <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-extrabold text-gray-400 uppercase">Phương thức</label>
                                  <select 
                                    className="form-input text-xs py-1 px-1.5 rounded-lg bg-white" 
                                    value={adjustType}
                                    onChange={e => setAdjustType(e.target.value as 'add' | 'sub')}
                                  >
                                    <option value="add">Tăng (+)</option>
                                    <option value="sub">Giảm (-)</option>
                                  </select>
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-extrabold text-gray-400 uppercase">Số lượng</label>
                                  <input 
                                    type="number" 
                                    min="1"
                                    className="form-input text-xs py-1 px-2 rounded-lg bg-white" 
                                    value={adjustQty}
                                    onChange={e => setAdjustQty(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-extrabold text-gray-400 uppercase">Lý do điều chỉnh</label>
                                  <select 
                                    className="form-input text-xs py-1 px-1.5 rounded-lg bg-white" 
                                    value={adjustReason}
                                    onChange={e => setAdjustReason(e.target.value)}
                                  >
                                    <option value="Kiểm kê kho lệch">Lệch kiểm kê</option>
                                    <option value="Hàng hỏng / Hết hạn">Hỏng / Hết hạn</option>
                                    <option value="Hao hụt tự nhiên">Hao hụt khác</option>
                                    <option value="Bổ sung nội bộ nhanh">Bổ sung nhanh</option>
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-0.5">
                                <label className="text-[9px] font-extrabold text-gray-400 uppercase">Ghi chú thêm</label>
                                <input 
                                  type="text" 
                                  placeholder="Ghi cụ thể chi tiết phát sinh..."
                                  className="form-input text-xs py-1 px-2 rounded-lg bg-white w-full" 
                                  value={adjustNote}
                                  onChange={e => setAdjustNote(e.target.value)}
                                />
                              </div>

                              <div className="flex justify-end gap-1.5 pt-1.5 border-t border-emerald-200/50">
                                <button 
                                  onClick={() => setAdjustingSkuId(null)}
                                  className="text-[9px] font-bold text-gray-400 hover:text-gray-650 px-2 py-1 rounded"
                                >
                                  Hủy
                                </button>
                                <button 
                                  onClick={() => handleSaveStockAdjustment(sku)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] px-3 py-1 rounded-xl shadow-sm"
                                >
                                  Xác nhận Adjust
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      )
                    })}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3 border leading-relaxed text-gray-500 text-[11px] font-semibold">
                    💡 <strong>Mách nhỏ thủ kho:</strong> Chỉnh sửa giá bán lẻ ở đây sẽ thay đổi giá bán trực tiếp trên hệ thống hóa đơn POS chi nhánh của bạn.
                  </div>
                </div>
              )}

              {/* TAB 2: INVENTORY TRANSACTION HISTORY */}
              {activeTab === 'logs' && (
                <div className="space-y-3">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">Các giao dịch tồn kho tại chi nhánh</span>
                  
                  {getProductTransactions(selectedProduct).length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl text-gray-400 border border-dashed">
                      <FileText className="mx-auto mb-2 text-gray-300" size={24} />
                      <p className="font-bold text-[11px]">Chưa ghi nhận giao dịch nhập/xuất nào</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {getProductTransactions(selectedProduct).map(tx => {
                        const isPlus = tx.quantity > 0
                        return (
                          <div key={tx.id} className="bg-white border border-gray-150 rounded-2xl p-3 shadow-sm text-[11px] font-semibold leading-normal">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-1.5 mb-1.5">
                              <span className="font-bold text-gray-800 bg-slate-100 px-1.5 py-0.5 rounded">{tx.id}</span>
                              <span className="font-mono text-gray-400 text-[9px] font-bold">{tx.createdAt}</span>
                            </div>

                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-gray-900 font-extrabold">{getSkuCode(tx.skuId)}</div>
                                <div className="text-gray-400 text-[10px] mt-0.5">Tác nhân: {tx.createdBy}</div>
                                <div className="text-gray-500 italic text-[10px] mt-1">"{tx.note}"</div>
                              </div>
                              
                              <span className={`text-[14px] font-black font-mono shrink-0 px-2 py-0.5 rounded-lg ${
                                isPlus ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {isPlus ? `+${tx.quantity}` : tx.quantity}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Drawer footer closing */}
          <div className="pt-2 border-t border-gray-100 shrink-0">
            <button 
              type="button" 
              onClick={() => setSelectedProduct(null)} 
              className="w-full btn-secondary py-2 text-xs font-bold justify-center rounded-xl"
            >
              Đóng chi tiết sản phẩm
            </button>
          </div>
        </div>
      )}

      {/* --- SLIDING RIGHT DRAWER FOR SUBMITTING REPLENISHMENT REQUEST --- */}
      {showReplenishDrawer && (
        <div className="w-full md:w-80 shrink-0 bg-white rounded-3xl border border-gray-200 p-5 shadow-lg animate-slideIn flex flex-col justify-between space-y-4">
          <form onSubmit={handleRequestReplenish} className="space-y-4 flex-1 flex flex-col overflow-hidden">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
              <div>
                <h2 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                  📦 Yêu cầu cấp hàng
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                  Gửi phiếu yêu cầu đến kho tổng
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowReplenishDrawer(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex-1 overflow-y-auto space-y-3 pt-2 text-xs">
              
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide block">Chọn mặt hàng / Sku</label>
                <select
                  required
                  className="form-input text-xs py-2 px-3 rounded-xl focus:border-indigo-500"
                  value={repSkuId}
                  onChange={e => setRepSkuId(e.target.value)}
                >
                  <option value="">-- Chọn mặt hàng cấp --</option>
                  {productList.flatMap(p => 
                    p.skus.map(s => {
                      const stock = getStockForSku(s.id)
                      const minStock = getMinStockForSku(s.id)
                      const isLow = stock <= minStock
                      return (
                        <option 
                          key={s.id} 
                          value={s.id}
                          className={isLow ? 'text-rose-650 font-bold' : ''}
                        >
                          {p.name} - {Object.values(s.attributes).join(' / ')} {isLow ? ' [Sắp hết ⚠️] ' : ''}
                        </option>
                      )
                    })
                  )}
                </select>
              </div>

              {repSkuId && (() => {
                const stock = getStockForSku(repSkuId)
                const minStock = getMinStockForSku(repSkuId)
                return (
                  <div className="bg-slate-50 border rounded-2xl p-2.5 text-[10px] font-bold text-gray-650 leading-relaxed">
                    📊 Tình trạng tồn kho hiện tại:
                    <div className="mt-1 text-gray-900 font-black text-[11px]">
                      Tồn kho chi nhánh: <span className="text-indigo-650 text-[12px]">{stock}</span> / Mức tối thiểu: {minStock}
                    </div>
                  </div>
                )
              })()}

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide block">Số lượng yêu cầu cấp</label>
                <input
                  required
                  type="number"
                  min="1"
                  className="form-input text-xs py-2 px-3 rounded-xl focus:border-indigo-500"
                  value={repQty}
                  onChange={e => setRepQty(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide block">Ghi chú phiếu cấp hàng</label>
                <textarea
                  placeholder="Ví dụ: Nhu cầu khách tăng đột ngột, hàng sắp cạn kho..."
                  className="form-input text-xs py-2 px-3 rounded-xl focus:border-indigo-500 min-h-20 resize-none"
                  value={repNote}
                  onChange={e => setRepNote(e.target.value)}
                />
              </div>

            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-3 border-t shrink-0">
              <button 
                type="submit" 
                className="flex-1 btn-primary py-2.5 text-xs font-black justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1"
              >
                <ArrowUpRight size={13} /> Gửi yêu cầu cấp
              </button>
              <button 
                type="button" 
                onClick={() => setShowReplenishDrawer(false)}
                className="btn-secondary py-2.5 text-xs font-bold justify-center rounded-2xl"
              >
                Hủy bỏ
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  )
}
