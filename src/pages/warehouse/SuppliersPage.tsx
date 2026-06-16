import { useState } from 'react'
import { 
  Plus, Edit, Phone, Mail, MapPin, Search, CheckCircle, XCircle
} from 'lucide-react'
import { 
  SUPPLIER_MOCK_LIST, saveSuppliers, Supplier, PURCHASE_ORDER_LIST
} from '@/data/supplierMockData'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => SUPPLIER_MOCK_LIST)
  const [toast, setToast] = useState('')
  const [supplierSearch, setSupplierSearch] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  // Modals visibility
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  // Supplier Form state
  const [supFormName, setSupFormName] = useState('')
  const [supFormContact, setSupFormContact] = useState('')
  const [supFormPhone, setSupFormPhone] = useState('')
  const [supFormEmail, setSupFormEmail] = useState('')
  const [supFormAddress, setSupFormAddress] = useState('')
  const [supFormCategories, setSupFormCategories] = useState<string[]>([])
  const [supFormStatus, setSupFormStatus] = useState<'active' | 'inactive'>('active')

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
      if (editingSupplier.status === 'active' && supFormStatus === 'inactive') {
        const hasPending = PURCHASE_ORDER_LIST.some(o => o.supplierId === editingSupplier.id && (o.status === 'sent' || o.status === 'confirmed'))
        if (hasPending) {
          alert(`Không thể ngừng hoạt động: Nhà cung cấp này hiện đang có đơn mua hàng PO đang chờ duyệt hoặc chờ giao hàng.`)
          return
        }

        const uniqueWarningCategories: string[] = []
        editingSupplier.productCategories.forEach(cat => {
          const otherActiveForCat = suppliers.some(s => s.id !== editingSupplier.id && s.status === 'active' && s.productCategories.includes(cat))
          if (!otherActiveForCat) {
            uniqueWarningCategories.push(cat)
          }
        })

        if (uniqueWarningCategories.length > 0) {
          const confirmStop = confirm(`Cảnh báo: Đây là nhà cung cấp HOẠT ĐỘNG DUY NHẤT cung cấp danh mục: ${uniqueWarningCategories.join(', ')}. Bạn có chắc chắn vẫn muốn ngừng hoạt động nhà cung cấp này?`)
          if (!confirmStop) return
        }
      }

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
    const supplier = suppliers.find(s => s.id === supplierId)
    if (!supplier) return

    if (supplier.status === 'active') {
      // Check pending orders
      const hasPending = PURCHASE_ORDER_LIST.some(o => o.supplierId === supplierId && (o.status === 'sent' || o.status === 'confirmed'))
      if (hasPending) {
        alert(`Không thể ngừng hoạt động: Nhà cung cấp này hiện đang có đơn mua hàng PO đang chờ duyệt hoặc chờ giao hàng.`)
        return
      }

      // Check last supplier in categories
      const uniqueWarningCategories: string[] = []
      supplier.productCategories.forEach(cat => {
        const otherActiveForCat = suppliers.some(s => s.id !== supplierId && s.status === 'active' && s.productCategories.includes(cat))
        if (!otherActiveForCat) {
          uniqueWarningCategories.push(cat)
        }
      })

      if (uniqueWarningCategories.length > 0) {
        const confirmStop = confirm(`Cảnh báo: Đây là nhà cung cấp HOẠT ĐỘNG DUY NHẤT cung cấp danh mục: ${uniqueWarningCategories.join(', ')}. Bạn có chắc chắn vẫn muốn ngừng hoạt động nhà cung cấp này?`)
        if (!confirmStop) return
      }
    }

    const next = suppliers.map(s => {
      if (s.id !== supplierId) return s
      const newStatus = s.status === 'active' ? 'inactive' : 'active'
      showToast(`Đã chuyển trạng thái nhà cung cấp thành: ${newStatus === 'active' ? 'Hoạt động' : 'Tạm dừng'}`)
      return { ...s, status: newStatus as 'active' | 'inactive' }
    })
    setSuppliers(next)
    saveSuppliers(next)
    if (selectedSupplier && selectedSupplier.id === supplierId) {
      setSelectedSupplier(next.find(s => s.id === supplierId) || null)
    }
  }

  // Filters calculation
  const filteredSuppliers = suppliers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(supplierSearch.toLowerCase()) || 
                        s.phone.includes(supplierSearch) ||
                        s.contactPerson.toLowerCase().includes(supplierSearch.toLowerCase())
    return matchSearch
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
          <h1 className="text-xl font-bold text-gray-900">Danh sách Nhà cung cấp</h1>
          <p className="text-sm text-gray-500">Quản lý danh sách các đối tác cung cấp hàng hóa cho Pet Shop</p>
        </div>
        <button onClick={openCreateSupplier} className="btn-primary">
          <Plus size={15} /> Thêm nhà cung cấp
        </button>
      </div>

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
                  <th className="table-th text-center">Đơn hàng</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSuppliers.map(s => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedSupplier(selectedSupplier?.id === s.id ? null : s)}
                    className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
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
              <button onClick={() => setSelectedSupplier(null)} className="text-gray-400 hover:text-gray-650 font-bold">×</button>
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
                  <div className="text-[9px] text-gray-400 uppercase font-bold mt-0.5">Tổng số lần giao hàng</div>
                </div>
                <div className="bg-slate-50 border p-2 rounded-xl">
                  <div className="text-xs font-black text-gray-800">{selectedSupplier.lastOrderDate}</div>
                  <div className="text-[9px] text-gray-400 uppercase font-bold mt-1">Lần giao gần nhất</div>
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
            </div>
          </div>
        )}
      </div>

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
    </div>
  )
}
