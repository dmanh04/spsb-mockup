import type { Product, SKU } from '@/types'
import { getSKUByAttributes } from '@/data/productMockData'
import { formatPrice } from '@/utils/format'

interface Props {
  product: Product
  selectedAttrs: Record<string, string>
  onChange: (attrs: Record<string, string>) => void
}

export default function SKUVariantSelector({ product, selectedAttrs, onChange }: Props) {
  const currentSKU = getSKUByAttributes(product, selectedAttrs)

  function selectAttr(attrName: string, value: string) {
    const newAttrs = { ...selectedAttrs, [attrName]: value }
    onChange(newAttrs)
  }

  function isOutOfStock(attrName: string, value: string): boolean {
    const testAttrs = { ...selectedAttrs, [attrName]: value }
    const sku = product.skus.find(s =>
      Object.entries(testAttrs).every(([k, v]) => s.attributes[k] === v)
    )
    return sku !== undefined && sku.stock === 0
  }

  function isPossible(attrName: string, value: string): boolean {
    const testAttrs = { ...selectedAttrs, [attrName]: value }
    return product.skus.some(s =>
      Object.entries(testAttrs).every(([k, v]) => s.attributes[k] === v)
    )
  }

  return (
    <div className="space-y-4">
      {product.attributes.map(attr => (
        <div key={attr.name}>
          <div className="text-sm font-medium text-gray-700 mb-2">
            {attr.name}:
            {selectedAttrs[attr.name] && (
              <span className="font-semibold text-gray-900 ml-1">{selectedAttrs[attr.name]}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {attr.values.map(val => {
              const selected = selectedAttrs[attr.name] === val
              const outOfStock = isOutOfStock(attr.name, val)
              const possible = isPossible(attr.name, val)
              return (
                <button
                  key={val}
                  onClick={() => possible && selectAttr(attr.name, val)}
                  disabled={!possible}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                    ${selected
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                      : outOfStock
                      ? 'bg-gray-50 text-gray-300 border-gray-200 line-through cursor-not-allowed'
                      : !possible
                      ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400 hover:text-primary-600'
                    }
                  `}
                >
                  {val}
                  {outOfStock && !selected && <span className="ml-1 text-xs">(hết)</span>}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Price + Stock display */}
      <div className="pt-3 border-t">
        {currentSKU ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary-600">{formatPrice(currentSKU.price)}</div>
              {currentSKU.originalPrice && (
                <div className="text-sm text-gray-400 line-through">{formatPrice(currentSKU.originalPrice)}</div>
              )}
            </div>
            <div className={`text-sm font-medium ${currentSKU.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {currentSKU.stock > 0 ? `Còn ${currentSKU.stock} sản phẩm` : 'Hết hàng'}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400 italic">Vui lòng chọn đầy đủ biến thể</div>
        )}
      </div>
    </div>
  )
}
