import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, AlertTriangle, CheckCircle, Info, Sparkles, MapPin, 
  Check, Scissors, Activity, Home, Stethoscope, Heart, Shield
} from 'lucide-react'
import { SERVICE_MOCK_LIST, saveServices, SERVICE_CATEGORY_LABELS } from '@/data/serviceMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { formatPrice } from '@/utils/format'
import type { Service, ServicePricing } from '@/types'

const CATEGORY_ICONS: Record<string, any> = {
  grooming: <Scissors size={18} className="text-blue-500" />,
  bathing: <Activity size={18} className="text-teal-500" />,
  spa: <Activity size={18} className="text-purple-500" />,
  boarding: <Home size={18} className="text-amber-500" />,
  nail: <Scissors size={18} className="text-pink-500" />,
  ear: <Activity size={18} className="text-orange-500" />,
  checkup: <Stethoscope size={18} className="text-red-500" />,
}

const CATEGORY_COLORS: Record<string, string> = {
  grooming: 'bg-blue-50 border-blue-200 text-blue-700',
  bathing: 'bg-teal-50 border-teal-200 text-teal-700',
  spa: 'bg-purple-50 border-purple-200 text-purple-700',
  boarding: 'bg-amber-50 border-amber-200 text-amber-700',
  nail: 'bg-pink-50 border-pink-200 text-pink-700',
  ear: 'bg-orange-50 border-orange-200 text-orange-700',
  checkup: 'bg-red-50 border-red-200 text-red-700',
}

const CATEGORY_PRESET_IMAGES: Record<string, string> = {
  grooming: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600',
  bathing: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=600',
  spa: 'https://images.unsplash.com/photo-1596495578065-6e076baf188a?auto=format&fit=crop&q=80&w=600',
  boarding: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=600',
  nail: 'https://images.unsplash.com/photo-1608454367599-c11394f09d5a?auto=format&fit=crop&q=80&w=600',
  ear: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=600',
  checkup: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=600',
}

const DEFAULT_MATRIX = [
  { size: 'small', label: 'Nhỏ (< 5kg)', price: 100000, duration: 45 },
  { size: 'medium', label: 'Vừa (5–15kg)', price: 150000, duration: 60 },
  { size: 'large', label: 'Lớn (15–30kg)', price: 200000, duration: 90 },
  { size: 'xlarge', label: 'Rất lớn (> 30kg)', price: 300000, duration: 120 },
] as ServicePricing[]

export default function ServiceFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id

  // Form States
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Service['category']>('grooming')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [image, setImage] = useState('')
  const [petTypes, setPetTypes] = useState<Service['petTypes']>(['dog', 'cat'])
  const [shopIds, setShopIds] = useState<string[]>(['SH01'])
  const [pricingMatrix, setPricingMatrix] = useState<ServicePricing[]>(DEFAULT_MATRIX)

  const [toastMsg, setToastMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Load existing service data for Edit Mode
  useEffect(() => {
    if (isEditMode && id) {
      const svc = SERVICE_MOCK_LIST.find(s => s.id === id)
      if (svc) {
        setName(svc.name)
        setCategory(svc.category)
        setDescription(svc.description)
        setStatus(svc.status)
        setImage(svc.image)
        setPetTypes(svc.petTypes)
        setShopIds(svc.shopIds)
        setPricingMatrix(svc.pricingMatrix)
      } else {
        setErrorMsg('Không tìm thấy dịch vụ yêu cầu!')
      }
    } else {
      // Setup preset image for grooming initially on create
      setImage(CATEGORY_PRESET_IMAGES.grooming)
    }
  }, [isEditMode, id])

  // Automatically update suggested image if category changes and image matches old category preset
  const handleCategoryChange = (cat: Service['category']) => {
    setCategory(cat)
    // If the image is currently one of the presets, change it to match the new category preset
    const currentPresetKeys = Object.keys(CATEGORY_PRESET_IMAGES)
    const isCurrentlyPreset = currentPresetKeys.some(k => CATEGORY_PRESET_IMAGES[k] === image) || !image
    if (isCurrentlyPreset) {
      setImage(CATEGORY_PRESET_IMAGES[cat])
    }
  }

  // Toggle Pet Types selection
  const togglePetType = (type: 'dog' | 'cat' | 'other') => {
    setPetTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // Toggle Shop ID selection
  const toggleShop = (shopId: string) => {
    setShopIds(prev =>
      prev.includes(shopId)
        ? prev.filter(id => id !== shopId)
        : [...prev, shopId]
    )
  }

  // Update specific row of pricing matrix
  const updateMatrixRow = (size: string, field: 'price' | 'duration', value: number) => {
    setPricingMatrix(prev =>
      prev.map(row => (row.size === size ? { ...row, [field]: value } : row))
    )
  }

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên dịch vụ!')
      return
    }
    if (!description.trim()) {
      setErrorMsg('Vui lòng nhập mô tả ngắn về dịch vụ!')
      return
    }
    if (petTypes.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất một loài vật nuôi áp dụng!')
      return
    }
    if (shopIds.length === 0) {
      setErrorMsg('Vui lòng tích chọn ít nhất một chi nhánh áp dụng!')
      return
    }

    // Average price and duration computed from matrix
    const prices = pricingMatrix.map(p => p.price)
    const durations = pricingMatrix.map(p => p.duration)
    const basePrice = Math.min(...prices) // standard base price
    const baseDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)

    const finalService: Service = {
      id: id || `SV0${SERVICE_MOCK_LIST.length + 1}`,
      name: name.trim(),
      category,
      description: description.trim(),
      image: image.trim() || 'https://placehold.co/300x200/cccccc/333333?text=Service',
      status,
      petTypes,
      shopIds,
      pricingMatrix,
      price: basePrice,
      duration: baseDuration,
    }

    let nextList = [...SERVICE_MOCK_LIST]
    if (isEditMode) {
      nextList = nextList.map(s => (s.id === id ? finalService : s))
    } else {
      nextList.push(finalService)
    }

    saveServices(nextList)

    setToastMsg(isEditMode ? 'Cập nhật dịch vụ thành công!' : 'Tạo mới dịch vụ thành công!')
    setErrorMsg('')
    setTimeout(() => {
      setToastMsg('')
      navigate('/admin/services')
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative text-sm animate-fadeIn">
      {/* Dynamic Floating Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800 transition-all scale-100 animate-bounce">
          <CheckCircle size={20} className="text-emerald-400 shrink-0" />
          <span className="font-semibold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-800 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-shake">
          <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Lưu ý nhập liệu:</span> {errorMsg}
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-700 font-extrabold text-lg px-1">×</button>
        </div>
      )}

      {/* Breadcrumbs & Header bar */}
      <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl border border-gray-100 p-4 rounded-3xl shadow-sm">
        <button
          onClick={() => navigate('/admin/services')}
          className="p-3 border border-gray-200 bg-white hover:bg-gray-50 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider select-none">
            <span>Danh mục</span>
            <span>/</span>
            <span className="text-indigo-600">{isEditMode ? 'Chỉnh sửa dịch vụ' : 'Thêm mới'}</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">
            {isEditMode ? `Cập nhật dịch vụ: ${name}` : 'Tạo Dịch Vụ Mới'}
          </h1>
        </div>
      </div>

      {/* Main Grid Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Forms (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Info size={18} className="text-indigo-500" />
              Thông tin cơ bản
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Service Name */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Tên dịch vụ <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tắm xông hơi Premium..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-sm px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none bg-gray-50/50"
                />
              </div>

              {/* Service Category */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Danh mục chính <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={e => handleCategoryChange(e.target.value as Service['category'])}
                    className="w-full text-sm px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none bg-white font-semibold appearance-none"
                  >
                    {Object.entries(SERVICE_CATEGORY_LABELS).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Service Status */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Trạng thái áp dụng</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full text-sm px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none bg-white font-semibold"
                >
                  <option value="active">Đang kích hoạt (Active)</option>
                  <option value="inactive">Tạm ngưng phục vụ (Inactive)</option>
                </select>
              </div>

              {/* Description helper notice */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 flex gap-2.5 items-start">
                <Sparkles size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Hãy nhập tên mô tả đầy đủ để khách hàng dễ dàng hình dung quy trình tắm rửa, spa, cắt tỉa của tiệm.
                </p>
              </div>
            </div>

            {/* Description textarea */}
            <div className="space-y-2">
              <label className="block font-bold text-gray-600">Mô tả dịch vụ <span className="text-rose-500">*</span></label>
              <textarea
                required
                rows={4}
                placeholder="Mô tả chi tiết các bước dịch vụ (ví dụ: chải mượt lông, tắm sấy khô, vệ sinh tai bằng bông chuyên dụng)..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full text-sm px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none bg-gray-50/50 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Card 2: Applicability (Pets & Shops) */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Pet Types */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Heart size={18} className="text-rose-500 animate-pulse" />
                Thú cưng áp dụng <span className="text-rose-500">*</span>
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                Chọn các loại thú cưng có thể đặt dịch vụ này (chọn tối thiểu một loại).
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {(['dog', 'cat', 'other'] as const).map(type => {
                  const isSelected = petTypes.includes(type)
                  const label = type === 'dog' ? '🐕 Chó' : type === 'cat' ? '🐈 Mèo' : '🐿️ Khác'
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => togglePetType(type)}
                      className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 border cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                      {isSelected && <Check size={14} className="stroke-[3]" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Applicable Shops */}
            <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
              <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                <MapPin size={18} className="text-emerald-500" />
                Chi nhánh áp dụng <span className="text-rose-500">*</span>
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                Đánh dấu các chi nhánh mà dịch vụ này sẽ có hiệu lực phục vụ.
              </p>
              <div className="space-y-2.5 pt-1">
                {SHOP_MOCK_LIST.map(shop => {
                  const isChecked = shopIds.includes(shop.id)
                  return (
                    <label
                      key={shop.id}
                      className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer hover:bg-gray-50/50 transition-all font-semibold ${
                        isChecked ? 'border-emerald-200 bg-emerald-50/20 text-emerald-900' : 'border-gray-150 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleShop(shop.id)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                      />
                      <div>
                        <div className="text-sm">{shop.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{shop.address}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Card 3: Dynamic Pricing Matrix */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Shield size={18} className="text-amber-500" />
              Bảng giá & Thời gian chi tiết theo kích cỡ thú cưng
            </h3>
            <p className="text-xs text-gray-400">
              Cấu hình giá cả và thời lượng chi tiết cho từng kích thước vật nuôi để tính tiền chính xác lúc đặt lịch.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pricingMatrix.map(row => (
                <div
                  key={row.size}
                  className="p-4 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all space-y-4 bg-gray-50/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-gray-800 text-sm uppercase tracking-wide">
                      ⚡ Kích cỡ: {row.label}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold">
                      {row.size.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Price Input */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-500">Giá dịch vụ (VND)</label>
                      <input
                        type="number"
                        required
                        min={0}
                        step={10000}
                        value={row.price}
                        onChange={e => updateMatrixRow(row.size, 'price', Number(e.target.value))}
                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono font-bold text-gray-900 bg-white"
                      />
                    </div>

                    {/* Duration Input */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-500">Thời lượng (Phút)</label>
                      <input
                        type="number"
                        required
                        min={5}
                        step={5}
                        value={row.duration}
                        onChange={e => updateMatrixRow(row.size, 'duration', Number(e.target.value))}
                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono font-bold text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Column (1 col wide on desktop) */}
        <div className="space-y-6">
          {/* Card 4: Media, suggestions & preview */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              📸 Hình ảnh đại diện
            </h3>

            {/* Custom URL Input */}
            <div className="space-y-2">
              <label className="block font-bold text-gray-600">Đường dẫn hình ảnh (URL)</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={image}
                onChange={e => setImage(e.target.value)}
                className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 bg-gray-50/30"
              />
            </div>

            {/* Suggested presets selection */}
            <div className="space-y-2">
              <span className="block font-bold text-gray-500 text-xs">Gợi ý hình ảnh theo danh mục</span>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CATEGORY_PRESET_IMAGES).map(([catKey, url]) => {
                  const isSelected = image === url
                  const label = SERVICE_CATEGORY_LABELS[catKey] || catKey
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setImage(url)}
                      className={`text-left p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all hover:bg-gray-50 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/40 font-bold text-indigo-700 shadow-sm'
                          : 'border-gray-250 bg-white text-gray-500 font-medium'
                      }`}
                    >
                      <div className="shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-gray-100 bg-gray-100 flex items-center justify-center">
                        <img src={url} alt={label} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] truncate leading-tight">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Preview Box with Glassmorphism */}
            <div className="space-y-2 pt-2">
              <span className="block font-bold text-gray-500 text-xs">Xem trước dịch vụ</span>
              
              <div className="relative rounded-3xl overflow-hidden border border-gray-100 shadow-lg aspect-[4/3] group/preview bg-gray-50 flex items-center justify-center p-1">
                {image ? (
                  <img
                    src={image}
                    alt="Service Preview"
                    onError={e => {
                      (e.target as any).src = 'https://placehold.co/400x300/eeeeee/888888?text=L%E1%BB%97i+%C4%91%C6%B0%E1%BB%9Dng+d%E1%BA%ABn'
                    }}
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover/preview:scale-105"
                  />
                ) : (
                  <div className="text-center p-4 text-gray-400 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-300">
                      📸
                    </div>
                    <span className="text-[10px] font-semibold">Chưa thiết lập hình ảnh</span>
                  </div>
                )}

                {/* Overlaid Tag */}
                <div className="absolute top-4 left-4">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-md backdrop-blur-md ${CATEGORY_COLORS[category] || 'bg-white text-gray-700 border-gray-200'}`}>
                    {CATEGORY_ICONS[category]}
                    {SERVICE_CATEGORY_LABELS[category]}
                  </div>
                </div>

                {/* Floating Preview Info Banner */}
                <div className="absolute bottom-4 inset-x-4 bg-white/70 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-lg flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900 truncate">{name || 'Tên dịch vụ...'}</div>
                    <div className="text-[10px] text-gray-500 font-semibold mt-0.5 truncate">
                      {petTypes.map(p => p === 'dog' ? '🐕' : p === 'cat' ? '🐈' : '🐿️').join(' ')} · {pricingMatrix[0]?.duration} - {pricingMatrix[pricingMatrix.length - 1]?.duration} phút
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider text-[8px]">Giá từ</span>
                    <span className="text-sm font-black text-indigo-600 block">
                      {formatPrice(Math.min(...pricingMatrix.map(p => p.price)))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-3">
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              🚀 {isEditMode ? 'Lưu cập nhật' : 'Tạo mới dịch vụ'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/services')}
              className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm rounded-2xl transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
