import { useState } from 'react'
import { Calendar, Plus, Check } from 'lucide-react'
import { SCHEDULE_MOCK_LIST, SHIFT_TEMPLATES } from '@/data/schedulesMockData'
import { LEAVE_REQUEST_MOCK_LIST } from '@/data/leaveRequestMockData'
import { useAuthContext } from '@/auth/AuthContext'

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Đã xếp', confirmed: 'Xác nhận', working: 'Đang làm', absent: 'Vắng', on_leave: 'Nghỉ phép',
}
const STATUS_COLOR: Record<string, string> = {
  scheduled: 'badge-blue', confirmed: 'badge-green', working: 'badge-green', absent: 'badge-red', on_leave: 'badge-orange',
}

const LEAVE_STATUS_LABEL: Record<string, string> = { pending: 'Đang chờ', approved: 'Đã duyệt', rejected: 'Từ chối' }
const LEAVE_STATUS_COLOR: Record<string, string> = { pending: 'badge-orange', approved: 'badge-green', rejected: 'badge-red' }

export default function MySchedulePage() {
  const { currentUser } = useAuthContext()
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveDate, setLeaveDate] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const mySchedules = SCHEDULE_MOCK_LIST.filter(s => s.staffId === currentUser?.id)
    .sort((a, b) => a.date.localeCompare(b.date))
  const myLeaveRequests = LEAVE_REQUEST_MOCK_LIST.filter(l => l.staffId === currentUser?.id)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Lịch làm việc của tôi</h1>
        <button onClick={() => setShowLeaveForm(true)} className="btn-secondary text-sm py-2">
          <Plus size={14} /> Xin nghỉ
        </button>
      </div>

      {/* Schedule list */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={14} /> Ca làm việc tuần tới
          </h2>
        </div>
        {mySchedules.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">Chưa có lịch nào được xếp</div>
        ) : (
          <div className="divide-y">
            {mySchedules.map(s => (
              <div key={s.id} className="px-4 py-3 flex items-center gap-4">
                <div className="w-24 shrink-0">
                  <div className="text-sm font-semibold text-gray-900">
                    {new Date(s.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.shift.color }} />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{s.shift.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{s.shift.startTime}–{s.shift.endTime}</span>
                  </div>
                </div>
                <span className={`${STATUS_COLOR[s.status]} shrink-0`}>{STATUS_LABEL[s.status]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave requests */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-900">Đơn xin nghỉ</h2>
        </div>
        {myLeaveRequests.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">Chưa có đơn xin nghỉ nào</div>
        ) : (
          <div className="divide-y">
            {myLeaveRequests.map(l => (
              <div key={l.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{l.dates.join(', ')}</span>
                  <span className={LEAVE_STATUS_COLOR[l.status]}>{LEAVE_STATUS_LABEL[l.status]}</span>
                </div>
                <p className="text-xs text-gray-500">{l.reason}</p>
                {l.reviewNote && <p className="text-xs text-blue-600 mt-1">Phản hồi: {l.reviewNote}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave request form modal */}
      {showLeaveForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
            {submitted ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={20} className="text-green-500" />
                </div>
                <h3 className="font-semibold text-gray-900">Đã gửi đơn xin nghỉ</h3>
                <p className="text-sm text-gray-500 mt-1">Quản lý sẽ xem xét và phản hồi sớm.</p>
                <button onClick={() => { setShowLeaveForm(false); setSubmitted(false) }} className="btn-primary mt-4 w-full justify-center">
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-gray-900">Gửi đơn xin nghỉ</h3>
                <div>
                  <label className="form-label">Ngày xin nghỉ</label>
                  <input type="date" className="form-input" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Lý do</label>
                  <textarea className="form-input h-20 resize-none" placeholder="Vui lòng ghi rõ lý do..." value={leaveReason} onChange={e => setLeaveReason(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={!leaveDate || !leaveReason}
                    onClick={() => setSubmitted(true)}
                    className="btn-primary flex-1 justify-center disabled:opacity-40"
                  >
                    Gửi đơn
                  </button>
                  <button onClick={() => setShowLeaveForm(false)} className="btn-secondary">Huỷ</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
