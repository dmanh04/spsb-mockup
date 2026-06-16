import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus, Search, Eye, CheckCircle, XCircle } from 'lucide-react'
import { STOCK_ISSUES, saveStockIssues } from '@/data/stockIssueMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import { formatPrice } from '@/utils/format'
import type { StockIssueStatus, StockIssueType } from '@/types'

const STATUS_MAP: Record<StockIssueStatus, { label: string; badge: string }> = {
  draft: { label: 'Nháp', badge: 'badge-gray' },
  pending_approval: { label: 'Chờ duyệt', badge: 'badge-orange' },
  approved: { label: 'Đã duyệt', badge: 'badge-blue' },
  completed: { label: 'Hoàn thành', badge: 'badge-green' },
  cancelled: { label: 'Đã hủy', badge: 'badge-red' },
}

const TYPE_MAP: Record<StockIssueType, { label: string; badge: string }> = {
  sale: { label: 'Bán hàng', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  service_consumable: { label: 'Tiêu hao DV', badge: 'bg-purple-50 text-purple-700 border border-purple-200' },
  return_supplier: { label: 'Trả NCC', badge: 'bg-blue-50 text-blue-700 border border-blue-200' },
  damaged: { label: 'Hàng hỏng', badge: 'bg-red-50 text-red-600 border border-red-200' },
  transfer: { label: 'Chuyển kho', badge: 'bg-amber-50 text-amber-700 border border-amber-200' },
}

export default function StockIssueListPage() {
  const location = useLocation()
  const prefix = location.pathname.startsWith('/admin') ? '/admin/inventory' : '/warehouse'
  const [issues, setIssues] = useState(STOCK_ISSUES)
  const [filterStatus, setFilterStatus] = useState<StockIssueStatus | 'all'>('all')
  const [filterType, setFilterType] = useState<StockIssueType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = issues
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .filter(r => filterType === 'all' || r.type === filterType)
    .filter(r => !search || r.id.toLowerCase().includes(search.toLowerCase()) || r.reason.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const pendingCount = issues.filter(r => r.status === 'pending_approval').length
  const selected = selectedId ? issues.find(r => r.id === selectedId) : null

  function shopName(id: string) {
    if (id === 'warehouse') return 'Kho trung tâm'
    return SHOP_MOCK_LIST.find(s => s.id === id)?.name.replace('PetCare ', '') ?? id
  }

  function approve(id: string) {
    const next = issues.map(r => r.id === id ? { ...r, status: 'approved' as const, approvedBy: 'Admin PetCare', approvedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') } : r)
    setIssues(next)
    saveStockIssues(next)
  }

  function complete(id: string) {
    const next = issues.map(r => r.id === id ? { ...r, status: 'completed' as const } : r)
    setIssues(next)
    saveStockIssues(next)
  }

  function cancel(id: string) {
    const next = issues.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r)
    setIssues(next)
    saveStockIssues(next)
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Phiếu Xuất Kho (GIN)</h1>
          <p className="text-sm text-gray-500">
            {issues.length} phiếu {pendingCount > 0 && <span className="text-amber-600 font-semibold">· {pendingCount} chờ duyệt</span>}
          </p>
        </div>
        <Link to={`${prefix}/issues/new`} className="btn-primary">
          <Plus size={15} /> Tạo phiếu xuất
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {(['all', 'draft', 'pending_approval', 'approved', 'completed', 'cancelled'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterStatus === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {s === 'all' ? 'Tất cả' : STATUS_MAP[s].label}
              {s === 'pending_approval' && pendingCount > 0 && <span className="ml-1 badge-orange text-[10px]">{pendingCount}</span>}
            </button>
          ))}
        </div>
        <select className="form-input w-auto text-sm py-1.5" value={filterType} onChange={e => setFilterType(e.target.value as StockIssueType | 'all')}>
          <option value="all">Tất cả loại</option>
          {(Object.entries(TYPE_MAP) as [StockIssueType, { label: string }][]).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9 text-sm" placeholder="Tìm mã phiếu, lý do..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className={`card overflow-hidden flex-1 ${selected ? 'max-w-[60%]' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Mã phiếu</th>
                  <th className="table-th">Loại xuất</th>
                  <th className="table-th">Kho xuất</th>
                  <th className="table-th text-center">Số SKU</th>
                  <th className="table-th text-right">Giá trị</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th">Ngày</th>
                  <th className="table-th text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(r => (
                  <tr key={r.id} className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedId === r.id ? 'bg-primary-50/30' : ''}`}
                    onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}>
                    <td className="table-td font-mono text-xs font-bold text-primary-600">{r.id}</td>
                    <td className="table-td"><span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${TYPE_MAP[r.type].badge}`}>{TYPE_MAP[r.type].label}</span></td>
                    <td className="table-td text-xs">{shopName(r.warehouseId)}</td>
                    <td className="table-td text-center text-sm font-bold">{r.items.length}</td>
                    <td className="table-td text-right text-sm font-bold text-gray-900">{formatPrice(r.totalValue)}</td>
                    <td className="table-td"><span className={STATUS_MAP[r.status].badge}>{STATUS_MAP[r.status].label}</span></td>
                    <td className="table-td text-xs text-gray-400">{r.createdAt.split(' ')[0]}</td>
                    <td className="table-td text-center">
                      <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                        {r.status === 'pending_approval' && (
                          <>
                            <button onClick={() => approve(r.id)} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg"><CheckCircle size={15} /></button>
                            <button onClick={() => cancel(r.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><XCircle size={15} /></button>
                          </>
                        )}
                        {r.status === 'approved' && (
                          <button onClick={() => complete(r.id)} className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100">
                            Xuất kho
                          </button>
                        )}
                        <button onClick={() => setSelectedId(r.id)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><Eye size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-12 text-center text-gray-400 text-sm">Không có phiếu xuất kho nào</div>}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-[40%] card p-5 space-y-4 animate-slideIn sticky top-4 self-start">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">{selected.id}</h3>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-[10px] text-gray-400 uppercase font-bold">Loại xuất</div><span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${TYPE_MAP[selected.type].badge}`}>{TYPE_MAP[selected.type].label}</span></div>
                <div><div className="text-[10px] text-gray-400 uppercase font-bold">Trạng thái</div><span className={STATUS_MAP[selected.status].badge}>{STATUS_MAP[selected.status].label}</span></div>
                <div><div className="text-[10px] text-gray-400 uppercase font-bold">Kho xuất</div><div className="font-medium">{shopName(selected.warehouseId)}</div></div>
                <div><div className="text-[10px] text-gray-400 uppercase font-bold">Ngày tạo</div><div className="font-medium">{selected.createdAt}</div></div>
                <div className="col-span-2"><div className="text-[10px] text-gray-400 uppercase font-bold">Lý do</div><div className="font-medium">{selected.reason}</div></div>
                <div><div className="text-[10px] text-gray-400 uppercase font-bold">Người tạo</div><div className="font-medium">{selected.createdBy}</div></div>
                {selected.approvedBy && <div><div className="text-[10px] text-gray-400 uppercase font-bold">Người duyệt</div><div className="font-medium">{selected.approvedBy}</div></div>}
              </div>

              {selected.note && <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">📋 {selected.note}</div>}

              <div>
                <div className="text-xs font-bold text-gray-800 mb-2">Hàng hóa ({selected.items.length} SKU)</div>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-gray-900">{item.productName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {item.skuCode}
                          {item.batchNumber && <span className="text-indigo-600 font-bold ml-2">Lô: {item.batchNumber}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-red-500">-{item.quantity}</div>
                        <div className="text-[10px] text-gray-400">{formatPrice(item.unitCost)}/sp</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="font-bold text-gray-600">Tổng giá trị</span>
                <span className="text-base font-black text-red-500">{formatPrice(selected.totalValue)}</span>
              </div>

              {selected.status === 'pending_approval' && (
                <div className="flex gap-2 pt-2">
                  <button onClick={() => approve(selected.id)} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5">
                    <CheckCircle size={14} /> Duyệt
                  </button>
                  <button onClick={() => cancel(selected.id)} className="py-2.5 px-4 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50">Hủy</button>
                </div>
              )}
              {selected.status === 'approved' && (
                <button onClick={() => complete(selected.id)} className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl">
                  ✅ Xác nhận đã xuất kho
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
