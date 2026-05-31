import React, { useState } from 'react'
import { USER_MOCK_LIST, ROLE_LABELS } from '@/data/userMockData'
import type { User, Role } from '@/types'
import { Search, UserCheck, Shield, ChevronDown, Check, AlertCircle } from 'lucide-react'

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Super Admin' },
  { value: 'shop_head', label: 'Quản lý Chi nhánh' },
  { value: 'operation_staff', label: 'NV Vận hành' },
  { value: 'petcare_staff', label: 'NV Chăm sóc' },
  { value: 'warehouse_manager', label: 'Quản lý Kho' },
  { value: 'customer', label: 'Khách hàng' },
]

export default function UserAssignmentPanel() {
  const [users, setUsers] = useState<User[]>(USER_MOCK_LIST)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showToast, setShowToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' })

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search)
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  function handleRoleChange(userId: string, newRole: Role) {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    
    const user = users.find(u => u.id === userId)
    if (user) {
      triggerToast(`Đã chuyển vai trò của ${user.fullName} thành ${ROLE_LABELS[newRole] || newRole}`)
    }
  }

  function triggerToast(msg: string) {
    setShowToast({ show: true, msg })
    setTimeout(() => {
      setShowToast({ show: false, msg: '' })
    }, 3000)
  }

  return (
    <div className="space-y-5 animate-fadeIn relative">
      {/* Toast Notification */}
      {showToast.show && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-gray-800 animate-slideIn">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <UserCheck size={14} className="text-emerald-400" />
          <span>{showToast.msg}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng theo tên, email, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-semibold shrink-0">Lọc vai trò:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500 transition-colors bg-white font-medium text-gray-700"
          >
            <option value="all">Tất cả vai trò</option>
            {ROLE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* User Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Người dùng</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò hiện tại</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Chi nhánh</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Đăng nhập cuối</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* User Profile */}
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <img
                      src={user.avatar || `https://placehold.co/40x40/cccccc/ffffff?text=${user.fullName.charAt(0)}`}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-gray-100"
                    />
                    <div className="space-y-0.5">
                      <div className="font-bold text-gray-800">{user.fullName}</div>
                      <div className="text-[10px] text-gray-400">{user.email} • {user.phone}</div>
                    </div>
                  </td>

                  {/* Role Assignment Selector */}
                  <td className="px-5 py-3.5">
                    <div className="relative inline-block w-44">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 cursor-pointer pr-8"
                      >
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </td>

                  {/* Branch Shop */}
                  <td className="px-5 py-3.5 text-gray-600 font-medium">
                    {user.shopId === 'SH01' ? 'PetCare Quận 1' : user.shopId === 'SH02' ? 'PetCare Quận 3' : user.shopId === 'SH03' ? 'PetCare Quận 7' : 'Toàn hệ thống'}
                  </td>

                  {/* Last Login */}
                  <td className="px-5 py-3.5 text-gray-500 font-mono">
                    {user.lastLogin}
                  </td>

                  {/* Status Badge */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase border ${
                      user.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : user.status === 'inactive'
                        ? 'bg-gray-100 text-gray-500 border-gray-200'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {user.status === 'active' ? 'Hoạt động' : user.status === 'inactive' ? 'Ngoại tuyến' : 'Bị khóa'}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                    Không tìm thấy người dùng nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
