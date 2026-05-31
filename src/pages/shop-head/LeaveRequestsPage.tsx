import { useState } from 'react'
import { CheckCircle, XCircle, Clock, ShieldAlert, Check, AlertCircle } from 'lucide-react'
import { 
  LEAVE_REQUEST_MOCK_LIST, 
  SHIFT_SWAP_MOCK_LIST, 
  saveLeaveRequests, 
  saveShiftSwaps 
} from '@/data/leaveRequestMockData'
import { 
  SCHEDULE_MOCK_LIST, 
  saveSchedules 
} from '@/data/schedulesMockData'
import { useAuthContext } from '@/auth/AuthContext'
import type { LeaveRequestStatus } from '@/types'

const LEAVE_TYPE_LABELS: Record<string, string> = {
  annual: 'Phép năm', sick: 'Ốm đau', personal: 'Việc cá nhân', unpaid: 'Không lương',
}

const STATUS_BADGE: Record<LeaveRequestStatus, string> = {
  pending: 'badge-orange', approved: 'badge-green', rejected: 'badge-red',
}

const STATUS_LABEL: Record<LeaveRequestStatus, string> = {
  pending: 'Đang chờ', approved: 'Đã duyệt', rejected: 'Từ chối',
}

export default function LeaveRequestsPage() {
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'
  
  const [tab, setTab] = useState<'leave' | 'swap'>('leave')
  const [leaveRequests, setLeaveRequests] = useState(() => LEAVE_REQUEST_MOCK_LIST.filter(l => l.shopId === shopId))
  const [swapRequests, setSwapRequests] = useState(() => SHIFT_SWAP_MOCK_LIST)
  
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({})
  const [successMsg, setSuccessMsg] = useState('')

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // --- LEAVE REQUEST APPROVAL ACTION ---
  function handleLeaveDecision(id: string, decision: 'approved' | 'rejected') {
    const note = reviewNote[id] ?? ''
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
    
    // 1. Update in Mock List
    const allLeaves = LEAVE_REQUEST_MOCK_LIST.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status: decision,
          reviewNote: note || (decision === 'approved' ? 'Đồng ý duyệt phép.' : 'Từ chối đơn phép.'),
          reviewedBy: currentUser?.fullName ?? 'Shop Head',
          reviewedAt: nowStr
        }
      }
      return l
    })
    
    // Save persistently
    saveLeaveRequests(allLeaves)
    setLeaveRequests(allLeaves.filter(l => l.shopId === shopId))

    // 2. Automated scheduling adjustment on approval
    if (decision === 'approved') {
      const targetReq = LEAVE_REQUEST_MOCK_LIST.find(l => l.id === id)
      if (targetReq) {
        let scheduleModified = false
        const updatedSchedules = SCHEDULE_MOCK_LIST.map(s => {
          if (s.staffId === targetReq.staffId && targetReq.dates.includes(s.date)) {
            scheduleModified = true
            return { ...s, status: 'on_leave' as const }
          }
          return s
        })

        // If the staff didn't even have a schedule item on those dates, we can create an on_leave record
        targetReq.dates.forEach(date => {
          const hasSched = SCHEDULE_MOCK_LIST.some(s => s.staffId === targetReq.staffId && s.date === date)
          if (!hasSched) {
            scheduleModified = true
            updatedSchedules.push({
              id: `SC-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              staffId: targetReq.staffId,
              staffName: targetReq.staffName,
              shopId: shopId,
              date: date,
              shiftId: 'SH_MORNING', // default placeholder
              shift: { id: 'SH_MORNING', name: 'Ca sáng', startTime: '07:00', endTime: '12:00', color: '#3B82F6' },
              status: 'on_leave'
            })
          }
        })

        if (scheduleModified) {
          saveSchedules(updatedSchedules)
        }
      }
      showSuccess(`Đã duyệt đơn nghỉ phép của ${targetReq?.staffName} và tự động giải phóng ca trực.`)
    } else {
      showSuccess(`Đã từ chối đơn nghỉ phép.`)
    }
  }

  // --- SHIFT SWAP APPROVAL ACTION ---
  function handleSwapDecision(id: string, decision: 'approved' | 'rejected') {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
    
    // 1. Update in Mock List
    const allSwaps = SHIFT_SWAP_MOCK_LIST.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: decision,
          reviewedBy: currentUser?.fullName ?? 'Shop Head',
          reviewedAt: nowStr
        }
      }
      return s
    })

    saveShiftSwaps(allSwaps)
    setSwapRequests(allSwaps)

    // 2. Automated Shift swap execution on approval
    if (decision === 'approved') {
      const targetReq = SHIFT_SWAP_MOCK_LIST.find(s => s.id === id)
      if (targetReq) {
        const reqSched = SCHEDULE_MOCK_LIST.find(s => s.id === targetReq.requesterScheduleId)
        const tgtSched = SCHEDULE_MOCK_LIST.find(s => s.id === targetReq.targetScheduleId)

        if (reqSched && tgtSched) {
          // Perform the swap in schedules: Swap their staff assignments!
          const updatedSchedules = SCHEDULE_MOCK_LIST.map(s => {
            if (s.id === reqSched.id) {
              return {
                ...s,
                staffId: tgtSched.staffId,
                staffName: tgtSched.staffName
              }
            }
            if (s.id === tgtSched.id) {
              return {
                ...s,
                staffId: reqSched.staffId,
                staffName: reqSched.staffName
              }
            }
            return s
          })

          saveSchedules(updatedSchedules)
          showSuccess(`Đã phê duyệt đổi ca thành công! Ca trực đã được cập nhật hoán đổi tự động.`)
        } else {
          showSuccess(`Phê duyệt thành công, nhưng không tìm thấy ca trực tương ứng để hoán đổi trực tiếp.`)
        }
      }
    } else {
      showSuccess(`Đã từ chối yêu cầu đổi ca.`)
    }
  }

  const pendingCount = leaveRequests.filter(l => l.status === 'pending').length
  const pendingSwapsCount = swapRequests.filter(s => s.status === 'pending').length

  return (
    <div className="space-y-5 min-h-[calc(100vh-140px)]">
      
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Đơn xin nghỉ & Đổi ca</h1>
          <p className="text-sm text-gray-500">
            Duyệt đơn và tự động hóa điều khiển phân ca cho chi nhánh {shopId}
          </p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="bg-emerald-55 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3 animate-pulse-subtle">
          <Check size={18} className="text-emerald-600 shrink-0" />
          <span className="text-sm font-extrabold">{successMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        <button 
          onClick={() => setTab('leave')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            tab === 'leave' 
              ? 'bg-white shadow-sm text-gray-900' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Nghỉ phép thường niên 
          {pendingCount > 0 && <span className="badge-orange text-[9px] px-1.5 font-mono">{pendingCount}</span>}
        </button>
        <button 
          onClick={() => setTab('swap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            tab === 'swap' 
              ? 'bg-white shadow-sm text-gray-900' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Yêu cầu đổi ca trực
          {pendingSwapsCount > 0 && <span className="badge-blue text-[9px] px-1.5 font-mono">{pendingSwapsCount}</span>}
        </button>
      </div>

      {/* LEAVE REQUESTS TAB */}
      {tab === 'leave' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leaveRequests.map(req => {
            return (
              <div 
                key={req.id} 
                className={`bg-white rounded-3xl border border-gray-150 p-5 shadow-sm transition-all flex flex-col justify-between ${
                  req.status === 'pending' ? 'border-orange-200 bg-orange-50/5' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900 text-base">{req.staffName}</span>
                        <span className={`text-[10px] font-black ${STATUS_BADGE[req.status]}`}>
                          {STATUS_LABEL[req.status]}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1 font-mono">
                        {LEAVE_TYPE_LABELS[req.type] || req.type} · {req.dates.join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 font-mono">
                      <Clock size={11} /> {req.requestedAt}
                    </div>
                  </div>

                  <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-3 text-sm text-gray-700 font-medium italic mb-4">
                    "{req.reason}"
                  </div>
                </div>

                {req.status === 'pending' ? (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <input
                      className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500"
                      placeholder="Phản hồi ý kiến hoặc lời dặn (tuỳ chọn)..."
                      value={reviewNote[req.id] ?? ''}
                      onChange={e => setReviewNote(n => ({ ...n, [req.id]: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleLeaveDecision(req.id, 'approved')}
                        className="flex-1 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle size={13} /> Duyệt đơn
                      </button>
                      <button 
                        onClick={() => handleLeaveDecision(req.id, 'rejected')}
                        className="flex-1 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle size={13} /> Từ chối
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-gray-100 text-xs font-bold">
                    <span className={req.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}>
                      {req.status === 'approved' ? '✓ Đã phê duyệt' : '✗ Đã từ chối'}
                    </span>
                    {req.reviewNote && (
                      <p className="mt-1.5 text-gray-500 font-medium italic">
                        Ý kiến phê duyệt: "{req.reviewNote}"
                      </p>
                    )}
                    {req.reviewedBy && (
                      <div className="text-[10px] text-gray-400 font-medium mt-1 font-mono">
                        Duyệt bởi: {req.reviewedBy} lúc {req.reviewedAt}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {leaveRequests.length === 0 && (
            <div className="col-span-2 bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-sm font-bold">Không có đơn xin nghỉ nào tại chi nhánh</p>
            </div>
          )}
        </div>
      )}

      {/* SHIFT SWAPS TAB */}
      {tab === 'swap' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {swapRequests.map(req => (
            <div 
              key={req.id} 
              className={`bg-white rounded-3xl border border-gray-150 p-5 shadow-sm transition-all flex flex-col justify-between ${
                req.status === 'pending' ? 'border-indigo-200 bg-indigo-50/5' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-gray-900 text-base">{req.requesterName}</span>
                      <span className="text-gray-400 text-sm">↔</span>
                      <span className="font-extrabold text-gray-900 text-base">{req.targetStaffName}</span>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mt-1.5 inline-block ${
                      req.status === 'pending' ? 'badge-orange' : req.status === 'approved' ? 'badge-green' : 'badge-red'
                    }`}>
                      {req.status === 'pending' ? 'Đang chờ duyệt' : req.status === 'approved' ? 'Đã hoán đổi' : 'Đã từ chối'}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 font-mono flex items-center gap-1">
                    <Clock size={11} /> {req.requestedAt}
                  </div>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 text-sm text-indigo-800 font-semibold italic mb-4">
                  "{req.reason}"
                </div>

                {/* Conflict/Schedule Indicators for Swap Preview */}
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-150 text-[10px] font-bold text-gray-500 space-y-1 mb-4">
                  <span className="text-gray-400 uppercase tracking-wider block mb-1">Chi tiết ca làm hoán đổi:</span>
                  <div>• {req.requesterName}: Ca làm ID <span className="font-mono text-gray-700 font-bold">{req.requesterScheduleId}</span></div>
                  <div>• {req.targetStaffName}: Ca làm ID <span className="font-mono text-gray-700 font-bold">{req.targetScheduleId}</span></div>
                </div>
              </div>

              {req.status === 'pending' ? (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button 
                    onClick={() => handleSwapDecision(req.id, 'approved')}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100"
                  >
                    <CheckCircle size={13} /> Phê duyệt & Đổi ca
                  </button>
                  <button 
                    onClick={() => handleSwapDecision(req.id, 'rejected')}
                    className="flex-1 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={13} /> Từ chối
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-100 text-xs font-bold">
                  <span className={req.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}>
                    {req.status === 'approved' ? '✓ Đã phê duyệt hoán đổi' : '✗ Đã từ chối hoán đổi'}
                  </span>
                  {req.reviewedBy && (
                    <div className="text-[10px] text-gray-400 font-medium mt-1 font-mono">
                      Duyệt bởi: {req.reviewedBy} lúc {req.reviewedAt}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {swapRequests.length === 0 && (
            <div className="col-span-2 bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">🔄</div>
              <p className="text-sm font-bold">Không có yêu cầu đổi ca trực nào</p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
