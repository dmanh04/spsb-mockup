import React, { useState } from 'react'
import { Lock, Shield, Key, Globe, Eye, EyeOff, Plus, Trash2, CheckCircle2 } from 'lucide-react'

export default function SecurityPolicyPanel() {
  // Policy State
  const [mfaRequired, setMfaRequired] = useState(true)
  const [mfaStaffOnly, setMfaStaffOnly] = useState(true)
  
  // Password rules
  const [minPasswordLength, setMinPasswordLength] = useState(8)
  const [reqUppercase, setReqUppercase] = useState(true)
  const [reqNumbers, setReqNumbers] = useState(true)
  const [reqSpecial, setReqSpecial] = useState(false)
  
  // Sessions
  const [sessionTimeout, setSessionTimeout] = useState(30) // in minutes
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5)
  
  // IP restrictions
  const [ipList, setIpList] = useState<string[]>(['192.168.1.1', '14.226.45.10'])
  const [newIp, setNewIp] = useState('')
  
  const [saved, setSaved] = useState(false)

  function handleAddIp(e: React.FormEvent) {
    e.preventDefault()
    if (!newIp.trim()) return
    // Simple IP regex validation
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
    if (!ipRegex.test(newIp.trim())) {
      alert('Vui lòng nhập địa chỉ IP hợp lệ (Ví dụ: 192.168.1.100)')
      return
    }
    if (ipList.includes(newIp.trim())) return
    setIpList([...ipList, newIp.trim()])
    setNewIp('')
  }

  function handleRemoveIp(ip: string) {
    setIpList(ipList.filter(item => item !== ip))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Save Button Floating Alert */}
      {saved && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-emerald-500 animate-slideIn">
          <CheckCircle2 size={15} />
          <span>Đã áp dụng và cập nhật tất cả chính sách bảo mật hệ thống thành công!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Section 1: Multi-Factor & Authentication */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-100">
            <Shield size={16} className="text-red-800" />
            Xác thực đa yếu tố (MFA / 2FA)
          </h3>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <label className="font-bold text-gray-800 block">Bắt buộc xác thực 2 lớp (MFA)</label>
                <span className="text-gray-400 leading-normal block">
                  Yêu cầu người dùng cung cấp mã OTP (Google Authenticator hoặc SMS) khi đăng nhập vào hệ thống.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={mfaRequired}
                  onChange={(e) => setMfaRequired(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-800"></div>
              </label>
            </div>

            {mfaRequired && (
              <div className="pl-4 border-l-2 border-red-800/40 space-y-3 pt-1 animate-fadeIn">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-gray-700 block">Chỉ áp dụng cho nhóm Quản lý & Nhân viên</span>
                    <span className="text-[10px] text-gray-400 block">
                      Khách hàng thường có thể tùy chọn tắt MFA để tiện lợi cho việc mua sắm nhanh.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={mfaStaffOnly}
                    onChange={(e) => setMfaStaffOnly(e.target.checked)}
                    className="rounded text-red-800 focus:ring-red-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Password Complexity Policy */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-100">
            <Key size={16} className="text-red-800" />
            Độ phức tạp của Mật khẩu
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-gray-700">
                <span>Độ dài mật khẩu tối thiểu</span>
                <span className="text-red-800 font-bold">{minPasswordLength} ký tự</span>
              </div>
              <input
                type="range"
                min={6}
                max={20}
                value={minPasswordLength}
                onChange={(e) => setMinPasswordLength(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={reqUppercase}
                  onChange={(e) => setReqUppercase(e.target.checked)}
                  className="rounded text-red-800 focus:ring-red-500 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <span className="font-semibold text-gray-700 block">Ký tự viết hoa (A-Z)</span>
                  <span className="text-[9px] text-gray-400 block">Ít nhất 1 chữ hoa</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={reqNumbers}
                  onChange={(e) => setReqNumbers(e.target.checked)}
                  className="rounded text-red-800 focus:ring-red-500 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <span className="font-semibold text-gray-700 block">Ký tự số (0-9)</span>
                  <span className="text-[9px] text-gray-400 block">Ít nhất 1 con số</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50/50 cursor-pointer transition-colors col-span-full">
                <input
                  type="checkbox"
                  checked={reqSpecial}
                  onChange={(e) => setReqSpecial(e.target.checked)}
                  className="rounded text-red-800 focus:ring-red-500 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <span className="font-semibold text-gray-700 block">Ký tự đặc biệt (!@#$...)</span>
                  <span className="text-[9px] text-gray-400 block">Bắt buộc chứa ít nhất một ký tự đặc biệt</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Sessions & Login Lockouts */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-100">
            <Lock size={16} className="text-red-800" />
            Phiên hoạt động & Khóa tài khoản
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-gray-700">
                <span>Thời gian hết hạn phiên làm việc</span>
                <span className="text-red-800 font-bold">{sessionTimeout} phút</span>
              </div>
              <input
                type="range"
                min={5}
                max={180}
                step={5}
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-800"
              />
              <span className="text-[10px] text-gray-400 block">
                Hệ thống tự động đăng xuất nếu người dùng không có tương tác nào trong thời gian này.
              </span>
            </div>

            <div className="space-y-2 border-t border-gray-100/60 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Giới hạn số lần đăng nhập sai</span>
                <select
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
                  className="border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-red-500 bg-white font-semibold text-gray-700"
                >
                  <option value={3}>3 lần</option>
                  <option value={5}>5 lần</option>
                  <option value={10}>10 lần</option>
                  <option value={0}>Không giới hạn</option>
                </select>
              </div>
              <span className="text-[10px] text-gray-400 block leading-normal">
                Tài khoản sẽ bị tạm khóa trong 15 phút nếu nhập sai mật khẩu vượt quá số lần cấu hình ở trên.
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: White-listed IPs */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-100">
            <Globe size={16} className="text-red-800" />
            Giới hạn truy cập IP (IP Whitelist)
          </h3>

          <div className="space-y-4">
            <span className="text-gray-400 leading-normal block">
              Chỉ cho phép các máy tính có địa chỉ IP dưới đây truy cập vào hệ thống quản lý admin hoặc chi nhánh. Để trống nếu muốn cho phép mọi IP truy cập.
            </span>

            {/* IP list table */}
            <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50/50 max-h-36 overflow-y-auto">
              <table className="w-full text-left">
                <tbody>
                  {ipList.map((ip) => (
                    <tr key={ip} className="border-b border-gray-100 text-xs">
                      <td className="px-3 py-2 font-mono text-gray-700 font-medium">{ip}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveIp(ip)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1 hover:bg-white rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ipList.length === 0 && (
                    <tr>
                      <td className="px-3 py-4 text-center text-gray-400 text-xs italic">
                        Không giới hạn IP. Hệ thống mở truy cập toàn cầu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Form add IP */}
            <form onSubmit={handleAddIp} className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập IP (Ví dụ: 14.226.45.10)..."
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-mono"
              />
              <button
                type="submit"
                className="btn-secondary py-1.5 px-3 flex items-center gap-1 text-xs shrink-0 font-semibold"
              >
                <Plus size={14} /> Thêm IP
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Save Settings Block */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={handleSave}
          className="btn-primary py-2.5 px-6 font-semibold bg-red-800 hover:bg-red-900 border-none transition-colors duration-200 text-xs shadow-md"
        >
          Áp dụng Chính sách
        </button>
      </div>
    </div>
  )
}
