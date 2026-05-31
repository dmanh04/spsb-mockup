import { useState } from 'react'
import { Search, Package, TrendingDown } from 'lucide-react'
import { PRODUCT_MOCK_LIST } from '@/data/productMockData'
import { INVENTORY_ITEMS } from '@/data/inventoryMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'

export default function ShopHeadProductsPage() {
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'
  const [search, setSearch] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)

  const shopInventory = INVENTORY_ITEMS.filter(i => i.shopId === shopId)

  const products = PRODUCT_MOCK_LIST.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  const getStockForSku = (skuId: string) =>
    shopInventory.find(i => i.skuId === skuId)?.quantity ?? 0

  const getMinStockForSku = (skuId: string) =>
    shopInventory.find(i => i.skuId === skuId)?.minStock ?? 5

  const filteredProducts = showLowStock
    ? products.filter(p => p.skus.some(s => getStockForSku(s.id) <= getMinStockForSku(s.id)))
    : products

  const lowStockCount = products.filter(p => p.skus.some(s => getStockForSku(s.id) <= getMinStockForSku(s.id))).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sản phẩm Chi nhánh</h1>
          <p className="text-sm text-gray-500">Tồn kho tại {shopId}</p>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
            <TrendingDown size={14} className="text-orange-500" />
            <span className="text-sm text-orange-700 font-medium">{lowStockCount} sản phẩm sắp hết</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9 text-sm" placeholder="Tìm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button
          onClick={() => setShowLowStock(v => !v)}
          className={`btn-secondary text-sm py-2 ${showLowStock ? 'bg-orange-50 border-orange-300 text-orange-700' : ''}`}>
          <TrendingDown size={13} /> Sắp hết hàng ({lowStockCount})
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th">Sản phẩm</th>
              <th className="table-th">Biến thể</th>
              <th className="table-th">Giá bán</th>
              <th className="table-th">Tồn kho</th>
              <th className="table-th">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.flatMap(p =>
              p.skus.map(sku => {
                const stock = getStockForSku(sku.id)
                const minStock = getMinStockForSku(sku.id)
                const isLow = stock <= minStock && stock > 0
                const isOut = stock === 0
                return (
                  <tr key={sku.id} className={`hover:bg-gray-50 ${isOut ? 'opacity-60' : ''}`}>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-400">{p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-xs text-gray-600">{Object.values(sku.attributes).join(' / ')}</td>
                    <td className="table-td text-xs font-bold text-primary-600">{formatPrice(sku.price)}</td>
                    <td className="table-td">
                      <span className={`text-sm font-bold ${isOut ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-green-600'}`}>
                        {stock}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">/ tối thiểu {minStock}</span>
                    </td>
                    <td className="table-td">
                      {isOut ? <span className="badge-red">Hết hàng</span>
                        : isLow ? <span className="badge-orange">Sắp hết</span>
                        : <span className="badge-green">Còn hàng</span>}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">
            <Package size={28} className="mx-auto mb-2 text-gray-300" />
            Không có sản phẩm nào
          </div>
        )}
      </div>
    </div>
  )
}
