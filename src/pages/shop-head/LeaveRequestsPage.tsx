import { useState } from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { LEAVE_REQUEST_MOCK_LIST, SHIFT_SWAP_MOCK_LIST } from '@/data/leaveRequestMockData'
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
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({})
  const [statuses, setStatuses] = useState<Record<string, LeaveRequestStatus>>({})

  const leaveRequests = LEAVE_REQUEST_MOCK_LIST.filter(l => l.shopId === shopId)
  const swapRequests = SHIFT_SWAP_MOCK_LIST.filter(s => s.status === 'pending')

  function getStatus(id: string, original: LeaveRequestStatus): LeaveRequestStatus {
    return statuses[id] ?? original
  }

  function approve(id: string) {
    setStatuses(s => ({ ...s, [id]: 'approved' }))
  }
  function reject(id: string) {
    setStatuses(s => ({ ...s, [id]: 'rejected' }))
  }

  const pendingCount = leaveRequests.filter(l => getStatus(l.id, l.status) === 'pending').length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Đơn xin nghỉ & Đổi ca</h1>
        {pendingCount > 0 && (
          <p className="text-sm text-orange-600 mt-0.5">{pendingCount} đơn đang chờ duyệt</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('leave')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'leave' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Nghỉ phép {pendingCount > 0 && <span className="ml-1 badge-orange text-[10px]">{pendingCount}</span>}
        </button>
        <button onClick={() => setTab('swap')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'swap' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Đổi ca ({swapRequests.length})
        </button>
      </div>

      {tab === 'leave' && (
        <div className="space-y-3">
          {leaveRequests.map(req => {
            const status = getStatus(req.id, req.status)
            return (
              <div key={req.id} className={`card p-4 ${status === 'pending' ? 'border-orange-200' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{req.staffName}</span>
                      <span className={STATUS_BADGE[status]}>{STATUS_LABEL[status]}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {LEAVE_TYPE_LABELS[req.type]} · {req.dates.join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={11} /> {req.requestedAt}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-3">
                  "{req.reason}"
                </div>

                {status === 'pending' ? (
                  <div className="space-y-2">
                    <input
                      className="form-input text-sm"
                      placeholder="Phản hồi (tuỳ chọn)..."
                      value={reviewNote[req.id] ?? ''}
                      onChange={e => setReviewNote(n => ({ ...n, [req.id]: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => approve(req.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                        <CheckCircle size={14} /> Duyệt
                      </button>
                      <button onClick={() => reject(req.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                        <XCircle size={14} /> Từ chối
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`text-xs font-medium ${status === 'approved' ? 'text-green-600' : 'text-red-500'}`}>
                    {status === 'approved' ? '✓ Đã duyệt' : '✗ Đã từ chối'}
                    {req.reviewNote && <span className="ml-2 text-gray-500">— {req.reviewNote}</span>}
                  </div>
                )}
              </div>
            )
          })}
          {leaveRequests.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">Không có đơn xin nghỉ nào</div>
          )}
        </div>
      )}

      {tab === 'swap' && (
        <div className="space-y-3">
          {swapRequests.map(req => (
            <div key={req.id} className="card p-4 border-blue-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-semibold text-gray-900">{req.requesterName}</span>
                  <span className="text-gray-400 text-sm mx-2">↔</span>
                  <span className="font-semibold text-gray-900">{req.targetStaffName}</span>
                  <span className="badge-orange ml-2">Đang chờ</span>
                </div>
                <div className="text-xs text-gray-400">{req.requestedAt}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 mb-3">
                "{req.reason}"
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100">
                  <CheckCircle size={14} /> Chấp thuận
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100">
                  <XCircle size={14} /> Từ chối
                </button>
              </div>
            </div>
          ))}
          {swapRequests.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">Không có yêu cầu đổi ca</div>
          )}
        </div>
      )}
    </div>
  )
}
