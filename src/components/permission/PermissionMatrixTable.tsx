import { useState } from 'react'
import { Save, RotateCcw, Check } from 'lucide-react'
import { getPermissionMatrix, updatePermission, resetPermissions } from '@/data/permissionMockData'
import type { Module, Role } from '@/types'

const ROLE_LABELS: Record<Role, string> = {
  customer: 'Khách hàng',
  operation_staff: 'NV Vận hành',
  petcare_staff: 'NV Chăm sóc',
  shop_head: 'Quản lý CN',
  admin: 'Admin',
  warehouse_manager: 'Quản lý kho',
}

const MODULE_LABELS: Record<Module, string> = {
  booking: 'Booking',
  product: 'Sản phẩm',
  inventory: 'Kho hàng',
  order: 'Đơn hàng',
  user: 'Người dùng',
  shop: 'Chi nhánh',
  schedule: 'Lịch làm việc',
  voucher: 'Voucher',
  report: 'Báo cáo',
  service: 'Dịch vụ',
  room: 'Phòng',
}

const STAFF_ROLES: Role[] = ['operation_staff', 'petcare_staff', 'shop_head', 'admin', 'warehouse_manager']
const ALL_MODULES: Module[] = ['booking', 'product', 'inventory', 'order', 'user', 'shop', 'schedule', 'voucher', 'report', 'service', 'room']

type Action = 'read' | 'write' | 'delete'
const ACTION_LABELS: Record<Action, string> = { read: 'R', write: 'W', delete: 'D' }
const ACTION_COLORS: Record<Action, string> = {
  read: 'bg-blue-500 text-white',
  write: 'bg-yellow-500 text-white',
  delete: 'bg-red-500 text-white',
}
const ACTION_OFF: Record<Action, string> = {
  read: 'bg-gray-100 text-gray-300',
  write: 'bg-gray-100 text-gray-300',
  delete: 'bg-gray-100 text-gray-300',
}

export default function PermissionMatrixTable() {
  const [matrix, setMatrix] = useState(() => getPermissionMatrix())
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  function toggle(role: Role, module: Module, action: Action) {
    if (role === 'admin') return // admin always has all permissions
    const current = matrix[role][module][action]
    updatePermission(role, module, action, !current)
    setMatrix({ ...getPermissionMatrix() })
    setDirty(true)
  }

  function handleSave() {
    setSaved(true)
    setDirty(false)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    resetPermissions()
    setMatrix({ ...getPermissionMatrix() })
    setDirty(false)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          {(['read', 'write', 'delete'] as Action[]).map(a => (
            <div key={a} className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${ACTION_COLORS[a]}`}>{ACTION_LABELS[a]}</div>
              <span className="text-gray-500">{a === 'read' ? 'Xem' : a === 'write' ? 'Sửa/Tạo' : 'Xóa'}</span>
            </div>
          ))}
          {dirty && <span className="text-orange-500 font-medium ml-2">● Có thay đổi chưa lưu</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="btn-secondary text-sm py-1.5">
            <RotateCcw size={13} /> Reset
          </button>
          <button onClick={handleSave} className={`btn-primary text-sm py-1.5 ${saved ? 'bg-green-500 hover:bg-green-500' : ''}`}>
            {saved ? <><Check size={13} /> Đã lưu</> : <><Save size={13} /> Lưu thay đổi</>}
          </button>
        </div>
      </div>

      {/* Matrix */}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="table-th w-32 sticky left-0 bg-gray-50 z-10">Module</th>
              {STAFF_ROLES.map(role => (
                <th key={role} className="table-th text-center">
                  <div className="text-xs font-semibold">{ROLE_LABELS[role]}</div>
                  {role === 'admin' && <div className="text-[10px] text-gray-400 font-normal">Toàn quyền</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_MODULES.map(module => (
              <tr key={module} className="border-b hover:bg-gray-50/50 transition-colors">
                <td className="table-td font-medium sticky left-0 bg-white z-10">
                  {MODULE_LABELS[module]}
                </td>
                {STAFF_ROLES.map(role => {
                  const perms = matrix[role]?.[module]
                  const isAdmin = role === 'admin'
                  return (
                    <td key={role} className="table-td">
                      <div className="flex items-center justify-center gap-1">
                        {(['read', 'write', 'delete'] as Action[]).map(action => {
                          const enabled = isAdmin || perms?.[action]
                          return (
                            <button
                              key={action}
                              onClick={() => toggle(role, module, action)}
                              disabled={isAdmin}
                              title={`${ROLE_LABELS[role]} — ${MODULE_LABELS[module]} — ${action}`}
                              className={`w-6 h-6 rounded text-[10px] font-bold transition-all ${
                                enabled ? ACTION_COLORS[action] : ACTION_OFF[action]
                              } ${isAdmin ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                            >
                              {ACTION_LABELS[action]}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Bấm vào từng nút R/W/D để bật/tắt quyền. Thay đổi có hiệu lực ngay sau khi lưu.
      </p>
    </div>
  )
}
