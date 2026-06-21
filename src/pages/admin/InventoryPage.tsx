import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search, AlertTriangle, Plus, ClipboardList, History, Package,
  ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Boxes, TrendingDown,
  BellRing, Radio, Loader2, CheckCircle, X, ChevronRight, Send, Check, Trash
} from 'lucide-react'
import { INVENTORY_ITEMS, INVENTORY_TRANSACTIONS } from '@/data/inventoryMockData'
import { STOCK_RECEIPTS, saveStockReceipts } from '@/data/stockReceiptMockData'
import { STOCK_ISSUES } from '@/data/stockIssueMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { formatPrice } from '@/utils/format'
import { addNotification } from '@/data/notificationMockData'
import { SUPPLIER_MOCK_LIST } from '@/data/supplierMockData'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { CAGE_MOCK_LIST } from '@/data/cageMockData'
import type { StockReceipt, StockReceiptItem } from '@/types'

interface WarehousePing {
  id: string
  skuCode: string
  productName: string
  shopId: string
  shopName: string
  type: 'check' | 'replenish' | 'transfer' | 'custom'
  message: string
  status: 'pending' | 'in_progress' | 'resolved'
  createdAt: string
}

export default function AdminInventoryPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'balances' | 'transactions'>('overview')
  const [filterShop, setFilterShop] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState<'all' | 'product' | 'cage'>('all')
  const [search, setSearch] = useState('')

  // Stock In Request Modal & Form States
  const [receiptsList, setReceiptsList] = useState<StockReceipt[]>(() => [...STOCK_RECEIPTS])
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false)
  const [newReqSupplierId, setNewReqSupplierId] = useState('')
  const [newReqItems, setNewReqItems] = useState<{
    skuId: string
    skuCode: string
    productName: string
    itemType: 'product' | 'cage'
    orderedQty: number
  }[]>([])
  const [addingType, setAddingType] = useState<'product' | 'cage'>('product')
  const [selectedProductSkuId, setSelectedProductSkuId] = useState('')
  const [selectedCageId, setSelectedCageId] = useState('')
  const [addingQty, setAddingQty] = useState<number>(1)
  const [newReqNote, setNewReqNote] = useState('')

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('')

  // Pings log state
  const [pings, setPings] = useState<WarehousePing[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem('spsb_warehouse_pings')
      if (data) {
        try { return JSON.parse(data) } catch (e) { console.error(e) }
      }
    }
    return [
      {
        id: 'P-001',
        skuCode: 'P002-12KG',
        productName: 'Whiskas Tuna 1.2kg',
        shopId: 'SH01',
        shopName: 'Chi nhánh Q.1',
        type: 'transfer',
        message: 'Yêu cầu chuyển sản phẩm "Whiskas Tuna 1.2kg" (P002-12KG) từ Kho trung tâm sang Chi nhánh Q.1.',
        status: 'pending',
        createdAt: '2026-05-31 09:15'
      }
    ]
  })

  const savePings = (updatedPings: WarehousePing[]) => {
    setPings(updatedPings)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('spsb_warehouse_pings', JSON.stringify(updatedPings))
    }
  }

  // Ping Modal State
  const [showPingModal, setShowPingModal] = useState(false)
  const [pingItem, setPingItem] = useState<{ skuCode: string; productName: string; shopId: string; quantity: number; minStock: number } | null>(null)
  const [pingType, setPingType] = useState<'check' | 'replenish' | 'transfer' | 'custom'>('check')
  const [pingMessage, setPingMessage] = useState('')

  // Check Modal State (RFID IoT Scan)
  const [showCheckModal, setShowCheckModal] = useState(false)
  const [checkItem, setCheckItem] = useState<{ skuCode: string; productName: string; shopId: string; quantity: number } | null>(null)
  const [checkStep, setCheckStep] = useState<number>(0) // 0: idle, 1: connecting, 2: scanning, 3: completed
  const [checkResult, setCheckResult] = useState<{ bookQty: number; actualQty: number; status: 'match' | 'mismatch' } | null>(null)

  const getPreFilledMessage = (type: string, name: string, code: string, shopName: string, qty: number) => {
    if (type === 'check') {
      return `Hệ thống ghi nhận sản phẩm "${name}" (${code}) tại ${shopName} đang có tồn kho là ${qty}. Vui lòng thực hiện kiểm đếm thực tế để đối chiếu.`
    }
    if (type === 'replenish') {
      return `Sản phẩm "${name}" (${code}) tại ${shopName} đang ở mức tồn thấp (${qty} sản phẩm). Đề nghị Quản lý kho lên kế hoạch nhập hàng gấp từ nhà cung cấp.`
    }
    if (type === 'transfer') {
      return `Sản phẩm "${name}" (${code}) tại ${shopName} đang hết hàng/sắp hết hàng (${qty} sản phẩm). Vui lòng điều chuyển từ Kho trung tâm sang.`
    }
    return ''
  }

  const handlePingTypeChange = (type: 'check' | 'replenish' | 'transfer' | 'custom') => {
    setPingType(type)
    if (pingItem) {
      const shopName = pingItem.shopId === 'warehouse' ? 'Kho Trung Tâm' : (SHOP_MOCK_LIST.find(s => s.id === pingItem.shopId)?.name ?? pingItem.shopId)
      setPingMessage(getPreFilledMessage(type, pingItem.productName, pingItem.skuCode, shopName, pingItem.quantity))
    } else {
      setPingMessage('')
    }
  }

  const openPingModal = (item: any) => {
    setPingItem(item)
    const shopName = item.shopId === 'warehouse' ? 'Kho Trung Tâm' : (SHOP_MOCK_LIST.find(s => s.id === item.shopId)?.name ?? item.shopId)
    let defaultType: 'check' | 'replenish' | 'transfer' | 'custom' = 'check'
    if (item.quantity === 0 || item.quantity <= item.minStock) {
      defaultType = item.shopId === 'warehouse' ? 'replenish' : 'transfer'
    }
    setPingType(defaultType)
    setPingMessage(getPreFilledMessage(defaultType, item.productName, item.skuCode, shopName, item.quantity))
    setShowPingModal(true)
  }

  const handleSendPing = () => {
    if (!pingItem) return
    const shopName = pingItem.shopId === 'warehouse' ? 'Kho Trung Tâm' : (SHOP_MOCK_LIST.find(s => s.id === pingItem.shopId)?.name ?? pingItem.shopId)
    const typeLabel = pingType === 'check' ? 'Kiểm hàng' : pingType === 'replenish' ? 'Nhập hàng' : pingType === 'transfer' ? 'Chuyển kho' : 'Yêu cầu khác'
    
    addNotification({
      type: 'inventory',
      title: `Yêu cầu Admin: ${typeLabel} (${pingItem.skuCode})`,
      body: pingMessage,
      link: pingType === 'check' ? '/warehouse/stock-count' : pingType === 'transfer' ? '/warehouse/transfers' : '/warehouse',
      forRoles: ['warehouse_manager']
    })

    const newPing: WarehousePing = {
      id: `P-${Date.now()}`,
      skuCode: pingItem.skuCode,
      productName: pingItem.productName,
      shopId: pingItem.shopId,
      shopName,
      type: pingType,
      message: pingMessage,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    }

    savePings([newPing, ...pings])
    setToastMessage(`Đã gửi Ping yêu cầu ${typeLabel} tới Quản lý kho!`)
    setShowPingModal(false)
    setPingItem(null)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const startCheck = (item: any) => {
    setCheckItem(item)
    setCheckStep(1)
    setCheckResult(null)
    setShowCheckModal(true)

    setTimeout(() => {
      setCheckStep(2)
      setTimeout(() => {
        setCheckStep(3)
        // Discrepancy simulation (30% chance for items with quantity > 5, 60% chance if quantity <= 5)
        const isLow = item.quantity <= 5
        const hasDiscrepancy = Math.random() < (isLow ? 0.60 : 0.30)
        let actualQty = item.quantity
        if (hasDiscrepancy) {
          const delta = Math.random() < 0.5 ? -1 : 1
          actualQty = Math.max(0, item.quantity + (delta * Math.max(1, Math.floor(Math.random() * 3))))
        }
        setCheckResult({
          bookQty: item.quantity,
          actualQty,
          status: actualQty === item.quantity ? 'match' : 'mismatch'
        })
      }, 1500)
    }, 1000)
  }

  const handlePingFromCheck = () => {
    if (!checkItem || !checkResult) return
    const shopName = checkItem.shopId === 'warehouse' ? 'Kho Trung Tâm' : (SHOP_MOCK_LIST.find(s => s.id === checkItem.shopId)?.name ?? checkItem.shopId)
    const discrepancyText = `Phát hiện lệch số liệu sau khi quét RFID nhanh. Số lượng sổ sách: ${checkResult.bookQty} | Quét thực tế: ${checkResult.actualQty} (Chênh lệch: ${checkResult.actualQty - checkResult.bookQty}). Đề nghị Quản lý kho kiểm đếm và điều chỉnh.`
    
    setPingItem({
      skuCode: checkItem.skuCode,
      productName: checkItem.productName,
      shopId: checkItem.shopId,
      quantity: checkItem.quantity,
      minStock: 5
    })
    setPingType('check')
    setPingMessage(discrepancyText)
    setShowCheckModal(false)
    setShowPingModal(true)
  }

  const SHOPS = [
    { id: 'warehouse', name: 'Kho TT' },
    ...SHOP_MOCK_LIST.map(s => ({ id: s.id, name: s.name.replace('PetCare ', '') })),
  ]

  const filteredItems = INVENTORY_ITEMS
    .filter(i => filterShop === 'all' || i.shopId === filterShop)
    .filter(i => filterCategory === 'all' || i.category === filterCategory)
    .filter(i => {
      if (filterStatus === 'low') return i.quantity > 0 && i.quantity <= i.minStock
      if (filterStatus === 'out') return i.quantity === 0
      return true
    })
    .filter(i => !search || i.productName.toLowerCase().includes(search.toLowerCase()) || i.skuCode.toLowerCase().includes(search.toLowerCase()))

  const filteredTransactions = INVENTORY_TRANSACTIONS
    .filter(t => filterShop === 'all' || t.shopId === filterShop)
    .filter(t => !search || t.productName.toLowerCase().includes(search.toLowerCase()) || t.skuCode.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const outOfStock = INVENTORY_ITEMS.filter(i => i.quantity === 0)
  const lowStock = INVENTORY_ITEMS.filter(i => i.quantity > 0 && i.quantity <= i.minStock)
  const totalSKUs = new Set(INVENTORY_ITEMS.map(i => i.skuCode)).size
  const pendingReceipts = receiptsList.filter(r => r.status === 'pending_approval').length
  const pendingIssues = STOCK_ISSUES.filter(r => r.status === 'pending_approval').length

  // Helper arrays for adding items in creation modal
  const allProductSKUs = PRODUCT_MOCK_LIST.filter(p => p.status === 'active').flatMap(prod => 
    prod.skus.map(sku => ({
      skuId: sku.id,
      skuCode: sku.sku,
      productName: `${prod.name} - ${Object.values(sku.attributes).join('/')}`,
      itemType: 'product' as const
    }))
  )

  const allCages = CAGE_MOCK_LIST.filter(c => c.status === 'active').map(cage => ({
    skuId: cage.id,
    skuCode: cage.code,
    productName: `${cage.name} (Size ${cage.size})`,
    itemType: 'cage' as const
  }))

  const handleAddItemToRequest = () => {
    if (addingType === 'product') {
      const found = allProductSKUs.find(s => s.skuId === selectedProductSkuId)
      if (!found) return
      if (newReqItems.some(i => i.skuId === found.skuId)) {
        setToastMessage('Mặt hàng này đã có trong danh sách yêu cầu!')
        setTimeout(() => setToastMessage(''), 3000)
        return
      }
      setNewReqItems(prev => [...prev, {
        skuId: found.skuId,
        skuCode: found.skuCode,
        productName: found.productName,
        itemType: 'product',
        orderedQty: addingQty
      }])
    } else {
      const found = allCages.find(c => c.skuId === selectedCageId)
      if (!found) return
      if (newReqItems.some(i => i.skuId === found.skuId)) {
        setToastMessage('Mặt hàng này đã có trong danh sách yêu cầu!')
        setTimeout(() => setToastMessage(''), 3000)
        return
      }
      setNewReqItems(prev => [...prev, {
        skuId: found.skuId,
        skuCode: found.skuCode,
        productName: found.productName,
        itemType: 'cage',
        orderedQty: addingQty
      }])
    }
    setSelectedProductSkuId('')
    setSelectedCageId('')
    setAddingQty(1)
  }

  const handleSubmitRequest = () => {
    if (!newReqSupplierId) {
      alert('Vui lòng chọn nhà cung cấp!')
      return
    }
    if (newReqItems.length === 0) {
      alert('Vui lòng thêm ít nhất một mặt hàng!')
      return
    }
    const supplier = SUPPLIER_MOCK_LIST.find(s => s.id === newReqSupplierId)
    if (!supplier) return

    const receiptId = `GRN-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`
    
    const newReceipt: StockReceipt = {
      id: receiptId,
      supplierId: supplier.id,
      supplierName: supplier.name,
      warehouseId: 'warehouse',
      items: newReqItems.map(item => ({
        skuId: item.skuId,
        skuCode: item.skuCode,
        productName: item.productName,
        itemType: item.itemType,
        orderedQty: item.orderedQty,
        receivedQty: 0,
        unitCost: 0,
        estimatedCost: 0,
        actualCost: 0,
        batchNumber: '',
        expiryDate: '',
      })),
      totalValue: 0,
      estimatedTotalValue: 0,
      actualTotalValue: 0,
      status: 'pending_approval',
      createdBy: 'Bùi Văn Khánh',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      note: newReqNote
    }

    const updatedList = [newReceipt, ...STOCK_RECEIPTS]
    saveStockReceipts(updatedList)
    setReceiptsList(updatedList)
    
    addNotification({
      type: 'inventory',
      title: `Yêu cầu nhập kho mới: ${receiptId}`,
      body: `Quản lý kho vừa gửi một yêu cầu nhập kho mới từ nhà cung cấp ${supplier.name}.`,
      link: '/admin/stock-in-approval',
      forRoles: ['admin']
    })

    setShowCreateRequestModal(false)
    setToastMessage('Đã tạo và gửi yêu cầu nhập kho thành công!')
    setTimeout(() => setToastMessage(''), 3000)
  }

  return (
    <div className="space-y-6 text-sm animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/70 backdrop-blur-xl border border-gray-100 p-5 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý Kho Toàn hệ thống</h1>
          <p className="text-gray-500 mt-1 font-medium">
            {totalSKUs} SKU · {INVENTORY_TRANSACTIONS.length} giao dịch · {pendingReceipts + pendingIssues > 0 && <span className="text-amber-600">{pendingReceipts + pendingIssues} phiếu chờ duyệt</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin/inventory/adjust')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95 cursor-pointer">
            <Plus size={16} /> Cân đối tồn kho
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-150 pb-px">
        {[
          { key: 'overview', label: 'Tổng quan', icon: Boxes },
          { key: 'balances', label: 'Tồn kho chi tiết', icon: ClipboardList },
          { key: 'transactions', label: 'Nhật ký giao dịch', icon: History },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm transition-all border-b-2 -mb-px cursor-pointer ${
              activeTab === tab.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5 animate-slideIn">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Tổng SKU', value: totalSKUs, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { label: 'Hết hàng', value: outOfStock.length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
              { label: 'Sắp hết', value: lowStock.length, icon: TrendingDown, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
              { label: 'Phiếu chờ duyệt', value: pendingReceipts + pendingIssues, icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-5 shadow-sm`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-xs font-bold text-gray-600 mt-1">{s.label}</div>
                  </div>
                  <s.icon size={20} className={`${s.color} opacity-60`} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Phiếu nhập kho', path: '/admin/inventory/receipts', icon: ArrowDownToLine, count: 0, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200' },
              { label: 'Phiếu xuất kho', path: '/admin/inventory/issues', icon: ArrowUpFromLine, count: pendingIssues, color: 'text-red-500 bg-red-50 hover:bg-red-100 border-red-200' },
              { label: 'Phiếu chuyển kho', path: '/admin/inventory/transfers', icon: ArrowLeftRight, count: 0, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200' },
              { label: 'Kiểm kê kho', path: '/admin/inventory/stock-count', icon: ClipboardList, count: 0, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200' },
              { label: 'Duyệt nhập kho', path: '/admin/stock-in-approval', icon: ClipboardList, count: pendingReceipts, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
            ].map(a => (
              <Link key={a.path} to={a.path} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${a.color}`}>
                <a.icon size={20} />
                <div>
                  <div className="text-sm font-bold">{a.label}</div>
                  {a.count > 0 && <div className="text-xs font-semibold opacity-75">{a.count} chờ duyệt</div>}
                </div>
              </Link>
            ))}
          </div>

          {/* Inventory by branch */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Tồn kho theo chi nhánh</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Chi nhánh</th>
                    <th className="px-5 py-3 text-right">Tổng SKU</th>
                    <th className="px-5 py-3 text-right">Tổng SL</th>
                    <th className="px-5 py-3 text-right">Hết hàng</th>
                    <th className="px-5 py-3 text-right">Sắp hết</th>
                    <th className="px-5 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {['warehouse', ...SHOP_MOCK_LIST.map(s => s.id)].map(shopId => {
                    const items = INVENTORY_ITEMS.filter(i => i.shopId === shopId)
                    const out = items.filter(i => i.quantity === 0).length
                    const low = items.filter(i => i.quantity > 0 && i.quantity <= i.minStock).length
                    const total = items.reduce((s, i) => s + i.quantity, 0)
                    const shopName = shopId === 'warehouse' ? 'Kho Trung Tâm' : (SHOP_MOCK_LIST.find(s => s.id === shopId)?.name ?? shopId)
                    return (
                      <tr key={shopId} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-bold text-gray-900 text-sm">{shopName}</td>
                        <td className="px-5 py-3 text-right font-bold text-sm">{items.length}</td>
                        <td className="px-5 py-3 text-right font-mono text-sm">{total}</td>
                        <td className="px-5 py-3 text-right">{out > 0 ? <span className="badge-red text-[10px]">{out}</span> : <span className="text-gray-300">0</span>}</td>
                        <td className="px-5 py-3 text-right">{low > 0 ? <span className="badge-orange text-[10px]">{low}</span> : <span className="text-gray-300">0</span>}</td>
                        <td className="px-5 py-3">
                          {out > 0 ? <span className="badge-red">Cần bổ sung</span> : low > 0 ? <span className="badge-orange">Chú ý</span> : <span className="badge-green">Tốt</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Yêu cầu & Tiến độ Nhập kho */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Yêu cầu & Tiến độ Nhập kho</h3>
                <p className="text-xs text-gray-500 mt-0.5">Quản lý và theo dõi các yêu cầu nhập hàng (Sản phẩm & Chuồng)</p>
              </div>
              <button
                onClick={() => {
                  setNewReqSupplierId('')
                  setNewReqItems([])
                  setNewReqNote('')
                  setShowCreateRequestModal(true)
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={14} /> Tạo yêu cầu nhập kho
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Mã phiếu</th>
                    <th className="px-5 py-3 text-left">Nhà cung cấp</th>
                    <th className="px-5 py-3 text-left">Ngày tạo</th>
                    <th className="px-5 py-3 text-left">Mặt hàng</th>
                    <th className="px-5 py-3 text-right">Tổng giá trị</th>
                    <th className="px-5 py-3 text-center">Trạng thái</th>
                    <th className="px-5 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                  {receiptsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                        Chưa có yêu cầu nhập kho nào.
                      </td>
                    </tr>
                  ) : (
                    receiptsList.slice(0, 5).map(r => {
                      const statusLabels: Record<string, string> = {
                        draft: 'Nháp',
                        pending_approval: 'Chờ duyệt',
                        price_negotiating: 'Thương lượng',
                        approved: 'Chờ nhập hàng',
                        completed: 'Hoàn tất',
                        cancelled: 'Đã hủy'
                      }
                      const statusColors: Record<string, string> = {
                        draft: 'badge-gray',
                        pending_approval: 'badge-orange',
                        price_negotiating: 'badge-blue',
                        approved: 'badge-green',
                        completed: 'badge-slate',
                        cancelled: 'badge-red'
                      }
                      const prodCount = r.items.filter(i => i.itemType === 'product').length
                      const cageCount = r.items.filter(i => i.itemType === 'cage').length
                      return (
                        <tr key={r.id} className="hover:bg-gray-50/50">
                          <td className="px-5 py-3 text-xs font-mono font-bold text-gray-900">{r.id}</td>
                          <td className="px-5 py-3 text-xs max-w-[180px] truncate" title={r.supplierName}>{r.supplierName}</td>
                          <td className="px-5 py-3 text-xs text-gray-400 font-mono">{r.createdAt}</td>
                          <td className="px-5 py-3 text-xs text-gray-500">
                            {prodCount > 0 && <span>{prodCount} SP </span>}
                            {cageCount > 0 && <span>{cageCount} Chuồng</span>}
                            {prodCount === 0 && cageCount === 0 && <span>0 mặt hàng</span>}
                          </td>
                          <td className="px-5 py-3 text-right text-xs text-gray-900 font-bold font-mono">
                            {r.status === 'completed' 
                              ? formatPrice(r.actualTotalValue || r.totalValue)
                              : formatPrice(r.estimatedTotalValue || r.totalValue || 0)}
                          </td>
                          <td className="px-5 py-3 text-center text-xs">
                            <span className={statusColors[r.status] || 'badge-gray'}>{statusLabels[r.status] || r.status}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            {r.status === 'pending_approval' || r.status === 'approved' ? (
                              <button
                                onClick={() => navigate('/admin/stock-in-approval')}
                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                Duyệt ngay <ChevronRight size={12} />
                              </button>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lịch sử yêu cầu gửi Quản lý kho */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <BellRing size={16} className="text-indigo-600 animate-pulse" />
                  Yêu cầu & Ping gửi Quản lý kho
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Lịch sử tương tác và yêu cầu phối hợp vận hành kho</p>
              </div>
              {pings.length > 0 && (
                <button 
                  onClick={() => {
                    if (confirm('Bạn có chắc chắn muốn xóa lịch sử gửi ping?')) {
                      savePings([])
                    }
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                >
                  Xóa lịch sử
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Thời gian</th>
                    <th className="px-5 py-3 text-left">Sản phẩm / SKU</th>
                    <th className="px-5 py-3 text-left">Vị trí</th>
                    <th className="px-5 py-3 text-left">Loại yêu cầu</th>
                    <th className="px-5 py-3 text-left">Nội dung yêu cầu</th>
                    <th className="px-5 py-3 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                  {pings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                        Chưa có yêu cầu hoặc ping nào được gửi.
                      </td>
                    </tr>
                  ) : (
                    pings.map(ping => {
                      const typeLabels: Record<string, string> = {
                        check: 'Kiểm hàng',
                        replenish: 'Nhập thêm',
                        transfer: 'Chuyển kho',
                        custom: 'Yêu cầu khác'
                      }
                      const typeColors: Record<string, string> = {
                        check: 'badge-blue',
                        replenish: 'badge-green',
                        transfer: 'badge-orange',
                        custom: 'badge-gray'
                      }
                      return (
                        <tr key={ping.id} className="hover:bg-gray-50/50">
                          <td className="px-5 py-3 text-xs text-gray-400 font-mono whitespace-nowrap">{ping.createdAt}</td>
                          <td className="px-5 py-3">
                            <div className="text-xs font-bold text-gray-900">{ping.productName}</div>
                            <div className="text-[9px] text-gray-400 font-mono mt-0.5">{ping.skuCode}</div>
                          </td>
                          <td className="px-5 py-3 text-xs">{ping.shopName}</td>
                          <td className="px-5 py-3 text-xs">
                            <span className={typeColors[ping.type] || 'badge-gray'}>{typeLabels[ping.type] || ping.type}</span>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-500 max-w-xs truncate" title={ping.message}>{ping.message}</td>
                          <td className="px-5 py-3 text-center">
                            <span className="badge-orange">Đang chờ xử lý</span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Balances */}
      {activeTab === 'balances' && (
        <div className="space-y-5 animate-slideIn">
          {(outOfStock.length > 0 || lowStock.length > 0) && (
            <div className="flex flex-wrap gap-3">
              {outOfStock.length > 0 && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-2 text-red-800 shadow-sm">
                  <AlertTriangle size={15} className="text-red-500 shrink-0" />
                  <span className="text-xs font-bold">{outOfStock.length} SKU hết hàng</span>
                  <button onClick={() => setFilterStatus('out')} className="text-xs text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer">Lọc</button>
                </div>
              )}
              {lowStock.length > 0 && (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2 shadow-sm">
                  <AlertTriangle size={15} className="text-orange-500 shrink-0" />
                  <span className="text-xs font-bold text-orange-800">{lowStock.length} SKU sắp hết hàng</span>
                  <button onClick={() => setFilterStatus('low')} className="text-xs text-orange-600 hover:text-orange-800 font-bold hover:underline cursor-pointer">Lọc</button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'product', label: 'Sản phẩm' },
                { key: 'cage', label: 'Chuồng nuôi' },
              ].map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setFilterCategory(cat.key as any)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    filterCategory === cat.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-755'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 flex-1 justify-end min-w-48">
              <div className="relative flex-1 max-w-xs">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none text-xs font-semibold transition-all"
                  placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="px-3 py-2 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-bold text-xs"
                value={filterShop} onChange={e => setFilterShop(e.target.value)}>
                <option value="all">Tất cả chi nhánh</option>
                {SHOPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select className="px-3 py-2 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-bold text-xs"
                value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="low">Sắp hết</option>
                <option value="out">Hết hàng</option>
              </select>
              {(filterShop !== 'all' || filterStatus !== 'all' || filterCategory !== 'all' || search) && (
                <button onClick={() => { setFilterShop('all'); setFilterStatus('all'); setFilterCategory('all'); setSearch('') }}
                  className="px-3 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-2xl font-bold text-xs cursor-pointer">
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500">{filteredItems.length} mặt hàng thỏa mãn bộ lọc</p>

          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Mặt hàng</th>
                  <th className="px-5 py-4">Phân loại</th>
                  <th className="px-5 py-4">Mã Code</th>
                  <th className="px-5 py-4">Vị trí kho / Shop</th>
                  <th className="px-5 py-4 text-right">Số lượng tồn</th>
                  <th className="px-5 py-4 text-right">Ngưỡng tối thiểu</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {filteredItems.map((item, idx) => {
                  const isOut = item.quantity === 0
                  const isLow = !isOut && item.quantity <= item.minStock
                  const shopLabel = item.shopId === 'warehouse' ? 'Kho TT' : (SHOP_MOCK_LIST.find(s => s.id === item.shopId)?.name.replace('PetCare ', '') ?? item.shopId)
                  return (
                    <tr key={`${item.skuId}-${item.shopId}-${idx}`} className={`hover:bg-gray-50/50 ${isOut ? 'bg-red-50/10' : ''}`}>
                      <td className="px-5 py-4"><div className="text-sm font-bold text-gray-900">{item.productName}</div></td>
                      <td className="px-5 py-4 font-semibold text-xs">
                        {item.category === 'cage' ? (
                          <span className="px-2.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-255 text-[10px] font-bold rounded-lg">Chuồng</span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-255 text-[10px] font-bold rounded-lg">Sản phẩm</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-400">{item.skuCode}</td>
                      <td className="px-5 py-4 text-xs font-bold text-gray-600">{shopLabel}</td>
                      <td className="px-5 py-4 text-right font-mono">
                        <span className={`text-sm font-extrabold ${isOut ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-green-600'}`}>{item.quantity}</span>
                      </td>
                      <td className="px-5 py-4 text-right text-xs text-gray-400 font-mono">{item.minStock}</td>
                      <td className="px-5 py-4">
                        {isOut ? <span className="badge-red">Hết hàng</span> : isLow ? <span className="badge-orange">Sắp hết</span> : <span className="badge-green">Còn hàng</span>}
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button onClick={() => startCheck(item)}
                          title="Quét thực tế (Check RFID)"
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-all cursor-pointer mr-1.5 inline-flex items-center gap-1">
                          <Radio size={12} /> Check
                        </button>
                        <button onClick={() => openPingModal(item)}
                          title="Ping Quản lý Kho"
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-xs font-bold transition-all cursor-pointer mr-1.5 inline-flex items-center gap-1">
                          <BellRing size={12} /> Ping
                        </button>
                        <button onClick={() => navigate(`/admin/inventory/adjust?skuCode=${item.skuCode}&shopId=${item.shopId}`)}
                          title="Cân đối thủ công"
                          className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1">
                          <Plus size={12} /> Cân đối
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <div className="text-lg">📭</div>
                <div className="font-semibold text-xs">Không tìm thấy tồn kho nào thỏa mãn điều kiện lọc.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Transactions */}
      {activeTab === 'transactions' && (
        <div className="space-y-5 animate-slideIn">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none text-sm font-semibold transition-all"
                placeholder="Tìm giao dịch, mã SKU..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-semibold"
              value={filterShop} onChange={e => setFilterShop(e.target.value)}>
              <option value="all">Tất cả chi nhánh</option>
              {SHOPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <p className="text-xs text-gray-500">{filteredTransactions.length} giao dịch</p>

          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Mã GD</th>
                  <th className="px-5 py-4">Phân loại</th>
                  <th className="px-5 py-4">Sản phẩm / SKU</th>
                  <th className="px-5 py-4">Chi nhánh</th>
                  <th className="px-5 py-4 text-right">Chênh lệch</th>
                  <th className="px-5 py-4">Người thực hiện</th>
                  <th className="px-5 py-4">Thời gian</th>
                  <th className="px-5 py-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {filteredTransactions.map(tx => {
                  const isPositive = tx.quantity > 0
                  const txTypeLabels: Record<string, string> = { stock_in: 'Nhập hàng', stock_out: 'Xuất hàng', transfer_in: 'Nhận chuyển', transfer_out: 'Gửi chuyển', adjustment: 'Cân đối kho' }
                  const txTypeColors: Record<string, string> = { stock_in: 'badge-green', stock_out: 'badge-red', transfer_in: 'badge-blue', transfer_out: 'badge-orange', adjustment: 'badge-gray' }
                  const shopLabel = tx.shopId === 'warehouse' ? 'Kho TT' : (SHOP_MOCK_LIST.find(s => s.id === tx.shopId)?.name.replace('PetCare ', '') ?? tx.shopId)
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4 font-mono text-xs text-gray-900 font-bold">{tx.id}</td>
                      <td className="px-5 py-4 text-xs"><span className={txTypeColors[tx.type] || 'badge-gray'}>{txTypeLabels[tx.type] || tx.type}</span></td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-bold text-gray-900">{tx.productName}</div>
                        <div className="text-[9px] text-gray-400 font-mono mt-0.5">{tx.skuCode}</div>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold">{shopLabel}</td>
                      <td className="px-5 py-4 text-right font-mono font-black">
                        <span className={isPositive ? 'text-green-600' : 'text-red-500'}>{isPositive ? `+${tx.quantity}` : tx.quantity}</span>
                      </td>
                      <td className="px-5 py-4 text-xs">{tx.createdBy}</td>
                      <td className="px-5 py-4 text-xs text-gray-400 font-mono">{tx.createdAt}</td>
                      <td className="px-5 py-4 text-xs text-gray-500 max-w-xs truncate" title={tx.note}>{tx.note}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <div className="text-lg">📋</div>
                <div className="font-semibold text-xs">Chưa có lịch sử giao dịch kho nào.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800 animate-slideIn">
          <CheckCircle size={18} className="text-emerald-400 shrink-0" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* MODAL: PING QUẢN LÝ KHO */}
      {showPingModal && pingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 shadow-2xl" onClick={() => setShowPingModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-zoomIn" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-amber-50/20">
              <div className="flex items-center gap-2.5 text-amber-600">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                  <BellRing size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base font-black">Ping Quản lý Kho</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Gửi thông báo yêu cầu phối hợp vận hành</p>
                </div>
              </div>
              <button onClick={() => setShowPingModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-left">
              {/* Product Info */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Sản phẩm & SKU</div>
                <div className="text-sm font-bold text-gray-900">{pingItem.productName}</div>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                  <span>Mã: <code className="font-mono text-indigo-600 bg-indigo-50 px-1.5 rounded font-bold">{pingItem.skuCode}</code></span>
                  <span>Tồn hiện tại: <strong className="text-gray-800 font-extrabold font-mono">{pingItem.quantity}</strong></span>
                </div>
              </div>

              {/* Request Type Selector */}
              <div>
                <label className="form-label mb-2 block font-bold text-gray-700">Loại yêu cầu</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'check', label: 'Kiểm hàng thực tế', desc: 'Yêu cầu đếm lại kệ' },
                    { key: 'replenish', label: 'Nhập thêm hàng', desc: 'Từ nhà cung cấp' },
                    { key: 'transfer', label: 'Điều chuyển kho', desc: 'Chuyển hàng nội bộ' },
                    { key: 'custom', label: 'Yêu cầu khác (Tùy chỉnh)', desc: 'Tự viết nội dung' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => handlePingTypeChange(opt.key as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        pingType === opt.key 
                          ? 'border-amber-500 bg-amber-50/40 shadow-sm font-bold' 
                          : 'border-gray-150 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-xs font-bold text-gray-900">{opt.label}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area Message */}
              <div>
                <label className="form-label mb-1.5 block font-bold text-gray-700">Nội dung tin nhắn</label>
                <textarea
                  rows={4}
                  className="form-input text-xs leading-relaxed resize-none border-gray-200 focus:border-amber-400 focus:ring-amber-50 rounded-2xl w-full p-3 bg-white"
                  placeholder="Nhập nội dung yêu cầu cụ thể..."
                  value={pingMessage}
                  onChange={e => setPingMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button onClick={() => setShowPingModal(false)} className="btn-secondary py-2 rounded-xl text-xs">Hủy</button>
              <button 
                onClick={handleSendPing} 
                disabled={!pingMessage.trim()}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-amber-100 transition-all active:scale-95 cursor-pointer text-xs"
              >
                <Send size={13} /> Gửi yêu cầu (Ping)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RFID / IOT CHECK SIMULATION */}
      {showCheckModal && checkItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 shadow-2xl">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-zoomIn">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-indigo-50/20">
              <div className="flex items-center gap-2.5 text-indigo-600">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Radio size={18} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base font-black">Check RFID / IoT</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Kiểm đếm tự động qua cảm biến kệ hàng</p>
                </div>
              </div>
              {checkStep === 3 && (
                <button onClick={() => setShowCheckModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-full transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="p-6 flex flex-col items-center justify-center text-center min-h-64">
              {/* Step 1: Connecting */}
              {checkStep === 1 && (
                <div className="space-y-4 py-6 animate-pulse">
                  <Loader2 className="animate-spin text-indigo-600 mx-auto" size={42} />
                  <div>
                    <div className="text-sm font-bold text-gray-800">Đang kết nối thiết bị RFID...</div>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Đang truy vấn tín hiệu từ cổng đọc tại chi nhánh...</p>
                  </div>
                </div>
              )}

              {/* Step 2: Scanning */}
              {checkStep === 2 && (
                <div className="space-y-4 py-4 w-full">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-indigo-100/50 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-indigo-200/50 animate-pulse" />
                    <div className="relative w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      <Radio size={22} className="animate-spin animate-pulse" style={{ animationDuration: '3s' }} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">Đang quét dải sóng UHF trên kệ...</div>
                    <div className="bg-gray-950 rounded-xl p-3 text-left font-mono text-[10px] text-emerald-400 mt-3 space-y-1 overflow-hidden h-24 max-w-sm mx-auto border border-gray-800">
                      <div className="text-gray-500">&gt; rfid_scanner --connect --shelf-id=S12</div>
                      <div>&gt; Connecting to hardware receiver... SUCCESS</div>
                      <div className="animate-pulse">&gt; Reading tag UID for {checkItem.skuCode}...</div>
                      <div className="text-yellow-400">&gt; Match count database tracking: {checkItem.quantity} units</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Completed */}
              {checkStep === 3 && checkResult && (
                <div className="w-full space-y-5 animate-slideIn">
                  {checkResult.status === 'match' ? (
                    <>
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle size={36} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-emerald-600">Số liệu Trùng Khớp!</h4>
                        <p className="text-xs text-gray-500 mt-1.5 px-4 leading-relaxed">
                          Quét RFID tại kệ vật lý hoàn toàn trùng khớp với dữ liệu trên hệ thống.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 grid grid-cols-2 gap-4 max-w-xs mx-auto">
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Sổ sách</div>
                          <div className="text-xl font-black text-gray-800 mt-1 font-mono">{checkResult.bookQty}</div>
                        </div>
                        <div className="border-l border-gray-200 pl-4">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Thực tế RFID</div>
                          <div className="text-xl font-black text-emerald-600 mt-1 font-mono">{checkResult.actualQty}</div>
                        </div>
                      </div>

                      <div className="pt-2 max-w-xs mx-auto">
                        <button onClick={() => setShowCheckModal(false)} className="btn-secondary w-full py-2.5 rounded-xl justify-center font-bold text-xs">
                          Đóng
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <AlertTriangle size={36} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-red-500">Phát Hiện Sai Lệch!</h4>
                        <p className="text-xs text-gray-500 mt-1.5 px-4 leading-relaxed">
                          Quét thực tế bằng cảm biến phát hiện sự sai lệch giữa số lượng trên hệ thống và số lượng tại quầy/kho.
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 max-w-xs mx-auto space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Sổ sách</div>
                            <div className="text-xl font-black text-gray-800 mt-1 font-mono">{checkResult.bookQty}</div>
                          </div>
                          <div className="border-l border-gray-200 pl-4">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Thực tế RFID</div>
                            <div className="text-xl font-black text-red-500 mt-1 font-mono">{checkResult.actualQty}</div>
                          </div>
                        </div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-xs">
                          <span className="text-gray-500 font-medium">Chênh lệch:</span>
                          <span className="font-extrabold font-mono text-red-500">
                            {checkResult.actualQty - checkResult.bookQty > 0 ? '+' : ''}{checkResult.actualQty - checkResult.bookQty} sản phẩm
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 space-y-2 max-w-xs mx-auto">
                        <button onClick={handlePingFromCheck} className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white w-full py-2.5 rounded-xl font-semibold shadow-lg shadow-amber-100 transition-all text-xs cursor-pointer">
                          <BellRing size={13} /> Ping Quản lý kho xử lý ngay
                        </button>
                        <button onClick={() => setShowCheckModal(false)} className="btn-secondary w-full py-2 rounded-xl justify-center text-xs">
                          Bỏ qua
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TẠO YÊU CẦU NHẬP KHO */}
      {showCreateRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 shadow-2xl overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 overflow-hidden animate-zoomIn flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-indigo-50/10 shrink-0">
              <div className="flex items-center gap-2.5 text-indigo-600">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                  <ArrowDownToLine size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Tạo Yêu Cầu Nhập Kho</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Thêm các mặt hàng sản phẩm hoặc chuồng nuôi cần nhập kho</p>
                </div>
              </div>
              <button onClick={() => setShowCreateRequestModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-full transition-colors font-bold">&times;</button>
            </div>

            <div className="p-6 space-y-4 text-left overflow-y-auto flex-1">
              {/* Supplier Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nhà cung cấp *</label>
                <select
                  value={newReqSupplierId}
                  onChange={e => setNewReqSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-bold text-xs"
                >
                  <option value="">Chọn nhà cung cấp</option>
                  {SUPPLIER_MOCK_LIST.filter(s => s.status === 'active').map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.contactPerson})</option>
                  ))}
                </select>
              </div>

              {/* Add Item Form */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150 space-y-3">
                <div className="text-xs font-extrabold text-indigo-700">Thêm mặt hàng vào yêu cầu</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  {/* Item Type */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phân loại</label>
                    <select
                      value={addingType}
                      onChange={e => {
                        setAddingType(e.target.value as any)
                        setSelectedProductSkuId('')
                        setSelectedCageId('')
                      }}
                      className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none text-xs font-semibold"
                    >
                      <option value="product">Sản phẩm (SKU)</option>
                      <option value="cage">Chuồng nuôi</option>
                    </select>
                  </div>

                  {/* Item Dropdown */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Chọn mặt hàng</label>
                    {addingType === 'product' ? (
                      <select
                        value={selectedProductSkuId}
                        onChange={e => setSelectedProductSkuId(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none text-xs font-semibold"
                      >
                        <option value="">Chọn sản phẩm SKU</option>
                        {allProductSKUs.map(sku => (
                          <option key={sku.skuId} value={sku.skuId}>{sku.productName}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={selectedCageId}
                        onChange={e => setSelectedCageId(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none text-xs font-semibold"
                      >
                        <option value="">Chọn chuồng nuôi</option>
                        {allCages.map(cage => (
                          <option key={cage.skuId} value={cage.skuId}>{cage.productName} - {cage.skuCode}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Số lượng</label>
                      <input
                        type="number"
                        min={1}
                        value={addingQty}
                        onChange={e => setAddingQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none text-xs font-bold text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItemToRequest}
                      disabled={addingType === 'product' ? !selectedProductSkuId : !selectedCageId}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-sm transition-all shrink-0 cursor-pointer"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>

              {/* Added Items List */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Danh sách mặt hàng đã chọn ({newReqItems.length})</label>
                <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white max-h-48 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2">Loại</th>
                        <th className="px-4 py-2">Tên mặt hàng</th>
                        <th className="px-4 py-2">Mã code</th>
                        <th className="px-4 py-2 text-right">Số lượng</th>
                        <th className="px-4 py-2 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold text-xs text-gray-700">
                      {newReqItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-gray-400">Chưa có mặt hàng nào được chọn.</td>
                        </tr>
                      ) : (
                        newReqItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-4 py-2.5">
                              {item.itemType === 'cage' ? (
                                <span className="px-1.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 text-[9px] font-bold rounded">Chuồng</span>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold rounded">SP</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 max-w-[200px] truncate">{item.productName}</td>
                            <td className="px-4 py-2.5 font-mono text-[10px] text-gray-400">{item.skuCode}</td>
                            <td className="px-4 py-2.5 text-right font-mono font-bold">{item.orderedQty}</td>
                            <td className="px-4 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => setNewReqItems(prev => prev.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                              >
                                <Trash size={12} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Ghi chú</label>
                <textarea
                  rows={2}
                  value={newReqNote}
                  onChange={e => setNewReqNote(e.target.value)}
                  placeholder="Ghi chú thêm về lô hàng, yêu cầu đặc biệt..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowCreateRequestModal(false)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={!newReqSupplierId || newReqItems.length === 0}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-150 transition-all cursor-pointer"
              >
                Gửi yêu cầu nhập kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
