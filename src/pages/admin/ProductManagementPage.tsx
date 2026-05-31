import { useState } from 'react'
import { Search, Plus, Edit, Eye } from 'lucide-react'
import { PRODUCT_MOCK_LIST, PRODUCT_CATEGORIES } from '@/data/productMockData'
import { formatPrice } from '@/utils/format'

export default function AdminProductManagementPage() {
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = PRODUCT_MOCK_LIST
    .filter(p => !selectedCat || p.category === PRODUCT_CATEGORIES.find(c => c.id === selectedCat)?.name)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý sản phẩm & SKU</h1>
          <p className="text-sm text-gray-500">{PRODUCT_MOCK_LIST.length} sản phẩm · {PRODUCT_MOCK_LIST.reduce((s, p) => s + p.skus.length, 0)} SKU</p>
        </div>
        <button className="btn-primary"><Plus size={15} /> Thêm sản phẩm</button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9" placeholder="Tìm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input w-auto" value={selectedCat ?? ''} onChange={e => setSelectedCat(e.target.value || null)}>
          <option value="">Tất cả danh mục</option>
          {PRODUCT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(p => {
          const totalStock = p.skus.reduce((s, sku) => s + sku.stock, 0)
          const minPrice = Math.min(...p.skus.map(s => s.price))
          const maxPrice = Math.max(...p.skus.map(s => s.price))
          const isExpanded = expandedId === p.id
          return (
            <div key={p.id} className="card overflow-hidden">
              {/* Product row */}
              <div className="p-4 flex items-center gap-4">
                <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900">{p.name}</span>
                    <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-red'} text-[10px]`}>
                      {p.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{p.brand} · {p.category}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{p.skus.length} biến thể</span>
                    <span className="text-xs text-gray-400">Tồn kho: {totalStock}</span>
                    <span className="text-xs font-medium text-primary-600">
                      {minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)}–${formatPrice(maxPrice)}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    className="btn-secondary text-xs py-1.5">
                    <Eye size={12} /> {isExpanded ? 'Ẩn SKU' : 'Xem SKU'}
                  </button>
                  <button className="btn-secondary text-xs py-1.5"><Edit size={12} /> Sửa</button>
                </div>
              </div>

              {/* SKU table (expanded) */}
              {isExpanded && (
                <div className="border-t">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Danh sách SKU ({p.skus.length})
                  </div>
                  <table className="w-full">
                    <thead className="border-b bg-gray-50/50">
                      <tr>
                        <th className="table-th">Mã SKU</th>
                        {p.attributes.map(a => <th key={a.name} className="table-th">{a.name}</th>)}
                        <th className="table-th">Giá</th>
                        <th className="table-th">Tồn kho</th>
                        <th className="table-th">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {p.skus.map(sku => (
                        <tr key={sku.id} className={`hover:bg-gray-50 ${sku.stock === 0 ? 'opacity-50' : ''}`}>
                          <td className="table-td font-mono text-xs text-gray-500">{sku.sku}</td>
                          {p.attributes.map(a => (
                            <td key={a.name} className="table-td text-xs">{sku.attributes[a.name]}</td>
                          ))}
                          <td className="table-td text-xs font-medium text-primary-600">{formatPrice(sku.price)}</td>
                          <td className="table-td">
                            <span className={`text-xs font-semibold ${sku.stock === 0 ? 'text-red-500' : sku.stock < 5 ? 'text-orange-500' : 'text-green-600'}`}>
                              {sku.stock === 0 ? 'Hết hàng' : sku.stock}
                            </span>
                          </td>
                          <td className="table-td">
                            <button className="text-xs text-primary-600 hover:underline"><Edit size={11} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
