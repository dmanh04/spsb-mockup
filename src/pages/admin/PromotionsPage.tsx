import { useState } from 'react'
import { Plus, Edit, Megaphone, Calendar, Users } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  type: 'discount' | 'loyalty' | 'bundle' | 'seasonal'
  status: 'active' | 'scheduled' | 'ended' | 'draft'
  startDate: string
  endDate: string
  target: string
  description: string
  reach: number
  conversions: number
}

const CAMPAIGNS: Campaign[] = [
  { id: 'C001', name: 'Hè rực rỡ — Giảm 20% Spa', type: 'seasonal', status: 'active', startDate: '2026-05-01', endDate: '2026-07-31', target: 'Tất cả khách hàng', description: 'Giảm 20% tất cả dịch vụ Spa trong mùa hè', reach: 1240, conversions: 87 },
  { id: 'C002', name: 'Khách hàng thân thiết — Combo 5 buổi', type: 'loyalty', status: 'active', startDate: '2026-01-01', endDate: '2026-12-31', target: 'Khách hàng VIP (>5 lần)', description: 'Mua 5 buổi tắm, tặng 1 buổi miễn phí', reach: 340, conversions: 52 },
  { id: 'C003', name: 'Khai trương CN Quận 7', type: 'bundle', status: 'scheduled', startDate: '2026-06-15', endDate: '2026-06-30', target: 'Khách hàng mới', description: 'Miễn phí tắm + sấy khi đặt lịch lần đầu tại CN Q.7', reach: 0, conversions: 0 },
  { id: 'C004', name: 'Giảm giá tháng sinh nhật', type: 'loyalty', status: 'active', startDate: '2026-01-01', endDate: '2026-12-31', target: 'Khách hàng có sinh nhật trong tháng', description: 'Giảm 15% dịch vụ bất kỳ trong tháng sinh nhật', reach: 89, conversions: 31 },
  { id: 'C005', name: 'Flash Sale cuối tuần', type: 'discount', status: 'ended', startDate: '2026-04-01', endDate: '2026-04-30', target: 'Tất cả', description: 'Giảm 30% Spa Premium vào thứ 6–7–CN', reach: 890, conversions: 134 },
]

const TYPE_LABELS: Record<string, string> = {
  discount: 'Giảm giá', loyalty: 'Khách thân thiết', bundle: 'Combo', seasonal: 'Theo mùa',
}
const TYPE_COLORS: Record<string, string> = {
  discount: 'bg-red-100 text-red-700', loyalty: 'bg-purple-100 text-purple-700',
  bundle: 'bg-blue-100 text-blue-700', seasonal: 'bg-green-100 text-green-700',
}
const STATUS_COLORS: Record<string, string> = {
  active: 'badge-green', scheduled: 'badge-blue', ended: 'badge-gray', draft: 'badge-orange',
}
const STATUS_LABELS: Record<string, string> = {
  active: 'Đang chạy', scheduled: 'Sắp diễn ra', ended: 'Đã kết thúc', draft: 'Nháp',
}

export default function PromotionsPage() {
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = filterStatus === 'all' ? CAMPAIGNS : CAMPAIGNS.filter(c => c.status === filterStatus)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone size={20} className="text-primary-500" /> Chiến dịch Khuyến mãi
          </h1>
          <p className="text-sm text-gray-500">{CAMPAIGNS.filter(c => c.status === 'active').length} chiến dịch đang chạy</p>
        </div>
        <button className="btn-primary"><Plus size={15} /> Tạo chiến dịch</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Đang chạy', value: CAMPAIGNS.filter(c => c.status === 'active').length, color: 'text-green-600' },
          { label: 'Tổng lượt tiếp cận', value: CAMPAIGNS.reduce((s, c) => s + c.reach, 0).toLocaleString(), color: 'text-blue-600' },
          { label: 'Chuyển đổi', value: CAMPAIGNS.reduce((s, c) => s + c.conversions, 0), color: 'text-indigo-600' },
          { label: 'Tỷ lệ chuyển đổi', value: `${Math.round(CAMPAIGNS.reduce((s, c) => s + c.conversions, 0) / CAMPAIGNS.reduce((s, c) => s + c.reach, 0) * 100)}%`, color: 'text-primary-600' },
        ].map(s => (
          <div key={s.label} className="card p-3">
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['all', 'active', 'scheduled', 'ended', 'draft'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
            {s === 'all' ? 'Tất cả' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Campaign cards */}
      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{c.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${TYPE_COLORS[c.type]}`}>{TYPE_LABELS[c.type]}</span>
                  <span className={STATUS_COLORS[c.status]}>{STATUS_LABELS[c.status]}</span>
                </div>
                <p className="text-sm text-gray-500">{c.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="btn-secondary text-xs py-1.5"><Edit size={12} /> Sửa</button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-gray-400" />
                <div>
                  <div className="text-xs text-gray-400">Thời gian</div>
                  <div className="font-medium text-xs">{c.startDate} → {c.endDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users size={13} className="text-gray-400" />
                <div>
                  <div className="text-xs text-gray-400">Đối tượng</div>
                  <div className="font-medium text-xs">{c.target}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Lượt tiếp cận</div>
                <div className="font-bold text-blue-600">{c.reach.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Chuyển đổi</div>
                <div className="font-bold text-green-600">{c.conversions} ({c.reach > 0 ? Math.round(c.conversions / c.reach * 100) : 0}%)</div>
              </div>
            </div>

            {c.status === 'active' && c.reach > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Hiệu quả chuyển đổi</span>
                  <span>{Math.round(c.conversions / c.reach * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded h-2">
                  <div className="bg-green-500 h-2 rounded" style={{ width: `${Math.min(c.conversions / c.reach * 100 * 5, 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
