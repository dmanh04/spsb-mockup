import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, Plus, Trash2, Sparkles, AlertTriangle, CheckCircle, Info, Image as ImageIcon, Tags, Star
} from 'lucide-react'
import { PRODUCT_CATEGORIES, PRODUCT_MOCK_LIST, saveProducts } from '@/data/productMockData'
import type { Product, SKU, ProductAttribute } from '@/types'
import { formatPrice } from '@/utils/format'

interface TempAttribute {
  name: string
  values: string[]
  valueInput: string
}

export default function AdminProductFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id

  // 1. Basic Product Info State
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [selectedParentId, setSelectedParentId] = useState('')
  const [selectedSubId, setSelectedSubId] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [basePrice, setBasePrice] = useState<number>(0)
  const [images, setImages] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  // 2. Dynamic Attributes State
  const [attributes, setAttributes] = useState<TempAttribute[]>([])

  // 3. SKUs state - a dictionary of SKU details keyed by a combined attribute key
  // Format of key: val1|val2|val3 or 'default' if no attributes
  const [skuData, setSkuData] = useState<Record<string, {
    id?: string
    sku: string
    price: number
    stock: number
    image: string
  }>>({})

  const [toastMsg, setToastMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Load product data for editing and synchronize categories selection
  useEffect(() => {
    if (selectedSubId) {
      const sub = PRODUCT_CATEGORIES.find(c => c.id === selectedSubId)
      if (sub) {
        setCategory(sub.name)
      }
    } else if (selectedParentId) {
      const parent = PRODUCT_CATEGORIES.find(c => c.id === selectedParentId)
      if (parent) {
        setCategory(parent.name)
      }
    } else {
      setCategory('')
    }
  }, [selectedParentId, selectedSubId])

  const handleParentChange = (parentId: string) => {
    setSelectedParentId(parentId)
    const subs = PRODUCT_CATEGORIES.filter(c => c.parentId === parentId)
    if (subs.length > 0) {
      setSelectedSubId(subs[0].id)
    } else {
      setSelectedSubId('')
    }
  }

  useEffect(() => {
    if (isEditMode && id) {
      const product = PRODUCT_MOCK_LIST.find(p => p.id === id)
      if (product) {
        setName(product.name)
        setBrand(product.brand)
        setDescription(product.description)
        setStatus(product.status)
        setBasePrice(product.basePrice)
        setImages(product.images || [])
        setTagsInput(product.tags.join(', '))

        // Map attributes
        const mappedAttrs: TempAttribute[] = product.attributes.map(attr => ({
          name: attr.name,
          values: attr.values,
          valueInput: ''
        }))
        setAttributes(mappedAttrs)

        // Find category details
        const catObj = PRODUCT_CATEGORIES.find(c => c.name === product.category)
        if (catObj) {
          if (catObj.parentId === null) {
            setSelectedParentId(catObj.id)
            setSelectedSubId('')
          } else {
            setSelectedParentId(catObj.parentId)
            setSelectedSubId(catObj.id)
          }
        }
        setCategory(product.category)

        // Map SKUs
        const initialSkuData: Record<string, any> = {}
        product.skus.forEach(sku => {
          // Create unique key from attribute values in order of defined attributes
          const key = product.attributes.length > 0
            ? product.attributes.map(a => sku.attributes[a.name] || '').join('|')
            : 'default'

          initialSkuData[key] = {
            id: sku.id,
            sku: sku.sku,
            price: sku.price,
            stock: sku.stock,
            image: sku.image || ''
          }
        })
        setSkuData(initialSkuData)
      } else {
        setErrorMsg('Không tìm thấy sản phẩm yêu cầu!')
      }
    } else {
      // Default initial state for new product
      setName('')
      setBrand('')
      const firstParent = PRODUCT_CATEGORIES.find(c => c.parentId === null)
      if (firstParent) {
        setSelectedParentId(firstParent.id)
        const firstSub = PRODUCT_CATEGORIES.find(c => c.parentId === firstParent.id)
        if (firstSub) {
          setSelectedSubId(firstSub.id)
          setCategory(firstSub.name)
        } else {
          setSelectedSubId('')
          setCategory(firstParent.name)
        }
      } else {
        setSelectedParentId('')
        setSelectedSubId('')
        setCategory('')
      }
      setDescription('')
      setStatus('active')
      setBasePrice(100000)
      setImages(['https://placehold.co/400x400/3B82F6/white?text=Product+Image'])
      tagsInput && setTagsInput('')
      setAttributes([])
      setSkuData({
        'default': {
          sku: '',
          price: 100000,
          stock: 10,
          image: ''
        }
      })
    }
  }, [isEditMode, id])

  // --- Attributes Helpers ---
  function addAttribute() {
    setAttributes([...attributes, { name: '', values: [], valueInput: '' }])
  }

  function updateAttributeName(index: number, name: string) {
    const updated = [...attributes]
    updated[index].name = name
    setAttributes(updated)
  }

  function addAttributeValue(index: number) {
    const attr = attributes[index]
    const newVal = attr.valueInput.trim()
    if (!newVal) return
    if (attr.values.includes(newVal)) return

    const updated = [...attributes]
    updated[index].values = [...attr.values, newVal]
    updated[index].valueInput = ''
    setAttributes(updated)
  }

  function removeAttributeValue(attrIndex: number, valIndex: number) {
    const updated = [...attributes]
    updated[attrIndex].values = updated[attrIndex].values.filter((_, i) => i !== valIndex)
    setAttributes(updated)
  }

  function removeAttribute(index: number) {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  // --- SKU Generator Logic ---
  // Generate Cartesian combinations
  const skuCombinations = useMemo(() => {
    const activeAttrs = attributes.filter(a => a.name.trim() !== '' && a.values.length > 0)
    if (activeAttrs.length === 0) {
      return [['default']]
    }

    const valueArrays = activeAttrs.map(a => a.values)
    
    // Cartesian product algorithm
    return valueArrays.reduce<string[][]>(
      (acc, curr) => {
        const res: string[][] = []
        acc.forEach(a => {
          curr.forEach(b => {
            res.push([...a, b])
          })
        })
        return res
      },
      [[]]
    )
  }, [attributes])

  // Image Handlers
  function addImage() {
    const url = newImageUrl.trim()
    if (!url) return
    if (images.includes(url)) return
    setImages([...images, url])
    setNewImageUrl('')
  }

  function removeImage(idx: number) {
    setImages(images.filter((_, i) => i !== idx))
  }

  function setPrimaryImage(idx: number) {
    if (idx === 0) return
    const updated = [...images]
    const primary = updated.splice(idx, 1)[0]
    updated.unshift(primary)
    setImages(updated)
  }

  // Auto-fill or adjust SKUs when combinations change
  useEffect(() => {
    const activeAttrs = attributes.filter(a => a.name.trim() !== '' && a.values.length > 0)
    const newSkuData: Record<string, any> = {}
    const defaultSkuImage = images[0] || ''

    if (activeAttrs.length === 0) {
      // Default simple SKU
      newSkuData['default'] = skuData['default'] || {
        sku: isEditMode ? `SKU-${id}-DEFAULT` : 'SKU-NEW-DEFAULT',
        price: basePrice || 100000,
        stock: 10,
        image: defaultSkuImage
      }
    } else {
      skuCombinations.forEach(combo => {
        const key = combo.join('|')
        
        // Generate a clean default SKU Code
        const cleanName = name ? name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) : 'PROD'
        const cleanCombo = combo.map(c => c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3)).join('-')
        const generatedSkuCode = isEditMode
          ? `${id}-${cleanCombo}`
          : `${cleanName}-${cleanCombo}`

        newSkuData[key] = skuData[key] || {
          sku: generatedSkuCode,
          price: basePrice || 100000,
          stock: 10,
          image: defaultSkuImage
        }
      })
    }

    setSkuData(newSkuData)
  }, [skuCombinations, attributes, name, basePrice, images])

  // Update specific SKU row details
  function updateSkuDetail(key: string, field: 'sku' | 'price' | 'stock' | 'image', value: any) {
    setSkuData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }))
  }

  // --- Save Form Action ---
  function handleSave(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên sản phẩm')
      return
    }
    if (!category) {
      setErrorMsg('Vui lòng chọn danh mục')
      return
    }

    const activeAttrs = attributes.filter(a => a.name.trim() !== '' && a.values.length > 0)
    
    // Build the SKU array
    const skusList: SKU[] = []
    
    const activeImages = images.map(img => img.trim()).filter(img => img.length > 0)
    const finalImages = activeImages.length > 0 ? activeImages : ['https://placehold.co/400x400/3B82F6/white?text=Product']
    const firstProductImage = finalImages[0]

    if (activeAttrs.length === 0) {
      // Default SKU
      const def = skuData['default'] || { sku: 'DEFAULT', price: basePrice, stock: 10, image: '' }
      skusList.push({
        id: def.id || (isEditMode ? `${id}-S1` : `P${Date.now().toString().slice(-4)}-S1`),
        productId: id || `P${Date.now().toString().slice(-4)}`,
        sku: def.sku || `SKU-${Date.now().toString().slice(-4)}`,
        attributes: {},
        price: Number(def.price) || 0,
        stock: Number(def.stock) || 0,
        image: def.image || firstProductImage
      })
    } else {
      skuCombinations.forEach((combo, idx) => {
        const key = combo.join('|')
        const detail = skuData[key]
        
        // Build attribute map
        const attrMap: Record<string, string> = {}
        activeAttrs.forEach((attr, aIdx) => {
          attrMap[attr.name] = combo[aIdx]
        })

        skusList.push({
          id: detail?.id || (isEditMode ? `${id}-S${idx + 1}` : `P${Date.now().toString().slice(-4)}-S${idx + 1}`),
          productId: id || `P${Date.now().toString().slice(-4)}`,
          sku: detail?.sku || `SKU-${idx + 1}`,
          attributes: attrMap,
          price: Number(detail?.price) || 0,
          stock: Number(detail?.stock) || 0,
          image: detail?.image || firstProductImage
        })
      })
    }

    // Format tags
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    const updatedProduct: Product = {
      id: id || `P00${PRODUCT_MOCK_LIST.length + 1}`,
      name: name.trim(),
      brand: brand.trim() || 'No Brand',
      category,
      description: description.trim(),
      status,
      attributes: activeAttrs.map(a => ({ name: a.name, values: a.values })),
      skus: skusList,
      basePrice: Number(basePrice) || 0,
      rating: isEditMode ? PRODUCT_MOCK_LIST.find(p => p.id === id)?.rating || 4.5 : 5.0,
      reviewCount: isEditMode ? PRODUCT_MOCK_LIST.find(p => p.id === id)?.reviewCount || 0 : 0,
      images: finalImages,
      tags,
      createdAt: isEditMode ? PRODUCT_MOCK_LIST.find(p => p.id === id)?.createdAt || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }

    let nextProductsList = [...PRODUCT_MOCK_LIST]
    if (isEditMode) {
      nextProductsList = nextProductsList.map(p => p.id === id ? updatedProduct : p)
    } else {
      nextProductsList.push(updatedProduct)
    }

    // Save to localStorage & mutate the in-memory constant array
    saveProducts(nextProductsList)

    setToastMsg(isEditMode ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!')
    setTimeout(() => {
      setToastMsg('')
      navigate('/admin/products')
    }, 1500)
  }

  const activeAttrs = attributes.filter(a => a.name.trim() !== '' && a.values.length > 0)

  return (
    <div className="space-y-6 animate-fadeIn pb-12 relative text-xs">
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-gray-950 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-slideIn">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Lỗi:</span> {errorMsg}
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-700 font-bold">×</button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase select-none">
            <span>Quản lý sản phẩm</span>
            <span>/</span>
            <span className="text-red-800">{isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm mới'}</span>
          </div>
          <h1 className="text-lg font-extrabold text-gray-900 mt-0.5">
            {isEditMode ? `Cấu hình Sản phẩm: ${name || 'Đang tải...'}` : 'Tạo Sản phẩm Mới'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Basic Info Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Info size={16} className="text-red-800" />
              Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-gray-600">Tên sản phẩm <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Royal Canin Adult..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600">Thương hiệu / Brand <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Royal Canin, Whiskas..."
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-gray-600">Danh mục cha <span className="text-rose-500">*</span></label>
                <select
                  value={selectedParentId}
                  onChange={e => handleParentChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 bg-white font-semibold"
                >
                  <option value="">Chọn danh mục cha</option>
                  {PRODUCT_CATEGORIES.filter(c => c.parentId === null).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600">Danh mục con <span className="text-rose-500">*</span></label>
                <select
                  value={selectedSubId}
                  onChange={e => setSelectedSubId(e.target.value)}
                  disabled={!selectedParentId}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 bg-white font-semibold disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Chọn danh mục con</option>
                  {PRODUCT_CATEGORIES.filter(c => c.parentId === selectedParentId).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600">Giá cơ sở (VND) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="285000"
                  value={basePrice}
                  onChange={e => setBasePrice(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600">Trạng thái bán</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 bg-white font-semibold"
                >
                  <option value="active">Đang kinh doanh (Active)</option>
                  <option value="inactive">Ngừng kinh doanh (Inactive)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-gray-600">Mô tả sản phẩm</label>
              <textarea
                rows={4}
                placeholder="Nhập thông tin mô tả chi tiết công dụng, nguyên liệu, hướng dẫn sử dụng sản phẩm..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          {/* Card 2: Attributes Builder */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Sparkles size={16} className="text-red-800" />
                Thiết lập Thuộc tính (Biến thể)
              </h3>
              <button
                type="button"
                onClick={addAttribute}
                className="py-1.5 px-3 rounded-lg border border-red-800 text-red-800 font-semibold flex items-center gap-1 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Plus size={14} /> Thêm nhóm thuộc tính
              </button>
            </div>

            <p className="text-[10px] text-gray-400">
              Định nghĩa các phân loại sản phẩm như Trọng lượng (2kg, 4kg), Hương vị (Gà, Bò). Hệ thống sẽ tự động nhân bản tạo SKU tương ứng.
            </p>

            {attributes.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-gray-400 font-medium">
                Sản phẩm này hiện không có biến thể thuộc tính (bán theo sản phẩm gốc đơn lẻ).
              </div>
            ) : (
              <div className="space-y-4">
                {attributes.map((attr, attrIdx) => (
                  <div key={attrIdx} className="bg-gray-50/50 rounded-xl border border-gray-200/60 p-4 space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => removeAttribute(attrIdx)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Xóa thuộc tính"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-gray-500">Tên thuộc tính</label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Trọng lượng, Màu sắc..."
                          value={attr.name}
                          onChange={e => updateAttributeName(attrIdx, e.target.value)}
                          className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="block font-bold text-gray-500">Thêm giá trị phân loại</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ví dụ: 2kg, Đỏ (Ấn Enter hoặc click +)"
                            value={attr.valueInput}
                            onChange={e => {
                              const updated = [...attributes]
                              updated[attrIdx].valueInput = e.target.value
                              setAttributes(updated)
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addAttributeValue(attrIdx)
                              }
                            }}
                            className="flex-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => addAttributeValue(attrIdx)}
                            className="px-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center font-bold text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Rendered attribute pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {attr.values.map((val, valIdx) => (
                        <span
                          key={valIdx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-100 font-bold text-[10px]"
                        >
                          {val}
                          <button
                            type="button"
                            onClick={() => removeAttributeValue(attrIdx, valIdx)}
                            className="text-red-700 hover:text-red-950 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {attr.values.length === 0 && (
                        <span className="text-[10px] text-gray-400 italic">Chưa nhập giá trị phân loại nào.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: SKU Combinations Pricing and Inventory */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Tags size={16} className="text-red-800" />
              Danh sách SKU biến thể chi tiết ({activeAttrs.length === 0 ? 1 : skuCombinations.length})
            </h3>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {activeAttrs.map(attr => (
                      <th key={attr.name} className="px-4 py-3">{attr.name}</th>
                    ))}
                    <th className="px-4 py-3 min-w-[130px]">Mã SKU</th>
                    <th className="px-4 py-3 min-w-[120px]">Giá bán lẻ (VND)</th>
                    <th className="px-4 py-3 min-w-[90px]">Số lượng tồn</th>
                    <th className="px-4 py-3 min-w-[150px]">Link ảnh SKU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeAttrs.length === 0 ? (
                    // Default Single SKU Row
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-500 italic">Mặc định (Không biến thể)</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: SKU-RC-DEFAULT"
                          value={skuData['default']?.sku || ''}
                          onChange={e => updateSkuDetail('default', 'sku', e.target.value.toUpperCase())}
                          className="w-full text-xs px-2.5 py-1 border border-gray-200 rounded-md focus:border-red-500 focus:outline-none font-mono"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          required
                          min={0}
                          value={skuData['default']?.price || 0}
                          onChange={e => updateSkuDetail('default', 'price', Number(e.target.value))}
                          className="w-full text-xs px-2.5 py-1 border border-gray-200 rounded-md focus:border-red-500 focus:outline-none font-mono"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          required
                          min={0}
                          value={skuData['default']?.stock || 0}
                          onChange={e => updateSkuDetail('default', 'stock', Number(e.target.value))}
                          className="w-full text-xs px-2.5 py-1 border border-gray-200 rounded-md focus:border-red-500 focus:outline-none font-mono"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Mặc định ảnh sản phẩm"
                          value={skuData['default']?.image || ''}
                          onChange={e => updateSkuDetail('default', 'image', e.target.value)}
                          className="w-full text-xs px-2.5 py-1 border border-gray-200 rounded-md focus:border-red-500 focus:outline-none"
                        />
                      </td>
                    </tr>
                  ) : (
                    // Combinations Rows
                    skuCombinations.map((combo, comboIdx) => {
                      const key = combo.join('|')
                      const rowData = skuData[key] || { sku: '', price: basePrice, stock: 10, image: '' }
                      
                      return (
                        <tr key={comboIdx} className="hover:bg-gray-50/50">
                          {combo.map((val, vIdx) => (
                            <td key={vIdx} className="px-4 py-3 font-bold text-gray-800">{val}</td>
                          ))}
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              required
                              value={rowData.sku}
                              onChange={e => updateSkuDetail(key, 'sku', e.target.value.toUpperCase())}
                              className="w-full text-xs px-2.5 py-1 border border-gray-200 rounded-md focus:border-red-500 focus:outline-none font-mono"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              required
                              min={0}
                              value={rowData.price}
                              onChange={e => updateSkuDetail(key, 'price', Number(e.target.value))}
                              className="w-full text-xs px-2.5 py-1 border border-gray-200 rounded-md focus:border-red-500 focus:outline-none font-mono"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              required
                              min={0}
                              value={rowData.stock}
                              onChange={e => updateSkuDetail(key, 'stock', Number(e.target.value))}
                              className="w-full text-xs px-2.5 py-1 border border-gray-200 rounded-md focus:border-red-500 focus:outline-none font-mono"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              placeholder="Trống dùng ảnh chính"
                              value={rowData.image}
                              onChange={e => updateSkuDetail(key, 'image', e.target.value)}
                              className="w-full text-xs px-2.5 py-1 border border-gray-200 rounded-md focus:border-red-500 focus:outline-none"
                            />
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

        {/* Right column - Media & Tags (1 col) */}
        <div className="space-y-6">
          {/* Card 4: Media & Image Preview */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <ImageIcon size={16} className="text-red-800" />
              Hình ảnh Sản phẩm ({images.length})
            </h3>

            {/* Add new image URL */}
            <div className="space-y-1">
              <label className="block font-bold text-gray-600">Thêm đường dẫn ảnh (URL)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập đường dẫn ảnh mới..."
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addImage()
                    }
                  }}
                  className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 bg-white"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-bold text-[11px]"
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* Image List Preview Grid */}
            <div className="space-y-2">
              <span className="block font-bold text-gray-500 text-[10px]">Danh sách hình ảnh đã tải lên</span>
              
              {images.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400 space-y-1">
                  <ImageIcon size={28} className="mx-auto text-gray-300" />
                  <div className="font-semibold text-[10px]">Chưa có hình ảnh nào</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img, idx) => {
                    const isPrimary = idx === 0
                    return (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-100 aspect-square bg-gray-50 flex items-center justify-center p-1">
                        <img
                          src={img}
                          alt={`Product Image ${idx + 1}`}
                          onError={e => {
                            (e.target as any).src = 'https://placehold.co/400x400/eeeeee/888888?text=Lỗi+ảnh'
                          }}
                          className="w-full h-full object-cover rounded-md"
                        />
                        
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="p-1 bg-red-800 hover:bg-red-900 rounded text-white transition-colors cursor-pointer"
                              title="Xóa hình ảnh"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <div className="w-full space-y-1">
                            {!isPrimary ? (
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(idx)}
                                className="w-full py-1 bg-white/20 hover:bg-white/40 rounded text-[9px] font-bold text-white transition-colors cursor-pointer uppercase tracking-wider"
                              >
                                Đặt làm ảnh chính
                              </button>
                            ) : (
                              <div className="w-full py-1 bg-amber-500 text-gray-950 font-extrabold text-[9px] rounded text-center uppercase tracking-wider flex items-center justify-center gap-0.5">
                                <Star size={9} className="fill-gray-950 text-gray-950" />
                                Ảnh đại diện
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Top corner badge (Visible without hover if Primary) */}
                        {isPrimary && (
                          <div className="absolute top-1.5 left-1.5 p-1 bg-amber-500 text-gray-950 rounded-md shadow-md" title="Ảnh đại diện">
                            <Star size={10} className="fill-gray-950 text-gray-950" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Card 5: Metadata & Tags */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Tags size={16} className="text-red-800" />
              Thẻ từ khóa & Tìm kiếm
            </h3>

            <div className="space-y-1">
              <label className="block font-bold text-gray-600">Từ khóa tìm kiếm (Tags)</label>
              <input
                type="text"
                placeholder="Cách nhau bằng dấu phẩy, e.g. hạt khô, hạt mèo, royal canin"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
              />
              <p className="text-[9px] text-gray-400 leading-normal">
                Các từ khóa này giúp cải thiện khả năng tìm kiếm sản phẩm cho khách hàng trên website.
              </p>
            </div>

            {/* Tags preview pills */}
            <div className="flex flex-wrap gap-1">
              {tagsInput.split(',').map((t, idx) => {
                const tag = t.trim()
                if (!tag) return null
                return (
                  <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium text-[9px]">
                    #{tag}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-3">
            <button
              type="submit"
              className="w-full py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-lg font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle size={14} />
              {isEditMode ? 'Lưu sản phẩm' : 'Tạo sản phẩm mới'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg font-bold text-xs transition-colors cursor-pointer"
            >
              Hủy bỏ & Trở lại
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
