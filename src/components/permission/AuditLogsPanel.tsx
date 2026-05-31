import React, { useState } from 'react'
import { Search, Filter, Shield, Clock, Download, ArrowRightLeft } from 'lucide-react'

interface AuditLog {
  id: string
  timestamp: string
  actorName: string
  actorEmail: string
  action: string
  category: 'role' | 'permission' | 'security' | 'user'
  target: string
  ipAddress: string
  status: 'success' | 'failed'
}

const AUDIT_LOGS_MOCK: AuditLog[] = [
  { id: 'LOG001', timestamp: '2026-05-31 17:30:12', actorName: 'Admin PetCare', actorEmail: 'admin@petcare.com', action: 'Thay đổi quyền "Xem" & "Sửa" đối với Module Sản phẩm', category: 'permission', target: 'NV Vận hành', ipAddress: '14.226.45.10', status: 'success' },
  { id: 'LOG002', timestamp: '2026-05-31 16:15:45', actorName: 'Nguyễn Quang Minh', actorEmail: 'minh@shophead.petcare.com', action: 'Đổi vai trò người dùng "Lê Văn Tiến" từ NV Chăm sóc thành Quản lý Kho', category: 'user', target: 'Lê Văn Tiến', ipAddress: '192.168.1.5', status: 'success' },
  { id: 'LOG003', timestamp: '2026-05-31 15:40:02', actorName: 'Admin PetCare', actorEmail: 'admin@petcare.com', action: 'Bật bắt buộc Xác thực 2 lớp (MFA) đối với toàn bộ nhân viên', category: 'security', target: 'Chính sách Bảo mật', ipAddress: '14.226.45.10', status: 'success' },
  { id: 'LOG004', timestamp: '2026-05-31 12:10:33', actorName: 'Hệ thống', actorEmail: 'system@petcare.com', action: 'Phát hiện đăng nhập thất bại liên tiếp 5 lần', category: 'security', target: 'Tài khoản: phamha@customer.com', ipAddress: '172.56.21.99', status: 'failed' },
  { id: 'LOG005', timestamp: '2026-05-30 09:20:11', actorName: 'Admin PetCare', actorEmail: 'admin@petcare.com', action: 'Khởi tạo vai trò mới "Nhân viên Telesale"', category: 'role', target: 'Nhân viên Telesale', ipAddress: '14.226.45.10', status: 'success' },
  { id: 'LOG006', timestamp: '2026-05-30 08:45:00', actorName: 'Bùi Văn Khánh', actorEmail: 'khanh@warehouse.petcare.com', action: 'Yêu cầu xuất báo cáo thống kê tồn kho hàng tháng', category: 'user', target: 'Báo cáo Kho', ipAddress: '192.168.2.1', status: 'success' },
  { id: 'LOG007', timestamp: '2026-05-29 14:15:22', actorName: 'Admin PetCare', actorEmail: 'admin@petcare.com', action: 'Xóa vai trò tùy chỉnh "Cộng tác viên Sự kiện"', category: 'role', target: 'Cộng tác viên Sự kiện', ipAddress: '118.69.3.24', status: 'success' },
  { id: 'LOG008', timestamp: '2026-05-29 11:30:15', actorName: 'Đặng Thu Hương', actorEmail: 'huong@shophead.petcare.com', action: 'Thay đổi lịch trực của NV Chăm sóc "Trần Hùng"', category: 'user', target: 'Trần Hùng', ipAddress: '192.168.3.10', status: 'success' },
]

export default function AuditLogsPanel() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [logs, setLogs] = useState<AuditLog[]>(AUDIT_LOGS_MOCK)

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  function handleExport() {
    alert('Đang xuất tệp dữ liệu nhật ký hệ thống (.xlsx)... Tải xuống hoàn tất!')
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-xs">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nhật ký theo người dùng, hành động..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Filter category */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-semibold shrink-0">Phân loại:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500 transition-colors bg-white font-medium text-gray-700"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="permission">Thay đổi Phân quyền</option>
              <option value="role">Quản lý Vai trò (Role)</option>
              <option value="security">Chính sách Bảo mật</option>
              <option value="user">Gán quyền người dùng</option>
            </select>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="btn-secondary py-2 px-4 font-semibold flex items-center justify-center gap-1.5 self-start md:self-auto border border-gray-200 hover:bg-gray-50 transition-colors text-xs"
        >
          <Download size={14} /> Xuất file nhật ký
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-40">Thời gian</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-48">Quản trị viên thực hiện</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động thực hiện</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-40">Đối tượng chịu tác động</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Địa chỉ IP</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Timestamp */}
                  <td className="px-5 py-3.5 text-gray-400 font-mono flex items-center gap-1.5">
                    <Clock size={12} className="shrink-0" />
                    {log.timestamp}
                  </td>

                  {/* Actor Info */}
                  <td className="px-5 py-3.5">
                    <div className="space-y-0.5">
                      <div className="font-bold text-gray-800">{log.actorName}</div>
                      <div className="text-[10px] text-gray-400">{log.actorEmail}</div>
                    </div>
                  </td>

                  {/* Action Description */}
                  <td className="px-5 py-3.5 font-medium text-gray-700 leading-relaxed pr-10">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase mr-2 ${
                      log.category === 'permission'
                        ? 'bg-blue-50 text-blue-600'
                        : log.category === 'role'
                        ? 'bg-orange-50 text-orange-600'
                        : log.category === 'security'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {log.category === 'permission' ? 'Quyền' : log.category === 'role' ? 'Vai trò' : log.category === 'security' ? 'Bảo mật' : 'Gán quyền'}
                    </span>
                    {log.action}
                  </td>

                  {/* Target impacted */}
                  <td className="px-5 py-3.5 text-gray-600 font-semibold">
                    {log.target}
                  </td>

                  {/* IP Address */}
                  <td className="px-5 py-3.5 text-gray-500 font-mono">
                    {log.ipAddress}
                  </td>

                  {/* Status Indicator */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border ${
                      log.status === 'success'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {log.status === 'success' ? 'Thành công' : 'Thất bại'}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-xs italic">
                    Không tìm thấy bản ghi nhật ký hệ thống nào.
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
