import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronLeft, AlertTriangle, CheckCircle, Info, Sparkles, 
  MapPin, Check, Plus, ClipboardList, RefreshCw, Calculator
} from 'lucide-react'
import { INVENTORY_ITEMS, INVENTORY_TRANSACTIONS, saveInventory } from '@/data/inventoryMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import type { InventoryItem, InventoryTransaction } from '@/types'

export default function InventoryAdjustmentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Parse query params if redirected inline from list row
  const queryParams = new URLSearchParams(location.search)
  const querySkuCode = queryParams.get('skuCode') || ''
  const queryShopId = queryParams.get('shopId') || 'warehouse'

  // Extract all SKUs from product catalog to select from
  const catalogSkus = PRODUCT_MOCK_LIST.flatMap(prod =>
    prod.skus.map(sku => {
      const variantLabel = Object.values(sku.attributes).join(' / ')
      return {
        skuId: sku.id,
        skuCode: sku.sku,
        productName: `${prod.name}${variantLabel ? ` (${variantLabel})` : ''}`,
        basePrice: sku.price,
      }
    })
  )

  // Form States
  const [shopId, setShopId] = useState(queryShopId)
  const [selectedSkuCode, setSelectedSkuCode] = useState(querySkuCode)
  const [adjustmentMode, setAdjustmentMode] = useState<'override' | 'delta'>('delta')
  const [inputValue, setInputValue] = useState<number>(0)
  const [note, setNote] = useState('')
  
  const [currentQty, setCurrentQty] = useState<number>(0)
  const [toastMsg, setToastMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Determine current quantity when shop or product changes
  useEffect(() => {
    if (selectedSkuCode && shopId) {
      const match = INVENTORY_ITEMS.find(
        i => i.skuCode === selectedSkuCode && i.shopId === shopId
      )
      setCurrentQty(match ? match.quantity : 0)
    } else {
      setCurrentQty(0)
    }
  }, [selectedSkuCode, shopId])

  // Get selected product detail
  const selectedProduct = catalogSkus.find(s => s.skuCode === selectedSkuCode)

  // Compute expected quantity in real time
  const expectedQty = adjustmentMode === 'override' 
    ? Math.max(0, inputValue)
    : Math.max(0, currentQty + inputValue)

  const deltaQty = adjustmentMode === 'override'
    ? expectedQty - currentQty
    : inputValue

  const SHOPS = [
    { id: 'warehouse', name: 'Kho Trung Tâm (TT)' },
    ...SHOP_MOCK_LIST.map(s => ({ id: s.id, name: s.name })),
  ]

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (!selectedSkuCode) {
      setErrorMsg('Vui lòng chọn mã SKU sản phẩm cần cân đối!')
      return
    }
    if (!shopId) {
      setErrorMsg('Vui lòng chọn vị trí kho / chi nhánh thực hiện!')
      return
    }
    if (!note.trim()) {
      setErrorMsg('Vui lòng nhập lý do điều chỉnh kho (bắt buộc để đối chiếu)!')
      return
    }
    if (adjustmentMode === 'delta' && inputValue === 0) {
      setErrorMsg('Số lượng biến động thay đổi phải khác 0!')
      return
    }

    const todayStr = new Date().toISOString().split('T')[0]
    const nowTimeStr = new Date().toISOString().replace('T', ' ').slice(0, 16)

    // Build or update Inventory Item
    let nextItems = [...INVENTORY_ITEMS]
    const itemIndex = nextItems.findIndex(
      i => i.skuCode === selectedSkuCode && i.shopId === shopId
    )

    if (itemIndex >= 0) {
      // Update existing item
      nextItems[itemIndex] = {
        ...nextItems[itemIndex],
        quantity: expectedQty,
        lastUpdated: todayStr
      }
    } else {
      // Create new inventory item record
      if (selectedProduct) {
        const newItem: InventoryItem = {
          skuId: selectedProduct.skuId,
          skuCode: selectedSkuCode,
          productName: selectedProduct.productName,
          shopId: shopId,
          quantity: expectedQty,
          minStock: 5, // Default min stock
          lastUpdated: todayStr
        }
        nextItems.push(newItem)
      }
    }

    // Build Transaction Log
    const newTx: InventoryTransaction = {
      id: `TX-0${Date.now().toString().slice(-4)}`,
      type: 'adjustment',
      skuId: selectedProduct ? selectedProduct.skuId : 'UNKNOWN',
      skuCode: selectedSkuCode,
      productName: selectedProduct ? selectedProduct.productName : 'Sản phẩm',
      shopId: shopId,
      quantity: deltaQty,
      note: note.trim(),
      createdBy: 'Admin PetCare',
      createdAt: nowTimeStr
    }

    const nextTxList = [newTx, ...INVENTORY_TRANSACTIONS]

    // Save and persist
    saveInventory(nextItems, nextTxList)

    setToastMsg('Cân đối số dư kho thành công!')
    setErrorMsg('')
    setTimeout(() => {
      setToastMsg('')
      navigate('/admin/inventory')
    }, 1550)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn text-sm">
      {/* Floating success Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800 animate-bounce">
          <CheckCircle size={20} className="text-emerald-400 shrink-0" />
          <span className="font-semibold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Floating error Banner */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-shake">
          <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Lỗi nhập liệu:</span> {errorMsg}
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-700 font-extrabold text-lg px-1">×</button>
        </div>
      )}

      {/* Breadcrumb Header Bar */}
      <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl border border-gray-100 p-4 rounded-3xl shadow-sm">
        <button
          onClick={() => navigate('/admin/inventory')}
          className="p-3 border border-gray-200 bg-white hover:bg-gray-50 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider select-none">
            <span>Tồn kho</span>
            <span>/</span>
            <span className="text-indigo-600">Điều chỉnh cân đối kho</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">
            Cân đối tồn kho & Nhập hàng thêm
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main forms (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Select location and items */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <MapPin size={18} className="text-indigo-500" />
              Lựa chọn Vị trí & Sản phẩm
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Select Shop */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Kho / Chi nhánh thực hiện <span className="text-rose-500">*</span></label>
                <select
                  value={shopId}
                  onChange={e => setShopId(e.target.value)}
                  className="w-full text-sm px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white font-semibold"
                >
                  {SHOPS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Select Product SKU */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Sản phẩm SKU cần cân đối <span className="text-rose-500">*</span></label>
                <select
                  value={selectedSkuCode}
                  onChange={e => setSelectedSkuCode(e.target.value)}
                  className="w-full text-sm px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white font-semibold"
                >
                  <option value="">-- Chọn sản phẩm SKU --</option>
                  {catalogSkus.map(s => (
                    <option key={s.skuCode} value={s.skuCode}>
                      {s.productName} ({s.skuCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedProduct && (
              <div className="bg-indigo-50/30 p-4 border border-indigo-50 rounded-2xl flex gap-3 items-center animate-slideIn">
                <Sparkles size={16} className="text-indigo-500 shrink-0" />
                <div className="text-xs text-indigo-950 font-semibold leading-relaxed">
                  Đã chọn: <span className="underline">{selectedProduct.productName}</span>. Mã SKU: <span className="font-mono">{selectedProduct.skuCode}</span>.
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Current and expected stock calculation */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Calculator size={18} className="text-gray-500" />
              Tính toán & Biến động chênh lệch
            </h3>

            {/* Current Quantity display box */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-center">
                <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Tồn kho hiện tại</span>
                <span className="text-2xl font-black text-gray-700 block mt-1 font-mono">{currentQty}</span>
              </div>
              <div className="p-4 rounded-2xl border border-gray-100 bg-indigo-50/30 text-center flex flex-col justify-center items-center">
                <span className="text-[10px] text-indigo-500 block font-bold uppercase tracking-wider">Biến động (Delta)</span>
                <span className={`text-lg font-black block mt-1 font-mono ${deltaQty > 0 ? 'text-green-600' : deltaQty < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {deltaQty > 0 ? `+${deltaQty}` : deltaQty}
                </span>
              </div>
              <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-600 text-white text-center">
                <span className="text-[10px] text-indigo-200 block font-bold uppercase tracking-wider">Tồn kho dự kiến mới</span>
                <span className="text-2xl font-black block mt-1 font-mono">{expectedQty}</span>
              </div>
            </div>

            {/* Toggle Modes */}
            <div className="space-y-2">
              <label className="block font-bold text-gray-600">Kiểu điều chỉnh số lượng</label>
              <div className="flex gap-3">
                <label className="flex-1 flex items-center gap-3 p-4 border border-gray-250 rounded-2xl hover:bg-gray-50/50 cursor-pointer transition-all font-semibold">
                  <input
                    type="radio"
                    name="adjMode"
                    checked={adjustmentMode === 'delta'}
                    onChange={() => { setAdjustmentMode('delta'); setInputValue(0); }}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <div>
                    <span className="text-sm block">Cộng / Trừ số dư chênh lệch</span>
                    <span className="text-[10px] text-gray-400 font-medium">Nhập số dương để nhập thêm hàng, số âm để trừ hao hụt</span>
                  </div>
                </label>
                
                <label className="flex-1 flex items-center gap-3 p-4 border border-gray-250 rounded-2xl hover:bg-gray-50/50 cursor-pointer transition-all font-semibold">
                  <input
                    type="radio"
                    name="adjMode"
                    checked={adjustmentMode === 'override'}
                    onChange={() => { setAdjustmentMode('override'); setInputValue(currentQty); }}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <div>
                    <span className="text-sm block">Ghi đè số lượng tuyệt đối</span>
                    <span className="text-[10px] text-gray-400 font-medium">Đặt trực tiếp số lượng tồn thực tế đo đạc được sau kiểm kho</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Input adjustment value */}
            <div className="space-y-2">
              <label className="block font-bold text-gray-600">
                {adjustmentMode === 'override' ? 'Số lượng tồn kho tuyệt đối mới' : 'Biến động chênh lệch hàng (+ / -)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={inputValue}
                  onChange={e => setInputValue(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none font-mono font-bold text-base"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-gray-400 text-xs font-bold font-mono">
                  {adjustmentMode === 'override' ? 'CÁI / HỘP' : inputValue > 0 ? 'NHẬP BÙ' : inputValue < 0 ? 'HAO HỤT' : 'CHƯA THAY ĐỔI'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - 1 col */}
        <div className="space-y-6">
          {/* Card 3: Reasons & Action submit */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              📝 Biên bản đối chiếu / Lý do điều chỉnh
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600">Mô tả chi tiết nguyên nhân <span className="text-rose-500">*</span></label>
              <textarea
                required
                rows={4}
                placeholder="Ví dụ: Kiểm kho tháng phát hiện hụt 2 túi do bao bì rách; Nhập bù thêm PO#4501..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 bg-gray-50/20 resize-none leading-relaxed font-semibold text-gray-700"
              />
            </div>

            <div className="bg-orange-50/40 p-4 border border-orange-100 rounded-2xl flex gap-2.5 items-start">
              <AlertTriangle size={16} className="text-orange-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-500 leading-normal font-medium">
                Mọi hành động điều chỉnh kho của Admin đều được ghi nhật ký vĩnh viễn trên hệ thống kiểm toán để tránh gian lận số liệu hàng hóa chi nhánh.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                🚀 Lưu cân đối kho
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/inventory')}
                className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm rounded-2xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
