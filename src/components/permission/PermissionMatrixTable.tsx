import React, { useState } from 'react'
import {
  Shield, Check, Save, RotateCcw, Info, Users, LayoutDashboard,
  Calendar, Package, Scissors, Home, ShoppingCart, Warehouse,
  MapPin, Ticket, BarChart3, Brain, ShieldAlert, Settings,
  Eye, Plus, Edit2, Trash2, Download, CheckSquare, RefreshCw, X
} from 'lucide-react'

// Define types
type Role = 'admin' | 'shop_head' | 'operation_staff' | 'petcare_staff' | 'warehouse_manager' | 'customer'

interface RoleInfo {
  name: string
  label: string
  type: 'system' | 'custom'
  memberCount: number
  description: string
  color: string
}

const ROLE_DETAILS: Record<Role, RoleInfo> = {
  admin: {
    name: 'Super Admin',
    label: 'Hệ thống',
    type: 'system',
    memberCount: 3,
    description: 'Toàn quyền quản trị hệ thống Pet Care & Shop trên toàn hệ thống LMS & CRM. Có quyền tối cao không thể sửa đổi quyền hạn mặc định.',
    color: 'text-red-700 bg-red-50 border-red-200'
  },
  shop_head: {
    name: 'Quản lý Chi nhánh',
    label: 'Hệ thống',
    type: 'system',
    memberCount: 5,
    description: 'Quản lý toàn bộ hoạt động của chi nhánh, phân công ca trực cho nhân viên chăm sóc, phê duyệt lịch nghỉ phép và xem báo cáo tài chính chi nhánh.',
    color: 'text-blue-700 bg-blue-50 border-blue-200'
  },
  operation_staff: {
    name: 'NV Vận hành',
    label: 'Hệ thống',
    type: 'system',
    memberCount: 12,
    description: 'Tiếp nhận thú cưng đặt lịch (bookings), làm thủ tục check-in/check-out, tư vấn dịch vụ tại quầy, xử lý hóa đơn thanh toán cho khách hàng.',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
  },
  petcare_staff: {
    name: 'NV Chăm sóc',
    label: 'Hệ thống',
    type: 'system',
    memberCount: 15,
    description: 'Trực tiếp thực hiện các nghiệp vụ chăm sóc thú cưng: tắm rửa, vệ sinh, cắt tỉa lông (spa, grooming), theo dõi và ghi chép nhật ký sức khỏe.',
    color: 'text-purple-700 bg-purple-50 border-purple-200'
  },
  warehouse_manager: {
    name: 'Quản lý Kho',
    label: 'Hệ thống',
    type: 'system',
    memberCount: 4,
    description: 'Quản lý số lượng tồn kho sản phẩm, tạo phiếu nhập kho/xuất kho, lập lệnh điều chuyển hàng hóa giữa các chi nhánh chi tiết.',
    color: 'text-amber-700 bg-amber-50 border-amber-200'
  },
  customer: {
    name: 'Khách hàng',
    label: 'Hệ thống',
    type: 'system',
    memberCount: 1250,
    description: 'Khách hàng của hệ thống. Có quyền truy cập cổng thông tin khách hàng (customer portal) để đặt lịch, đặt mua sản phẩm, xem hồ sơ thú cưng.',
    color: 'text-sky-700 bg-sky-50 border-sky-200'
  }
}

// 7 Actions
type Action = 'read' | 'create' | 'edit' | 'delete' | 'export' | 'approve' | 'manage'

const ACTIONS: { value: Action; label: string }[] = [
  { value: 'read', label: 'Xem' },
  { value: 'create', label: 'Tạo mới' },
  { value: 'edit', label: 'Sửa' },
  { value: 'delete', label: 'Xóa' },
  { value: 'export', label: 'Xuất' },
  { value: 'approve', label: 'Phê duyệt' },
  { value: 'manage', label: 'Quản lý' }
]

// Modules specific to SPSB Pet shop
interface ModuleInfo {
  id: string
  name: string
  icon: React.ElementType
}

const MODULES: ModuleInfo[] = [
  { id: 'dashboard', name: 'Tổng quan & Dashboard', icon: LayoutDashboard },
  { id: 'booking', name: 'Quản lý Đặt lịch (Booking)', icon: Calendar },
  { id: 'product', name: 'Quản lý Sản phẩm', icon: Package },
  { id: 'service', name: 'Quản lý Dịch vụ', icon: Scissors },
  { id: 'room', name: 'Quản lý Phòng & Chuồng', icon: Home },
  { id: 'order', name: 'Quản lý Đơn hàng', icon: ShoppingCart },
  { id: 'inventory', name: 'Quản lý Kho hàng', icon: Warehouse },
  { id: 'user', name: 'Quản lý Nhân sự', icon: Users },
  { id: 'shop', name: 'Quản lý Chi nhánh', icon: MapPin },
  { id: 'voucher', name: 'Cấu hình Voucher', icon: Ticket },
  { id: 'report', name: 'Báo cáo & Thống kê', icon: BarChart3 },
  { id: 'ai', name: 'AI Breed & Chatbot', icon: Brain },
  { id: 'permission', name: 'Phân quyền hệ thống', icon: ShieldAlert },
  { id: 'settings', name: 'Cài đặt Hệ thống', icon: Settings }
]

// Default Permission state mapped logically
const INITIAL_PERMISSION_STATE: Record<Role, Record<string, Record<Action, boolean>>> = {
  admin: {
    dashboard: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    booking: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    product: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    service: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    room: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    order: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    inventory: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    user: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    shop: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    voucher: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    report: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    ai: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    permission: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    settings: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true }
  },
  shop_head: {
    dashboard: { read: true, create: false, edit: false, delete: false, export: true, approve: false, manage: false },
    booking: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    product: { read: true, create: true, edit: true, delete: false, export: true, approve: false, manage: true },
    service: { read: true, create: true, edit: true, delete: false, export: true, approve: false, manage: true },
    room: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    order: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    inventory: { read: true, create: true, edit: true, delete: false, export: true, approve: true, manage: true },
    user: { read: true, create: false, edit: true, delete: false, export: true, approve: true, manage: false },
    shop: { read: true, create: false, edit: true, delete: false, export: false, approve: false, manage: false },
    voucher: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    report: { read: true, create: false, edit: false, delete: false, export: true, approve: false, manage: false },
    ai: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    permission: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    settings: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false }
  },
  operation_staff: {
    dashboard: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    booking: { read: true, create: true, edit: true, delete: false, export: true, approve: false, manage: false },
    product: { read: true, create: false, edit: false, delete: false, export: true, approve: false, manage: false },
    service: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    room: { read: true, create: false, edit: true, delete: false, export: false, approve: false, manage: false },
    order: { read: true, create: true, edit: true, delete: false, export: true, approve: false, manage: false },
    inventory: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    user: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    shop: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    voucher: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    report: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    ai: { read: true, create: true, edit: false, delete: false, export: false, approve: false, manage: false },
    permission: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    settings: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false }
  },
  petcare_staff: {
    dashboard: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    booking: { read: true, create: false, edit: true, delete: false, export: false, approve: false, manage: false },
    product: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    service: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    room: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    order: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    inventory: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    user: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    shop: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    voucher: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    report: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    ai: { read: true, create: true, edit: false, delete: false, export: false, approve: false, manage: false },
    permission: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    settings: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false }
  },
  warehouse_manager: {
    dashboard: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    booking: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    product: { read: true, create: true, edit: true, delete: false, export: true, approve: false, manage: false },
    service: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    room: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    order: { read: true, create: false, edit: false, delete: false, export: true, approve: false, manage: false },
    inventory: { read: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
    user: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    shop: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    voucher: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    report: { read: true, create: false, edit: false, delete: false, export: true, approve: false, manage: false },
    ai: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    permission: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    settings: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false }
  },
  customer: {
    dashboard: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    booking: { read: true, create: true, edit: true, delete: true, export: false, approve: false, manage: false },
    product: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    service: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    room: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    order: { read: true, create: true, edit: false, delete: true, export: false, approve: false, manage: false },
    inventory: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    user: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    shop: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    voucher: { read: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    report: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    ai: { read: true, create: true, edit: false, delete: false, export: false, approve: false, manage: false },
    permission: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
    settings: { read: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false }
  }
}

export default function PermissionMatrixTable() {
  const [selectedRole, setSelectedRole] = useState<Role>('admin')
  const [permissions, setPermissions] = useState(INITIAL_PERMISSION_STATE)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  // Toggle single permission checkmark
  function handleToggle(moduleId: string, action: Action) {
    if (selectedRole === 'admin') return // Super admin is protected

    setPermissions(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [moduleId]: {
          ...prev[selectedRole][moduleId],
          [action]: !prev[selectedRole][moduleId][action]
        }
      }
    }))
    setDirty(true)
  }

  // Row-level select all/clear
  function handleToggleRow(moduleId: string, forceState?: boolean) {
    if (selectedRole === 'admin') return

    const currentRow = permissions[selectedRole][moduleId]
    const allChecked = Object.values(currentRow).every(val => val)
    const targetState = forceState !== undefined ? forceState : !allChecked

    const newRow = { ...currentRow }
    ACTIONS.forEach(act => {
      newRow[act.value] = targetState
    })

    setPermissions(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [moduleId]: newRow
      }
    }))
    setDirty(true)
  }

  // Column-level select all/clear
  function handleToggleColumn(action: Action, forceState?: boolean) {
    if (selectedRole === 'admin') return

    const allChecked = MODULES.every(mod => permissions[selectedRole][mod.id][action])
    const targetState = forceState !== undefined ? forceState : !allChecked

    const newRolePermissions = { ...permissions[selectedRole] }
    MODULES.forEach(mod => {
      newRolePermissions[mod.id] = {
        ...newRolePermissions[mod.id],
        [action]: targetState
      }
    })

    setPermissions(prev => ({
      ...prev,
      [selectedRole]: newRolePermissions
    }))
    setDirty(true)
  }

  function handleSave() {
    setSaved(true)
    setDirty(false)
    setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  function handleReset() {
    if (confirm('Bạn có muốn khôi phục ma trận quyền về trạng thái mặc định ban đầu của vai trò này không?')) {
      setPermissions(prev => ({
        ...prev,
        [selectedRole]: JSON.parse(JSON.stringify(INITIAL_PERMISSION_STATE[selectedRole]))
      }))
      setDirty(true)
    }
  }

  const roleInfo = ROLE_DETAILS[selectedRole]

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Sub-Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        {/* Left Controls */}
        <div className="flex items-center gap-3">
          {/* Role Dropdown */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-9 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 cursor-pointer shadow-sm min-w-[200px]"
            >
              {Object.keys(ROLE_DETAILS).map(role => (
                <option key={role} value={role}>
                  {ROLE_DETAILS[role as Role].name} ({ROLE_DETAILS[role as Role].memberCount} người)
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Users size={14} />
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 shadow-sm shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Đang sửa</span>
          </div>

          <button
            onClick={() => setIsCompareOpen(true)}
            className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
          >
            ⇆ So sánh
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              onClick={handleReset}
              className="btn-secondary py-2 px-4 text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-red-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}

          <button
            onClick={handleSave}
            className={`btn-primary py-2 px-5 text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 border-none transition-all duration-200 ${
              saved 
                ? 'bg-emerald-600 hover:bg-emerald-600' 
                : 'bg-red-800 hover:bg-red-900'
            }`}
          >
            {saved ? (
              <>
                <Check size={14} /> Đã lưu thành công
              </>
            ) : (
              <>
                <Check size={14} /> Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>

      {/* Role Profile Info Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side Info */}
        <div className="flex items-start gap-4">
          {/* Shield Icon container */}
          <div className="p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-100 shrink-0">
            <Shield size={24} className="fill-red-800/10 text-red-800" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-gray-800">{roleInfo.name}</h2>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                {roleInfo.label}
              </span>
            </div>
            <p className="text-gray-500 max-w-2xl leading-relaxed font-medium">
              {roleInfo.description}
            </p>
          </div>
        </div>

        {/* Right Side Pill */}
        <div className="flex items-center self-start sm:self-auto gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-gray-700 select-none shrink-0">
          <Users size={14} className="text-gray-400" />
          <span>{roleInfo.memberCount} thành viên</span>
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left select-none">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-xs font-extrabold text-gray-500 uppercase tracking-wider w-64">
                  Module hệ thống
                </th>
                {ACTIONS.map(action => (
                  <th
                    key={action.value}
                    className="px-4 py-3.5 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-center group cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => handleToggleColumn(action.value)}
                    title={`Click để đảo trạng thái toàn bộ cột: ${action.label}`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>{action.label}</span>
                      {selectedRole !== 'admin' && (
                        <span className="text-[9px] text-gray-300 group-hover:text-red-700 font-normal normal-case">tất cả</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {MODULES.map(mod => {
                const IconComponent = mod.icon
                const rowPermissions = permissions[selectedRole][mod.id]
                const allRowActive = Object.values(rowPermissions).every(v => v)
                
                return (
                  <tr key={mod.id} className="hover:bg-gray-50/50 transition-colors group">
                    {/* Module info & Quick row toggle */}
                    <td className="px-5 py-3.5 flex items-center justify-between font-semibold text-gray-700">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded bg-gray-100 text-gray-500 group-hover:bg-red-50 group-hover:text-red-800 transition-colors shrink-0">
                          <IconComponent size={14} />
                        </div>
                        <span className="group-hover:text-red-800 transition-colors">{mod.name}</span>
                      </div>
                      
                      {selectedRole !== 'admin' && (
                        <button
                          onClick={() => handleToggleRow(mod.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gray-400 hover:text-red-700 bg-gray-100/60 hover:bg-red-50 px-2 py-0.5 rounded font-bold shrink-0 ml-2 border border-transparent hover:border-red-100"
                        >
                          Chọn dòng
                        </button>
                      )}
                    </td>

                    {/* Interactive Actions cells */}
                    {ACTIONS.map(action => {
                      const active = rowPermissions[action.value]
                      const isAdmin = selectedRole === 'admin'
                      return (
                        <td
                          key={action.value}
                          className="px-4 py-3.5 text-center"
                        >
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleToggle(mod.id, action.value)}
                              disabled={isAdmin}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                active
                                  ? 'bg-emerald-100 text-emerald-800 hover:scale-105 border border-transparent'
                                  : 'text-gray-300 hover:text-red-700 hover:bg-gray-100 hover:scale-105 border border-transparent'
                              } ${isAdmin ? 'cursor-default opacity-85' : 'cursor-pointer shadow-sm'}`}
                              title={`${roleInfo.name} — ${mod.name} — ${action.label}`}
                            >
                              {active ? (
                                <Check size={12} strokeWidth={3} />
                              ) : (
                                <span className="font-semibold text-gray-300">—</span>
                              )}
                            </button>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Instructions footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-400 flex items-start gap-2 select-none">
          <Info size={14} className="text-gray-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Hướng dẫn sử dụng:</strong> Bấm trực tiếp vào các ô tròn để Bật/Tắt quyền cụ thể cho từng Module. Bấm vào tiêu đề cột để Bật/Tắt tất cả các dòng của hành động đó. Rê chuột vào từng dòng để kích hoạt nút "Chọn dòng" giúp bật/tắt nhanh toàn bộ Module. Thay đổi cần bấm <strong>Lưu thay đổi</strong> ở góc trên để chính thức áp dụng.
          </div>
        </div>
      </div>

      {/* Comparative Drawer / Overlay Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl border border-gray-100 overflow-hidden animate-zoomIn flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <Shield size={16} className="text-red-800" />
                  So sánh Ma trận Quyền Hệ thống
                </h3>
                <p className="text-[10px] text-gray-400">Xem và so sánh nhanh số lượng quyền được gán giữa các vai trò hiện có.</p>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content - Scrollable Grid */}
            <div className="overflow-y-auto p-5 text-xs flex-1">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2.5 font-bold text-gray-500 uppercase tracking-wider w-56">Module</th>
                    {Object.keys(ROLE_DETAILS).map(roleKey => (
                      <th key={roleKey} className="py-2.5 px-3 font-bold text-gray-500 uppercase tracking-wider text-center">
                        {ROLE_DETAILS[roleKey as Role].name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MODULES.map(mod => (
                    <tr key={mod.id} className="hover:bg-gray-50/40">
                      <td className="py-3 font-semibold text-gray-700 flex items-center gap-2">
                        {React.createElement(mod.icon, { size: 13, className: 'text-gray-400' })}
                        {mod.name}
                      </td>
                      {Object.keys(ROLE_DETAILS).map(roleKey => {
                        const rowPerms = permissions[roleKey as Role][mod.id]
                        const activeCount = Object.values(rowPerms).filter(Boolean).length
                        const percentage = Math.round((activeCount / ACTIONS.length) * 100)
                        
                        return (
                          <td key={roleKey} className="py-3 px-3 text-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] ${
                                activeCount === ACTIONS.length
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : activeCount === 0
                                  ? 'bg-gray-100 text-gray-400 border border-gray-200'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              }`}>
                                {activeCount} / 7 quyền
                              </span>
                              <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden shrink-0">
                                <div 
                                  className={`h-full rounded-full ${
                                    activeCount === ACTIONS.length ? 'bg-emerald-500' : activeCount === 0 ? 'bg-gray-200' : 'bg-indigo-500'
                                  }`} 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsCompareOpen(false)}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Đóng bảng so sánh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
