import { useState } from 'react'
import { Plus, X, AlertTriangle } from 'lucide-react'
import { SCHEDULE_MOCK_LIST, SHIFT_TEMPLATES } from '@/data/schedulesMockData'
import { LEAVE_REQUEST_MOCK_LIST } from '@/data/leaveRequestMockData'
import { USER_MOCK_LIST } from '@/data/userMockData'
import type { StaffSchedule } from '@/types'

interface Props {
  shopId: string
  weekDates: string[]  // 7 date strings YYYY-MM-DD
}

interface CellModalProps {
  date: string
  shiftId: string
  shiftName: string
  assigned: StaffSchedule[]
  available: typeof USER_MOCK_LIST
  onClose: () => void
}

function CellModal({ date, shiftId, shiftName, assigned, available, onClose }: CellModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold text-gray-900">{shiftName}</h3>
            <p className="text-xs text-gray-500">{new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Đang xếp ca ({assigned.length})</p>
            {assigned.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Chưa có nhân viên</p>
            ) : (
              <div className="space-y-1.5">
                {assigned.map(s => (
                  <div key={s.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                      {s.staffName[0]}
                    </div>
                    <span className="text-sm flex-1">{s.staffName}</span>
                    {s.status === 'on_leave' && <span className="text-[10px] text-orange-500 font-medium">Nghỉ phép</span>}
                    <button className="text-gray-300 hover:text-red-400"><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Thêm nhân viên</p>
            <select className="form-input text-sm">
              <option value="">-- Chọn nhân viên --</option>
              {available
                .filter(u => !assigned.some(a => a.staffId === u.id))
                .map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} — {u.position}</option>
                ))}
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <button className="btn-primary flex-1 justify-center text-sm" onClick={onClose}>
              <Plus size={13} /> Thêm & Lưu
            </button>
            <button className="btn-secondary" onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StaffScheduleGrid({ shopId, weekDates }: Props) {
  const [modalCell, setModalCell] = useState<{ date: string; shiftId: string } | null>(null)

  const staffList = USER_MOCK_LIST.filter(u =>
    u.shopId === shopId && (u.role === 'petcare_staff' || u.role === 'operation_staff')
  )

  const approvedLeaves = LEAVE_REQUEST_MOCK_LIST
    .filter(l => l.shopId === shopId && l.status === 'approved')
    .flatMap(l => l.dates)

  function getCell(date: string, shiftId: string): StaffSchedule[] {
    return SCHEDULE_MOCK_LIST.filter(s => s.shopId === shopId && s.date === date && s.shiftId === shiftId)
  }

  function hasConflict(date: string, shiftId: string): boolean {
    const cell = getCell(date, shiftId)
    return cell.some(s => approvedLeaves.includes(s.date) && s.status === 'on_leave')
  }

  const dayLabels = weekDates.map(d => ({
    date: d,
    label: new Date(d).toLocaleDateString('vi-VN', { weekday: 'short' }),
    day: new Date(d).getDate(),
  }))

  const modalData = modalCell
    ? {
        date: modalCell.date,
        shiftId: modalCell.shiftId,
        assigned: getCell(modalCell.date, modalCell.shiftId),
        shift: SHIFT_TEMPLATES.find(s => s.id === modalCell.shiftId)!,
      }
    : null

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-8 border-b bg-gray-50 text-xs font-semibold">
        <div className="px-3 py-3 text-gray-400">Ca làm</div>
        {dayLabels.map(d => (
          <div key={d.date} className="px-2 py-3 text-center border-l">
            <div className="text-gray-400">{d.label}</div>
            <div className="text-gray-900 font-bold text-sm">{d.day}</div>
          </div>
        ))}
      </div>

      {/* Rows per shift */}
      {SHIFT_TEMPLATES.map(shift => (
        <div key={shift.id} className="grid grid-cols-8 border-b last:border-b-0">
          {/* Shift label */}
          <div className="px-3 py-3 flex flex-col justify-center border-r">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: shift.color }} />
              <span className="text-xs font-semibold text-gray-700">{shift.name}</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">{shift.startTime}–{shift.endTime}</span>
          </div>

          {/* Cells per day */}
          {dayLabels.map(d => {
            const cell = getCell(d.date, shift.id)
            const conflict = hasConflict(d.date, shift.id)
            return (
              <button
                key={d.date}
                onClick={() => setModalCell({ date: d.date, shiftId: shift.id })}
                className="px-2 py-2 border-l min-h-16 hover:bg-gray-50 transition-colors text-left align-top group"
              >
                {conflict && (
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle size={10} className="text-orange-400" />
                    <span className="text-[9px] text-orange-400">Conflict</span>
                  </div>
                )}
                <div className="space-y-1">
                  {cell.map(s => (
                    <div key={s.id}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        s.status === 'on_leave' ? 'bg-red-100 text-red-600 line-through' : 'text-white'
                      }`}
                      style={{ backgroundColor: s.status === 'on_leave' ? undefined : shift.color + '33', color: s.status === 'on_leave' ? undefined : shift.color }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: shift.color }} />
                      <span className="truncate max-w-14">{s.staffName.split(' ').slice(-1)[0]}</span>
                    </div>
                  ))}
                </div>
                {cell.length === 0 && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-gray-300">
                    <Plus size={11} /><span className="text-[10px]">Thêm</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      ))}

      {/* Modal */}
      {modalData && (
        <CellModal
          date={modalData.date}
          shiftId={modalData.shiftId}
          shiftName={modalData.shift.name}
          assigned={modalData.assigned}
          available={staffList}
          onClose={() => setModalCell(null)}
        />
      )}
    </div>
  )
}
