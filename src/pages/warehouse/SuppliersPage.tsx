import { useState } from 'react'
import { Plus, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react'

interface Supplier {
  id: string
  name: string
  phone: string
  email: string
  address: string
  category: string
  status: 'active' | 'inactive'
  lastOrder: string
  totalOrders: number
}

const SUPPLIERS_MOCK: Supplier[] = [
  { id: 'SUP001', name: 'Royal Canin Vietnam', phone: '028 3820 8899', email: 'sales@royalcanin.vn', address: '123 Lê Văn Lương, TP.HCM', category: 'Thức ăn chó mèo', status: 'active', lastOrder: '2026-05-28', totalOrders: 45 },
  { id: 'SUP002', name: 'Mars Vietnam (Whiskas)', phone: '028 5412 3000', email: 'contact@mars.vn', address: '456 Nguyễn Huệ, TP.HCM', category: 'Thức ăn chó mèo', status: 'active', lastOrder: '2026-05-25', totalOrders: 38 },
  { id: 'SUP003', name: 'Bioline Vietnam', phone: '028 7300 5555', email: 'info@bioline.vn', address: '789 Trần Hưng Đạo, TP.HCM', category: 'Dịch vụ & Phụ kiện', status: 'active', lastOrder: '2026-05-20', totalOrders: 22 },
  { id: 'SUP004', name: 'Pedigree Việt', phone: '028 6255 1234', email: 'sales@pedigree.vn', address: '321 Pasteur, TP.HCM', category: 'Thức ăn chó mèo', status: 'inactive', lastOrder: '2026-04-15', totalOrders: 15 },
]

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(SUPPLIERS_MOCK)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filtered = suppliers.filter(s =>
    (categoryFilter === 'all' || s.category === categoryFilter) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm))
  )

  const categories = [...new Set(suppliers.map(s => s.category))]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nhà cung cấp</h1>
          <p className="text-sm text-gray-500">{suppliers.length} nhà cung cấp · {suppliers.filter(s => s.status === 'active').length} hoạt động</p>
        </div>
        <button className="btn-primary"><Plus size={15} /> Thêm nhà cung cấp</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input className="form-input flex-1" placeholder="Tìm theo tên hoặc SĐT..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select className="form-input w-auto" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="all">Tất cả danh mục</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th">Nhà cung cấp</th>
              <th className="table-th">Danh mục</th>
              <th className="table-th">Liên hệ</th>
              <th className="table-th">Đơn hàng</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="table-td">
                  <div>
                    <div className="font-medium text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.address}</div>
                  </div>
                </td>
                <td className="table-td"><span className="badge-blue text-[10px]">{s.category}</span></td>
                <td className="table-td text-xs">
                  <div className="flex items-center gap-1.5"><Phone size={11} />{s.phone}</div>
                  <div className="flex items-center gap-1.5"><Mail size={11} />{s.email}</div>
                </td>
                <td className="table-td">
                  <div className="font-bold text-gray-900">{s.totalOrders}</div>
                  <div className="text-xs text-gray-400">Cuối: {s.lastOrder}</div>
                </td>
                <td className="table-td">
                  <span className={s.status === 'active' ? 'badge-green' : 'badge-gray'}>
                    {s.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </td>
                <td className="table-td flex gap-1">
                  <button className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"><Edit size={13} /></button>
                  <button className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">Không tìm thấy nhà cung cấp</div>
        )}
      </div>
    </div>
  )
}
