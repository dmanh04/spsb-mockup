import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, AlertTriangle, CheckCircle, Tag, Info, 
  Sparkles, Calendar, Settings, ShieldAlert, Award, Star
} from 'lucide-react'
import { VOUCHER_MOCK_LIST, saveVouchers } from '@/data/voucherMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { formatPrice } from '@/utils/format'
import type { Voucher } from '@/types'

export default function VoucherFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id

  // Form States
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<'percent' | 'fixed'>('percent')
  const [value, setValue] = useState<number>(10)
  const [minOrderValue, setMinOrderValue] = useState<number>(0)
  const [maxDiscount, setMaxDiscount] = useState<number>(0)
  const [usageLimit, setUsageLimit] = useState<number>(100)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<Voucher['status']>('active')
  const [shopId, setShopId] = useState<string>('')

  const [toastMsg, setToastMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Load existing voucher details for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const v = VOUCHER_MOCK_LIST.find(x => x.id === id)
      if (v) {
        setCode(v.code)
        setName(v.name)
        setType(v.type)
        setValue(v.value)
        setMinOrderValue(v.minOrderValue)
        setMaxDiscount(v.maxDiscount || 0)
        setUsageLimit(v.usageLimit)
        setStartDate(v.startDate)
        setEndDate(v.endDate)
        setStatus(v.status)
        setShopId(v.shopId || '')
      } else {
        setErrorMsg('Không tìm thấy mã Voucher yêu cầu!')
      }
    } else {
      // Default dates
      const today = new Date()
      setStartDate(today.toISOString().split('T')[0])
      
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      setEndDate(nextMonth.toISOString().split('T')[0])
    }
  }, [isEditMode, id])

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (!code.trim()) {
      setErrorMsg('Vui lòng nhập mã Voucher (Code)!')
      return
    }
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên hiển thị của Voucher!')
      return
    }
    if (value <= 0) {
      setErrorMsg('Giá trị giảm giá phải lớn hơn 0!')
      return
    }
    if (type === 'percent' && value > 100) {
      setErrorMsg('Mức chiết khấu phần trăm (%) không thể vượt quá 100%!')
      return
    }
    if (!startDate || !endDate) {
      setErrorMsg('Vui lòng chọn đầy đủ thời gian hiệu lực (ngày bắt đầu và ngày kết thúc)!')
      return
    }
    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('Ngày hết hạn không thể trước ngày bắt đầu có hiệu lực!')
      return
    }

    const finalVoucher: Voucher = {
      id: id || `V00${VOUCHER_MOCK_LIST.length + 1}`,
      code: code.trim().toUpperCase().replace(/\s+/g, ''),
      name: name.trim(),
      type,
      value,
      minOrderValue,
      maxDiscount: type === 'percent' && maxDiscount > 0 ? maxDiscount : undefined,
      usageLimit,
      usedCount: isEditMode ? VOUCHER_MOCK_LIST.find(v => v.id === id)?.usedCount || 0 : 0,
      startDate,
      endDate,
      status,
      shopId: shopId || undefined,
    }

    let nextList = [...VOUCHER_MOCK_LIST]
    if (isEditMode) {
      nextList = nextList.map(v => v.id === id ? finalVoucher : v)
    } else {
      nextList.push(finalVoucher)
    }

    saveVouchers(nextList)

    setToastMsg(isEditMode ? 'Cập nhật Voucher thành công!' : 'Tạo mới Voucher thành công!')
    setErrorMsg('')
    setTimeout(() => {
      setToastMsg('')
      navigate('/admin/vouchers')
    }, 1500)
  }

  // Preset code helper
  const generateRandomCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000)
    setCode(`PETCARE${random}`)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn text-sm">
      {/* Floating Success Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800 animate-bounce">
          <CheckCircle size={20} className="text-emerald-400 shrink-0" />
          <span className="font-semibold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Floating Error Alert */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-shake">
          <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Lỗi nhập liệu:</span> {errorMsg}
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-700 font-extrabold text-lg px-1">×</button>
        </div>
      )}

      {/* Breadcrumb Header Bar */}
      <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl border border-gray-100 p-4 rounded-3xl shadow-sm">
        <button
          onClick={() => navigate('/admin/vouchers')}
          className="p-3 border border-gray-200 bg-white hover:bg-gray-50 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider select-none">
            <span>Khuyến mãi</span>
            <span>/</span>
            <span className="text-indigo-600">{isEditMode ? 'Chỉnh sửa voucher' : 'Thêm mới'}</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">
            {isEditMode ? `Cập nhật Voucher: ${code}` : 'Tạo Voucher Mới'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form controls (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Core Voucher Info */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Tag size={18} className="text-indigo-500" />
              Thông tin chi tiết Voucher
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Voucher Code */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Mã Voucher (Code) <span className="text-rose-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: PETCARE30..."
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-gray-50/50 font-mono font-bold tracking-wider"
                  />
                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="px-3.5 py-1.5 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                    >
                      💡 Tạo mã ngẫu nhiên
                    </button>
                  )}
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Tên hiển thị (Name) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giảm 30.000đ cho ngày quốc tế thú cưng..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-gray-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Type selection */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Loại giảm giá</label>
                <select
                  value={type}
                  onChange={e => {
                    setType(e.target.value as 'percent' | 'fixed')
                    setValue(e.target.value === 'percent' ? 10 : 30000)
                  }}
                  className="w-full text-sm px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white font-semibold"
                >
                  <option value="percent">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định (VND)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">
                  Mức giảm {type === 'percent' ? '(%)' : '(VND)'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={value}
                  onChange={e => setValue(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none font-mono font-bold text-gray-800 bg-gray-50/50"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Trạng thái phát hành</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full text-sm px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white font-semibold"
                >
                  <option value="active">Đang áp dụng (Active)</option>
                  <option value="inactive">Tạm ngưng cung cấp (Inactive)</option>
                  <option value="expired">Đã hết hạn (Expired)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Conditions and restrictions */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Settings size={18} className="text-gray-500" />
              Điều kiện áp dụng & Giới hạn
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Minimum order value */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Đơn hàng tối thiểu (VND)</label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={minOrderValue}
                  onChange={e => setMinOrderValue(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none font-mono font-bold text-gray-800 bg-gray-50/50"
                />
              </div>

              {/* Maximum discount (Only relevant for percentage type) */}
              <div className={`space-y-2 transition-all duration-300 ${type === 'percent' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <label className="block font-bold text-gray-600">Mức giảm tối đa (VND)</label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  disabled={type !== 'percent'}
                  placeholder="Bỏ trống nếu không giới hạn"
                  value={maxDiscount}
                  onChange={e => setMaxDiscount(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none font-mono font-bold text-gray-800 bg-gray-50/50"
                />
              </div>

              {/* Usage Limit */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Giới hạn số lượt dùng</label>
                <input
                  type="number"
                  min={1}
                  value={usageLimit}
                  onChange={e => setUsageLimit(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none font-mono font-bold text-gray-800 bg-gray-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Branch restriction */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Giới hạn Chi nhánh áp dụng</label>
                <select
                  value={shopId}
                  onChange={e => setShopId(e.target.value)}
                  className="w-full text-sm px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white font-semibold"
                >
                  <option value="">-- Tất cả chi nhánh (Toàn hệ thống) --</option>
                  {SHOP_MOCK_LIST.map(shop => (
                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                  ))}
                </select>
              </div>

              {/* Branch helper notice */}
              <div className="bg-gray-50 p-4 border border-gray-150 rounded-2xl flex gap-2.5 items-start">
                <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-normal font-semibold">
                  Nếu không cấu hình giới hạn chi nhánh cụ thể, khách hàng có thể áp dụng mã này khi mua hàng hoặc đặt chỗ tại bất kỳ cơ sở nào của PetCare.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Start and End Validity Dates */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Calendar size={18} className="text-gray-500" />
              Thời gian có hiệu lực
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Start date */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Ngày bắt đầu hiệu lực <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-gray-50/50 font-bold"
                />
              </div>

              {/* End date */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Ngày hết hạn khuyến mãi <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-gray-50/50 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Ticket Live Preview (1 col) */}
        <div className="space-y-6">
          {/* Card 4: Ticket Graphic live preview */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              🎟️ Khung mô phỏng Tấm vé Voucher
            </h3>

            {/* Simulated Ticket graphics with radial punches and serrated dashed dividers */}
            <div className="relative rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl aspect-[3/4.2] flex flex-col justify-between overflow-hidden group/ticket transition-all hover:shadow-2xl hover:-translate-y-0.5 p-6 select-none">
              
              {/* Dotted circle punches on left and right for classic ticket feel */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white z-15"></div>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white z-15"></div>

              {/* Ticket Top - Promo head */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border border-white/10">
                    <Star size={10} className="fill-white text-white animate-spin-slow" />
                    PetCare Promo
                  </div>
                  <span className="text-[10px] font-bold opacity-60">ADMIN PREVIEW</span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">GIẢM GIÁ CHIẾT KHẤU</div>
                  <div className="text-3xl font-black tracking-tight flex items-baseline gap-1">
                    {type === 'percent' ? `${value}%` : formatPrice(value)}
                    <span className="text-xs font-bold opacity-75">OFF</span>
                  </div>
                </div>
              </div>

              {/* Radial punched-out divider (dashed dotted line) */}
              <div className="border-t-2 border-dashed border-white/25 my-4 -mx-6 relative z-10"></div>

              {/* Ticket Bottom - Promo body */}
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10.5px] font-extrabold uppercase tracking-wider opacity-60 mb-1">MÃ ÁP DỤNG</div>
                  <div className="font-mono text-xl font-black bg-white text-indigo-950 px-4 py-2 rounded-2xl w-max tracking-widest border border-indigo-200/50 shadow-md">
                    {code.trim().toUpperCase() || 'MAVOUCHER'}
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Name */}
                  <div className="text-xs font-extrabold leading-snug line-clamp-2">
                    {name || 'Tên hiển thị chương trình khuyến mãi...'}
                  </div>

                  {/* Conditions */}
                  <div className="space-y-1 text-[10px] opacity-75 font-semibold leading-relaxed">
                    <div>• Áp dụng cho đơn hàng tối thiểu: <span className="underline">{formatPrice(minOrderValue)}</span></div>
                    {type === 'percent' && maxDiscount > 0 && (
                      <div>• Mức giảm tối đa: <span className="underline">{formatPrice(maxDiscount)}</span></div>
                    )}
                    {shopId && (
                      <div>• Chỉ tại chi nhánh: <span className="underline uppercase">{shopId}</span></div>
                    )}
                    <div>• Hạn dùng: <span className="underline">{startDate || 'Ngày bắt đầu'}</span> đến <span className="underline">{endDate || 'Ngày kết thúc'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form adjustment actions */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-3">
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              🚀 {isEditMode ? 'Lưu cập nhật' : 'Phát hành Voucher'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/vouchers')}
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
