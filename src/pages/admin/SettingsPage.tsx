import { useState } from 'react'
import { Save, Check, Settings, Bell, Shield, Globe, Palette, Database } from 'lucide-react'

const TABS = [
  { id: 'general', label: 'Chung', icon: Settings },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
  { id: 'security', label: 'Bảo mật', icon: Shield },
  { id: 'localization', label: 'Bản địa hóa', icon: Globe },
  { id: 'appearance', label: 'Giao diện', icon: Palette },
  { id: 'backup', label: 'Backup & Dữ liệu', icon: Database },
]

export default function SystemSettingsPage() {
  const [tab, setTab] = useState('general')
  const [saved, setSaved] = useState(false)
  const [generalForm, setGeneralForm] = useState({
    systemName: 'PetCare Management System',
    contactEmail: 'admin@petcare.com',
    hotline: '1900 6789',
    website: 'https://petcare.vn',
    taxCode: '0312345678',
    address: '12 Nguyễn Trãi, P.Bến Thành, Q.1, TP.HCM',
    bookingAdvanceDays: 30,
    cancelDeadlineHours: 2,
    autoConfirmMinutes: 30,
    maxBookingPerDay: 20,
  })

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cài đặt Hệ thống</h1>
          <p className="text-sm text-gray-500">Quản lý cấu hình toàn bộ hệ thống PetCare</p>
        </div>
        <button onClick={handleSave} className={`btn-primary ${saved ? 'bg-green-500 hover:bg-green-500' : ''}`}>
          {saved ? <><Check size={14} /> Đã lưu</> : <><Save size={14} /> Lưu cài đặt</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Sidebar tabs */}
        <div className="space-y-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${tab === t.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Settings content */}
        <div className="md:col-span-3">
          {tab === 'general' && (
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Thông tin hệ thống</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label">Tên hệ thống</label>
                  <input className="form-input" value={generalForm.systemName} onChange={e => setGeneralForm(f => ({ ...f, systemName: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Email liên hệ</label>
                  <input className="form-input" value={generalForm.contactEmail} onChange={e => setGeneralForm(f => ({ ...f, contactEmail: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Hotline</label>
                  <input className="form-input" value={generalForm.hotline} onChange={e => setGeneralForm(f => ({ ...f, hotline: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Website</label>
                  <input className="form-input" value={generalForm.website} onChange={e => setGeneralForm(f => ({ ...f, website: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Mã số thuế</label>
                  <input className="form-input" value={generalForm.taxCode} onChange={e => setGeneralForm(f => ({ ...f, taxCode: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Địa chỉ văn phòng</label>
                  <input className="form-input" value={generalForm.address} onChange={e => setGeneralForm(f => ({ ...f, address: e.target.value }))} />
                </div>
              </div>

              <hr />
              <h2 className="font-semibold text-gray-900">Quy tắc Booking</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Đặt trước tối đa (ngày)</label>
                  <input type="number" className="form-input" value={generalForm.bookingAdvanceDays} onChange={e => setGeneralForm(f => ({ ...f, bookingAdvanceDays: +e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Hủy trước giờ hẹn (giờ)</label>
                  <input type="number" className="form-input" value={generalForm.cancelDeadlineHours} onChange={e => setGeneralForm(f => ({ ...f, cancelDeadlineHours: +e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Tự xác nhận booking sau (phút)</label>
                  <input type="number" className="form-input" value={generalForm.autoConfirmMinutes} onChange={e => setGeneralForm(f => ({ ...f, autoConfirmMinutes: +e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Booking tối đa mỗi ngày/chi nhánh</label>
                  <input type="number" className="form-input" value={generalForm.maxBookingPerDay} onChange={e => setGeneralForm(f => ({ ...f, maxBookingPerDay: +e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Cài đặt Thông báo</h2>
              {[
                { label: 'Email xác nhận booking', desc: 'Gửi email khi booking được tạo', defaultOn: true },
                { label: 'SMS nhắc nhở trước 2 giờ', desc: 'SMS nhắc khách hàng trước lịch hẹn', defaultOn: true },
                { label: 'Thông báo hoàn thành dịch vụ', desc: 'Push notification khi dịch vụ xong', defaultOn: true },
                { label: 'Email báo cáo hàng ngày', desc: 'Gửi báo cáo tổng kết cuối ngày cho shop head', defaultOn: false },
                { label: 'Cảnh báo tồn kho thấp', desc: 'Email khi SKU dưới ngưỡng tối thiểu', defaultOn: true },
                { label: 'Thông báo đơn xin nghỉ', desc: 'Nhắc shop head khi có đơn chờ duyệt >24h', defaultOn: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-400">{item.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {tab === 'security' && (
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Bảo mật hệ thống</h2>
              {[
                { label: 'Yêu cầu 2FA cho Admin', desc: 'Bắt buộc xác thực 2 lớp với tài khoản admin', defaultOn: true },
                { label: 'Khóa tài khoản sau 5 lần đăng nhập sai', desc: 'Bảo vệ tài khoản khỏi brute force', defaultOn: true },
                { label: 'Tự động đăng xuất sau 30 phút không hoạt động', desc: 'Session timeout', defaultOn: false },
                { label: 'Ghi log tất cả thay đổi permission', desc: 'Audit trail cho thay đổi phân quyền', defaultOn: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-400">{item.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {tab === 'localization' && (
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Bản địa hóa</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Ngôn ngữ mặc định', options: ['Tiếng Việt', 'English'], default: 'Tiếng Việt' },
                  { label: 'Múi giờ', options: ['Asia/Ho_Chi_Minh (UTC+7)', 'UTC'], default: 'Asia/Ho_Chi_Minh (UTC+7)' },
                  { label: 'Định dạng ngày', options: ['dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd'], default: 'dd/mm/yyyy' },
                  { label: 'Đơn vị tiền tệ', options: ['VND (đ)', 'USD ($)'], default: 'VND (đ)' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="form-label">{f.label}</label>
                    <select className="form-input" defaultValue={f.default}>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'appearance' && (
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Giao diện</h2>
              <div>
                <label className="form-label">Màu chủ đạo</label>
                <div className="flex gap-3 mt-2">
                  {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'].map(color => (
                    <button key={color} className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Chế độ hiển thị', options: ['Sáng', 'Tối', 'Theo hệ thống'] },
                  { label: 'Mật độ giao diện', options: ['Thoáng (Comfortable)', 'Vừa (Default)', 'Dày (Compact)'] },
                  { label: 'Font chữ', options: ['Inter', 'Roboto', 'Open Sans'] },
                  { label: 'Kích cỡ chữ', options: ['Nhỏ (13px)', 'Vừa (14px)', 'Lớn (16px)'] },
                ].map(f => (
                  <div key={f.label}>
                    <label className="form-label">{f.label}</label>
                    <select className="form-input">
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'backup' && (
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Backup & Quản lý dữ liệu</h2>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-green-900">Backup tự động</div>
                      <div className="text-xs text-green-600">Lần cuối: 31/05/2026 03:00 · Thành công</div>
                    </div>
                    <span className="badge-green">Hoạt động</span>
                  </div>
                </div>

                {[
                  { label: 'Tần suất backup', options: ['Mỗi ngày 3:00 AM', 'Mỗi 6 giờ', 'Mỗi giờ'] },
                  { label: 'Lưu trữ backup (ngày)', options: ['7 ngày', '14 ngày', '30 ngày'] },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">{f.label}</label>
                    <select className="form-input w-auto text-sm">
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <button className="btn-primary text-sm">Backup ngay</button>
                  <button className="btn-secondary text-sm">Xuất toàn bộ dữ liệu</button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="text-sm font-semibold text-red-900 mb-1">⚠️ Vùng nguy hiểm</div>
                  <p className="text-xs text-red-600 mb-3">Các thao tác này không thể hoàn tác</p>
                  <button className="text-xs text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100">Xóa toàn bộ dữ liệu cache</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
