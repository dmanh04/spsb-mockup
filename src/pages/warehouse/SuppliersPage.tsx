import { useState } from 'react'
import { 
  Plus, Edit, Phone, Mail, MapPin, Search, Calendar, FileText, 
  CheckCircle, XCircle, ShoppingBag, Eye, Trash2, ShieldAlert
} from 'lucide-react'
import { 
  SUPPLIER_MOCK_LIST, saveSuppliers, 
  PURCHASE_ORDER_LIST, savePurchaseOrders, 
  Supplier, PurchaseOrder, PurchaseOrderItem 
} from '@/data/supplierMockData'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { formatPrice } from '@/utils/format'

const PO_STATUS_LABELS: Record<string, string> = {
  draft: 'Nháp',
  sent: 'Đã gửi',
  confirmed: 'Đã xác nhận',
  received: 'Đã nhận hàng',
  cancelled: 'Đã hủy',
}

const PO_STATUS_COLORS: Record<string, string> = {
  draft: 'badge-gray',
  sent: 'badge-orange',
  confirmed: 'badge-blue',
  received: 'badge-green',
  cancelled: 'badge-red',
}

export default function SuppliersPage() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'pos'>('suppliers')
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => SUPPLIER_MOCK_LIST)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => PURCHASE_ORDER_LIST)
  const [toast, setToast] = useState('')

  // Search & Filters
  const [supplierSearch, setSupplierSearch] = useState('')
  const [poSearch, setPoSearch] = useState('')
  const [poStatusFilter, setPoStatusFilter] = useState('all')

  // Selected details
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)

  // Modals visibility
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [isPOModalOpen, setIsPOModalOpen] = useState(false)

  // Supplier Form state
  const [supFormName, setSupFormName] = useState('')
  const [supFormContact, setSupFormContact] = useState('')
  const [supFormPhone, setSupFormPhone] = useState('')
  const [supFormEmail, setSupFormEmail] = useState('')
  const [supFormAddress, setSupFormAddress] = useState('')
  const [supFormCategories, setSupFormCategories] = useState<string[]>([])
  const [supFormStatus, setSupFormStatus] = useState<'active' | 'inactive'>('active')

  // PO Form state
  const [poFormSupId, setPoFormSupId] = useState('')
  const [poFormDelivery, setPoFormDelivery] = useState('')
  const [poFormNote, setPoFormNote] = useState('')
  const [poFormItems, setPoFormItems] = useState<Array<{ skuId: string; qty: number; unitPrice: number }>>([])

  // SKU helper options
  const allSKUs = PRODUCT_MOCK_LIST.flatMap(p =>
    p.skus.map(sku => ({
      skuId: sku.id,
      skuCode: sku.sku,
      productName: p.name,
      variantName: Object.values(sku.attributes).join(' / '),
      fullName: `${p.name} (${Object.values(sku.attributes).join(' / ')})`,
      price: sku.price,
    }))
  )

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // --- Supplier CRUD Handlers ---
  function openCreateSupplier() {
    setEditingSupplier(null)
    setSupFormName('')
    setSupFormContact('')
    setSupFormPhone('')
    setSupFormEmail('')
    setSupFormAddress('')
    setSupFormCategories([])
    setSupFormStatus('active')
    setIsSupplierModalOpen(true)
  }

  function openEditSupplier(supplier: Supplier) {
    setEditingSupplier(supplier)
    setSupFormName(supplier.name)
    setSupFormContact(supplier.contactPerson)
    setSupFormPhone(supplier.phone)
    setSupFormEmail(supplier.email)
    setSupFormAddress(supplier.address)
    setSupFormCategories(supplier.productCategories)
    setSupFormStatus(supplier.status)
    setIsSupplierModalOpen(true)
  }

  function handleSaveSupplier(e: React.FormEvent) {
    e.preventDefault()
    if (!supFormName) return

    let nextSuppliers: Supplier[] = []

    if (editingSupplier) {
      nextSuppliers = suppliers.map(s => {
        if (s.id !== editingSupplier.id) return s
        return {
          ...s,
          name: supFormName,
          contactPerson: supFormContact,
          phone: supFormPhone,
          email: supFormEmail,
          address: supFormAddress,
          productCategories: supFormCategories,
          status: supFormStatus
        }
      })
      showToast(`Đã cập nhật nhà cung cấp: ${supFormName}`)
    } else {
      const newSup: Supplier = {
        id: `SP${String(suppliers.length + 1).padStart(3, '0')}`,
        name: supFormName,
        contactPerson: supFormContact,
        phone: supFormPhone,
        email: supFormEmail,
        address: supFormAddress,
        productCategories: supFormCategories,
        status: supFormStatus,
        totalOrders: 0,
        lastOrderDate: '—'
      }
      nextSuppliers = [...suppliers, newSup]
      showToast(`Đã thêm nhà cung cấp mới: ${supFormName}`)
    }

    setSuppliers(nextSuppliers)
    saveSuppliers(nextSuppliers)
    setIsSupplierModalOpen(false)
    if (selectedSupplier && editingSupplier && selectedSupplier.id === editingSupplier.id) {
      setSelectedSupplier(nextSuppliers.find(s => s.id === editingSupplier.id) || null)
    }
  }

  function toggleSupplierStatus(supplierId: string) {
    const next = suppliers.map(s => {
      if (s.id !== supplierId) return s
      const newStatus = s.status === 'active' ? 'inactive' : 'active'
      showToast(`Đã chuyển trạng thái nhà cung cấp thành: ${newStatus === 'active' ? 'Hoạt động' : 'Khóa'}`)
      return { ...s, status: newStatus as 'active' | 'inactive' }
    })
    setSuppliers(next)
    saveSuppliers(next)
    if (selectedSupplier && selectedSupplier.id === supplierId) {
      setSelectedSupplier(next.find(s => s.id === supplierId) || null)
    }
  }

  // --- PO Management Handlers ---
  function openCreatePO() {
    setPoFormSupId('')
    setPoFormDelivery('')
    setPoFormNote('')
    setPoFormItems([{ skuId: '', qty: 10, unitPrice: 0 }])
    setIsPOModalOpen(true)
  }

  function addPOFormLine() {
    setPoFormItems([...poFormItems, { skuId: '', qty: 10, unitPrice: 0 }])
  }

  function removePOFormLine(idx: number) {
    if (poFormItems.length === 1) return
    setPoFormItems(poFormItems.filter((_, i) => i !== idx))
  }

  function updatePOFormLine(idx: number, field: string, value: any) {
    setPoFormItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [field]: value }
      if (field === 'skuId') {
        const skuInfo = allSKUs.find(s => s.skuId === value)
        if (skuInfo) {
          updated.unitPrice = Math.round(skuInfo.price * 0.65) // Suggest default unit cost 65% of price
        }
      }
      return updated
    }))
  }

  function handleCreatePO(e: React.FormEvent) {
    e.preventDefault()
    if (!poFormSupId || !poFormDelivery) {
      alert('Vui lòng chọn nhà cung cấp và ngày giao hàng!')
      return
    }

    const supplier = suppliers.find(s => s.id === poFormSupId)
    if (!supplier) return

    const validItems = poFormItems.filter(i => i.skuId && i.qty > 0)
    if (validItems.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm hợp lệ!')
      return
    }

    const todayStr = new Date().toISOString().slice(0, 10)
    const newPOId = `PO-${todayStr.replace(/-/g, '')}-${String(purchaseOrders.length + 1).padStart(3, '0')}`

    const itemsMapped: PurchaseOrderItem[] = validItems.map(vi => {
      const skuInfo = allSKUs.find(s => s.skuId === vi.skuId)!
      return {
        skuId: vi.skuId,
        skuCode: skuInfo.skuCode,
        productName: skuInfo.fullName,
        qty: vi.qty,
        unitPrice: vi.unitPrice
      }
    })

    const totalVal = itemsMapped.reduce((s, i) => s + i.qty * i.unitPrice, 0)

    const newPO: PurchaseOrder = {
      id: newPOId,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: itemsMapped,
      total: totalVal,
      status: 'confirmed', // Directly confirm so it is ready for Stock In
      createdAt: todayStr,
      expectedDelivery: poFormDelivery,
      note: poFormNote
    }

    const nextPOs = [newPO, ...purchaseOrders]
    setPurchaseOrders(nextPOs)
    savePurchaseOrders(nextPOs)

    // Update supplier totalOrders count
    const nextSuppliers = suppliers.map(s => {
      if (s.id !== supplier.id) return s
      return {
        ...s,
        totalOrders: s.totalOrders + 1,
        lastOrderDate: todayStr
      }
    })
    setSuppliers(nextSuppliers)
    saveSuppliers(nextSuppliers)

    setIsPOModalOpen(false)
    showToast(`Đã tạo thành công Đơn PO: ${newPOId}`)
  }

  function updatePOStatus(poId: string, newStatus: PurchaseOrder['status']) {
    const next = purchaseOrders.map(po => {
      if (po.id !== poId) return po
      return { ...po, status: newStatus }
    })
    setPurchaseOrders(next)
    savePurchaseOrders(next)
    if (selectedPO && selectedPO.id === poId) {
      setSelectedPO(next.find(po => po.id === poId) || null)
    }
    showToast(`Cập nhật trạng thái PO ${poId} -> ${PO_STATUS_LABELS[newStatus]}`)
  }

  // Filters calculation
  const filteredSuppliers = suppliers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(supplierSearch.toLowerCase()) || 
                        s.phone.includes(supplierSearch) ||
                        s.contactPerson.toLowerCase().includes(supplierSearch.toLowerCase())
    return matchSearch
  })

  const filteredPOs = purchaseOrders.filter(po => {
    const matchSearch = po.id.toLowerCase().includes(poSearch.toLowerCase()) ||
                        po.supplierName.toLowerCase().includes(poSearch.toLowerCase())
    const matchStatus = poStatusFilter === 'all' || po.status === poStatusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="font-semibold text-sm">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mua hàng & Nhà cung cấp</h1>
          <p className="text-sm text-gray-500">Quản lý đối tác và theo dõi tiến độ các Đơn mua hàng (PO)</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'suppliers' ? (
            <button onClick={openCreateSupplier} className="btn-primary">
              <Plus size={15} /> Thêm nhà cung cấp
            </button>
          ) : (
            <button onClick={openCreatePO} className="btn-primary bg-indigo-650 hover:bg-indigo-700">
              <Plus size={15} /> Tạo đơn mua hàng PO
            </button>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('suppliers'); setSelectedPO(null); }}
          className={`py-2.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'suppliers' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Nhà cung cấp ({suppliers.length})
        </button>
        <button
          onClick={() => { setActiveTab('pos'); setSelectedSupplier(null); }}
          className={`py-2.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'pos' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Đơn mua hàng PO ({purchaseOrders.length})
        </button>
      </div>

      {/* TAB 1: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="flex gap-5">
          {/* Supplier Table */}
          <div className={`flex-1 transition-all space-y-4 ${selectedSupplier ? 'max-w-[60%]' : ''}`}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="form-input pl-9 text-sm"
                placeholder="Tìm kiếm nhà cung cấp theo tên, SĐT, người liên hệ..."
                value={supplierSearch}
                onChange={e => setSupplierSearch(e.target.value)}
              />
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="table-th">Nhà cung cấp</th>
                    <th className="table-th">Liên hệ</th>
                    <th className="table-th text-center">Đơn PO</th>
                    <th className="table-th">Trạng thái</th>
                    <th className="table-th text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSuppliers.map(s => (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedSupplier(selectedSupplier?.id === s.id ? null : s)}
                      className={`hover:bg-gray-55/40 transition-colors cursor-pointer ${
                        selectedSupplier?.id === s.id ? 'bg-primary-50/20 border-l-2 border-l-primary-500' : ''
                      }`}
                    >
                      <td className="table-td">
                        <div className="font-bold text-gray-900">{s.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{s.address}</div>
                      </td>
                      <td className="table-td text-xs">
                        <div className="font-semibold text-gray-700">{s.contactPerson}</div>
                        <div className="text-gray-400 mt-0.5">{s.phone}</div>
                      </td>
                      <td className="table-td text-center">
                        <div className="font-black text-gray-800">{s.totalOrders}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">Cuối: {s.lastOrderDate}</div>
                      </td>
                      <td className="table-td">
                        <span className={s.status === 'active' ? 'badge-green' : 'badge-gray'}>
                          {s.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="table-td" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => openEditSupplier(s)}
                            className="p-1.5 text-gray-400 hover:text-primary-650 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => toggleSupplierStatus(s.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              s.status === 'active' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'
                            }`}
                            title={s.status === 'active' ? 'Khóa đối tác' : 'Kích hoạt'}
                          >
                            {s.status === 'active' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSuppliers.length === 0 && (
                <div className="p-10 text-center text-gray-400 text-sm">Không tìm thấy nhà cung cấp nào</div>
              )}
            </div>
          </div>

          {/* Supplier Detail Panel */}
          {selectedSupplier && (
            <div className="w-[40%] card p-5 space-y-4 animate-slideIn sticky top-4 self-start">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Chi tiết nhà cung cấp</h3>
                <button onClick={() => setSelectedSupplier(null)} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">{selectedSupplier.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Mã nhà cung cấp: {selectedSupplier.id}</p>
                </div>

                <div className="space-y-2.5 bg-gray-50 rounded-xl p-3 border">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={13} className="text-gray-400 shrink-0" />
                    <span>SĐT: <strong>{selectedSupplier.phone}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail size={13} className="text-gray-400 shrink-0" />
                    <span>Email: <strong>{selectedSupplier.email}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={13} className="text-gray-400 shrink-0" />
                    <span>Địa chỉ: <span>{selectedSupplier.address}</span></span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 border p-2 rounded-xl">
                    <div className="text-base font-black text-primary-600">{selectedSupplier.totalOrders}</div>
                    <div className="text-[9px] text-gray-400 uppercase font-bold mt-0.5">Tổng số đơn hàng</div>
                  </div>
                  <div className="bg-slate-50 border p-2 rounded-xl">
                    <div className="text-xs font-black text-gray-800">{selectedSupplier.lastOrderDate}</div>
                    <div className="text-[9px] text-gray-400 uppercase font-bold mt-1">Đơn gần nhất</div>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Danh mục sản phẩm cung cấp</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedSupplier.productCategories.map(cat => (
                      <span key={cat} className="badge-blue text-[9px] px-2 py-0.5">{cat}</span>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <span className="text-[10px] font-black text-gray-700 uppercase block">Lịch sử đơn PO gần đây</span>
                  {purchaseOrders.filter(po => po.supplierId === selectedSupplier.id).length === 0 ? (
                    <div className="text-center py-5 text-gray-400 text-[10px] border border-dashed rounded-xl">Chưa có đơn hàng nào</div>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {purchaseOrders.filter(po => po.supplierId === selectedSupplier.id).map(po => (
                        <div key={po.id} className="bg-white border rounded-lg p-2 flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-gray-850">{po.id}</span>
                            <span className="block text-[9px] text-gray-400">{po.createdAt} · {po.items.length} mặt hàng</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900 block">{formatPrice(po.total)}</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                              po.status === 'received' ? 'bg-emerald-50 text-emerald-600' : 
                              po.status === 'cancelled' ? 'bg-red-50 text-red-650' : 'bg-blue-50 text-blue-600'
                            }`}>{PO_STATUS_LABELS[po.status]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PURCHASE ORDERS (PO) */}
      {activeTab === 'pos' && (
        <div className="flex gap-5">
          {/* PO Table */}
          <div className={`flex-1 transition-all space-y-4 ${selectedPO ? 'max-w-[60%]' : ''}`}>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="form-input pl-9 text-sm"
                  placeholder="Tìm PO theo mã đơn, tên nhà cung cấp..."
                  value={poSearch}
                  onChange={e => setPoSearch(e.target.value)}
                />
              </div>
              <select
                className="form-input w-auto text-xs font-bold"
                value={poStatusFilter}
                onChange={e => setPoStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="draft">Nháp</option>
                <option value="sent">Đã gửi đơn</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="received">Đã nhận hàng</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="table-th">Mã đơn PO</th>
                    <th className="table-th">Nhà cung cấp</th>
                    <th className="table-th text-right">Tổng tiền</th>
                    <th className="table-th text-center">Trạng thái</th>
                    <th className="table-th">Ngày dự kiến</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPOs.map(po => (
                    <tr
                      key={po.id}
                      onClick={() => setSelectedPO(selectedPO?.id === po.id ? null : po)}
                      className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                        selectedPO?.id === po.id ? 'bg-primary-50/20 border-l-2 border-l-primary-500' : ''
                      }`}
                    >
                      <td className="table-td">
                        <span className="font-mono text-xs font-bold text-indigo-600">{po.id}</span>
                        <span className="block text-[10px] text-gray-400 mt-0.5">Lập ngày: {po.createdAt}</span>
                      </td>
                      <td className="table-td">
                        <div className="font-semibold text-gray-800 text-xs truncate max-w-44">{po.supplierName}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{po.items.length} SKU hàng đặt</div>
                      </td>
                      <td className="table-td text-right font-black text-gray-900">
                        {formatPrice(po.total)}
                      </td>
                      <td className="table-td text-center">
                        <span className={PO_STATUS_COLORS[po.status]}>{PO_STATUS_LABELS[po.status]}</span>
                      </td>
                      <td className="table-td text-xs font-semibold text-gray-600">
                        {po.expectedDelivery}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPOs.length === 0 && (
                <div className="p-10 text-center text-gray-400 text-sm">Không tìm thấy đơn mua hàng nào</div>
              )}
            </div>
          </div>

          {/* PO Detail Panel */}
          {selectedPO && (
            <div className="w-[40%] card p-5 space-y-4 animate-slideIn sticky top-4 self-start">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="text-sm font-black text-indigo-700 font-mono">{selectedPO.id}</h3>
                  <span className="text-[9px] text-gray-400 font-semibold block">Ngày lập: {selectedPO.createdAt}</span>
                </div>
                <button onClick={() => setSelectedPO(null)} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Nhà cung cấp đối tác</span>
                  <div className="font-bold text-gray-950 text-xs mt-0.5">{selectedPO.supplierName}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-gray-50 border rounded-xl p-3">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Trạng thái</span>
                    <span className={`inline-block mt-0.5 ${PO_STATUS_COLORS[selectedPO.status]}`}>{PO_STATUS_LABELS[selectedPO.status]}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Giao dự kiến</span>
                    <span className="font-semibold text-gray-800 block mt-0.5">{selectedPO.expectedDelivery}</span>
                  </div>
                </div>

                {selectedPO.note && (
                  <div className="bg-gray-50 border rounded-xl p-2.5 text-gray-600">
                    📋 {selectedPO.note}
                  </div>
                )}

                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-2">Hàng hóa đặt mua ({selectedPO.items.length} SKU)</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedPO.items.map((item, i) => (
                      <div key={i} className="bg-white border rounded-xl p-2.5 flex justify-between items-center shadow-sm">
                        <div className="max-w-[70%]">
                          <div className="font-bold text-gray-850 leading-tight">{item.productName}</div>
                          <span className="font-mono text-[9px] text-gray-400 block mt-0.5">{item.skuCode} · Giá đặt: {formatPrice(item.unitPrice)}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded shadow-sm border border-indigo-100">x{item.qty}</span>
                          <span className="block font-black text-[11px] text-gray-900 mt-1">{formatPrice(item.qty * item.unitPrice)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-xs font-black text-gray-550 uppercase">Tổng tiền đặt:</span>
                  <span className="text-base font-black text-indigo-700">{formatPrice(selectedPO.total)}</span>
                </div>

                {/* Status action buttons */}
                {['draft', 'sent', 'confirmed'].includes(selectedPO.status) && (
                  <div className="border-t pt-3 space-y-2">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Cập nhật nhanh tiến độ PO</span>
                    <div className="flex gap-2">
                      {selectedPO.status === 'draft' && (
                        <button onClick={() => updatePOStatus(selectedPO.id, 'sent')} className="flex-1 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-750 font-bold hover:bg-indigo-100 rounded-lg">
                          Gửi đơn NCC
                        </button>
                      )}
                      {(selectedPO.status === 'draft' || selectedPO.status === 'sent') && (
                        <button onClick={() => updatePOStatus(selectedPO.id, 'confirmed')} className="flex-1 py-1.5 bg-blue-50 border border-blue-200 text-blue-750 font-bold hover:bg-blue-100 rounded-lg">
                          Xác nhận PO
                        </button>
                      )}
                      {selectedPO.status === 'confirmed' && (
                        <div className="bg-amber-50 border border-amber-250/20 text-amber-900 rounded-xl p-2.5 leading-normal flex items-start gap-2 w-full">
                          <ShieldAlert size={14} className="text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            Đơn PO đã sẵn sàng. Đi đến màn hình <strong>Nhập Kho Mới</strong> và chọn mã đơn này để nhận hàng.
                          </div>
                        </div>
                      )}
                      <button onClick={() => updatePOStatus(selectedPO.id, 'cancelled')} className="px-3.5 py-1.5 bg-red-50 border border-red-200 text-red-650 font-bold hover:bg-red-100 rounded-lg">
                        Hủy đơn
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT SUPPLIER --- */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveSupplier} className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 animate-scaleUp shadow-2xl">
            <h3 className="text-base font-black text-gray-900 border-b pb-2">
              {editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2 space-y-1">
                <label className="font-bold text-gray-700">Tên Nhà cung cấp <span className="text-red-500">*</span></label>
                <input required className="form-input text-xs py-2" placeholder="VD: Công ty Royal Canin..." value={supFormName} onChange={e => setSupFormName(e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Người đại diện liên hệ</label>
                <input className="form-input text-xs py-2" placeholder="VD: Nguyễn Văn A..." value={supFormContact} onChange={e => setSupFormContact(e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                <input required className="form-input text-xs py-2" placeholder="VD: 0912..." value={supFormPhone} onChange={e => setSupFormPhone(e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Thư điện tử (Email)</label>
                <input type="email" className="form-input text-xs py-2" placeholder="VD: info@..." value={supFormEmail} onChange={e => setSupFormEmail(e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Trạng thái đối tác</label>
                <select className="form-input text-xs py-2" value={supFormStatus} onChange={e => setSupFormStatus(e.target.value as 'active' | 'inactive')}>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm ngưng</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="font-bold text-gray-700">Địa chỉ văn phòng/kho</label>
                <input className="form-input text-xs py-2" placeholder="VD: 123 Lê Lợi..." value={supFormAddress} onChange={e => setSupFormAddress(e.target.value)} />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="font-bold text-gray-700 block">Các danh mục cung cấp chính (chọn nhiều)</label>
                <div className="flex gap-2">
                  {['Thức ăn chó', 'Thức ăn mèo', 'Phụ kiện', 'Chăm sóc', 'Dịch vụ'].map(cat => {
                    const isSelected = supFormCategories.includes(cat)
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSupFormCategories(prev =>
                            isSelected ? prev.filter(c => c !== cat) : [...prev, cat]
                          )
                        }}
                        className={`px-3 py-1.5 border rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary-50 border-primary-400 text-primary-700' : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t">
              <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="btn-secondary flex-1 justify-center py-2.5 rounded-2xl text-xs font-bold">Hủy</button>
              <button type="submit" className="btn-primary flex-1 justify-center py-2.5 rounded-2xl text-xs font-bold">Lưu lại</button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL: CREATE PURCHASE ORDER (PO) --- */}
      {isPOModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreatePO} className="bg-white rounded-3xl w-full max-w-2xl p-6 space-y-4 animate-scaleUp shadow-2xl flex flex-col max-h-[90vh]">
            <h3 className="text-base font-black text-gray-900 border-b pb-2 shrink-0">
              Tạo đơn mua hàng PO mới
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Chọn Nhà cung cấp đối tác <span className="text-red-500">*</span></label>
                  <select
                    required
                    className="form-input text-xs py-2"
                    value={poFormSupId}
                    onChange={e => setPoFormSupId(e.target.value)}
                  >
                    <option value="">-- Chọn đối tác cung cấp --</option>
                    {suppliers.filter(s => s.status === 'active').map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.contactPerson})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Ngày giao hàng dự kiến <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="date"
                    className="form-input text-xs py-2 font-bold"
                    min={new Date().toISOString().slice(0, 10)}
                    value={poFormDelivery}
                    onChange={e => setPoFormDelivery(e.target.value)}
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-gray-700">Ghi chú đơn PO</label>
                  <input
                    className="form-input text-xs py-2"
                    placeholder="Ví dụ: Đơn nhập bổ sung hàng bán hè, yêu cầu date xa..."
                    value={poFormNote}
                    onChange={e => setPoFormNote(e.target.value)}
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-gray-800 uppercase tracking-wide">Danh sách sản phẩm mua đặt</span>
                  <button
                    type="button"
                    onClick={addPOFormLine}
                    className="text-primary-600 hover:text-primary-800 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <Plus size={12} /> Thêm SKU hàng đặt
                  </button>
                </div>

                <div className="space-y-2">
                  {poFormItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 items-end bg-slate-50/50 p-2.5 rounded-xl border">
                      <div className="flex-1 min-w-44 space-y-1">
                        <label className="font-bold text-gray-400 text-[10px] uppercase">Chọn sản phẩm / SKU</label>
                        <select
                          required
                          className="form-input text-[11px] py-1.5"
                          value={item.skuId}
                          onChange={e => updatePOFormLine(idx, 'skuId', e.target.value)}
                        >
                          <option value="">-- Chọn mặt hàng đặt --</option>
                          {allSKUs.map(sku => (
                            <option key={sku.skuId} value={sku.skuId}>{sku.fullName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-20 space-y-1">
                        <label className="font-bold text-gray-400 text-[10px] uppercase">SL Đặt</label>
                        <input
                          required
                          type="number"
                          min="1"
                          className="form-input text-xs py-1.5 font-bold"
                          value={item.qty}
                          onChange={e => updatePOFormLine(idx, 'qty', +e.target.value)}
                        />
                      </div>

                      <div className="w-32 space-y-1">
                        <label className="font-bold text-gray-400 text-[10px] uppercase">Giá nhập vốn</label>
                        <input
                          required
                          type="number"
                          min="0"
                          className="form-input text-xs py-1.5 font-bold"
                          value={item.unitPrice}
                          onChange={e => updatePOFormLine(idx, 'unitPrice', +e.target.value)}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removePOFormLine(idx)}
                        disabled={poFormItems.length === 1}
                        className="p-2 border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summing total */}
            <div className="shrink-0 flex justify-between items-center bg-gray-50 rounded-xl p-3 border text-xs">
              <span className="font-bold text-gray-500">TỔNG GIÁ TRỊ ĐƠN ĐẶT (ƯỚC TÍNH):</span>
              <span className="font-black text-base text-indigo-750">
                {formatPrice(poFormItems.reduce((s, i) => s + (i.qty || 0) * (i.unitPrice || 0), 0))}
              </span>
            </div>

            <div className="flex gap-3 pt-3 border-t shrink-0">
              <button type="button" onClick={() => setIsPOModalOpen(false)} className="btn-secondary flex-1 justify-center py-2.5 rounded-2xl text-xs font-bold">Hủy</button>
              <button type="submit" className="btn-primary bg-indigo-650 hover:bg-indigo-700 flex-1 justify-center py-2.5 rounded-2xl text-xs font-bold">Xác nhận tạo PO</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
