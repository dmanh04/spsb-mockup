import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Tag, Calendar, ShoppingBag, ShieldAlert, Sparkles } from 'lucide-react'
import { VOUCHER_MOCK_LIST, saveVouchers } from '@/data/voucherMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'
import type { Voucher } from '@/types'

export default function ShopHeadVoucherFormPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'

  // Form states
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<'percent' | 'fixed'>('percent')
  const [value, setValue] = useState('10')
  const [minOrderValue, setMinOrderValue] = useState('100000')
  const [maxDiscount, setMaxDiscount] = useState('50000')
  const [usageLimit, setUsageLimit] = useState('100')
  const [endDate, setEndDate] = useState('2026-07-31')

  const parsedValue = parseInt(value) || 0
  const parsedMinOrder = parseInt(minOrderValue) || 0
  const parsedMaxDiscount = parseInt(maxDiscount) || 0
  const parsedLimit = parseInt(usageLimit) || 0

  function handleAutoGenerateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let generated = 'PET' + shopId.replace('SH', '')
    for (let i = 0; i < 5; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCode(generated)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code || !name) return

    const newVoucher: Voucher = {
      id: `VC-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      type: type,
      value: parsedValue,
      minOrderValue: parsedMinOrder,
      maxDiscount: type === 'percent' ? parsedMaxDiscount : undefined,
      usageLimit: parsedLimit,
      usedCount: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: endDate,
      status: 'active',
      shopId: shopId
    }

    const updated = [newVoucher, ...VOUCHER_MOCK_LIST]
    saveVouchers(updated)
    navigate('/shop-head/vouchers')
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn min-h-[calc(100vh-140px)]">
      
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <Link 
          to="/shop-head/vouchers" 
          className="btn-secondary py-1.5 px-3 rounded-2xl flex items-center gap-1 text-xs"
        >
          <ArrowLeft size={13} /> Quay lại danh sách
        </Link>
        <span className="text-xs font-bold text-gray-400 font-mono">Chi nhánh: {shopId}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT COLUMN: FORM SETTINGS */}
        <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
              <Tag size={15} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-800">Tạo mã Voucher mới</h2>
              <p className="text-[10px] text-gray-450 font-bold uppercase tracking-wide">Chiến dịch ưu đãi cho cửa hàng</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              {/* Code */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide flex items-center justify-between">
                  Mã Voucher
                  <button 
                    type="button" 
                    onClick={handleAutoGenerateCode}
                    className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 hover:underline uppercase tracking-wide"
                  >
                    Tạo mã ngẫu nhiên
                  </button>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: KHACHHANGVIP"
                  className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500 font-mono font-bold uppercase"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                />
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Tên chương trình</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Ưu đãi Spa Mùa Hè"
                  className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Loại giảm giá</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setType('percent')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      type === 'percent' 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Giảm theo %
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType('fixed')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      type === 'fixed' 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Số tiền cố định
                  </button>
                </div>
              </div>

              {/* Value */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">
                  {type === 'percent' ? 'Tỉ lệ giảm (%)' : 'Số tiền giảm (VND)'}
                </label>
                <input 
                  type="number" 
                  min="1"
                  max={type === 'percent' ? 100 : 99999999}
                  required
                  className="form-input text-xs rounded-xl py-2 px-3 font-mono font-bold"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Min Order Value */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Đơn tối thiểu (VND)</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  className="form-input text-xs rounded-xl py-2 px-3 font-mono"
                  value={minOrderValue}
                  onChange={e => setMinOrderValue(e.target.value)}
                />
              </div>

              {/* Max Discount (Only for Percent type) */}
              <div className="space-y-1">
                <label className={`text-xs font-extrabold text-gray-500 uppercase tracking-wide ${type !== 'percent' ? 'opacity-40' : ''}`}>
                  Giảm tối đa (VND)
                </label>
                <input 
                  type="number" 
                  min="0"
                  disabled={type !== 'percent'}
                  className="form-input text-xs rounded-xl py-2 px-3 font-mono disabled:opacity-40 disabled:bg-gray-50"
                  value={type === 'percent' ? maxDiscount : ''}
                  onChange={e => setMaxDiscount(e.target.value)}
                  placeholder="Bỏ trống nếu không giới hạn"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Usage Limit */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Giới hạn lượt dùng</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  className="form-input text-xs rounded-xl py-2 px-3 font-mono"
                  value={usageLimit}
                  onChange={e => setUsageLimit(e.target.value)}
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Ngày hết hạn</label>
                <input 
                  type="date" 
                  required
                  className="form-input text-xs rounded-xl py-2 px-3"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full btn-primary py-2.5 text-xs font-bold justify-center rounded-2xl shadow-md shadow-indigo-100 pt-3"
            >
              Phát hành & Kích hoạt chiến dịch
            </button>

          </form>
        </div>

        {/* RIGHT COLUMN: LIVE GRAPHICS COUPON PREVIEW */}
        <div className="space-y-5">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
            Bản xem trước trực quan (Live Graphic Preview)
          </span>

          {/* Classic punched-out dashed ticket graphic */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl shadow-xl overflow-hidden relative min-h-48 text-white flex select-none animate-slideIn">
            
            {/* Ambient glows inside ticket */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-y-6 translate-x-6" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/10 rounded-full blur-lg translate-y-6 -translate-x-6" />

            {/* Left Value punch-out slot section */}
            <div className="w-1/3 shrink-0 flex flex-col justify-center items-center border-r border-dashed border-white/30 px-3 relative min-h-48 select-none">
              
              {/* Radial punch-out holes on left edge */}
              <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-slate-50 border border-gray-100 z-10" />
              <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-slate-50 border border-gray-100 z-10" />

              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-2">
                <Sparkles size={20} className="text-yellow-200 fill-yellow-200 animate-pulse" />
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-black font-mono tracking-tight leading-none">
                  {type === 'percent' ? `${parsedValue}%` : 'GIẢM'}
                </div>
                <div className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mt-1">
                  {type === 'percent' ? 'Ưu đãi' : `${formatPrice(parsedValue)}`}
                </div>
              </div>
            </div>

            {/* Right details section */}
            <div className="flex-1 p-6 flex flex-col justify-between min-h-48 relative">
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="bg-white/20 text-white text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full">
                    Shop {shopId} ONLY
                  </span>
                </div>
                
                <h3 className="text-base font-black truncate max-w-56 mt-1">
                  {name || 'Tên chương trình ưu đãi'}
                </h3>

                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-sm font-black tracking-wider bg-black/15 text-yellow-100 border border-white/10 px-2 py-0.5 rounded-xl uppercase">
                    {code || 'MÃCHƯATẠO'}
                  </span>
                </div>
              </div>

              {/* Min order / Expiry / Limits conditions */}
              <div className="border-t border-white/10 pt-3 space-y-1.5 text-[10px] text-emerald-55 font-semibold">
                <div className="flex justify-between">
                  <span className="opacity-70 flex items-center gap-1"><ShoppingBag size={11} /> Áp dụng tối thiểu:</span>
                  <strong className="text-white">{formatPrice(parsedMinOrder)}</strong>
                </div>
                {type === 'percent' && parsedMaxDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="opacity-70 flex items-center gap-1"><ShieldAlert size={11} /> Giảm tối đa:</span>
                    <strong className="text-white">{formatPrice(parsedMaxDiscount)}</strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="opacity-70 flex items-center gap-1"><Calendar size={11} /> Hạn dùng (Expiry):</span>
                  <strong className="text-white font-mono">{endDate}</strong>
                </div>
              </div>

            </div>

          </div>

          {/* Prompt card warning */}
          <div className="bg-indigo-50 border border-indigo-150 rounded-3xl p-4 text-xs text-indigo-900 leading-relaxed font-semibold">
            💡 <strong>Quy trình hoạt động:</strong> Sau khi mã Voucher được phát hành, hệ thống sẽ lưu vĩnh viễn dữ liệu và hiển thị mã này trong cổng thanh toán tự động tại quầy của thu ngân chi nhánh, cho phép chiết khấu ngay hóa đơn cho khách.
          </div>
        </div>

      </div>

    </div>
  )
}
