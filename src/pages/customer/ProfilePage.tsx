import { useState } from 'react'
import { User, Lock, Bell, Shield, Edit, Check, Camera } from 'lucide-react'
import { useAuthContext } from '@/auth/AuthContext'
import { BOOKING_MOCK_LIST } from '@/data/bookingMockData'
import { ORDER_MOCK_LIST } from '@/data/orderMockData'
import { formatPrice } from '@/utils/format'

const TABS = [
  { id: 'profile', label: 'Hồ sơ', icon: User },
  { id: 'security', label: 'Bảo mật', icon: Lock },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
]

export default function ProfilePage() {
  const { currentUser } = useAuthContext()
  const [tab, setTab] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    fullName: currentUser?.fullName ?? '',
    phone: currentUser?.phone ?? '',
    email: currentUser?.email ?? '',
    birthDate: '1995-08-20',
    gender: 'male',
    address: '12 Nguyễn Trãi, P.Bến Thành, Q.1, TP.HCM',
  })

  const myBookings = BOOKING_MOCK_LIST.filter(b => b.customerId === currentUser?.id)
  const myOrders = ORDER_MOCK_LIST.filter(o => o.customerId === currentUser?.id)
  const totalSpent = myOrders.reduce((s, o) => s + o.total, 0) + myBookings.filter(b => b.status === 'paid').reduce((s, b) => s + b.price, 0)

  function handleSave() {
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img src={currentUser?.avatar ?? 'https://placehold.co/64x64/3B82F6/white?text=?'} alt="" className="w-16 h-16 rounded-full border-2 border-white shadow" />
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow">
              <Camera size={11} className="text-white" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{currentUser?.fullName}</h2>
            <p className="text-sm text-gray-500">{currentUser?.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="badge-green text-[10px]">Khách hàng thân thiết</span>
              <span className="text-xs text-gray-400">Thành viên từ {currentUser?.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
          {[
            { label: 'Lịch hẹn', value: myBookings.length },
            { label: 'Đơn hàng', value: myOrders.length },
            { label: 'Tổng chi tiêu', value: formatPrice(totalSpent) },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-base font-black text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Thông tin cá nhân</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-secondary text-sm py-1.5">
                <Edit size={13} /> Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-primary text-sm py-1.5"><Check size={13} /> Lưu</button>
                <button onClick={() => setEditing(false)} className="btn-secondary text-sm py-1.5">Hủy</button>
              </div>
            )}
          </div>

          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700 flex items-center gap-2">
              <Check size={14} /> Đã lưu thay đổi thành công
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Họ tên', key: 'fullName', type: 'text' },
              { label: 'Số điện thoại', key: 'phone', type: 'tel' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Ngày sinh', key: 'birthDate', type: 'date' },
            ].map(f => (
              <div key={f.key} className={f.key === 'address' ? 'col-span-2' : ''}>
                <label className="form-label">{f.label}</label>
                {editing ? (
                  <input type={f.type} className="form-input" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900">{(form as any)[f.key]}</div>
                )}
              </div>
            ))}
            <div>
              <label className="form-label">Giới tính</label>
              {editing ? (
                <select className="form-input" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900">{form.gender === 'male' ? 'Nam' : 'Nữ'}</div>
              )}
            </div>
            <div className="col-span-2">
              <label className="form-label">Địa chỉ mặc định</label>
              {editing ? (
                <input className="form-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900">{form.address}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Lock size={15} /> Đổi mật khẩu</h3>
            {['Mật khẩu hiện tại', 'Mật khẩu mới', 'Xác nhận mật khẩu mới'].map(label => (
              <div key={label}>
                <label className="form-label">{label}</label>
                <input type="password" className="form-input" placeholder="••••••••" />
              </div>
            ))}
            <button className="btn-primary"><Lock size={14} /> Cập nhật mật khẩu</button>
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Shield size={15} /> Bảo mật 2 lớp (2FA)</h3>
            <p className="text-sm text-gray-500">Bảo vệ tài khoản bằng mã xác thực qua SMS mỗi khi đăng nhập từ thiết bị mới.</p>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <div>
                <div className="text-sm font-medium text-gray-900">Xác thực qua SMS</div>
                <div className="text-xs text-gray-400">SĐT: {currentUser?.phone}</div>
              </div>
              <button className="btn-primary text-sm py-1.5">Kích hoạt</button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications settings tab */}
      {tab === 'notifications' && (
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Bell size={15} /> Cài đặt thông báo</h3>
          {[
            { label: 'Booking được xác nhận', desc: 'Khi lịch hẹn được duyệt', defaultOn: true },
            { label: 'Nhắc nhở trước lịch hẹn', desc: '2 tiếng trước giờ hẹn', defaultOn: true },
            { label: 'Dịch vụ hoàn thành', desc: 'Khi pet care staff đánh dấu xong', defaultOn: true },
            { label: 'Trạng thái đơn hàng', desc: 'Khi đơn hàng được cập nhật', defaultOn: true },
            { label: 'Ưu đãi & Voucher mới', desc: 'Khuyến mãi từ PetCare', defaultOn: false },
            { label: 'Tin tức & Cập nhật', desc: 'Bài viết chăm sóc thú cưng', defaultOn: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{item.label}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500" />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
