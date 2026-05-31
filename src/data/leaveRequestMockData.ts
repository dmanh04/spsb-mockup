import type { LeaveRequest, ShiftSwapRequest } from '@/types'

const INITIAL_LEAVE_REQUEST_MOCK_LIST: LeaveRequest[] = [
  {
    id: 'LR-001', staffId: 'U022', staffName: 'Nguyễn Mai', shopId: 'SH01',
    dates: ['2026-06-02'], type: 'personal',
    reason: 'Có việc gia đình quan trọng cần giải quyết.',
    status: 'approved', requestedAt: '2026-05-30 16:00',
    reviewedBy: 'Nguyễn Quang Minh', reviewedAt: '2026-05-30 17:30',
    reviewNote: 'Đã duyệt. Nhớ bàn giao lịch cho Trần Hùng.',
  },
  {
    id: 'LR-002', staffId: 'U020', staffName: 'Trần Hùng', shopId: 'SH01',
    dates: ['2026-06-10', '2026-06-11'], type: 'annual',
    reason: 'Nghỉ phép năm còn lại, đi du lịch gia đình.',
    status: 'pending', requestedAt: '2026-05-31 09:00',
  },
  {
    id: 'LR-003', staffId: 'U021', staffName: 'Lê Lan', shopId: 'SH01',
    dates: ['2026-06-05'], type: 'sick',
    reason: 'Bị sốt từ đêm qua, cần nghỉ để hồi phục.',
    status: 'pending', requestedAt: '2026-06-04 21:30',
  },
  {
    id: 'LR-004', staffId: 'U020', staffName: 'Trần Hùng', shopId: 'SH01',
    dates: ['2026-05-25'], type: 'personal',
    reason: 'Đi khám sức khỏe định kỳ.',
    status: 'approved', requestedAt: '2026-05-22 10:00',
    reviewedBy: 'Nguyễn Quang Minh', reviewedAt: '2026-05-22 14:00',
    reviewNote: 'Duyệt.',
  },
]

const INITIAL_SHIFT_SWAP_MOCK_LIST: ShiftSwapRequest[] = [
  {
    id: 'SS-001', requesterId: 'U020', requesterName: 'Trần Hùng',
    targetStaffId: 'U022', targetStaffName: 'Nguyễn Mai',
    requesterScheduleId: 'SC-004', targetScheduleId: 'SC-022',
    reason: 'Tôi có việc cá nhân buổi chiều thứ 5 (05/06). Đổi ca sáng với Nguyễn Mai được không?',
    status: 'pending', requestedAt: '2026-05-31 11:00',
  },
]

const LOCAL_STORAGE_KEY_LEAVE = 'spsb_leave_requests_data'
const LOCAL_STORAGE_KEY_SWAP = 'spsb_shift_swaps_data'

const getStoredLeaves = (): LeaveRequest[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_LEAVE)
    if (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        console.error('Failed to parse stored leave requests', e)
      }
    }
  }
  return INITIAL_LEAVE_REQUEST_MOCK_LIST
}

const getStoredSwaps = (): ShiftSwapRequest[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_SWAP)
    if (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        console.error('Failed to parse stored shift swaps', e)
      }
    }
  }
  return INITIAL_SHIFT_SWAP_MOCK_LIST
}

export const LEAVE_REQUEST_MOCK_LIST: LeaveRequest[] = getStoredLeaves()
export const SHIFT_SWAP_MOCK_LIST: ShiftSwapRequest[] = getStoredSwaps()

export const saveLeaveRequests = (leaves: LeaveRequest[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(LOCAL_STORAGE_KEY_LEAVE, JSON.stringify(leaves))
  }
  LEAVE_REQUEST_MOCK_LIST.length = 0
  LEAVE_REQUEST_MOCK_LIST.push(...leaves)
}

export const saveShiftSwaps = (swaps: ShiftSwapRequest[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(LOCAL_STORAGE_KEY_SWAP, JSON.stringify(swaps))
  }
  SHIFT_SWAP_MOCK_LIST.length = 0
  SHIFT_SWAP_MOCK_LIST.push(...swaps)
}

