import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/auth/AuthContext'
import {
  Search, Plus, Edit, Eye, EyeOff, Trash2, Package, Layers, AlertTriangle, AlertCircle, ShoppingBag, CheckCircle
} from 'lucide-react'
import { PRODUCT_MOCK_LIST, PRODUCT_CATEGORIES, saveProducts } from '@/data/productMockData'
import { formatPrice } from '@/utils/format'
import type { Product } from '@/types'

export default function AdminProductManagementPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuthContext()
  const isWarehouseManager = currentUser?.role === 'warehouse_manager'
  const routePrefix = isWarehouseManager ? '/warehouse' : '/admin'
  
  // Local state to trigger re-renders after mutations
  const [productList, setProductList] = useState<Product[]>(PRODUCT_MOCK_LIST)
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // Toast notifications
  const [toastMsg, setToastMsg] = useState('')

  // Action: Delete product
  function handleDelete(product: Product) {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"? Tất cả các SKU liên quan cũng sẽ bị xóa. Thao tác không thể hoàn tác.`)) {
      const updatedList = productList.filter(p => p.id !== product.id)
      saveProducts(updatedList)
      setProductList(updatedList)
      triggerToast(`Đã xóa sản phẩm "${product.name}" thành công.`)
    }
  }

  function triggerToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // --- Statistics Computing ---
  const stats = useMemo(() => {
    const totalProducts = productList.length
    let totalSKUs = 0
    let outOfStockSKUs = 0
    let totalStock = 0

    productList.forEach(p => {
      totalSKUs += p.skus.length
      p.skus.forEach(s => {
        totalStock += s.stock
        if (s.stock === 0) {
          outOfStockSKUs++
        }
      })
    })

    return {
      totalProducts,
      totalSKUs,
      outOfStockSKUs,
      totalStock
    }
  }, [productList])

  // --- Filtering ---
  const filteredProducts = useMemo(() => {
    return productList.filter(p => {
      const selectedCategoryObj = PRODUCT_CATEGORIES.find(c => c.id === selectedCat)
      let matchesCategory = true
      
      if (selectedCat && selectedCategoryObj) {
        if (selectedCategoryObj.parentId === null) {
          // Parent category selected: match any products in its subcategories
          const subCategoryNames = PRODUCT_CATEGORIES
            .filter(c => c.parentId === selectedCategoryObj.id)
            .map(c => c.name)
          matchesCategory = subCategoryNames.includes(p.category)
        } else {
          // Subcategory selected: match exactly
          matchesCategory = p.category === selectedCategoryObj.name
        }
      }
      
      const matchesSearch = !search || 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase())
      
      return matchesCategory && matchesSearch
    })
  }, [productList, selectedCat, search])

  return (
    <div className="space-y-6 animate-fadeIn relative text-xs">
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-gray-950 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-slideIn">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <ShoppingBag size={22} className="text-red-800" />
            Quản lý Sản phẩm & SKU
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Xem danh sách sản phẩm, quản lý mã SKU biến thể, cấu hình tồn kho và thiết lập giá bán.
          </p>
        </div>
        {!isWarehouseManager && (
          <button
            onClick={() => navigate(`${routePrefix}/products/new`)}
            className="btn-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 bg-red-800 hover:bg-red-900 border-none transition-all shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} /> Thêm sản phẩm mới
          </button>
        )}
      </div>

      {/* Statistics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Tổng sản phẩm</span>
            <span className="text-xl font-extrabold text-gray-800">{stats.totalProducts}</span>
          </div>
          <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-100">
            <ShoppingBag size={18} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Tổng biến thể SKU</span>
            <span className="text-xl font-extrabold text-gray-800">{stats.totalSKUs}</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
            <Layers size={18} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Tổng tồn kho toàn hệ thống</span>
            <span className="text-xl font-extrabold text-gray-800">{stats.totalStock} đơn vị</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
            <Package size={18} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">SKU hết hàng</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-rose-600">{stats.outOfStockSKUs}</span>
              {stats.outOfStockSKUs > 0 && (
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100 animate-pulse">
                  Cần nhập thêm
                </span>
              )}
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-100">
            <AlertCircle size={18} />
          </div>
        </div>
      </div>

      {/* Toolbar Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên sản phẩm, thương hiệu, mã ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8.5 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-semibold shrink-0">Danh mục:</span>
          <select
            value={selectedCat ?? ''}
            onChange={(e) => setSelectedCat(e.target.value || null)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500 bg-white font-medium text-gray-700"
          >
            <option value="">Tất cả danh mục</option>
            {PRODUCT_CATEGORIES.filter(c => c.parentId === null).map(parent => {
              const subs = PRODUCT_CATEGORIES.filter(c => c.parentId === parent.id)
              return (
                <optgroup key={parent.id} label={`${parent.icon} ${parent.name}`}>
                  <option value={parent.id}>Tất cả thuộc {parent.name}</option>
                  {subs.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.icon} {sub.name}
                    </option>
                  ))}
                </optgroup>
              )
            })}
          </select>
        </div>
      </div>

      {/* Products Grid & List Card style */}
      <div className="space-y-4">
        {filteredProducts.map(p => {
          const totalStock = p.skus.reduce((s, sku) => s + sku.stock, 0)
          const minPrice = Math.min(...p.skus.map(s => s.price))
          const maxPrice = Math.max(...p.skus.map(s => s.price))
          const isExpanded = expandedId === p.id

          return (
            <div
              key={p.id}
              className={`bg-white rounded-xl border p-4 shadow-sm transition-all duration-300 relative overflow-hidden group ${
                isExpanded ? 'border-red-800/40 ring-1 ring-red-800/10' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
              }`}
            >
              {/* Highlight bar side */}
              <div className={`absolute left-0 top-0 w-1 h-full transition-colors ${
                p.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'
              }`} />

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Image */}
                <img
                  src={p.images[0]}
                  alt={p.name}
                  onError={(e) => {
                    (e.target as any).src = 'https://placehold.co/400x400/eeeeee/888888?text=Product'
                  }}
                  className="w-16 h-16 object-cover rounded-lg shrink-0 border border-gray-100 shadow-sm"
                />

                {/* Metadata */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-sm font-extrabold text-gray-800 group-hover:text-red-800 transition-colors">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">ID: {p.id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${
                      p.status === 'active'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {p.status === 'active' ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
                    </span>
                  </div>

                  <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    {p.brand} • <span className="text-red-700">{p.category}</span>
                  </div>

                  <p className="text-[10px] text-gray-500 max-w-xl line-clamp-1">
                    {p.description || 'Chưa có mô tả chi tiết cho sản phẩm.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[10px] text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Layers size={11} /> <strong>{p.skus.length}</strong> SKU biến thể
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Package size={11} /> Tổng tồn: <strong className={totalStock === 0 ? 'text-rose-500' : 'text-gray-700'}>{totalStock}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-red-800 font-bold">
                      Tầm giá: {minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      isExpanded
                        ? 'bg-red-800 border-red-900 text-white hover:bg-red-900 shadow-sm'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {isExpanded ? (
                      <>
                        <EyeOff size={13} /> Ẩn SKU
                      </>
                    ) : (
                      <>
                        <Eye size={13} /> Xem SKU
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate(`${routePrefix}/products/${p.id}/edit`)}
                    title="Chỉnh sửa sản phẩm"
                    className="p-2 text-gray-400 hover:text-red-800 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
                  >
                    <Edit size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(p)}
                    title="Xóa sản phẩm"
                    className="p-2 text-gray-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Collapsible SKUs Table list */}
              {isExpanded && (
                <div className="border-t border-gray-100 mt-4 pt-3 space-y-2 animate-fadeIn">
                  <div className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wide px-1">
                    Danh sách SKU chi tiết ({p.skus.length})
                  </div>

                  <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50/40">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="px-4 py-2">Mã SKU</th>
                          <th className="px-4 py-2">Mô tả Biến thể</th>
                          <th className="px-4 py-2 text-right">Đơn giá</th>
                          <th className="px-4 py-2 text-center">Hàng trong kho</th>
                          <th className="px-4 py-2 text-center">Trạng thái kho</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {p.skus.map(sku => (
                          <tr key={sku.id} className={`hover:bg-gray-50/50 ${sku.stock === 0 ? 'bg-rose-50/20' : ''}`}>
                            <td className="px-4 py-2.5 font-mono font-bold text-gray-600">{sku.sku}</td>
                            <td className="px-4 py-2.5 font-semibold text-gray-700">
                              {Object.keys(sku.attributes).length > 0 ? (
                                <div className="flex gap-1.5">
                                  {Object.entries(sku.attributes).map(([k, v]) => (
                                    <span key={k} className="bg-white border border-gray-200 rounded px-1.5 py-0.2 text-[9px]">
                                      <span className="text-gray-400">{k}:</span> <span className="text-red-800 font-bold">{v}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic text-[9px]">Sản phẩm tiêu chuẩn</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right font-extrabold text-red-800">{formatPrice(sku.price)}</td>
                            <td className="px-4 py-2.5 text-center font-mono font-bold text-gray-800">{sku.stock}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[8px] uppercase border ${
                                sku.stock === 0
                                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                                  : sku.stock < 5
                                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              }`}>
                                {sku.stock === 0 ? (
                                  <>
                                    <AlertTriangle size={8} /> Hết hàng
                                  </>
                                ) : sku.stock < 5 ? (
                                  'Sắp hết'
                                ) : (
                                  'Sẵn sàng'
                                )}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filteredProducts.length === 0 && (
          <div className="py-16 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white space-y-1.5">
            <AlertCircle size={24} className="mx-auto text-gray-300" />
            <div className="font-semibold">Không tìm thấy sản phẩm nào!</div>
            <div className="text-[10px]">Vui lòng điều chỉnh từ khóa tìm kiếm hoặc lọc danh mục khác.</div>
          </div>
        )}
      </div>
    </div>
  )
}
