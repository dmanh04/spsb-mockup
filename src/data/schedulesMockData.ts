import type { StaffSchedule, ShiftTemplate } from '@/types'

export const SHIFT_TEMPLATES: ShiftTemplate[] = [
  { id: 'SH_MORNING', name: 'Ca sáng', startTime: '07:00', endTime: '12:00', color: '#3B82F6' },
  { id: 'SH_AFTERNOON', name: 'Ca chiều', startTime: '12:00', endTime: '17:00', color: '#10B981' },
  { id: 'SH_EVENING', name: 'Ca tối', startTime: '17:00', endTime: '21:00', color: '#8B5CF6' },
]

const M = SHIFT_TEMPLATES[0]
const A = SHIFT_TEMPLATES[1]
const E = SHIFT_TEMPLATES[2]

export const SCHEDULE_MOCK_LIST: StaffSchedule[] = [
  // Tuần 02/06 – 08/06/2026
  // Trần Hùng (U020) — Groomer SH01
  { id: 'SC-001', staffId: 'U020', staffName: 'Trần Hùng', shopId: 'SH01', date: '2026-06-02', shiftId: M.id, shift: M, status: 'scheduled' },
  { id: 'SC-002', staffId: 'U020', staffName: 'Trần Hùng', shopId: 'SH01', date: '2026-06-03', shiftId: M.id, shift: M, status: 'scheduled' },
  { id: 'SC-003', staffId: 'U020', staffName: 'Trần Hùng', shopId: 'SH01', date: '2026-06-04', shiftId: M.id, shift: M, status: 'scheduled' },
  { id: 'SC-004', staffId: 'U020', staffName: 'Trần Hùng', shopId: 'SH01', date: '2026-06-05', shiftId: A.id, shift: A, status: 'scheduled' },
  { id: 'SC-005', staffId: 'U020', staffName: 'Trần Hùng', shopId: 'SH01', date: '2026-06-06', shiftId: M.id, shift: M, status: 'scheduled' },
  // Lê Lan (U021) — Spa Specialist SH01
  { id: 'SC-010', staffId: 'U021', staffName: 'Lê Lan', shopId: 'SH01', date: '2026-06-02', shiftId: A.id, shift: A, status: 'scheduled' },
  { id: 'SC-011', staffId: 'U021', staffName: 'Lê Lan', shopId: 'SH01', date: '2026-06-03', shiftId: A.id, shift: A, status: 'scheduled' },
  { id: 'SC-012', staffId: 'U021', staffName: 'Lê Lan', shopId: 'SH01', date: '2026-06-04', shiftId: E.id, shift: E, status: 'scheduled' },
  { id: 'SC-013', staffId: 'U021', staffName: 'Lê Lan', shopId: 'SH01', date: '2026-06-05', shiftId: A.id, shift: A, status: 'scheduled' },
  { id: 'SC-014', staffId: 'U021', staffName: 'Lê Lan', shopId: 'SH01', date: '2026-06-06', shiftId: A.id, shift: A, status: 'scheduled' },
  // Nguyễn Mai (U022) — Groomer SH01 (đang nghỉ 02/06)
  { id: 'SC-020', staffId: 'U022', staffName: 'Nguyễn Mai', shopId: 'SH01', date: '2026-06-02', shiftId: M.id, shift: M, status: 'on_leave' },
  { id: 'SC-021', staffId: 'U022', staffName: 'Nguyễn Mai', shopId: 'SH01', date: '2026-06-03', shiftId: M.id, shift: M, status: 'scheduled' },
  { id: 'SC-022', staffId: 'U022', staffName: 'Nguyễn Mai', shopId: 'SH01', date: '2026-06-04', shiftId: A.id, shift: A, status: 'scheduled' },
  { id: 'SC-023', staffId: 'U022', staffName: 'Nguyễn Mai', shopId: 'SH01', date: '2026-06-05', shiftId: M.id, shift: M, status: 'scheduled' },
  { id: 'SC-024', staffId: 'U022', staffName: 'Nguyễn Mai', shopId: 'SH01', date: '2026-06-07', shiftId: E.id, shift: E, status: 'scheduled' },
  // Nguyễn Thị Cẩm (U010) — Operation SH01
  { id: 'SC-030', staffId: 'U010', staffName: 'Nguyễn Thị Cẩm', shopId: 'SH01', date: '2026-06-02', shiftId: M.id, shift: M, status: 'scheduled' },
  { id: 'SC-031', staffId: 'U010', staffName: 'Nguyễn Thị Cẩm', shopId: 'SH01', date: '2026-06-03', shiftId: M.id, shift: M, status: 'scheduled' },
  { id: 'SC-032', staffId: 'U010', staffName: 'Nguyễn Thị Cẩm', shopId: 'SH01', date: '2026-06-04', shiftId: M.id, shift: M, status: 'scheduled' },
  { id: 'SC-033', staffId: 'U010', staffName: 'Nguyễn Thị Cẩm', shopId: 'SH01', date: '2026-06-05', shiftId: M.id, shift: M, status: 'scheduled' },
  { id: 'SC-034', staffId: 'U010', staffName: 'Nguyễn Thị Cẩm', shopId: 'SH01', date: '2026-06-06', shiftId: A.id, shift: A, status: 'scheduled' },
]
