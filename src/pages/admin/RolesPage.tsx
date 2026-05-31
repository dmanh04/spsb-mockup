import PermissionMatrixTable from '@/components/permission/PermissionMatrixTable'
import { Shield } from 'lucide-react'

export default function RolesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Shield size={20} className="text-primary-500" /> Phân quyền hệ thống
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Cấu hình quyền truy cập cho từng role. Thay đổi có hiệu lực ngay khi lưu.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>Hướng dẫn:</strong> Bấm vào ô R (Xem) / W (Sửa/Tạo) / D (Xóa) để bật/tắt quyền cho từng role. Admin luôn có toàn quyền và không thể thay đổi.
      </div>

      <PermissionMatrixTable />
    </div>
  )
}
