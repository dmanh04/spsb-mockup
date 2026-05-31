import { useState } from 'react'
import { Search, UserPlus, Edit, Ban } from 'lucide-react'
import { USER_MOCK_LIST, ROLE_LABELS, ROLE_COLORS } from '@/data/userMockData'
import { SHOP_MOCK_LIST } from '@/data/shopMockData'
import type { Role } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  active: 'badge-green', inactive: 'badge-gray', banned: 'badge-red',
}
const STATUS_LABELS: Record<string, string> = {
  active: 'Hoạt động', inactive: 'Tạm ngừng', banned: 'Đã khóa',
}

export default function UserManagementPage() {
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filtered = USER_MOCK_LIST
    .filter(u => filterRole === 'all' || u.role === filterRole)
    .filter(u => filterStatus === 'all' || u.status === filterStatus)
    .filter(u => !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))

  const roles: { value: string; label: string }[] = [
    { value: 'all', label: 'Tất cả role' },
    ...Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500">{USER_MOCK_LIST.length} tài khoản trong hệ thống</p>
        </div>
        <button className="btn-primary"><UserPlus size={15} /> Thêm người dùng</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9" placeholder="Tìm tên, email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input w-auto" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select className="form-input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Tạm ngừng</option>
          <option value="banned">Đã khóa</option>
        </select>
      </div>

      <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">{filtered.length}</span> kết quả</p>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th">Người dùng</th>
              <th className="table-th">Role</th>
              <th className="table-th">Chi nhánh</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th">Đăng nhập lần cuối</th>
              <th className="table-th">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(u => {
              const shop = SHOP_MOCK_LIST.find(s => s.id === u.shopId)
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt="" className="w-8 h-8 rounded-full shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{u.fullName}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-td">
                    <span className={ROLE_COLORS[u.role]}>{ROLE_LABELS[u.role]}</span>
                  </td>
                  <td className="table-td text-xs text-gray-600">
                    {shop ? shop.name.replace('PetCare ', '') : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="table-td">
                    <span className={STATUS_COLORS[u.status]}>{STATUS_LABELS[u.status]}</span>
                  </td>
                  <td className="table-td text-xs text-gray-500">{u.lastLogin}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Sửa">
                        <Edit size={13} />
                      </button>
                      {u.status === 'active' && (
                        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Khóa">
                          <Ban size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">Không tìm thấy người dùng</div>
        )}
      </div>
    </div>
  )
}
