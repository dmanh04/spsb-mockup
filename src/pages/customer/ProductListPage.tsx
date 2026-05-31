import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, SlidersHorizontal } from 'lucide-react'
import { PRODUCT_MOCK_LIST, PRODUCT_CATEGORIES } from '@/data/productMockData'
import { formatPrice } from '@/utils/format'

export default function ProductListPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'rating'>('rating')

  const filtered = PRODUCT_MOCK_LIST
    .filter(p => !selectedCategory || p.category === PRODUCT_CATEGORIES.find(c => c.id === selectedCategory)?.name)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.basePrice - b.basePrice
      if (sortBy === 'price_desc') return b.basePrice - a.basePrice
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return b.rating - a.rating
    })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Sản phẩm</h1>
        <p className="text-sm text-gray-500 mt-0.5">{PRODUCT_MOCK_LIST.length} sản phẩm</p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${!selectedCategory ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
        >
          Tất cả
        </button>
        {PRODUCT_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selectedCategory === cat.id ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
          >
            <span>{cat.icon}</span> {cat.name}
            <span className={`text-xs ${selectedCategory === cat.id ? 'text-blue-200' : 'text-gray-400'}`}>({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="form-input pl-9 py-2"
            placeholder="Tìm theo tên, thương hiệu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="form-input w-auto py-2 pr-8"
        >
          <option value="rating">Đánh giá cao nhất</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="name">Tên A-Z</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-700">{filtered.length}</span> sản phẩm
        {selectedCategory && ` trong danh mục này`}
        {search && ` phù hợp với "${search}"`}
      </p>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => {
            const totalStock = p.skus.reduce((sum, s) => sum + s.stock, 0)
            const minPrice = Math.min(...p.skus.map(s => s.price))
            const maxPrice = Math.max(...p.skus.map(s => s.price))
            return (
              <Link key={p.id} to={`/customer/products/${p.id}`}
                className="card hover:shadow-md transition-shadow group overflow-hidden">
                <div className="relative">
                  <img src={p.images[0]} alt={p.name} className="w-full h-40 object-cover bg-gray-50" />
                  {totalStock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-gray-700 text-xs font-bold px-2 py-1 rounded">Hết hàng</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="bg-white/90 backdrop-blur text-xs font-medium px-2 py-0.5 rounded-full text-gray-600">
                      {p.skus.length} loại
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-gray-400 mb-0.5">{p.brand}</div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 line-clamp-2 mb-1">{p.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-600">{p.rating}</span>
                    <span className="text-xs text-gray-400">({p.reviewCount} đánh giá)</span>
                  </div>
                  <div className="text-sm font-bold text-primary-600">
                    {minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
