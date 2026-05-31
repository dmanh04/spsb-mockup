import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Tag, Copy, Check } from 'lucide-react'
import { VOUCHER_MOCK_LIST, saveVouchers } from '@/data/voucherMockData'
import { formatPrice } from '@/utils/format'

export default function AdminVouchersPage() {
  const navigate = useNavigate()
  const [vouchers, setVouchers] = useState(VOUCHER_MOCK_LIST)
  const [copied, setCopied] = useState<string | null>(null)

  function copyCode(code: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code)
    }
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  function toggleStatus(id: string) {
    const updated = vouchers.map(v =>
      v.id === id ? { ...v, status: (v.status === 'active' ? 'inactive' as const : 'active' as const) } : v
    )
    setVouchers(updated)
    saveVouchers(updated)
  }

  function handleDelete(id: string) {
    if (window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
      const updated = vouchers.filter(v => v.id !== id)
      setVouchers(updated)
      saveVouchers(updated)
    }
  }

  const STATUS_COLORS: Record<string, string> = {
    active: 'badge-green', inactive: 'badge-gray', expired: 'badge-red',
  }

  return (
    <div className="space-y-6 text-sm animate-fadeIn">
      {/* Header section with Glassmorphic breadcrumbs */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-100 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Voucher & Khuyến mãi</h1>
          <p className="text-gray-500 mt-1 font-medium">
            {vouchers.length} voucher · {vouchers.filter(v => v.status === 'active').length} đang hoạt động
          </p>
        </div>
        
        <div>
          <button 
            onClick={() => navigate('/admin/vouchers/new')} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Tạo voucher mới
          </button>
        </div>
      </div>

      {/* Voucher list table */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-4">Mã / Tên hiển thị</th>
              <th className="px-5 py-4">Giảm giá</th>
              <th className="px-5 py-4">Điều kiện áp dụng</th>
              <th className="px-5 py-4">Số lượng đã dùng</th>
              <th className="px-5 py-4">Ngày hết hạn</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {vouchers.map(v => (
              <tr key={v.id} className={`hover:bg-gray-50/50 ${v.status === 'inactive' ? 'opacity-65' : ''}`}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                      <Tag size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-extrabold text-indigo-650 tracking-wide select-all">{v.code}</span>
                        <button onClick={() => copyCode(v.code)} className="text-gray-400 hover:text-indigo-600 cursor-pointer p-0.5 transition-colors">
                          {copied === v.code ? <Check size={11} className="text-emerald-500 stroke-[3]" /> : <Copy size={11} />}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-0.5">{v.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-extrabold text-emerald-600">
                    {v.type === 'percent' ? `-${v.value}%` : `-${formatPrice(v.value)}`}
                  </span>
                  {v.maxDiscount && (
                    <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Tối đa {formatPrice(v.maxDiscount)}</div>
                  )}
                </td>
                <td className="px-5 py-4 text-xs font-bold text-gray-600">
                  Đơn từ {formatPrice(v.minOrderValue)}
                  {v.shopId && (
                    <div className="text-[9px] text-indigo-500 font-extrabold uppercase mt-0.5">Áp dụng Chi nhánh {v.shopId}</div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="text-xs font-extrabold text-gray-900">{v.usedCount} / {v.usageLimit ?? '∞'} lượt</div>
                  {v.usageLimit && (
                    <div className="w-16 bg-gray-100 rounded-full h-1 mt-1.5 overflow-hidden">
                      <div className="bg-indigo-600 h-1" style={{ width: `${Math.min(100, (v.usedCount / v.usageLimit) * 100)}%` }} />
                    </div>
                  )}
                </td>
                <td className="px-5 py-4 text-xs font-bold text-gray-500">{v.endDate}</td>
                <td className="px-5 py-4">
                  <span className={STATUS_COLORS[v.status]}>
                    {v.status === 'active' ? 'Hoạt động' : v.status === 'inactive' ? 'Tạm dừng' : 'Hết hạn'}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex gap-2 items-center justify-center">
                    <button 
                      onClick={() => navigate(`/admin/vouchers/${v.id}/edit`)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                      title="Chỉnh sửa voucher"
                    >
                      <Edit size={14} />
                    </button>
                    
                    <button 
                      onClick={() => toggleStatus(v.id)} 
                      className={`text-xs px-2.5 py-1 rounded-xl border transition-all cursor-pointer font-bold ${
                        v.status === 'active' 
                          ? 'text-orange-600 border-orange-200 bg-orange-50/10 hover:bg-orange-50' 
                          : 'text-emerald-600 border-emerald-250 bg-emerald-50/10 hover:bg-emerald-50'
                      }`}
                    >
                      {v.status === 'active' ? 'Dừng' : 'Mở'}
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Xóa voucher"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vouchers.length === 0 && (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <div className="text-2xl">🎟️</div>
            <div className="font-semibold text-xs">Hiện tại chưa cấu hình mã voucher nào trên hệ thống.</div>
          </div>
        )}
      </div>
    </div>
  )
}
