import { useState } from 'react'
import { Plus, Tag, Copy, Check, Eye, EyeOff } from 'lucide-react'
import { VOUCHER_MOCK_LIST } from '@/data/voucherMockData'
import { formatPrice } from '@/utils/format'

const STATUS_COLORS: Record<string, string> = {
  active: 'badge-green', inactive: 'badge-gray', expired: 'badge-red',
}
const STATUS_LABELS: Record<string, string> = {
  active: 'Đang hoạt động', inactive: 'Tạm dừng', expired: 'Hết hạn',
}

export default function ShopHeadVouchersPage() {
  const [vouchers, setVouchers] = useState(VOUCHER_MOCK_LIST)
  const [copied, setCopied] = useState<string | null>(null)

  function copyCode(code: string) {
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  function toggleStatus(id: string) {
    setVouchers(prev => prev.map(v => v.id === id
      ? { ...v, status: (v.status === 'active' ? 'inactive' : 'active') as typeof v.status }
      : v
    ))
  }

  const activeCount = vouchers.filter(v => v.status === 'active').length
  const totalUsed = vouchers.reduce((s, v) => s + v.usedCount, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Voucher Chi nhánh</h1>
          <p className="text-sm text-gray-500">{activeCount} voucher đang hoạt động · {totalUsed} lượt dùng</p>
        </div>
        <button className="btn-primary"><Plus size={15} /> Tạo voucher mới</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Đang hoạt động', value: activeCount, color: 'text-green-600 bg-green-50' },
          { label: 'Tổng lượt dùng', value: totalUsed, color: 'text-blue-600 bg-blue-50' },
          { label: 'Sắp hết hạn', value: vouchers.filter(v => v.status === 'active' && new Date(v.endDate) <= new Date('2026-06-15')).length, color: 'text-orange-600 bg-orange-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.color.split(' ')[1]}`}>
            <div className={`text-2xl font-black ${s.color.split(' ')[0]}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Voucher list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vouchers.map(v => (
          <div key={v.id} className={`card p-4 ${v.status === 'inactive' ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Tag size={18} className="text-primary-500" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">{v.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-sm font-bold text-primary-600">{v.code}</span>
                    <button onClick={() => copyCode(v.code)} className="text-gray-400 hover:text-primary-500">
                      {copied === v.code ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={STATUS_COLORS[v.status]}>{STATUS_LABELS[v.status]}</span>
                <button onClick={() => toggleStatus(v.id)} className="text-gray-300 hover:text-gray-600">
                  {v.status === 'active' ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="text-2xl font-black text-green-600 mb-2">
              {v.type === 'percent' ? `-${v.value}%` : `-${formatPrice(v.value)}`}
              {v.maxDiscount && v.type === 'percent' && (
                <span className="text-sm font-medium text-gray-400 ml-2">tối đa {formatPrice(v.maxDiscount)}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
              <div>💰 Đơn tối thiểu: {formatPrice(v.minOrderValue)}</div>
              <div>📅 HSD: {v.endDate}</div>
              <div>👥 Đã dùng: {v.usedCount}/{v.usageLimit ?? '∞'}</div>
              <div>🏷️ {v.type === 'percent' ? 'Giảm theo %' : 'Giảm cố định'}</div>
            </div>

            {/* Usage progress */}
            {v.usageLimit && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Đã sử dụng</span>
                  <span>{v.usedCount}/{v.usageLimit}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${v.usedCount / v.usageLimit > 0.8 ? 'bg-orange-400' : 'bg-primary-500'}`}
                    style={{ width: `${Math.min((v.usedCount / v.usageLimit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
