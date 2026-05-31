import { useState } from 'react'
import { Plus, Edit, Trash2, Tag, Copy, Check } from 'lucide-react'
import { VOUCHER_MOCK_LIST } from '@/data/voucherMockData'
import { formatPrice } from '@/utils/format'

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState(VOUCHER_MOCK_LIST)
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [newVoucher, setNewVoucher] = useState({
    code: '', name: '', type: 'percent' as 'percent' | 'fixed', value: 10, minOrderValue: 0, endDate: '', usageLimit: 100,
  })

  function copyCode(code: string) {
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  function toggleStatus(id: string) {
    setVouchers(prev => prev.map(v =>
      v.id === id ? { ...v, status: (v.status === 'active' ? 'inactive' : 'active') as typeof v.status } : v
    ))
  }

  const STATUS_COLORS: Record<string, string> = {
    active: 'badge-green', inactive: 'badge-gray', expired: 'badge-red',
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Voucher & Khuyến mãi</h1>
          <p className="text-sm text-gray-500">{vouchers.length} voucher · {vouchers.filter(v => v.status === 'active').length} đang hoạt động</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={15} /> Tạo voucher</button>
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Tạo voucher mới</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="form-label">Mã voucher</label>
                <input className="form-input font-mono uppercase" placeholder="PETCARE20" value={newVoucher.code} onChange={e => setNewVoucher(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
              </div>
              <div className="col-span-2">
                <label className="form-label">Tên hiển thị</label>
                <input className="form-input" placeholder="Giảm 20% dịch vụ..." value={newVoucher.name} onChange={e => setNewVoucher(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Loại giảm giá</label>
                <select className="form-input" value={newVoucher.type} onChange={e => setNewVoucher(p => ({ ...p, type: e.target.value as 'percent' | 'fixed' }))}>
                  <option value="percent">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định</option>
                </select>
              </div>
              <div>
                <label className="form-label">Giá trị {newVoucher.type === 'percent' ? '(%)' : '(đ)'}</label>
                <input type="number" className="form-input" value={newVoucher.value} onChange={e => setNewVoucher(p => ({ ...p, value: +e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Đơn tối thiểu (đ)</label>
                <input type="number" className="form-input" value={newVoucher.minOrderValue} onChange={e => setNewVoucher(p => ({ ...p, minOrderValue: +e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Giới hạn sử dụng</label>
                <input type="number" className="form-input" value={newVoucher.usageLimit} onChange={e => setNewVoucher(p => ({ ...p, usageLimit: +e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="form-label">Hết hạn</label>
                <input type="date" className="form-input" value={newVoucher.endDate} onChange={e => setNewVoucher(p => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary flex-1 justify-center" onClick={() => setShowForm(false)}>Tạo voucher</button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th">Mã / Tên</th>
              <th className="table-th">Giảm giá</th>
              <th className="table-th">Điều kiện</th>
              <th className="table-th">Sử dụng</th>
              <th className="table-th">Hết hạn</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vouchers.map(v => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="table-td">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                      <Tag size={14} className="text-primary-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-primary-600">{v.code}</span>
                        <button onClick={() => copyCode(v.code)} className="text-gray-400 hover:text-primary-500">
                          {copied === v.code ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">{v.name}</div>
                    </div>
                  </div>
                </td>
                <td className="table-td">
                  <span className="text-sm font-bold text-green-600">
                    {v.type === 'percent' ? `-${v.value}%` : `-${formatPrice(v.value)}`}
                  </span>
                  {v.maxDiscount && <div className="text-xs text-gray-400">tối đa {formatPrice(v.maxDiscount)}</div>}
                </td>
                <td className="table-td text-xs text-gray-600">Tối thiểu {formatPrice(v.minOrderValue)}</td>
                <td className="table-td">
                  <div className="text-xs font-bold">{v.usedCount}/{v.usageLimit ?? '∞'}</div>
                  {v.usageLimit && (
                    <div className="w-16 bg-gray-100 rounded h-1 mt-1">
                      <div className="bg-primary-500 h-1 rounded" style={{ width: `${(v.usedCount / v.usageLimit) * 100}%` }} />
                    </div>
                  )}
                </td>
                <td className="table-td text-xs text-gray-500">{v.endDate}</td>
                <td className="table-td"><span className={STATUS_COLORS[v.status]}>{v.status === 'active' ? 'Hoạt động' : v.status === 'inactive' ? 'Tạm dừng' : 'Hết hạn'}</span></td>
                <td className="table-td">
                  <div className="flex gap-1">
                    <button className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"><Edit size={13} /></button>
                    <button onClick={() => toggleStatus(v.id)} className={`text-xs px-2 py-1 rounded border transition-colors ${v.status === 'active' ? 'text-orange-600 border-orange-200 hover:bg-orange-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}>
                      {v.status === 'active' ? 'Dừng' : 'Kích hoạt'}
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
