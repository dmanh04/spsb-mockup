import React from 'react'
import { Shield, Users, Lock, Clock, CheckCircle, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react'

interface RoleDetail {
  id: string
  name: string
  label: string
  type: 'system' | 'custom'
  memberCount: number
  description: string
  color: string
}

const ROLES_LIST: RoleDetail[] = [
  {
    id: 'admin',
    name: 'Super Admin',
    label: 'Super Admin',
    type: 'system',
    memberCount: 3,
    description: 'Toàn quyền quản trị hệ thống Pet Care & Shop trên toàn hệ thống, cấu hình hệ thống và phân quyền.',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'shop_head',
    name: 'Quản lý Chi nhánh',
    label: 'Shop Head',
    type: 'system',
    memberCount: 5,
    description: 'Quản lý vận hành chi nhánh, điều phối nhân sự, duyệt yêu cầu nghỉ phép, xem báo cáo doanh thu chi nhánh.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'operation_staff',
    name: 'NV Vận hành',
    label: 'Operation Staff',
    type: 'system',
    memberCount: 12,
    description: 'Quản lý lịch hẹn đặt chỗ (bookings), check-in/check-out cho thú cưng, tạo đơn hàng tại quầy và chăm sóc khách hàng.',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'petcare_staff',
    name: 'NV Chăm sóc',
    label: 'Pet Care Staff',
    type: 'system',
    memberCount: 15,
    description: 'Thực hiện dịch vụ spa, tắm rửa, cắt tỉa (grooming), nội trú, cập nhật trạng thái và ghi chép nhật ký sức khỏe thú cưng.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'warehouse_manager',
    name: 'Quản lý Kho',
    label: 'Warehouse Manager',
    type: 'system',
    memberCount: 4,
    description: 'Quản lý nhập xuất kho, kiểm kho sản phẩm, theo dõi nhà cung cấp và lập phiếu điều chuyển nội bộ giữa các chi nhánh.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'customer',
    name: 'Khách hàng',
    label: 'Customer',
    type: 'system',
    memberCount: 1250,
    description: 'Đặt lịch chăm sóc thú cưng trực tuyến, mua sắm sản phẩm, xem hồ sơ thú cưng cá nhân và nhận thông báo trạng thái.',
    color: 'from-sky-400 to-blue-500',
  },
]

const STATS = [
  { label: 'Tổng số vai trò', value: '6', icon: Shield, color: 'text-red-600 bg-red-50 border-red-100' },
  { label: 'Người dùng được gán', value: '1,289', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { label: 'Bảo mật hệ thống', value: 'A+ / 98%', icon: Lock, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { label: 'Thay đổi gần nhất', value: '2 phút trước', icon: Clock, color: 'text-purple-600 bg-purple-50 border-purple-100' },
]

const RECENT_CHANGES = [
  { user: 'Nguyễn Văn Admin', role: 'Super Admin', action: 'Cập nhật quyền "Xuất báo cáo" cho vai trò Quản lý Chi nhánh', time: '10 phút trước', type: 'update' },
  { user: 'Trần Thị Vận Hành', role: 'NV Vận hành', action: 'Gán vai trò NV Chăm sóc cho người dùng "Lê Minh Tuấn"', time: '1 giờ trước', type: 'assign' },
  { user: 'Hệ thống', role: 'System', action: 'Tự động kích hoạt cơ chế bảo mật xác thực 2 lớp (MFA) đối với nhóm Quản lý', time: '5 giờ trước', type: 'security' },
  { user: 'Nguyễn Văn Admin', role: 'Super Admin', action: 'Khởi tạo vai trò tùy chỉnh mới "Cộng tác viên Marketing" (đang chờ duyệt)', time: '1 ngày trước', type: 'create' },
]

export default function OverviewPanel({ onNavigateToMatrix }: { onNavigateToMatrix: () => void }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-400 block">{stat.label}</span>
                <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              </div>
              <div className={`p-3 rounded-lg border ${stat.color}`}>
                <Icon size={20} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-800">Cơ cấu & Danh sách Vai trò</h2>
              <p className="text-xs text-gray-400">Xem tổng quan chức năng nghiệp vụ của các vai trò trong hệ thống.</p>
            </div>
            <button
              onClick={onNavigateToMatrix}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline transition-all"
            >
              Xem ma trận quyền <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLES_LIST.map((role) => (
              <div
                key={role.id}
                className="group relative rounded-xl border border-gray-100 hover:border-gray-200 p-4 bg-gray-50/50 hover:bg-white transition-all shadow-sm hover:shadow duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Background decorative gradient */}
                <div className={`absolute right-0 top-0 w-1.5 h-full bg-gradient-to-b ${role.color}`} />

                <div className="space-y-2">
                  <div className="flex items-center justify-between pr-3">
                    <span className="text-sm font-bold text-gray-800 group-hover:text-red-700 transition-colors flex items-center gap-1.5">
                      <Shield size={14} className="text-gray-400 group-hover:text-red-600" />
                      {role.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {role.type === 'system' ? 'Hệ thống' : 'Tùy chỉnh'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed pr-3">
                    {role.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-400 border-t border-gray-100/60 pt-3 pr-3">
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {role.memberCount.toLocaleString()} người dùng
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                    Đang hoạt động
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Security Timeline */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-800">Hoạt động Phân quyền Gần đây</h2>
            <p className="text-xs text-gray-400">Nhật ký các thay đổi về quyền hạn và thiết lập bảo mật.</p>
          </div>

          <div className="relative border-l border-gray-100 pl-4 ml-2 space-y-5 py-2">
            {RECENT_CHANGES.map((change, i) => (
              <div key={i} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white group-hover:bg-red-500 transition-colors" />

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                      {change.user}
                      <span className="text-[10px] font-normal px-1.5 py-0.1 bg-gray-100 rounded text-gray-500">
                        {change.role}
                      </span>
                    </span>
                    <span className="text-[10px] text-gray-400">{change.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-normal pr-1">
                    {change.action}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <div className="rounded-lg bg-red-50/50 border border-red-100 p-3 text-xs text-red-800 flex items-start gap-2.5">
              <AlertTriangle size={15} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong>Cảnh báo Bảo mật:</strong> Có 2 vai trò chưa kích hoạt xác thực 2 lớp (MFA). Khuyên dùng kích hoạt cho tất cả nhân viên vận hành & quản lý.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
