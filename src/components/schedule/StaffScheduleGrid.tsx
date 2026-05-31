import { useState } from 'react'
import { Plus, X, AlertTriangle, UserPlus, CheckCircle, ShieldAlert, AlertCircle, Info } from 'lucide-react'
import { SCHEDULE_MOCK_LIST, SHIFT_TEMPLATES, saveSchedules } from '@/data/schedulesMockData'
import { LEAVE_REQUEST_MOCK_LIST } from '@/data/leaveRequestMockData'
import { USER_MOCK_LIST } from '@/data/userMockData'
import type { StaffSchedule } from '@/types'

interface Props {
  shopId: string
  weekDates: string[]  // 7 date strings YYYY-MM-DD
}

export default function StaffScheduleGrid({ shopId, weekDates }: Props) {
  const [schedules, setSchedules] = useState<StaffSchedule[]>(() => SCHEDULE_MOCK_LIST)
  const [selectedCell, setSelectedCell] = useState<{ date: string; shiftId: string } | null>(null)
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [warningMsg, setWarningMsg] = useState('')

  const staffList = USER_MOCK_LIST.filter(u =>
    u.shopId === shopId && (u.role === 'petcare_staff' || u.role === 'operation_staff')
  )

  const approvedLeaves = LEAVE_REQUEST_MOCK_LIST
    .filter(l => l.shopId === shopId && l.status === 'approved')

  // Get schedules for a specific cell
  function getCellSchedules(date: string, shiftId: string): StaffSchedule[] {
    return schedules.filter(s => s.shopId === shopId && s.date === date && s.shiftId === shiftId)
  }

  // Get count of shifts for a staff on a date
  function getStaffShiftsCount(staffId: string, date: string): number {
    return schedules.filter(s => s.staffId === staffId && s.date === date && s.status === 'scheduled').length
  }

  // Check if a staff has an overlapping shift on the same day
  function getStaffOtherShifts(staffId: string, date: string, currentShiftId: string): StaffSchedule[] {
    return schedules.filter(s => s.staffId === staffId && s.date === date && s.shiftId !== currentShiftId && s.status === 'scheduled')
  }

  // Check if staff has approved leave on this date
  function isStaffOnLeave(staffId: string, date: string): boolean {
    return approvedLeaves.some(l => l.staffId === staffId && l.dates.includes(date))
  }

  function handleRemoveStaff(schedId: string) {
    const updated = schedules.filter(s => s.id !== schedId)
    setSchedules(updated)
    saveSchedules(updated)
    // Clear warning when changing selection
    setWarningMsg('')
  }

  function handleAddStaff(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCell || !selectedStaffId) return

    const staff = staffList.find(u => u.id === selectedStaffId)
    if (!staff) return

    const { date, shiftId } = selectedCell

    // --- advanced validation checks ---
    // 1. Leave Check
    if (isStaffOnLeave(staff.id, date)) {
      setWarningMsg(`Không thể xếp ca: Nhân viên ${staff.fullName} đang nghỉ phép trong ngày này!`)
      return
    }

    // 2. Overlap Check
    const overlapping = getStaffOtherShifts(staff.id, date, shiftId)
    const shiftCount = getStaffShiftsCount(staff.id, date)

    const shiftTemplate = SHIFT_TEMPLATES.find(s => s.id === shiftId)!

    const newSchedule: StaffSchedule = {
      id: `SC-${Date.now()}`,
      staffId: staff.id,
      staffName: staff.fullName,
      shopId: shopId,
      date: date,
      shiftId: shiftId,
      shift: shiftTemplate,
      status: 'scheduled'
    }

    const updated = [...schedules, newSchedule]
    setSchedules(updated)
    saveSchedules(updated)

    // Reset Form select
    setSelectedStaffId('')
    setWarningMsg('')
  }

  const dayLabels = weekDates.map(d => ({
    date: d,
    label: new Date(d).toLocaleDateString('vi-VN', { weekday: 'short' }),
    day: new Date(d).getDate(),
  }))

  const activeCellData = selectedCell
    ? {
        date: selectedCell.date,
        shiftId: selectedCell.shiftId,
        assigned: getCellSchedules(selectedCell.date, selectedCell.shiftId),
        shift: SHIFT_TEMPLATES.find(s => s.id === selectedCell.shiftId)!,
      }
    : null

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* GRID AREA */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        {/* Week Calendar Header */}
        <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider select-none">
          <div className="px-4 py-4 shrink-0 flex items-center justify-center">Ca trực</div>
          {dayLabels.map(d => (
            <div key={d.date} className="px-2 py-3 text-center border-l border-gray-100">
              <div className="text-[10px] text-gray-400 font-bold">{d.label}</div>
              <div className="text-gray-900 font-black text-sm mt-0.5">{d.day}</div>
            </div>
          ))}
        </div>

        {/* Rows per shift template */}
        {SHIFT_TEMPLATES.map(shift => (
          <div key={shift.id} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
            {/* Shift label column */}
            <div className="px-4 py-4 flex flex-col justify-center border-r border-gray-100 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse-subtle" style={{ backgroundColor: shift.color }} />
                <span className="text-xs font-black text-gray-800">{shift.name}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold mt-1 font-mono">{shift.startTime} – {shift.endTime}</span>
            </div>

            {/* Shift cells per date */}
            {dayLabels.map(d => {
              const cell = getCellSchedules(d.date, shift.id)
              const hasLeaveConflict = cell.some(s => isStaffOnLeave(s.staffId, d.date))
              const isSelected = selectedCell?.date === d.date && selectedCell?.shiftId === shift.id

              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => { setSelectedCell({ date: d.date, shiftId: shift.id }); setWarningMsg('') }}
                  className={`px-2 py-3.5 border-l border-gray-100 min-h-20 hover:bg-gray-50/50 transition-all text-left align-top flex flex-col justify-between group ${
                    isSelected ? 'bg-indigo-50/40 ring-2 ring-indigo-500 ring-inset border-transparent' : ''
                  }`}
                >
                  <div className="space-y-1.5 w-full">
                    {/* Leaf/Conflict Warning Sign */}
                    {hasLeaveConflict && (
                      <div className="flex items-center gap-1 bg-rose-50 text-rose-700 font-black text-[9px] px-1.5 py-0.5 rounded border border-rose-100 animate-pulse-subtle">
                        <AlertTriangle size={9} /> Nghỉ phép
                      </div>
                    )}

                    {cell.map(s => {
                      const onLeave = isStaffOnLeave(s.staffId, d.date)
                      return (
                        <div 
                          key={s.id}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${
                            onLeave 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 line-through' 
                              : 'border border-gray-100 font-semibold'
                          }`}
                          style={onLeave ? undefined : { 
                            backgroundColor: shift.color + '12', 
                            color: shift.color,
                            borderColor: shift.color + '22'
                          }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: onLeave ? '#F43F5E' : shift.color }} />
                          <span className="truncate max-w-16">{s.staffName.split(' ').slice(-1)[0]}</span>
                        </div>
                      )
                    })}
                  </div>

                  {cell.length === 0 && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-gray-300 transition-opacity mt-auto">
                      <Plus size={11} /><span className="text-[10px] font-extrabold uppercase tracking-wider">Thêm</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* --- SLIDING RIGHT DRAWER FOR CELL SELECTION --- */}
      {activeCellData && (
        <div className="w-full lg:w-80 shrink-0 bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200 p-5 shadow-lg animate-slideIn flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            
            {/* Header with Close */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                  📅 Cấu hình: {activeCellData.shift.name}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 font-mono">
                  {new Date(activeCellData.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => { setSelectedCell(null); setWarningMsg('') }} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Warning Message Display */}
            {warningMsg && (
              <div className="bg-rose-50 border border-rose-150 text-rose-800 rounded-2xl p-3 text-xs font-semibold leading-relaxed flex items-start gap-2">
                <AlertCircle size={14} className="text-rose-600 shrink-0 mt-0.5 animate-bounce" />
                <span>{warningMsg}</span>
              </div>
            )}

            {/* List of current assignments */}
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">
                Nhân viên đã xếp ({activeCellData.assigned.length})
              </span>
              
              {activeCellData.assigned.length === 0 ? (
                <div className="text-xs text-gray-400 italic bg-gray-50 rounded-2xl p-3 border border-dashed border-gray-200 text-center font-medium">
                  Chưa xếp nhân sự nào
                </div>
              ) : (
                <div className="space-y-2">
                  {activeCellData.assigned.map(s => {
                    const onLeave = isStaffOnLeave(s.staffId, activeCellData.date)
                    return (
                      <div 
                        key={s.id} 
                        className={`flex items-center justify-between p-2 rounded-2xl border transition-all ${
                          onLeave 
                            ? 'bg-rose-50 border-rose-150 text-rose-800' 
                            : 'bg-gray-50/50 border-gray-150 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shrink-0">
                            {s.staffName[0]}
                          </div>
                          <div>
                            <div className="text-xs font-black text-gray-800">{s.staffName}</div>
                            {onLeave && (
                              <div className="text-[9px] font-bold text-rose-600 uppercase tracking-wide flex items-center gap-0.5 mt-0.5">
                                <AlertTriangle size={8} /> Nghỉ phép được duyệt
                              </div>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveStaff(s.id)}
                          className="text-gray-300 hover:text-rose-600 p-1 transition-colors"
                          title="Hủy gán ca"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Add Staff form block */}
            <form onSubmit={handleAddStaff} className="space-y-3 pt-3 border-t border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                Thêm nhân sự trực ca
              </label>
              
              <select 
                required
                className="form-input text-xs rounded-xl py-2 px-3 focus:border-indigo-500"
                value={selectedStaffId}
                onChange={e => { setSelectedStaffId(e.target.value); setWarningMsg('') }}
              >
                <option value="">-- Chọn nhân viên --</option>
                {staffList
                  .filter(u => !activeCellData.assigned.some(a => a.staffId === u.id))
                  .map(u => {
                    const onLeave = isStaffOnLeave(u.id, activeCellData.date)
                    const otherShifts = getStaffOtherShifts(u.id, activeCellData.date, activeCellData.shiftId)
                    const workloadCount = getStaffShiftsCount(u.id, activeCellData.date)

                    let suffix = ''
                    if (onLeave) suffix += ' [Nghỉ phép]'
                    else {
                      if (otherShifts.length > 0) suffix += ` [Trực ca ${otherShifts.map(x => x.shift.name.split(' ')[1]).join('/')}]`
                      if (workloadCount >= 2) suffix += ' [Quá tải ⚠️]'
                    }

                    return (
                      <option 
                        key={u.id} 
                        value={u.id}
                        disabled={onLeave}
                        className={onLeave ? 'text-gray-300 font-normal line-through' : ''}
                      >
                        {u.fullName} — {u.position}{suffix}
                      </option>
                    )
                  })}
              </select>

              {/* Show immediate validation warning before assigning if selecting an overlapping staff */}
              {selectedStaffId && (() => {
                const selUser = staffList.find(u => u.id === selectedStaffId)
                if (!selUser) return null
                const shiftsCount = getStaffShiftsCount(selUser.id, activeCellData.date)
                const isOverlapping = getStaffOtherShifts(selUser.id, activeCellData.date, activeCellData.shiftId).length > 0
                
                if (shiftsCount >= 2 || isOverlapping) {
                  return (
                    <div className="bg-amber-50 border border-amber-150 text-amber-800 rounded-2xl p-2.5 text-[10px] font-semibold leading-relaxed flex items-start gap-1.5">
                      <AlertTriangle size={12} className="text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        {isOverlapping && <div>• Trùng ca: Nhân viên đã trực ca khác trong ngày.</div>}
                        {shiftsCount >= 2 && <div>• Cảnh báo quá tải: Trực ca thứ {shiftsCount + 1} trong ngày.</div>}
                      </div>
                    </div>
                  )
                }
                return null
              })()}

              <button 
                type="submit"
                disabled={!selectedStaffId}
                className="w-full btn-primary py-2 text-xs font-bold justify-center rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100"
              >
                <UserPlus size={13} /> Thêm & Lưu ca trực
              </button>
            </form>

          </div>

          <div className="pt-2">
            <button 
              type="button" 
              onClick={() => { setSelectedCell(null); setWarningMsg('') }}
              className="w-full btn-secondary py-2 text-xs font-bold justify-center rounded-2xl"
            >
              Đóng bảng quản lý
            </button>
          </div>

        </div>
      )}

    </div>
  )
}
