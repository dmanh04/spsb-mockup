import React, { useState } from 'react'
import { Shield, Plus, Edit2, Trash2, Check, X, Search, Info } from 'lucide-react'

interface RoleItem {
  id: string
  name: string
  code: string
  type: 'system' | 'custom'
  memberCount: number
  description: string
}

const INITIAL_ROLES: RoleItem[] = [
  { id: 'admin', name: 'Super Admin', code: 'admin', type: 'system', memberCount: 3, description: 'Toàn quyền quản trị hệ thống Pet Care & Shop trên toàn hệ thống, cấu hình hệ thống và phân quyền.' },
  { id: 'shop_head', name: 'Quản lý Chi nhánh', code: 'shop_head', type: 'system', memberCount: 5, description: 'Quản lý vận hành chi nhánh, điều phối nhân sự, duyệt yêu cầu nghỉ phép, xem báo cáo doanh thu chi nhánh.' },
  { id: 'operation_staff', name: 'NV Vận hành', code: 'operation_staff', type: 'system', memberCount: 12, description: 'Quản lý lịch hẹn đặt chỗ (bookings), check-in/check-out cho thú cưng, tạo đơn hàng tại quầy và chăm sóc khách hàng.' },
  { id: 'petcare_staff', name: 'NV Chăm sóc', code: 'petcare_staff', type: 'system', memberCount: 15, description: 'Thực hiện dịch vụ spa, tắm rửa, cắt tỉa (grooming), nội trú, cập nhật trạng thái và ghi chép nhật ký sức khỏe thú cưng.' },
  { id: 'warehouse_manager', name: 'Quản lý Kho', code: 'warehouse_manager', type: 'system', memberCount: 4, description: 'Quản lý nhập xuất kho, kiểm kho sản phẩm, theo dõi nhà cung cấp và lập phiếu điều chuyển nội bộ giữa các chi nhánh.' },
  { id: 'customer', name: 'Khách hàng', code: 'customer', type: 'system', memberCount: 1250, description: 'Đặt lịch chăm sóc thú cưng trực tuyến, mua sắm sản phẩm, xem hồ sơ thú cưng cá nhân và nhận thông báo trạng thái.' },
]

export default function RoleManagementPanel() {
  const [roles, setRoles] = useState<RoleItem[]>(INITIAL_ROLES)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null)
  
  // Form State
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formType, setFormType] = useState<'system' | 'custom'>('custom')

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(search.toLowerCase()) || 
    role.code.toLowerCase().includes(search.toLowerCase()) ||
    role.description.toLowerCase().includes(search.toLowerCase())
  )

  function openCreateModal() {
    setEditingRole(null)
    setFormName('')
    setFormCode('')
    setFormDesc('')
    setFormType('custom')
    setIsModalOpen(true)
  }

  function openEditModal(role: RoleItem) {
    setEditingRole(role)
    setFormName(role.name)
    setFormCode(role.code)
    setFormDesc(role.description)
    setFormType(role.type)
    setIsModalOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim() || !formCode.trim()) return

    if (editingRole) {
      // Edit
      setRoles(roles.map(r => r.id === editingRole.id ? {
        ...r,
        name: formName,
        code: formCode.toLowerCase().replace(/\s+/g, '_'),
        description: formDesc,
        type: formType
      } : r))
    } else {
      // Create
      const newRole: RoleItem = {
        id: Math.random().toString(36).substring(2, 9),
        name: formName,
        code: formCode.toLowerCase().replace(/\s+/g, '_'),
        type: formType,
        memberCount: 0,
        description: formDesc
      }
      setRoles([...roles, newRole])
    }
    setIsModalOpen(false)
  }

  function handleDelete(id: string, name: string) {
    const roleToDelete = roles.find(r => r.id === id)
    if (roleToDelete?.type === 'system') {
      alert('Không thể xóa vai trò hệ thống mặc định!')
      return
    }
    if (confirm(`Bạn có chắc chắn muốn xóa vai trò "${name}"? Thao tác này không thể hoàn tác.`)) {
      setRoles(roles.filter(r => r.id !== id))
    }
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm vai trò theo tên, mã hoặc mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors bg-white shadow-sm"
          />
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary py-2 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 self-start sm:self-auto bg-red-800 hover:bg-red-900 border-none transition-colors duration-200 shadow-sm"
        >
          <Plus size={16} /> Thêm vai trò mới
        </button>
      </div>

      {/* Info Warning Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-2.5">
        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Lưu ý vai trò hệ thống:</strong> Các vai trò được ký hiệu là <span className="font-semibold text-amber-900 bg-amber-100 px-1 rounded">Hệ thống</span> được mã hóa cứng trong nhân xử lý nghiệp vụ của hệ thống Pet Care. Bạn chỉ có thể sửa thông tin hiển thị hoặc cấu hình ma trận quyền, không được phép xóa.
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-gray-200 transition-all duration-300 relative group"
          >
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 group-hover:text-red-700 transition-colors">
                    <Shield size={14} className="text-gray-400" />
                    {role.name}
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400 select-all">code: {role.code}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  role.type === 'system' 
                    ? 'bg-red-50 text-red-600 border border-red-100' 
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                }`}>
                  {role.type === 'system' ? 'Hệ thống' : 'Tùy chỉnh'}
                </span>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed min-h-[50px] line-clamp-3">
                {role.description || 'Chưa có mô tả chi tiết cho vai trò này.'}
              </p>
            </div>

            {/* Footer metrics & actions */}
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium">
                👥 {role.memberCount} thành viên
              </span>
              
              <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(role)}
                  title="Sửa thông tin"
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                >
                  <Edit2 size={13} />
                </button>
                {role.type !== 'system' && (
                  <button
                    onClick={() => handleDelete(role.id, role.name)}
                    title="Xóa vai trò"
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredRoles.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            Không tìm thấy vai trò nào phù hợp với từ khóa tìm kiếm.
          </div>
        )}
      </div>

      {/* CRUD Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden animate-zoomIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Shield size={16} className="text-red-800" />
                {editingRole ? 'Cập nhật Vai trò' : 'Thêm Vai trò Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-gray-600 font-semibold">Tên vai trò <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nhân viên Tư vấn, Cộng tác viên..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-600 font-semibold">Mã định danh (Role Code) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  disabled={editingRole?.type === 'system'}
                  placeholder="Ví dụ: marketing_staff, advisor"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors font-mono uppercase bg-white disabled:bg-gray-100 disabled:text-gray-400"
                />
                {editingRole?.type === 'system' && (
                  <span className="text-[10px] text-gray-400 block mt-0.5">Không thể sửa mã định danh của vai trò hệ thống.</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-gray-600 font-semibold">Loại vai trò</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={formType === 'custom'}
                      onChange={() => setFormType('custom')}
                      disabled={editingRole?.type === 'system'}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>Tự định nghĩa (Custom)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={formType === 'system'}
                      onChange={() => setFormType('system')}
                      disabled={editingRole ? editingRole.type !== 'system' : true}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>Hệ thống (System)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-600 font-semibold">Mô tả vai trò</label>
                <textarea
                  placeholder="Mô tả tóm tắt nhiệm vụ và trách nhiệm chính của vai trò..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg font-medium transition-colors"
                >
                  {editingRole ? 'Lưu thay đổi' : 'Thêm vai trò'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
