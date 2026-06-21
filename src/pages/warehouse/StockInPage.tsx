import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { 
  ChevronLeft, Plus, Trash2, CheckCircle, AlertTriangle, 
  Sparkles, Package, Search, Upload, Download, HelpCircle, 
  Info, ExternalLink, FileSpreadsheet, Barcode, Minus, 
  AlertCircle, ArrowRight, RefreshCw, Grid3X3, Edit 
} from 'lucide-react'
import { PRODUCT_MOCK_LIST, saveProducts } from '@/data/productMockData'
import { CAGE_MOCK_LIST } from '@/data/cageMockData'
import { SUPPLIER_MOCK_LIST } from '@/data/supplierMockData'
import { STOCK_RECEIPTS, saveStockReceipts } from '@/data/stockReceiptMockData'
import { formatPrice } from '@/utils/format'
import type { StockReceiptItem, StockReceiptStatus } from '@/types'

const ADJUSTMENT_REASONS = [
  'Kiểm kê định kỳ phát hiện thừa',
  'Nhà cung cấp giao dư hàng',
  'Tìm thấy sản phẩm thất lạc trong kho',
  'Thu hồi hàng trưng bày/hàng mẫu về kho',
  'Khách trả lại hàng khuyến mãi/quà tặng',
]

export default function CreateStockReceiptPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefix = location.pathname.startsWith('/admin') ? '/admin/inventory' : '/warehouse'

  // Form states
  const [inboundType, setInboundType] = useState<'supplier' | 'transfer' | 'return' | 'adjustment' | 'sample'>('supplier')
  const [supplierId, setSupplierId] = useState('')
  const [poReference, setPoReference] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<StockReceiptItem[]>([])
  const [saveAs, setSaveAs] = useState<'draft' | 'pending_approval'>('pending_approval')
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [tempQty, setTempQty] = useState(1)
  const [qtyChangeReason, setQtyChangeReason] = useState('')

  // Simulated features states
  const [barcodeQuery, setBarcodeQuery] = useState('')
  const [scanSuccess, setScanSuccess] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerCategory, setPickerCategory] = useState('all')
  const [pickerTab, setPickerTab] = useState<'product' | 'cage'>('product')
  
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false)
  const [isExcelImporting, setIsExcelImporting] = useState(false)

  // Quick Create SKU states
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const [qcName, setQcName] = useState('')
  const [qcCategory, setQcCategory] = useState('')
  const [qcBrand, setQcBrand] = useState('')
  const [qcSkuCode, setQcSkuCode] = useState('')
  const [qcVariant, setQcVariant] = useState('')
  const [qcPrice, setQcPrice] = useState(100000)

  // Load all SKU options from Master Product List
  const allSKUs = PRODUCT_MOCK_LIST.flatMap(p =>
    p.skus.map(sku => ({
      skuId: sku.id,
      skuCode: sku.sku,
      productName: p.name,
      variantName: Object.entries(sku.attributes).map(([k, v]) => `${k}: ${v}`).join(' / '),
      fullName: `${p.name} — ${Object.values(sku.attributes).join('/')}`,
      price: sku.price,
      image: p.images[0] || 'https://placehold.co/100x100/cccccc/white?text=No+Image',
      currentStock: sku.stock,
      category: p.category,
      brand: p.brand
    }))
  )

  // Load all cage options
  const allCages = CAGE_MOCK_LIST.filter(c => c.status === 'active').map(cage => ({
    cageId: cage.id,
    cageCode: cage.code || '',
    cageName: cage.name,
    size: cage.size,
    material: cage.material,
    petTypes: cage.petTypes,
    price: cage.price,
    image: cage.image,
    currentStock: cage.stock,
    fullName: `${cage.name} — ${cage.size} / ${cage.material}`,
  }))

  const supplier = SUPPLIER_MOCK_LIST.find(s => s.id === supplierId)
  const isWarehouse = !location.pathname.startsWith('/admin')
  const totalItems = items.reduce((s, i) => s + i.orderedQty, 0)
  const productCount = items.filter(i => i.itemType === 'product').length
  const cageCount = items.filter(i => i.itemType === 'cage').length

  // Handlers
  function addItem(skuId: string) {
    const sku = allSKUs.find(s => s.skuId === skuId)
    if (!sku) return

    // If item already exists, increase quantity
    const existingIdx = items.findIndex(i => i.skuId === skuId)
    if (existingIdx > -1) {
      updateItem(existingIdx, 'receivedQty', items[existingIdx].receivedQty + 1)
      updateItem(existingIdx, 'orderedQty', items[existingIdx].orderedQty + 1)
      showMiniToast(`Đã tăng số lượng SKU: ${sku.skuCode}`)
      return
    }

    const today = new Date()
    const expiry = new Date()
    expiry.setFullYear(today.getFullYear() + 2) // Default 2 years expiry
    const expiryStr = expiry.toISOString().slice(0, 10)
    const randomSuffix = String(Math.floor(Math.random() * 100)).padStart(2, '0')
    const batchNo = `LOT-${today.toISOString().slice(2, 10).replace(/-/g, '')}-${randomSuffix}`

    setItems(prev => [
      ...prev, 
      { 
        skuId: sku.skuId, 
        skuCode: sku.skuCode, 
        productName: `${sku.productName} (${sku.variantName})`, 
        itemType: 'product' as const,
        orderedQty: 10, 
        receivedQty: 10, 
        unitCost: 0,
        batchNumber: batchNo,
        expiryDate: expiryStr
      }
    ])
    showMiniToast(`Đã thêm: ${sku.productName}`)
  }

  function addCageItem(cageId: string) {
    const cage = allCages.find(c => c.cageId === cageId)
    if (!cage) return

    const existingIdx = items.findIndex(i => i.skuId === cageId && i.itemType === 'cage')
    if (existingIdx > -1) {
      updateItem(existingIdx, 'receivedQty', items[existingIdx].receivedQty + 1)
      updateItem(existingIdx, 'orderedQty', items[existingIdx].orderedQty + 1)
      showMiniToast(`Đã tăng số lượng chuồng: ${cage.cageCode}`)
      return
    }

    setItems(prev => [
      ...prev,
      {
        skuId: cage.cageId,
        skuCode: cage.cageCode,
        productName: `${cage.cageName} (${cage.size})`,
        itemType: 'cage' as const,
        orderedQty: 1,
        receivedQty: 1,
        unitCost: 0,
      }
    ])
    showMiniToast(`Đã thêm chuồng: ${cage.cageName}`)
  }

  function updateItem(idx: number, field: string, value: any) {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      return { ...item, [field]: value }
    }))
  }

  function removeItem(idx: number) {
    const removedItem = items[idx]
    setItems(prev => prev.filter((_, i) => i !== idx))
    if (removedItem) {
      showMiniToast(`Đã xóa SKU: ${removedItem.skuCode}`)
    }
  }

  // Quick action: Match Received Qty with Ordered Qty for all
  function matchAllQuantities() {
    setItems(prev => prev.map(item => ({ ...item, receivedQty: item.orderedQty })))
    showMiniToast('Đã khớp toàn bộ số lượng thực nhận = số lượng đặt')
  }

  // Barcode Scanner Simulation
  function handleBarcodeScan(code: string) {
    const sku = allSKUs.find(s => s.skuCode.toLowerCase() === code.trim().toLowerCase())
    if (sku) {
      addItem(sku.skuId)
      setBarcodeQuery('')
      setScanSuccess(true)
      setTimeout(() => setScanSuccess(false), 800)
    } else {
      setError(`Không tìm thấy SKU nào khớp với mã vạch: "${code}"`)
    }
  }

  // Excel Mock Import Actions
  function runExcelImport() {
    setIsExcelImporting(true)
    setError('')
    setTimeout(() => {
      // Add multiple sample items at once
      const sampleSKUs = [
        { id: 'P001-S3', qty: 30, costRate: 0.65 },
        { id: 'P002-S2', qty: 50, costRate: 0.65 },
        { id: 'P004-S2', qty: 100, costRate: 0.65 },
      ]

      const today = new Date()
      const expiry = new Date()
      expiry.setFullYear(today.getFullYear() + 2)
      const expiryStr = expiry.toISOString().slice(0, 10)

      const newItems: StockReceiptItem[] = []
      sampleSKUs.forEach((sample, idx) => {
        const sku = allSKUs.find(s => s.skuId === sample.id)
        if (sku) {
          newItems.push({
            skuId: sku.skuId,
            skuCode: sku.skuCode,
            productName: `${sku.productName} (${sku.variantName})`,
            itemType: 'product' as const,
            orderedQty: sample.qty,
            receivedQty: sample.qty - (sample.id === 'P002-S2' ? 2 : 0),
            unitCost: 0,
            batchNumber: `LOT-EXCEL-0${idx + 1}`,
            expiryDate: expiryStr
          })
        }
      })

      setItems(newItems)
      setIsExcelImporting(false)
      setIsExcelModalOpen(false)
      setToast('Nhập danh mục SKU từ Excel giả lập thành công!')
      setTimeout(() => setToast(''), 3000)
    }, 1200)
  }

  function showMiniToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validation based on type
    if (inboundType === 'supplier' && !supplierId) { setError('Vui lòng chọn nhà cung cấp'); return }
    if (inboundType === 'transfer' && (!supplierId || !referenceId)) { setError('Vui lòng nhập đầy đủ Chi nhánh gửi và Mã phiếu chuyển kho'); return }
    if (inboundType === 'return' && !referenceId) { setError('Vui lòng nhập Mã hóa đơn bán lẻ'); return }
    if (inboundType === 'sample' && !supplierId) { setError('Vui lòng chọn Nhà cung cấp tặng hàng'); return }
    if (inboundType === 'adjustment' && (!referenceId || !poReference)) { setError('Vui lòng nhập Mã phiếu kiểm kê và Lý do điều chỉnh'); return }

    if (items.length === 0) { setError('Vui lòng thêm ít nhất 1 SKU hàng hóa'); return }
    if (items.some(i => !i.skuId)) { setError('Có dòng hàng chưa chọn SKU'); return }
    if (items.some(i => i.orderedQty < 1 || i.receivedQty < 0)) { setError('Số lượng nhập không hợp lệ'); return }

    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const newId = `GRN-${dateStr}-${String(STOCK_RECEIPTS.length + 1).padStart(3, '0')}`

    const getInboundLabel = () => {
      if (inboundType === 'supplier') return supplier?.name || ''
      if (inboundType === 'transfer') return `Nhận từ: ${supplierId === 'WH-MAIN' ? 'Kho trung tâm' : supplierId}`
      if (inboundType === 'return') return `Trả hàng: ${supplierId || 'Khách lẻ'}`
      if (inboundType === 'sample') return `Hàng tặng: ${supplier?.name || ''}`
      if (inboundType === 'adjustment') return `Cân đối kiểm kho`
      return 'Nhập kho khác'
    }

    const receipt = {
      id: newId,
      supplierId: inboundType === 'supplier' || inboundType === 'sample' ? supplierId : 'internal',
      supplierName: getInboundLabel(),
      warehouseId: 'warehouse',
      poReference: inboundType === 'adjustment' ? poReference : undefined,
      inboundType,
      referenceId: inboundType !== 'supplier' ? referenceId : undefined,
      items: items.map(i => ({ ...i, unitCost: 0 })),
      totalValue: 0,
      status: (isWarehouse ? 'pending_approval' : saveAs) as StockReceiptStatus,
      createdBy: 'Bùi Văn Khánh',
      createdAt: today.toISOString().replace('T', ' ').slice(0, 16),
      note,
    }

    const next = [receipt, ...STOCK_RECEIPTS]
    saveStockReceipts(next)

    setToast(`Gửi yêu cầu nhập kho ${newId} thành công!`)
    setTimeout(() => navigate(`${prefix}/receipts`), 1500)
  }

  function handleQuickCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!qcName.trim()) { setError('Vui lòng nhập tên sản phẩm'); return }
    if (!qcCategory) { setError('Vui lòng chọn danh mục'); return }
    if (!qcSkuCode.trim()) { setError('Vui lòng nhập mã SKU/Mã vạch'); return }

    const skuCodeClean = qcSkuCode.trim().toUpperCase()
    
    // Check if SKU already exists
    if (allSKUs.some(s => s.skuCode.toUpperCase() === skuCodeClean)) {
      setError(`Mã SKU "${skuCodeClean}" đã tồn tại trong danh mục hệ thống.`);
      return
    }

    const newProductId = `P-QC-${Date.now()}`
    const newSkuId = `SKU-QC-${Date.now()}`
    const variantLabel = qcVariant.trim() || 'Mặc định'

    const newProduct = {
      id: newProductId,
      name: qcName.trim(),
      category: qcCategory,
      brand: qcBrand.trim() || 'OEM',
      description: 'Sản phẩm được tạo nhanh tại màn hình Nhập kho.',
      status: 'active' as const,
      attributes: [{ name: 'Biến thể', values: [variantLabel] }],
      skus: [
        {
          id: newSkuId,
          productId: newProductId,
          sku: skuCodeClean,
          attributes: { 'Biến thể': variantLabel },
          price: qcPrice,
          stock: 0,
          image: 'https://placehold.co/100x100/3B82F6/white?text=' + encodeURIComponent(qcName.trim().substring(0, 10)),
          barcode: skuCodeClean,
        }
      ],
      basePrice: qcPrice,
      rating: 5.0,
      reviewCount: 0,
      images: ['https://placehold.co/400x400/3B82F6/white?text=' + encodeURIComponent(qcName.trim().substring(0, 10))],
      tags: ['hàng mới', 'thêm nhanh'],
      createdAt: new Date().toISOString().slice(0, 10),
    }

    const today = new Date()
    const expiry = new Date()
    expiry.setFullYear(today.getFullYear() + 2)
    const expiryStr = expiry.toISOString().slice(0, 10)
    const randomSuffix = String(Math.floor(Math.random() * 100)).padStart(2, '0')
    const batchNo = `LOT-${today.toISOString().slice(2, 10).replace(/-/g, '')}-${randomSuffix}`

    // Save product to database
    saveProducts([...PRODUCT_MOCK_LIST, newProduct])

    setItems(prev => [
      ...prev,
      {
        skuId: newSkuId,
        skuCode: skuCodeClean,
        productName: `${qcName.trim()} (${variantLabel})`,
        itemType: 'product' as const,
        orderedQty: 10,
        receivedQty: 10,
        unitCost: 0,
        batchNumber: batchNo,
        expiryDate: expiryStr
      }
    ])

    // Reset fields
    setQcName('')
    setQcCategory('')
    setQcBrand('')
    setQcSkuCode('')
    setQcVariant('')
    setQcPrice(100000)

    setIsQuickCreateOpen(false)
    showMiniToast(`Đã thêm nhanh sản phẩm & SKU: ${skuCodeClean} vào phiếu!`)
  }

  const uniqueCategories = ['all', ...Array.from(new Set(PRODUCT_MOCK_LIST.map(p => p.category)))]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn relative">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-gray-900 to-slate-800 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideIn border border-slate-700">
          <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
            <CheckCircle size={18} />
          </div>
          <div>
            <span className="font-semibold text-sm block">Thông báo</span>
            <span className="text-xs text-gray-300">{toast}</span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start gap-3 text-sm shadow-sm">
          <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-rose-900">Đã xảy ra lỗi</span>
            <span className="text-xs text-rose-700">{error}</span>
          </div>
          <button type="button" onClick={() => setError('')} className="ml-auto text-rose-400 hover:text-rose-600 font-bold text-base">&times;</button>
        </div>
      )}

      {/* Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => navigate(`${prefix}/receipts`)} 
            className="p-3 border border-gray-200 bg-white hover:bg-gray-50 rounded-2xl transition-all shadow-sm group"
          >
            <ChevronLeft size={18} className="text-gray-600 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="text-[10px] text-primary-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>Kho hàng</span>
              <ArrowRight size={10} />
              <span>Phiếu nhập</span>
              <ArrowRight size={10} />
              <span className="text-gray-400">Tạo mới</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">{isWarehouse ? 'Gửi Yêu Cầu Nhập Kho' : 'Tạo Phiếu Nhập Kho (GRN)'}</h1>
          </div>
        </div>

        {/* Form Wizard Status Tracker */}
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl text-xs self-start md:self-auto shadow-inner">
          <span className="px-3 py-1.5 bg-white text-primary-700 font-bold rounded-xl shadow-sm flex items-center gap-1.5">
            <span className="w-5 h-5 bg-primary-100 text-primary-800 font-black rounded-full flex items-center justify-center text-[10px]">1</span>
            Soạn thảo
          </span>
          <span className="text-gray-400 font-bold px-1">/</span>
          <span className="px-3 py-1.5 text-gray-500 font-medium flex items-center gap-1.5">
            <span className="w-5 h-5 bg-gray-200 text-gray-600 font-black rounded-full flex items-center justify-center text-[10px]">2</span>
            Gửi yêu cầu
          </span>
          <span className="text-gray-400 font-bold px-1">/</span>
          <span className="px-3 py-1.5 text-gray-500 font-medium flex items-center gap-1.5">
            <span className="w-5 h-5 bg-gray-200 text-gray-600 font-black rounded-full flex items-center justify-center text-[10px]">3</span>
            Admin duyệt giá
          </span>
          <span className="text-gray-400 font-bold px-1">/</span>
          <span className="px-3 py-1.5 text-gray-500 font-medium flex items-center gap-1.5">
            <span className="w-5 h-5 bg-gray-200 text-gray-600 font-black rounded-full flex items-center justify-center text-[10px]">4</span>
            Nhập kho
          </span>
        </div>
      </div>

      {/* SKU Source Help Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex gap-3.5 shadow-sm">
        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 self-start">
          <Info size={20} className="shrink-0" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
            Nguồn dữ liệu mã SKU hàng hóa lấy từ đâu?
          </h4>
          <p className="text-blue-700 leading-relaxed">
            Danh sách các SKU (biến thể sản phẩm) được liên kết đồng bộ trực tiếp từ <strong>Danh mục sản phẩm chính (Master Catalog)</strong>. 
            Mỗi mặt hàng khi nhập kho sẽ được đối chiếu chính xác theo mã SKU được cài đặt trước đó để đảm bảo đồng nhất số liệu bán hàng & tồn kho.
          </p>
          <div className="pt-1.5 flex items-center gap-2">
            <span className="text-[10px] text-blue-500 font-medium">Bạn cần nhập sản phẩm mới chưa có trong hệ thống?</span>
            <Link 
              to="/admin/products" 
              target="_blank" 
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 underline underline-offset-2 hover:no-underline"
            >
              <span>Đi đến Quản lý sản phẩm</span>
              <ExternalLink size={11} />
            </Link>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main form (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Section 1: General Info */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2.5">
                <span className="p-1 bg-primary-50 rounded-lg text-primary-600"><Package size={16} /></span>
                1. Thông tin nguồn hàng & Loại nhập kho
              </h3>
              <span className="text-xs text-gray-400 font-medium">Bắt buộc nhập</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="form-label font-bold text-gray-700 text-xs">Loại nhập kho <span className="text-rose-500">*</span></label>
                <select 
                  className="form-input text-xs font-bold text-primary-700 bg-primary-50/20 border-primary-200" 
                  value={inboundType} 
                  onChange={e => {
                    const type = e.target.value as any
                    setInboundType(type)
                    setSupplierId('')
                    setReferenceId('')
                    if (type === 'adjustment') {
                      setPoReference(ADJUSTMENT_REASONS[0])
                    } else {
                      setPoReference('')
                    }
                    
                    // Reset or suggest cost based on type
                    if (type === 'sample') {
                      setItems(prev => prev.map(item => ({ ...item, unitCost: 0 })))
                    } else {
                      setItems(prev => prev.map(item => {
                        const sku = allSKUs.find(s => s.skuId === item.skuId)
                        return { ...item, unitCost: sku ? Math.round(sku.price * 0.65) : item.unitCost }
                      }))
                    }
                  }}
                >
                  <option value="supplier">📦 Mua hàng từ Nhà cung cấp</option>
                  <option value="transfer">🔄 Nhận chuyển kho nội bộ</option>
                  <option value="return">🛍️ Nhập hàng khách trả lại</option>
                  <option value="sample">🎁 Nhập hàng mẫu / hàng tặng kèm</option>
                  <option value="adjustment">⚖️ Nhập cân đối kiểm kê thừa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Supplier for 'supplier' */}
              {inboundType === 'supplier' && (
                <div className="md:col-span-2">
                  <label className="form-label font-bold text-gray-700 text-xs">Nhà cung cấp <span className="text-rose-500">*</span></label>
                  <select 
                    className="form-input text-xs" 
                    value={supplierId} 
                    onChange={e => setSupplierId(e.target.value)}
                  >
                    <option value="">-- Chọn nhà cung cấp từ hệ thống --</option>
                    {SUPPLIER_MOCK_LIST.filter(s => s.status === 'active').map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.contactPerson})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Transfer Inbound */}
              {inboundType === 'transfer' && (
                <>
                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Kho hàng / Chi nhánh gửi hàng <span className="text-rose-500">*</span></label>
                    <select 
                      className="form-input text-xs" 
                      value={supplierId} 
                      onChange={e => setSupplierId(e.target.value)}
                    >
                      <option value="">-- Chọn chi nhánh gửi --</option>
                      <option value="WH-MAIN">Kho trung tâm PetCare</option>
                      <option value="SH-Q1">Cửa hàng Quận 1 - Nguyễn Thị Minh Khai</option>
                      <option value="SH-Q7">Cửa hàng Quận 7 - Huỳnh Tấn Phát</option>
                      <option value="SH-BT">Cửa hàng Bình Thạnh - Điện Biên Phủ</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Mã phiếu chuyển kho liên kết <span className="text-rose-500">*</span></label>
                    <input 
                      className="form-input text-xs placeholder-gray-400 font-mono" 
                      placeholder="VD: TRF-20260616-042" 
                      value={referenceId} 
                      onChange={e => setReferenceId(e.target.value)} 
                    />
                  </div>
                </>
              )}

              {/* Return Inbound */}
              {inboundType === 'return' && (
                <>
                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Hóa đơn bán lẻ liên kết <span className="text-rose-500">*</span></label>
                    <input 
                      className="form-input text-xs placeholder-gray-400 font-mono" 
                      placeholder="VD: INV-20260612-981" 
                      value={referenceId} 
                      onChange={e => setReferenceId(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Tên khách hàng / Số điện thoại trả hàng</label>
                    <input 
                      className="form-input text-xs placeholder-gray-400" 
                      placeholder="VD: Nguyễn Văn A - 0901234567" 
                      value={supplierId} 
                      onChange={e => setSupplierId(e.target.value)} 
                    />
                  </div>
                </>
              )}

              {/* Sample Inbound */}
              {inboundType === 'sample' && (
                <>
                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Nhà cung cấp mẫu / Đối tác <span className="text-rose-500">*</span></label>
                    <select 
                      className="form-input text-xs" 
                      value={supplierId} 
                      onChange={e => setSupplierId(e.target.value)}
                    >
                      <option value="">-- Chọn đối tác tặng hàng --</option>
                      {SUPPLIER_MOCK_LIST.filter(s => s.status === 'active').map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Chương trình khuyến mãi / Mã quà tặng</label>
                    <input 
                      className="form-input text-xs placeholder-gray-400" 
                      placeholder="VD: PROMO-FREE-GIFT-JUN" 
                      value={referenceId} 
                      onChange={e => setReferenceId(e.target.value)} 
                    />
                  </div>
                </>
              )}

              {/* Adjustment Inbound */}
              {inboundType === 'adjustment' && (
                <>
                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Mã phiếu kiểm kê liên kết <span className="text-rose-500">*</span></label>
                    <input 
                      className="form-input text-xs placeholder-gray-400 font-mono" 
                      placeholder="VD: AUD-20260615-001" 
                      value={referenceId} 
                      onChange={e => setReferenceId(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Lý do kiểm thừa <span className="text-rose-500">*</span></label>
                    <select 
                      className="form-input text-xs mb-2" 
                      value={ADJUSTMENT_REASONS.includes(poReference) ? poReference : (poReference ? 'khác' : ADJUSTMENT_REASONS[0])}
                      onChange={e => {
                        const val = e.target.value
                        if (val === 'khác') {
                          setPoReference('')
                        } else {
                          setPoReference(val)
                        }
                      }}
                    >
                      {ADJUSTMENT_REASONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                      <option value="khác">Khác (Tự nhập lý do...)</option>
                    </select>
                    
                    {(!ADJUSTMENT_REASONS.includes(poReference) || poReference === '') && (
                      <input 
                        className="form-input text-xs placeholder-gray-400 animate-fadeIn" 
                        placeholder="Nhập lý do kiểm thừa chi tiết..." 
                        value={poReference} 
                        onChange={e => setPoReference(e.target.value)} 
                      />
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Supplier Details Card (Only show if supplierId exists and it is supplier or sample mode) */}
            {(inboundType === 'supplier' || inboundType === 'sample') && supplier && (
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn mt-2">
                <div>
                  <span className="text-gray-400 block uppercase font-bold text-[9px] tracking-wider mb-0.5">Đại diện liên hệ</span>
                  <span className="font-bold text-gray-800">{supplier.contactPerson}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase font-bold text-[9px] tracking-wider mb-0.5">Số điện thoại / Email</span>
                  <span className="font-medium text-gray-800">{supplier.phone} · <span className="text-primary-600 font-mono">{supplier.email}</span></span>
                </div>
                <div className="sm:col-span-1">
                  <span className="text-gray-400 block uppercase font-bold text-[9px] tracking-wider mb-0.5">Địa chỉ kho NCC</span>
                  <span className="font-medium text-gray-700 truncate block" title={supplier.address}>{supplier.address}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Items Details */}
          <div className="card overflow-hidden">
            <div className="card-header p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="p-1 bg-amber-50 rounded-lg text-amber-600">📦</span>
                  2. Danh sách hàng hóa & chuồng nhập kho ({items.length} mục{cageCount > 0 ? ` • ${productCount} SP, ${cageCount} Chuồng` : ''})
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Thêm mặt hàng và kiểm đếm số lượng thực tế nhận được.</p>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <button 
                  type="button" 
                  onClick={() => setIsPickerOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-md shadow-primary-600/10 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Search size={13} />
                  Tìm & Chọn SKU
                </button>

                <button 
                  type="button" 
                  onClick={() => {
                    setIsQuickCreateOpen(true)
                    setError('')
                  }}
                  className="px-3.5 py-2 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  Thêm nhanh SKU
                </button>

                <button 
                  type="button" 
                  onClick={() => setIsExcelModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileSpreadsheet size={13} />
                  Nhập Excel
                </button>

                {items.length > 0 && (
                  <button 
                    type="button" 
                    onClick={matchAllQuantities}
                    className="px-3.5 py-2 text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Sao chép toàn bộ số lượng đặt sang thực nhận"
                  >
                    Khớp nhanh SL nhận
                  </button>
                )}
              </div>
            </div>

            {/* Quick Barcode Scanner Area */}
            <div className="bg-slate-50/80 px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Barcode size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${scanSuccess ? 'text-emerald-500 animate-ping' : 'text-gray-400'}`} />
                  <input 
                    className={`form-input pl-9 text-xs font-mono py-1.5 ${scanSuccess ? 'border-emerald-400 bg-emerald-50/50' : 'border-gray-300'}`} 
                    placeholder="Quét mã vạch hoặc gõ mã SKU rồi nhấn Enter..." 
                    value={barcodeQuery}
                    onChange={e => setBarcodeQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (barcodeQuery.trim()) handleBarcodeScan(barcodeQuery)
                      }
                    }}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    if (barcodeQuery.trim()) handleBarcodeScan(barcodeQuery)
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Quét nhanh
                </button>
              </div>

              {/* Sample barcode list for testing */}
              <div className="text-[10px] text-gray-500 flex items-center gap-1.5 flex-wrap">
                <span className="font-bold flex items-center gap-1 text-slate-600"><Sparkles size={11} className="text-amber-500" /> Mã quét mẫu (Click):</span>
                {['P001-2KG-GA', 'P002-3KG', 'P004-5L-KM'].map(code => (
                  <button 
                    key={code}
                    type="button"
                    onClick={() => handleBarcodeScan(code)}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-gray-200 rounded-lg font-mono text-slate-700 active:scale-95 transition-all cursor-pointer"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Inbound Items Table */}
            {items.length === 0 ? (
              <div className="p-12 text-center bg-white">
                <div className="text-4xl mb-3 animate-bounce">📦</div>
                <div className="text-sm text-gray-500 font-bold">Chưa có hàng hóa nào được thêm</div>
                <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                  Vui lòng bấm nút <strong>"Tìm & Chọn SKU"</strong> hoặc sử dụng ô quét mã vạch ở trên để thêm hàng hóa vào danh sách nhập kho này.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-200/80 text-[11px] font-bold">
                      <th className="table-th text-slate-500 py-3.5 pl-5 w-16">Loại</th>
                      <th className="table-th text-slate-500 py-3.5 w-60">Thông tin SKU / Sản phẩm</th>
                      <th className="table-th text-slate-500 py-3.5 w-24">Tồn kho</th>
                      <th className="table-th text-slate-500 py-3.5 w-28">Số lượng đặt</th>
                      <th className="table-th py-3.5 pr-5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, idx) => {
                      const meta = item.itemType === 'product' ? allSKUs.find(s => s.skuId === item.skuId) : null
                      const cageMeta = item.itemType === 'cage' ? allCages.find(c => c.cageId === item.skuId) : null
                      const itemImage = meta?.image || cageMeta?.image || 'https://placehold.co/100x100/cccccc/white?text=No+Image'
                      const currentStock = meta?.currentStock || cageMeta?.currentStock || 0

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          {/* Item Type Badge */}
                          <td className="py-4 pl-5 align-top">
                            <div className="pt-1.5">
                              {item.itemType === 'cage' ? (
                                <span className="px-2 py-1 bg-violet-50 text-violet-700 border border-violet-200 text-[9px] font-bold rounded-lg flex items-center gap-1 w-fit">
                                  <Grid3X3 size={10} />
                                  Chuồng
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold rounded-lg flex items-center gap-1 w-fit">
                                  <Package size={10} />
                                  Sản phẩm
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Item Meta */}
                          <td className="py-4 align-top">
                            <div className="flex items-start gap-3">
                              <img 
                                src={itemImage} 
                                alt={item.productName} 
                                className="w-12 h-12 rounded-xl object-cover border border-gray-200/80 bg-white" 
                              />
                              <div className="space-y-1">
                                <div className="text-xs font-bold text-gray-900 leading-snug">{item.productName}</div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] font-bold rounded-md border border-slate-200">
                                    {item.skuCode}
                                  </span>
                                  {meta?.brand && (
                                    <span className="text-[9px] font-bold text-primary-600 uppercase tracking-wider">{meta.brand}</span>
                                  )}
                                  {meta?.category && <span className="text-[10px] text-gray-400">· {meta.category}</span>}
                                  {cageMeta && <span className="text-[10px] text-gray-400">· {cageMeta.size} · {cageMeta.material}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Current stock */}
                          <td className="py-4 align-top">
                            <div className="pt-1.5">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                currentStock <= 5 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                Tồn: {currentStock}
                              </span>
                            </div>
                          </td>

                          {/* Quantity (orderedQty) */}
                          <td className="py-4 align-top">
                            <div className="pt-1.5 flex items-center gap-1.5">
                              <span className="font-bold text-gray-800 text-sm">{item.orderedQty}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItemIndex(idx)
                                  setTempQty(item.orderedQty)
                                  setQtyChangeReason(item.note || '')
                                }}
                                className="p-1 text-primary-600 hover:bg-primary-50 rounded border border-transparent hover:border-primary-200 transition-all cursor-pointer"
                                title="Sửa số lượng"
                              >
                                <Edit size={12} />
                              </button>
                            </div>
                            {item.note && (
                              <div className="text-[10px] text-amber-600 font-medium mt-1 leading-tight">
                                Lý do: {item.note}
                              </div>
                            )}
                          </td>

                          {/* Delete Action */}
                          <td className="py-4 pr-5 text-right align-top">
                            <button 
                              type="button" 
                              onClick={() => removeItem(idx)} 
                              className="p-1.5 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                              title="Xóa mặt hàng này"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-200 bg-slate-50/50">
                    <tr>
                      <td className="py-4 pl-5 font-bold text-slate-700" colSpan={3}>
                        TỔNG CỘNG HÀNG NHẬP
                      </td>
                      <td className="py-4 text-sm font-black text-primary-600">
                        {totalItems} sp
                      </td>
                      <td className="py-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (1 col) */}
        <div className="space-y-6">
          
          {/* Sidebar block 1: Notes & Submit option */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span>📝</span> Ghi chú & Trạng thái lưu
            </h3>
            
            <div>
              <label className="form-label font-bold text-gray-700 text-xs">Ghi chú nhập hàng</label>
              <textarea 
                rows={4} 
                className="form-input resize-none text-xs rounded-xl border-gray-300 placeholder-gray-400" 
                placeholder="VD: Hàng về lúc 9h sáng, có 1 số SKU bị móp vỏ nhẹ nhưng chất lượng hạt bên trong đảm bảo..."
                value={note} 
                onChange={e => setNote(e.target.value)} 
              />
            </div>

            {isWarehouse ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle size={13} className="text-amber-600" />
                  Lưu ý về luồng xử lý
                </div>
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  Yêu cầu nhập kho sẽ được gửi cho <strong>Admin</strong> để thương lượng giá với NCC và duyệt.
                  Bạn <strong>không cần nhập giá</strong> — Admin sẽ xử lý phần này.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <label className="form-label font-bold text-gray-700 text-xs">Lưu phiếu dưới dạng</label>
                
                <div 
                  onClick={() => setSaveAs('pending_approval')}
                  className={`p-3 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-3 ${
                    saveAs === 'pending_approval' 
                      ? 'border-primary-500 bg-primary-50/30' 
                      : 'border-gray-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="saveAs" 
                    checked={saveAs === 'pending_approval'} 
                    onChange={() => {}}
                    className="w-4 h-4 text-primary-600 mt-0.5 cursor-pointer" 
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-800">Tạo & Gửi duyệt ngay</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 leading-snug">Chuyển lên trạng thái "Chờ duyệt".</div>
                  </div>
                </div>

                <div 
                  onClick={() => setSaveAs('draft')}
                  className={`p-3 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-3 ${
                    saveAs === 'draft' 
                      ? 'border-slate-800 bg-slate-50' 
                      : 'border-gray-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="saveAs" 
                    checked={saveAs === 'draft'} 
                    onChange={() => {}}
                    className="w-4 h-4 text-slate-800 mt-0.5 cursor-pointer" 
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-800">Lưu dưới dạng Nháp</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 leading-snug">Lưu lại để cập nhật thêm thông tin.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar block 2: Summary Card */}
          <div className="card p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-4 shadow-xl border border-slate-700">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-400">Thông tin tổng hợp phiếu</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Nhà cung cấp:</span>
                <span className="font-bold text-right max-w-40 truncate" title={supplier?.name || 'Chưa chọn'}>
                  {supplier?.name || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sản phẩm:</span>
                <span className="font-extrabold text-slate-200">{productCount} SKU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chuồng:</span>
                <span className="font-extrabold text-violet-300">{cageCount} mục</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tổng số lượng:</span>
                <span className="font-extrabold text-slate-200">{totalItems} sp</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Người lập phiếu:</span>
                <span className="font-medium text-slate-300">Bùi Văn Khánh</span>
              </div>
            </div>

            {isWarehouse && (
              <div className="pt-2 border-t border-slate-700">
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">ℹ️ Giá nhập sẽ do Admin duyệt</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                  Admin sẽ thương lượng với NCC để nhập giá dự kiến và giá thực tế sau khi hàng về kho.
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Actions Buttons */}
          <div className="space-y-3">
            <button 
              type="submit" 
              disabled={items.length === 0}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary-600/20 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
            >
              🚀 {isWarehouse ? 'Gửi Yêu Cầu Nhập Kho' : (saveAs === 'draft' ? 'Lưu nháp phiếu nhập' : 'Tạo & Gửi duyệt (GRN)')}
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate(`${prefix}/receipts`)}
              className="w-full py-3.5 bg-white border border-gray-200 text-gray-600 hover:bg-slate-50 hover:text-gray-800 font-bold text-xs rounded-2xl transition-all cursor-pointer text-center"
            >
              Hủy bỏ soạn thảo
            </button>
          </div>
        </div>
      </form>

      {/* Advanced SKU Picker Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 animate-scaleIn">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>🔍</span> Tìm & Chọn Hàng Hóa / Chuồng
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Click để thêm sản phẩm hoặc chuồng vào phiếu nhập kho.
                </p>
              </div>
              <button 
                onClick={() => setIsPickerOpen(false)} 
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-lg text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-3 pb-0 bg-white border-b border-gray-100 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPickerTab('product')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl border border-b-0 transition-all ${
                  pickerTab === 'product'
                    ? 'bg-white text-primary-700 border-gray-200'
                    : 'bg-gray-50 text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <Package size={12} className="inline mr-1.5 -mt-0.5" />
                Sản phẩm ({allSKUs.length})
              </button>
              <button
                type="button"
                onClick={() => setPickerTab('cage')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl border border-b-0 transition-all ${
                  pickerTab === 'cage'
                    ? 'bg-white text-violet-700 border-gray-200'
                    : 'bg-gray-50 text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <Grid3X3 size={12} className="inline mr-1.5 -mt-0.5" />
                Chuồng ({allCages.length})
              </button>
            </div>

            {/* Filters Area */}
            <div className="p-4 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3 bg-white">
              <div className="relative md:col-span-2">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  className="form-input pl-9.5 text-xs py-2" 
                  placeholder={pickerTab === 'product' ? 'Nhập tên sản phẩm, thương hiệu hoặc mã SKU...' : 'Nhập tên hoặc mã chuồng...'}
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                />
              </div>
              {pickerTab === 'product' && (
                <div>
                  <select 
                    className="form-input text-xs py-2" 
                    value={pickerCategory} 
                    onChange={e => setPickerCategory(e.target.value)}
                  >
                    <option value="all">-- Tất cả danh mục --</option>
                    {uniqueCategories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Results List */}
            <div className="overflow-y-auto p-5 space-y-3 flex-1 bg-slate-50/50">
              {pickerTab === 'product' ? (
                <>
                  {allSKUs
                    .filter(sku => {
                      const searchLower = pickerSearch.toLowerCase()
                      const matchesSearch = sku.fullName.toLowerCase().includes(searchLower) || 
                                            sku.skuCode.toLowerCase().includes(searchLower) ||
                                            (sku.brand && sku.brand.toLowerCase().includes(searchLower))
                      const matchesCategory = pickerCategory === 'all' || sku.category === pickerCategory
                      return matchesSearch && matchesCategory
                    })
                    .map(sku => {
                      const cartItem = items.find(i => i.skuId === sku.skuId && i.itemType === 'product')
                      const isSelected = !!cartItem

                      return (
                        <div 
                          key={sku.skuId}
                          className={`p-3.5 bg-white border rounded-2xl flex items-center justify-between gap-4 transition-all ${
                            isSelected 
                              ? 'border-primary-400 shadow-sm bg-primary-50/5' 
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img src={sku.image} alt={sku.productName} className="w-12 h-12 rounded-xl object-cover border border-gray-100 bg-white" />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-800 leading-snug truncate">{sku.productName}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-2">
                                <span className="font-mono font-bold text-gray-500">{sku.skuCode}</span>
                                <span>·</span>
                                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-md font-bold">{sku.variantName}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${sku.currentStock <= 5 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-500'}`}>
                                  Kho: {sku.currentStock} sp
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {isSelected ? (
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => { const idx = items.findIndex(i => i.skuId === sku.skuId && i.itemType === 'product'); if (cartItem!.receivedQty <= 1) { removeItem(idx) } else { updateItem(idx, 'receivedQty', cartItem!.receivedQty - 1); updateItem(idx, 'orderedQty', cartItem!.orderedQty - 1) } }} className="w-7 h-7 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg flex items-center justify-center active:scale-90 transition-all font-bold">-</button>
                                <span className="w-8 text-center text-xs font-black text-slate-800">{cartItem!.orderedQty}</span>
                                <button type="button" onClick={() => { const idx = items.findIndex(i => i.skuId === sku.skuId && i.itemType === 'product'); updateItem(idx, 'receivedQty', cartItem!.receivedQty + 1); updateItem(idx, 'orderedQty', cartItem!.orderedQty + 1) }} className="w-7 h-7 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg flex items-center justify-center active:scale-90 transition-all font-bold">+</button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => addItem(sku.skuId)} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">+ Chọn</button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  {allSKUs.filter(sku => { const s = pickerSearch.toLowerCase(); return (sku.fullName.toLowerCase().includes(s) || sku.skuCode.toLowerCase().includes(s)) && (pickerCategory === 'all' || sku.category === pickerCategory) }).length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-xs">Không tìm thấy sản phẩm nào</div>
                  )}
                </>
              ) : (
                <>
                  {allCages
                    .filter(cage => {
                      const s = pickerSearch.toLowerCase()
                      return cage.fullName.toLowerCase().includes(s) || cage.cageCode.toLowerCase().includes(s)
                    })
                    .map(cage => {
                      const cartItem = items.find(i => i.skuId === cage.cageId && i.itemType === 'cage')
                      const isSelected = !!cartItem

                      return (
                        <div 
                          key={cage.cageId}
                          className={`p-3.5 bg-white border rounded-2xl flex items-center justify-between gap-4 transition-all ${
                            isSelected 
                              ? 'border-violet-400 shadow-sm bg-violet-50/5' 
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img src={cage.image} alt={cage.cageName} className="w-12 h-12 rounded-xl object-cover border border-gray-100 bg-white" />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-800 leading-snug truncate">{cage.cageName}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-2">
                                <span className="font-mono font-bold text-gray-500">{cage.cageCode}</span>
                                <span>·</span>
                                <span className="px-1.5 py-0.2 bg-violet-50 text-violet-600 rounded-md font-bold">Size {cage.size}</span>
                                <span>·</span>
                                <span className="text-gray-500">{cage.material}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${cage.currentStock <= 5 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-500'}`}>
                                  Kho: {cage.currentStock}
                                </span>
                                <span className="text-[9px] font-bold text-violet-600 capitalize">
                                  {cage.petTypes?.map(pt => {
                                    const petNames: Record<string, string> = { dog: 'Chó', cat: 'Mèo', bird: 'Chim', rabbit: 'Thỏ', other: 'Khác' }
                                    return petNames[pt] || pt
                                  }).join(', ')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {isSelected ? (
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => { const idx = items.findIndex(i => i.skuId === cage.cageId && i.itemType === 'cage'); if (cartItem!.receivedQty <= 1) { removeItem(idx) } else { updateItem(idx, 'receivedQty', cartItem!.receivedQty - 1); updateItem(idx, 'orderedQty', cartItem!.orderedQty - 1) } }} className="w-7 h-7 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg flex items-center justify-center active:scale-90 transition-all font-bold">-</button>
                                <span className="w-8 text-center text-xs font-black text-slate-800">{cartItem!.orderedQty}</span>
                                <button type="button" onClick={() => { const idx = items.findIndex(i => i.skuId === cage.cageId && i.itemType === 'cage'); updateItem(idx, 'receivedQty', cartItem!.receivedQty + 1); updateItem(idx, 'orderedQty', cartItem!.orderedQty + 1) }} className="w-7 h-7 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg flex items-center justify-center active:scale-90 transition-all font-bold">+</button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => addCageItem(cage.cageId)} className="px-4 py-1.5 bg-violet-700 hover:bg-violet-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">+ Thêm chuồng</button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  {allCages.filter(c => { const s = pickerSearch.toLowerCase(); return c.fullName.toLowerCase().includes(s) || c.cageCode.toLowerCase().includes(s) }).length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-xs">Không tìm thấy chuồng nào</div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Đã thêm <span className="font-bold text-primary-600">{items.length} SKU</span> vào phiếu nhập.
              </div>
              <button 
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Hoàn tất & Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Excel Mock Import Modal */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-scaleIn">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-emerald-500" />
                Nhập danh mục SKU từ Excel
              </h3>
              <button 
                onClick={() => setIsExcelModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2 text-xs leading-relaxed text-slate-600">
                <p>Hệ thống hỗ trợ nhập danh sách sản phẩm nhập kho nhanh bằng tệp Excel (.xlsx hoặc .csv).</p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-700">Các cột dữ liệu yêu cầu:</div>
                  <div className="font-mono text-[10px] text-slate-500">
                    Mã_SKU | Số_Lượng_Đặt | Số_Lượng_Nhận | Đơn_Giá_Vốn
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  type="button"
                  onClick={() => {
                    showMiniToast('Đã tải xuống tệp mẫu Excel-GRN-Template.xlsx vào thư mục Downloads!')
                  }}
                  className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download size={13} />
                  Tải tệp Excel mẫu (.xlsx)
                </button>

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-slate-50/50 transition-all">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-slate-800 block">Kéo thả tệp dữ liệu vào đây</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">hoặc click để chọn tệp từ máy tính</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-slate-50 flex gap-2">
              <button 
                type="button"
                onClick={() => setIsExcelModalOpen(false)}
                className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all"
              >
                Hủy bỏ
              </button>
              
              <button 
                type="button"
                onClick={runExcelImport}
                disabled={isExcelImporting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {isExcelImporting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle size={13} />
                    Nhập dữ liệu mẫu nhanh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Create SKU Modal */}
      {isQuickCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 animate-scaleIn">
            
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Plus size={16} className="text-indigo-500" />
                Thêm nhanh Sản phẩm & SKU mới vào Hệ thống
              </h3>
              <button 
                type="button"
                onClick={() => setIsQuickCreateOpen(false)} 
                className="text-gray-400 hover:text-gray-600 text-xl font-bold font-sans"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleQuickCreate}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Tính năng này giúp bạn đăng ký sản phẩm mới chưa tồn tại trong danh mục hệ thống và đưa trực tiếp vào phiếu nhập kho hiện tại.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="form-label font-bold text-gray-700 text-xs">Tên sản phẩm mới <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      required
                      className="form-input text-xs" 
                      placeholder="VD: Hạt cho mèo Keos Vị Hải Sản" 
                      value={qcName}
                      onChange={e => setQcName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Danh mục sản phẩm <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      className="form-input text-xs"
                      value={qcCategory}
                      onChange={e => setQcCategory(e.target.value)}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {uniqueCategories.filter(c => c !== 'all').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Thương hiệu</label>
                    <input 
                      type="text"
                      className="form-input text-xs" 
                      placeholder="VD: Keos" 
                      value={qcBrand}
                      onChange={e => setQcBrand(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Mã SKU / Barcode mới <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      required
                      className="form-input text-xs font-mono" 
                      placeholder="VD: KEOS-CAT-1.5KG" 
                      value={qcSkuCode}
                      onChange={e => setQcSkuCode(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Phân loại biến thể</label>
                    <input 
                      type="text"
                      className="form-input text-xs" 
                      placeholder="VD: 1.5kg / Vị Hải Sản" 
                      value={qcVariant}
                      onChange={e => setQcVariant(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="form-label font-bold text-gray-700 text-xs">Giá bán lẻ niêm yết (đ) <span className="text-rose-500">*</span></label>
                    <input 
                      type="number"
                      required
                      min={0}
                      className="form-input text-xs font-bold" 
                      value={qcPrice}
                      onChange={e => setQcPrice(+e.target.value)}
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Đơn giá vốn nhập kho sẽ tự động đề xuất 65% giá bán lẻ: <strong>{formatPrice(qcPrice * 0.65)}</strong> (có thể tự chỉnh sửa).
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-slate-50 flex gap-2">
                <button 
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all"
                >
                  Hủy bỏ
                </button>
                
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle size={13} />
                  Tạo & Thêm vào phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Qty edit reason modal */}
      {editingItemIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-extrabold text-slate-900 border-b pb-2 flex items-center justify-between">
              <span>✏️ Chỉnh sửa số lượng</span>
              <button 
                type="button" 
                onClick={() => setEditingItemIndex(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </h3>
            
            <div className="text-xs space-y-3 font-semibold">
              <div>
                <span className="text-gray-400 block mb-0.5">Mặt hàng</span>
                <span className="text-gray-800 font-bold text-sm">{items[editingItemIndex]?.productName}</span>
                <span className="block text-[10px] text-gray-400 font-mono mt-0.5">{items[editingItemIndex]?.skuCode}</span>
              </div>
              
              <div>
                <span className="text-gray-400 block mb-1">Số lượng hiện tại</span>
                <span className="text-gray-800 font-bold text-sm bg-gray-50 border px-3 py-1 rounded-lg">{items[editingItemIndex]?.orderedQty}</span>
              </div>

              <div>
                <label className="text-gray-700 block mb-1">Số lượng mới <span className="text-rose-500">*</span></label>
                <input 
                  type="number"
                  min={1}
                  className="form-input text-xs font-bold"
                  value={tempQty}
                  onChange={e => setTempQty(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              {tempQty !== items[editingItemIndex]?.orderedQty && (
                <div className="space-y-1 animate-fadeIn">
                  <label className="text-gray-700 block">Lý do thay đổi số lượng <span className="text-rose-500">*</span></label>
                  <textarea 
                    rows={3}
                    className="form-input text-xs font-medium resize-none"
                    placeholder="VD: Cập nhật theo đơn yêu cầu bổ sung mới nhất, đổi sang size nhỏ hơn..."
                    value={qtyChangeReason}
                    onChange={e => setQtyChangeReason(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400 italic">Bắt buộc nhập lý do khi thay đổi số lượng đặt ban đầu.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t">
              <button 
                type="button" 
                onClick={() => setEditingItemIndex(null)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Hủy bỏ
              </button>
              <button 
                type="button" 
                disabled={tempQty !== items[editingItemIndex]?.orderedQty && !qtyChangeReason.trim()}
                onClick={() => {
                  const originalQty = items[editingItemIndex].orderedQty
                  updateItem(editingItemIndex, 'orderedQty', tempQty)
                  updateItem(editingItemIndex, 'receivedQty', tempQty)
                  if (tempQty !== originalQty) {
                    updateItem(editingItemIndex, 'note', qtyChangeReason.trim())
                  } else {
                    updateItem(editingItemIndex, 'note', '')
                  }
                  setEditingItemIndex(null)
                  showMiniToast("Đã cập nhật số lượng mặt hàng")
                }}
                className="btn-primary text-xs px-5 py-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

