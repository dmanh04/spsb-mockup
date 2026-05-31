import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, User as UserIcon, Phone, Mail, Calendar, Briefcase, 
  DollarSign, Landmark, ShieldCheck, AlertTriangle, Trash2, Award 
} from 'lucide-react'
import { 
  USER_MOCK_LIST, 
  ROLE_LABELS, 
  saveUsers 
} from '@/data/userMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'
import type { User, Role } from '@/types'

// Mock avatars for staff selector
const STAFF_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60', // female 1
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60', // male 1
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60', // female 2
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60', // male 2
]

const BANK_OPTIONS = ['Vietcombank', 'Techcombank', 'MB Bank', 'VietinBank', 'ACB', 'BIDV', 'VPBank']

export default function ShopHeadStaffFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'
  const isEditMode = !!id

  const [staffs, setStaffs] = useState(() => USER_MOCK_LIST)
  const existingStaff = isEditMode ? staffs.find(u => u.id === id) : null

  // --- Form States ---
  // Section 1: Personal
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarIdx, setAvatarIdx] = useState(0)

  // Section 2: Job
  const [role, setRole] = useState<Role>('petcare_staff')
  const [position, setPosition] = useState('Groomer')
  const [hireDate, setHireDate] = useState('2026-05-31')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  // Section 3: Payroll & Contract
  const [contractType, setContractType] = useState<'full_time' | 'part_time' | 'internship' | 'freelance'>('full_time')
  const [salaryType, setSalaryType] = useState<'fixed' | 'commission'>('fixed')
  const [baseSalary, setBaseSalary] = useState('8000000')
  const [commissionRate, setCommissionRate] = useState('10')

  // Section 4: Finance & Emergency
  const [taxCode, setTaxCode] = useState('')
  const [insuranceId, setInsuranceId] = useState('')
  const [bankName, setBankName] = useState('Vietcombank')
  const [bankAccount, setBankAccount] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Prepopulate form if in edit mode
  useEffect(() => {
    if (isEditMode && existingStaff) {
      setFullName(existingStaff.fullName)
      setEmail(existingStaff.email)
      setPhone(existingStaff.phone)
      setRole(existingStaff.role)
      setPosition(existingStaff.position ?? 'Groomer')
      setHireDate(existingStaff.hireDate ?? '2026-05-31')
      setStatus(existingStaff.status === 'active' ? 'active' : 'inactive')
      
      setContractType(existingStaff.contractType ?? 'full_time')
      setSalaryType(existingStaff.salaryType ?? 'fixed')
      setBaseSalary(existingStaff.baseSalary?.toString() ?? '8000000')
      setCommissionRate(existingStaff.commissionRate?.toString() ?? '10')

      setTaxCode(existingStaff.taxCode ?? '')
      setInsuranceId(existingStaff.insuranceId ?? '')
      setBankName(existingStaff.bankName ?? 'Vietcombank')
      setBankAccount(existingStaff.bankAccount ?? '')
      
      setEmergencyContactName(existingStaff.emergencyContactName ?? '')
      setEmergencyContactRelation(existingStaff.emergencyContactRelation ?? '')
      setEmergencyContactPhone(existingStaff.emergencyContactPhone ?? '')

      const avIdx = STAFF_AVATARS.indexOf(existingStaff.avatar)
      setAvatarIdx(avIdx !== -1 ? avIdx : 0)
    }
  }, [isEditMode, existingStaff])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName || !email || !phone || !position) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc tại các mục!')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const parsedBaseSalary = parseInt(baseSalary) || 0
    const parsedCommission = parseInt(commissionRate) || 0

    if (isEditMode && existingStaff) {
      // Edit mode
      const updated = staffs.map(u => {
        if (u.id === existingStaff.id) {
          return {
            ...u,
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            role: role,
            status: status as any,
            avatar: STAFF_AVATARS[avatarIdx] || u.avatar,
            hireDate: hireDate,
            position: position.trim(),
            contractType,
            salaryType,
            baseSalary: parsedBaseSalary,
            commissionRate: salaryType === 'commission' ? parsedCommission : undefined,
            taxCode: taxCode.trim(),
            insuranceId: insuranceId.trim(),
            bankName,
            bankAccount: bankAccount.trim(),
            emergencyContactName: emergencyContactName.trim(),
            emergencyContactRelation: emergencyContactRelation.trim(),
            emergencyContactPhone: emergencyContactPhone.trim()
          }
        }
        return u
      })

      saveUsers(updated)
      setSuccessMsg(`Đã cập nhật hồ sơ nhân viên ${fullName} thành công!`)
      setTimeout(() => navigate('/shop-head/staff'), 1500)
    } else {
      // Add mode
      const newStaffId = `U0${Date.now().toString().slice(-3)}`
      const newStaff: User = {
        id: newStaffId,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: role,
        shopId: shopId,
        status: status as any,
        avatar: STAFF_AVATARS[avatarIdx] || 'https://placehold.co/40x40/10B981/white?text=ST',
        createdAt: nowStr,
        lastLogin: '—',
        hireDate: hireDate,
        position: position.trim(),
        contractType,
        salaryType,
        baseSalary: parsedBaseSalary,
        commissionRate: salaryType === 'commission' ? parsedCommission : undefined,
        taxCode: taxCode.trim(),
        insuranceId: insuranceId.trim(),
        bankName,
        bankAccount: bankAccount.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactRelation: emergencyContactRelation.trim(),
        emergencyContactPhone: emergencyContactPhone.trim()
      }

      const updated = [...staffs, newStaff]
      saveUsers(updated)
      setSuccessMsg(`Đã kích hoạt và lưu hồ sơ nhân sự mới ${fullName}!`)
      setTimeout(() => navigate('/shop-head/staff'), 1500)
    }
  }

  function handleDelete() {
    if (!existingStaff) return
    if (confirm(`Bạn có chắc chắn muốn chấm dứt hợp đồng và gỡ bỏ hoàn toàn hồ sơ của nhân sự "${existingStaff.fullName}" khỏi hệ thống chi nhánh?`)) {
      const updated = staffs.filter(u => u.id !== existingStaff.id)
      saveUsers(updated)
      setSuccessMsg(`Đã gỡ bỏ tài khoản nhân viên ${existingStaff.fullName}.`)
      setTimeout(() => navigate('/shop-head/staff'), 1500)
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn min-h-[calc(100vh-140px)]">
      
      {/* Header action bar */}
      <div className="flex items-center justify-between">
        <Link 
          to="/shop-head/staff" 
          className="btn-secondary py-1.5 px-3 rounded-2xl flex items-center gap-1 text-xs"
        >
          <ArrowLeft size={13} /> Quay lại danh sách
        </Link>
        <span className="text-xs font-bold text-gray-400 font-mono">Chi nhánh: {shopId}</span>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="bg-emerald-55 border border-emerald-250 text-emerald-800 rounded-2xl p-4 flex items-center gap-2 text-sm font-extrabold animate-pulse-subtle">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-center gap-2 text-sm font-extrabold">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Detailed Full Info Form Layout */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: PERSONAL DETAILS & AVATAR */}
        <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-black text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
            <UserIcon size={15} className="text-indigo-600" />
            1. Thông tin Cá nhân & Liên hệ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Avatar Selector Grid */}
            <div className="space-y-3 bg-gray-50/50 p-4 border border-gray-100 rounded-2xl text-center">
              <span className="text-[10px] font-black text-gray-450 uppercase tracking-wide block text-left mb-1">
                Ảnh đại diện nhân sự
              </span>
              
              <div className="flex justify-center mb-2">
                <img 
                  src={STAFF_AVATARS[avatarIdx]} 
                  alt="" 
                  className="w-20 h-20 rounded-full border-2 border-indigo-600 object-cover shadow-md shadow-indigo-100" 
                />
              </div>

              <div className="flex justify-center gap-2">
                {STAFF_AVATARS.map((url, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => setAvatarIdx(idx)}
                    className={`w-9 h-9 rounded-full border-2 overflow-hidden transition-all shrink-0 ${
                      avatarIdx === idx ? 'border-indigo-600 scale-105 shadow-sm' : 'border-gray-200'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Họ và tên nhân sự *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: Hoàng Minh Anh" 
                    className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500 font-semibold"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Số điện thoại di động *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: 0956..." 
                    className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500 font-mono font-bold"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Địa chỉ Email liên hệ *</label>
                <input 
                  type="email" 
                  required
                  placeholder="domain@petcare.com" 
                  className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500 font-mono"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: PROFESSION & WORK LIFE STATUS */}
        <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-black text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Briefcase size={15} className="text-indigo-600" />
            2. Chức danh, Vai trò & Trạng thái làm việc
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Role selection */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Vai trò quản trị hệ thống</label>
              <select 
                className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500 font-bold text-gray-700"
                value={role}
                onChange={e => setRole(e.target.value as Role)}
              >
                <option value="petcare_staff">Nhân viên Chăm sóc (Groomer/Spa)</option>
                <option value="operation_staff">Nhân viên Vận hành (Lễ tân/Thu ngân)</option>
              </select>
            </div>

            {/* Position job title */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Chức danh công việc *</label>
              <select 
                className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500 font-bold text-gray-700"
                value={position}
                onChange={e => setPosition(e.target.value)}
              >
                <option value="Groomer">Groomer (Cắt tỉa lông)</option>
                <option value="Spa Specialist">Spa Specialist (Trị liệu Spa)</option>
                <option value="Bather">Bather (Tắm sấy cơ bản)</option>
                <option value="Nhân viên lễ tân">Nhân viên lễ tân</option>
              </select>
            </div>

            {/* Hire date */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Ngày ký hợp đồng trực tiếp</label>
              <input 
                type="date" 
                required
                className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500"
                value={hireDate}
                onChange={e => setHireDate(e.target.value)}
              />
            </div>

            {/* Work Status active/inactive */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Trạng thái điều phối ca trực</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    status === 'active' 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                      : 'bg-white text-gray-650 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Đang hoạt động
                </button>
                <button 
                  type="button"
                  onClick={() => setStatus('inactive')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    status === 'inactive' 
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                      : 'bg-white text-gray-655 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Tạm dừng trực ca
                </button>
              </div>
            </div>
          </div>

          {status === 'inactive' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed font-semibold flex items-start gap-2">
              <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <span>
                <strong>Cảnh báo ẩn ca trực:</strong> Khi chuyển sang "Tạm dừng trực ca", hệ thống xếp lịch Grid phân ca sẽ ẩn nhân sự này đi, đồng thời hệ thống dispatch lịch hẹn sẽ cảnh báo off-duty nếu gán lịch cho họ.
              </span>
            </div>
          )}
        </div>

        {/* SECTION 3: CONTRACT TYPE, SALARY PAYROLL SYSTEM */}
        <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-black text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
            <DollarSign size={15} className="text-indigo-600" />
            3. Hợp đồng Lao động & Cấu hình Tiền lương
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Contract Type */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Hình thức hợp đồng</label>
              <select 
                className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500 font-bold"
                value={contractType}
                onChange={e => setContractType(e.target.value as any)}
              >
                <option value="full_time">Chính thức (Full-time)</option>
                <option value="part_time">Bán thời gian (Part-time)</option>
                <option value="internship">Thực tập sinh (Internship)</option>
                <option value="freelance">Tự do (Freelancer)</option>
              </select>
            </div>

            {/* Salary Calculation Type */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Cách thức tính lương</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setSalaryType('fixed')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    salaryType === 'fixed' 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  Lương cứng
                </button>
                <button 
                  type="button"
                  onClick={() => setSalaryType('commission')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    salaryType === 'commission' 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  Theo hoa hồng
                </button>
              </div>
            </div>

            {/* Base Salary */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">
                {salaryType === 'fixed' ? 'Mức lương cơ bản (VND) *' : 'Mức lương sàn hỗ trợ (VND)'}
              </label>
              <input 
                type="number" 
                required
                className="form-input text-xs rounded-xl py-2 px-3 font-mono font-bold focus:border-indigo-500 text-gray-700"
                value={baseSalary}
                onChange={e => setBaseSalary(e.target.value)}
              />
              <span className="text-[10px] text-gray-400 font-bold block mt-1">
                Quy đổi: {formatPrice(parseInt(baseSalary) || 0)}
              </span>
            </div>

            {/* Commission Rate */}
            <div className="space-y-1">
              <label className={`text-xs font-extrabold text-gray-500 uppercase tracking-wide ${salaryType !== 'commission' ? 'opacity-40' : ''}`}>
                Tỉ lệ trích hoa hồng (%)
              </label>
              <input 
                type="number" 
                min="0"
                max="100"
                required={salaryType === 'commission'}
                disabled={salaryType !== 'commission'}
                className="form-input text-xs rounded-xl py-2 px-3 font-mono focus:border-indigo-500 disabled:opacity-40 disabled:bg-gray-50 text-gray-700 font-bold"
                value={salaryType === 'commission' ? commissionRate : ''}
                onChange={e => setCommissionRate(e.target.value)}
                placeholder="Ví dụ: 10% mỗi ca làm xong"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: TAX, BANKING & EMERGENCY CONTACTS */}
        <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-black text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Landmark size={15} className="text-indigo-600" />
            4. Liên kết Ngân hàng, Mã số thuế & Liên hệ khẩn cấp
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sub column: Tax & Banking */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-gray-450 uppercase tracking-wider block border-b pb-1">
                Tài chính & Thuế cá nhân
              </span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-500">Mã số thuế thu nhập</label>
                  <input 
                    type="text" 
                    placeholder="Mã số thuế cá nhân..." 
                    className="form-input text-xs rounded-xl py-2 px-3 font-mono uppercase"
                    value={taxCode}
                    onChange={e => setTaxCode(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-500">Số sổ Bảo hiểm xã hội</label>
                  <input 
                    type="text" 
                    placeholder="Số định danh BHXH..." 
                    className="form-input text-xs rounded-xl py-2 px-3 font-mono"
                    value={insuranceId}
                    onChange={e => setInsuranceId(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-500">Tên ngân hàng liên kết</label>
                  <select 
                    className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500 font-semibold"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                  >
                    {BANK_OPTIONS.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-500">Số tài khoản nhận lương</label>
                  <input 
                    type="text" 
                    placeholder="Số tài khoản..." 
                    className="form-input text-xs rounded-xl py-2 px-3 font-mono font-bold"
                    value={bankAccount}
                    onChange={e => setBankAccount(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Sub column: Emergency Contact */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-gray-450 uppercase tracking-wider block border-b pb-1">
                Liên hệ trong trường hợp khẩn cấp
              </span>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-extrabold text-gray-500">Họ và tên người bảo trợ</label>
                  <input 
                    type="text" 
                    placeholder="Người thân liên hệ khẩn..." 
                    className="form-input text-xs rounded-xl py-2 px-3"
                    value={emergencyContactName}
                    onChange={e => setEmergencyContactName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-500">Mối quan hệ</label>
                  <input 
                    type="text" 
                    placeholder="Vợ, chồng, bố mẹ..." 
                    className="form-input text-xs rounded-xl py-2 px-3"
                    value={emergencyContactRelation}
                    onChange={e => setEmergencyContactRelation(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-500">Số điện thoại liên hệ khẩn cấp</label>
                <input 
                  type="text" 
                  placeholder="Số điện thoại khẩn cấp..." 
                  className="form-input text-xs rounded-xl py-2 px-3 font-mono font-bold"
                  value={emergencyContactPhone}
                  onChange={e => setEmergencyContactPhone(e.target.value)}
                />
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM PANEL: SAVE ACTION & TERMINATE CONTRACT BUTTON */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
          {isEditMode && existingStaff && (
            <button 
              type="button" 
              onClick={handleDelete}
              className="w-full sm:w-auto px-6 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
            >
              <Trash2 size={14} /> Chấm dứt hợp đồng & Xóa nhân sự
            </button>
          )}

          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              type="submit" 
              className="flex-grow sm:flex-grow-0 btn-primary py-2.5 px-8 text-xs font-bold rounded-2xl shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={14} /> 
              {isEditMode ? 'Lưu cập nhật hồ sơ' : 'Kích hoạt hồ sơ nhân sự'}
            </button>

            <Link 
              to="/shop-head/staff"
              className="flex-grow sm:flex-grow-0 btn-secondary py-2.5 px-6 text-xs font-bold rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-200"
            >
              Hủy bỏ
            </Link>
          </div>
        </div>

      </form>

    </div>
  )
}
