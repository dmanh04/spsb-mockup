import { useState } from 'react'
import {
  Plus, X, AlertTriangle, UserPlus, CheckCircle, AlertCircle, Info,
  Sparkles, Copy, BarChart3, ArrowLeftRight, Check, Trash2, Calendar
} from 'lucide-react'
import { SCHEDULE_MOCK_LIST, SHIFT_TEMPLATES, saveSchedules } from '@/data/schedulesMockData'
import { LEAVE_REQUEST_MOCK_LIST, SHIFT_SWAP_MOCK_LIST, saveShiftSwaps } from '@/data/leaveRequestMockData'
import { USER_MOCK_LIST } from '@/data/userMockData'
import type { StaffSchedule, ShiftSwapRequest } from '@/types'

interface Props {
  shopId: string
  weekDates: string[]  // 7 date strings YYYY-MM-DD
}

export default function StaffScheduleGrid({ shopId, weekDates }: Props) {
  const [schedules, setSchedules] = useState<StaffSchedule[]>(() => SCHEDULE_MOCK_LIST)
  const [swaps, setSwaps] = useState<ShiftSwapRequest[]>(() => SHIFT_SWAP_MOCK_LIST)

  const [selectedCell, setSelectedCell] = useState<{ date: string; shiftId: string } | null>(null)
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [warningMsg, setWarningMsg] = useState('')

  // Multi-panel active state
  const [activePanel, setActivePanel] = useState<'cell' | 'copier' | 'ai' | 'coverage' | 'swap' | null>(null)

  // Copier state variables
  const [copierMode, setCopierMode] = useState<'overwrite' | 'merge'>('merge')
  const [copierSuccess, setCopierSuccess] = useState('')

  // AI draft state variables
  const [aiMode, setAiMode] = useState<'fill' | 'rebuild'>('rebuild')
  const [aiWorkloadLimit, setAiWorkloadLimit] = useState(true)
  const [aiDraftSchedules, setAiDraftSchedules] = useState<StaffSchedule[] | null>(null)
  const [aiSuccess, setAiSuccess] = useState('')

  // Swap requests state variables
  const [swapFeedback, setSwapFeedback] = useState('')

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

  // Helper to subtract 7 days from a date string (YYYY-MM-DD)
  function getPrevWeekDate(dateStr: string): string {
    const d = new Date(dateStr)
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  }

  // 1. Week Copier Logic
  const prevWeekDates = weekDates.map(getPrevWeekDate)
  const prevWeekSchedules = schedules.filter(s => s.shopId === shopId && prevWeekDates.includes(s.date))

  const copierAnalysis = prevWeekSchedules.map(prevSched => {
    const targetDate = weekDates[prevWeekDates.indexOf(prevSched.date)]
    const onLeave = isStaffOnLeave(prevSched.staffId, targetDate)
    return {
      prevSched,
      targetDate,
      onLeave,
    }
  })

  const validCopierCount = copierAnalysis.filter(x => !x.onLeave).length
  const conflictCopierCount = copierAnalysis.filter(x => x.onLeave).length

  function handleExecuteCopy() {
    let updatedSchedules = [...schedules]
    if (copierMode === 'overwrite') {
      updatedSchedules = updatedSchedules.filter(s => !(s.shopId === shopId && weekDates.includes(s.date)))
    }

    let addedCount = 0
    copierAnalysis.forEach(({ prevSched, targetDate, onLeave }) => {
      if (onLeave) return // Skip if on leave

      if (copierMode === 'merge') {
        const alreadyAssigned = updatedSchedules.some(s =>
          s.shopId === shopId &&
          s.date === targetDate &&
          s.shiftId === prevSched.shiftId &&
          s.staffId === prevSched.staffId
        )
        if (alreadyAssigned) return
      }

      const newSched: StaffSchedule = {
        id: `SC-COPY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        staffId: prevSched.staffId,
        staffName: prevSched.staffName,
        shopId: shopId,
        date: targetDate,
        shiftId: prevSched.shiftId,
        shift: prevSched.shift,
        status: 'scheduled'
      }
      updatedSchedules.push(newSched)
      addedCount++
    })

    setSchedules(updatedSchedules)
    saveSchedules(updatedSchedules)
    setCopierSuccess(`Đã sao chép thành công ${addedCount} ca trực từ tuần trước!`)
    setTimeout(() => setCopierSuccess(''), 4000)
  }

  // 2. AI Auto-Scheduler Logic
  function handleGenerateAiSchedule() {
    let baseSchedules = [...schedules]
    if (aiMode === 'rebuild') {
      baseSchedules = baseSchedules.filter(s => !(s.shopId === shopId && weekDates.includes(s.date)))
    }

    const newGenerated: StaffSchedule[] = []

    weekDates.forEach(date => {
      SHIFT_TEMPLATES.forEach(shift => {
        const existingInCell = baseSchedules.filter(s => s.shopId === shopId && s.date === date && s.shiftId === shift.id)

        const hasReceptionist = existingInCell.some(s => {
          const u = staffList.find(x => x.id === s.staffId)
          return u?.role === 'operation_staff'
        })
        const hasPetcare = existingInCell.some(s => {
          const u = staffList.find(x => x.id === s.staffId)
          return u?.role === 'petcare_staff'
        })

        const getDailyShiftCountForStaff = (staffId: string, d: string, tempGenerated: StaffSchedule[]) => {
          const inBase = baseSchedules.filter(s => s.staffId === staffId && s.date === d).length
          const inTemp = tempGenerated.filter(s => s.staffId === staffId && s.date === d).length
          return inBase + inTemp
        }

        const getWeeklyShiftCountForStaff = (staffId: string, tempGenerated: StaffSchedule[]) => {
          const inBase = baseSchedules.filter(s => s.staffId === staffId && weekDates.includes(s.date)).length
          const inTemp = tempGenerated.filter(s => s.staffId === staffId).length
          return inBase + inTemp
        }

        // Assign Receptionist
        if (!hasReceptionist) {
          const availableReceptionists = staffList.filter(u => {
            if (u.role !== 'operation_staff') return false
            if (isStaffOnLeave(u.id, date)) return false
            const inCell = existingInCell.some(s => s.staffId === u.id) || newGenerated.some(s => s.date === date && s.shiftId === shift.id && s.staffId === u.id)
            if (inCell) return false
            if (aiWorkloadLimit && getDailyShiftCountForStaff(u.id, date, newGenerated) >= 1) return false
            return true
          })

          availableReceptionists.sort((a, b) => {
            return getWeeklyShiftCountForStaff(a.id, newGenerated) - getWeeklyShiftCountForStaff(b.id, newGenerated)
          })

          if (availableReceptionists.length > 0) {
            const selected = availableReceptionists[0]
            newGenerated.push({
              id: `SC-AI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              staffId: selected.id,
              staffName: selected.fullName,
              shopId: shopId,
              date: date,
              shiftId: shift.id,
              shift: shift,
              status: 'scheduled'
            })
          }
        }

        // Assign Petcare
        if (!hasPetcare) {
          const availablePetcare = staffList.filter(u => {
            if (u.role !== 'petcare_staff') return false
            if (isStaffOnLeave(u.id, date)) return false
            const inCell = existingInCell.some(s => s.staffId === u.id) || newGenerated.some(s => s.date === date && s.shiftId === shift.id && s.staffId === u.id)
            if (inCell) return false
            if (aiWorkloadLimit && getDailyShiftCountForStaff(u.id, date, newGenerated) >= 1) return false
            return true
          })

          availablePetcare.sort((a, b) => {
            return getWeeklyShiftCountForStaff(a.id, newGenerated) - getWeeklyShiftCountForStaff(b.id, newGenerated)
          })

          if (availablePetcare.length > 0) {
            const selected = availablePetcare[0]
            newGenerated.push({
              id: `SC-AI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              staffId: selected.id,
              staffName: selected.fullName,
              shopId: shopId,
              date: date,
              shiftId: shift.id,
              shift: shift,
              status: 'scheduled'
            })
          }
        }
      })
    })

    setAiDraftSchedules(newGenerated)
  }

  function handleApplyAiSchedule() {
    if (!aiDraftSchedules) return
    let updated = [...schedules]
    if (aiMode === 'rebuild') {
      updated = updated.filter(s => !(s.shopId === shopId && weekDates.includes(s.date)))
    }
    updated.push(...aiDraftSchedules)
    setSchedules(updated)
    saveSchedules(updated)
    setAiDraftSchedules(null)
    setAiSuccess('Đã áp dụng lịch trực tự động thành công!')
    setTimeout(() => setAiSuccess(''), 4000)
  }

  // 3. Weekly Workload & Coverage analysis
  const staffWorkloads = staffList.map(u => {
    const weeklyShifts = schedules.filter(s => s.staffId === u.id && s.shopId === shopId && weekDates.includes(s.date))
    return {
      staff: u,
      count: weeklyShifts.length,
    }
  })

  const coverageGaps: { date: string; shiftId: string; shiftName: string; type: 'empty' | 'missing_receptionist' | 'missing_petcare'; label: string }[] = []

  weekDates.forEach(date => {
    SHIFT_TEMPLATES.forEach(shift => {
      const cell = getCellSchedules(date, shift.id)
      if (cell.length === 0) {
        coverageGaps.push({
          date,
          shiftId: shift.id,
          shiftName: shift.name,
          type: 'empty',
          label: 'Ca trống hoàn toàn ❌'
        })
      } else {
        const hasRep = cell.some(s => {
          const u = staffList.find(x => x.id === s.staffId)
          return u?.role === 'operation_staff'
        })
        const hasPet = cell.some(s => {
          const u = staffList.find(x => x.id === s.staffId)
          return u?.role === 'petcare_staff'
        })

        if (!hasRep) {
          coverageGaps.push({
            date,
            shiftId: shift.id,
            shiftName: shift.name,
            type: 'missing_receptionist',
            label: 'Thiếu lễ tân ⚠️'
          })
        }
        if (!hasPet) {
          coverageGaps.push({
            date,
            shiftId: shift.id,
            shiftName: shift.name,
            type: 'missing_petcare',
            label: 'Thiếu NV chăm sóc ⚠️'
          })
        }
      }
    })
  })

  function handleGoToCell(date: string, shiftId: string) {
    setSelectedCell({ date, shiftId })
    setActivePanel('cell')
    setWarningMsg('')
  }

  // 4. Swap Requests logic
  const currentWeekSwaps = swaps.filter(swap => {
    if (swap.status !== 'pending') return false
    const reqSched = schedules.find(s => s.id === swap.requesterScheduleId)
    const tarSched = schedules.find(s => s.id === swap.targetScheduleId)
    const isReqInWeek = reqSched && reqSched.shopId === shopId && weekDates.includes(reqSched.date)
    const isTarInWeek = tarSched && tarSched.shopId === shopId && weekDates.includes(tarSched.date)
    return isReqInWeek || isTarInWeek
  })

  const getCellSwapRequest = (date: string, shiftId: string) => {
    const cellScheds = getCellSchedules(date, shiftId)
    return currentWeekSwaps.find(sw =>
      cellScheds.some(s => s.id === sw.requesterScheduleId || s.id === sw.targetScheduleId)
    )
  }

  function handleApproveSwap(swap: ShiftSwapRequest) {
    const s1Index = schedules.findIndex(s => s.id === swap.requesterScheduleId)
    const s2Index = schedules.findIndex(s => s.id === swap.targetScheduleId)

    if (s1Index === -1 || s2Index === -1) {
      setSwapFeedback('Không tìm thấy ca trực tương ứng để hoán đổi!')
      return
    }

    const updatedSchedules = [...schedules]
    const s1 = { ...updatedSchedules[s1Index] }
    const s2 = { ...updatedSchedules[s2Index] }

    const tempStaffId = s1.staffId
    const tempStaffName = s1.staffName

    s1.staffId = s2.staffId
    s1.staffName = s2.staffName

    s2.staffId = tempStaffId
    s2.staffName = tempStaffName

    updatedSchedules[s1Index] = s1
    updatedSchedules[s2Index] = s2

    const updatedSwaps = swaps.map(sw => {
      if (sw.id === swap.id) {
        return {
          ...sw,
          status: 'approved' as const,
          reviewedBy: 'Nguyễn Quang Minh',
          reviewedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      }
      return sw
    })

    setSchedules(updatedSchedules)
    saveSchedules(updatedSchedules)
    setSwaps(updatedSwaps)
    saveShiftSwaps(updatedSwaps)

    setSwapFeedback('Phê duyệt đổi ca thành công!')
    setTimeout(() => setSwapFeedback(''), 3000)
  }

  function handleRejectSwap(swap: ShiftSwapRequest) {
    const updatedSwaps = swaps.map(sw => {
      if (sw.id === swap.id) {
        return {
          ...sw,
          status: 'rejected' as const,
          reviewedBy: 'Nguyễn Quang Minh',
          reviewedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      }
      return sw
    })

    setSwaps(updatedSwaps)
    saveShiftSwaps(updatedSwaps)

    setSwapFeedback('Đã từ chối yêu cầu đổi ca.')
    setTimeout(() => setSwapFeedback(''), 3000)
  }

  function handleRemoveStaff(schedId: string) {
    const updated = schedules.filter(s => s.id !== schedId)
    setSchedules(updated)
    saveSchedules(updated)
    setWarningMsg('')
  }

  function handleAddStaff(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCell || !selectedStaffId) return

    const staff = staffList.find(u => u.id === selectedStaffId)
    if (!staff) return

    const { date, shiftId } = selectedCell

    if (isStaffOnLeave(staff.id, date)) {
      setWarningMsg(`Không thể xếp ca: Nhân viên ${staff.fullName} đang nghỉ phép trong ngày này!`)
      return
    }

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
    <div className="space-y-6">
      {/* TOOLBAR CONTROLS */}
      <div className="flex flex-wrap items-center gap-3 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-gray-150 shadow-sm">
        <span className="text-xs font-black text-gray-400 uppercase tracking-wider mr-2">Công cụ nâng cao:</span>
        <button
          onClick={() => { setActivePanel('copier'); setSelectedCell(null); }}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
            activePanel === 'copier'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Copy size={14} /> Sao chép ca tuần trước
        </button>

        <button
          onClick={() => { setActivePanel('ai'); setSelectedCell(null); setAiDraftSchedules(null); }}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
            activePanel === 'ai'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Sparkles className="text-amber-500 animate-pulse" size={14} /> Tự động xếp ca AI
        </button>

        <button
          onClick={() => { setActivePanel('coverage'); setSelectedCell(null); }}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
            activePanel === 'coverage'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <BarChart3 size={14} /> Độ phủ & Công suất
        </button>

        <button
          onClick={() => { setActivePanel('swap'); setSelectedCell(null); }}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all relative ${
            activePanel === 'swap'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ArrowLeftRight size={14} /> Đổi ca chờ duyệt
          {currentWeekSwaps.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center border-2 border-white animate-bounce">
              {currentWeekSwaps.length}
            </span>
          )}
        </button>
      </div>

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
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: shift.color }} />
                  <span className="text-xs font-black text-gray-800">{shift.name}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-bold mt-1 font-mono">{shift.startTime} – {shift.endTime}</span>
              </div>

              {/* Shift cells per date */}
              {dayLabels.map(d => {
                const cell = getCellSchedules(d.date, shift.id)
                const hasLeaveConflict = cell.some(s => isStaffOnLeave(s.staffId, d.date))
                const swapReq = getCellSwapRequest(d.date, shift.id)
                const isSelected = selectedCell?.date === d.date && selectedCell?.shiftId === shift.id

                return (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => {
                      setSelectedCell({ date: d.date, shiftId: shift.id })
                      setActivePanel('cell')
                      setWarningMsg('')
                    }}
                    className={`px-2 py-3.5 border-l border-gray-100 min-h-24 hover:bg-gray-50/50 transition-all text-left align-top flex flex-col justify-between group ${
                      isSelected ? 'bg-indigo-50/40 ring-2 ring-indigo-500 ring-inset border-transparent' : ''
                    }`}
                  >
                    <div className="space-y-1.5 w-full">
                      {/* Leave/Conflict Warning */}
                      {hasLeaveConflict && (
                        <div className="flex items-center gap-1 bg-rose-50 text-rose-700 font-black text-[9px] px-1.5 py-0.5 rounded border border-rose-100 animate-pulse">
                          <AlertTriangle size={9} /> Nghỉ phép
                        </div>
                      )}

                      {/* Swap request indicator on the cell */}
                      {swapReq && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation()
                            setActivePanel('swap')
                            setSelectedCell(null)
                          }}
                          className="flex items-center gap-1 bg-amber-50 text-amber-700 font-black text-[9px] px-1.5 py-0.5 rounded border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                        >
                          🔄 Đổi ca chờ duyệt
                        </div>
                      )}

                      {cell.map(s => {
                        const onLeave = isStaffOnLeave(s.staffId, d.date)
                        const isPartOfSwap = swapReq && (swapReq.requesterScheduleId === s.id || swapReq.targetScheduleId === s.id)
                        return (
                          <div
                            key={s.id}
                            className={`flex items-center justify-between px-2 py-1 rounded-lg text-[10px] font-bold ${
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
                            <div className="flex items-center gap-1.5 truncate">
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: onLeave ? '#F43F5E' : shift.color }} />
                              <span className="truncate">{s.staffName.split(' ').slice(-1)[0]}</span>
                            </div>
                            {isPartOfSwap && <span className="text-[8px] text-amber-600 animate-bounce">🔄</span>}
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

        {/* --- DYNAMIC SLIDING DRAWER --- */}
        {activePanel && (
          <div className="w-full lg:w-96 shrink-0 bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200 p-5 shadow-lg animate-slideIn flex flex-col justify-between space-y-4 min-h-[450px]">
            <div className="space-y-4">
              
              {/* PANEL HEADER */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                    {activePanel === 'cell' && activeCellData && `📅 Ca trực: ${activeCellData.shift.name}`}
                    {activePanel === 'copier' && `📋 Sao chép ca tuần trước`}
                    {activePanel === 'ai' && `✨ Tự động xếp ca AI`}
                    {activePanel === 'coverage' && `📊 Báo cáo Độ phủ & Tải`}
                    {activePanel === 'swap' && `🔄 Đổi ca trực chờ duyệt`}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 font-mono">
                    {activePanel === 'cell' && activeCellData && new Date(activeCellData.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                    {activePanel !== 'cell' && 'Bảng điều khiển thông minh'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setActivePanel(null); setSelectedCell(null); setWarningMsg(''); setAiDraftSchedules(null); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* PANEL BODY CONTENT */}

              {/* A. CELL ASSIGNMENT PANEL */}
              {activePanel === 'cell' && activeCellData && (
                <div className="space-y-4">
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
                      Nhân sự trong ca ({activeCellData.assigned.length})
                    </span>
                    
                    {activeCellData.assigned.length === 0 ? (
                      <div className="text-xs text-gray-400 italic bg-gray-50 rounded-2xl p-3 border border-dashed border-gray-200 text-center font-medium">
                        Chưa có nhân sự trực ca này
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeCellData.assigned.map(s => {
                          const onLeave = isStaffOnLeave(s.staffId, activeCellData.date)
                          return (
                            <div
                              key={s.id}
                              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                                onLeave
                                  ? 'bg-rose-50 border-rose-150 text-rose-800'
                                  : 'bg-gray-50/50 border-gray-150 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shrink-0">
                                  {s.staffName[0]}
                                </div>
                                <div>
                                  <div className="text-xs font-black text-gray-800">{s.staffName}</div>
                                  {onLeave && (
                                    <div className="text-[9px] font-bold text-rose-600 uppercase tracking-wide flex items-center gap-0.5 mt-0.5 animate-pulse">
                                      <AlertTriangle size={8} /> Nghỉ phép đã duyệt
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveStaff(s.id)}
                                className="text-gray-300 hover:text-rose-600 p-1.5 transition-colors"
                                title="Xóa nhân sự"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Add Staff Form */}
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
                            if (workloadCount >= 1) suffix += ' [Trùng ngày ⚠️]'
                          }

                          return (
                            <option
                              key={u.id}
                              value={u.id}
                              disabled={onLeave}
                              className={onLeave ? 'text-gray-300 font-normal line-through' : ''}
                            >
                              {u.fullName} — {u.position === 'Groomer' ? 'NV Grooming' : u.position === 'Spa Specialist' ? 'KTV Spa' : 'Lễ tân'}{suffix}
                            </option>
                          )
                        })}
                    </select>

                    {selectedStaffId && (() => {
                      const selUser = staffList.find(u => u.id === selectedStaffId)
                      if (!selUser) return null
                      const shiftsCount = getStaffShiftsCount(selUser.id, activeCellData.date)
                      const isOverlapping = getStaffOtherShifts(selUser.id, activeCellData.date, activeCellData.shiftId).length > 0
                      
                      if (shiftsCount >= 1 || isOverlapping) {
                        return (
                          <div className="bg-amber-50 border border-amber-150 text-amber-800 rounded-2xl p-2.5 text-[10px] font-semibold leading-relaxed flex items-start gap-1.5">
                            <AlertTriangle size={12} className="text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              {isOverlapping && <div>• Trùng ca: Nhân sự đã có ca trực khác cùng ngày.</div>}
                              {shiftsCount >= 1 && <div>• Cân bằng công suất: Nhân sự trực sang ca thứ {shiftsCount + 1} trong ngày.</div>}
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
              )}

              {/* B. WEEK COPIER PANEL */}
              {activePanel === 'copier' && (
                <div className="space-y-4">
                  {copierSuccess && (
                    <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-2xl p-3 text-xs font-semibold leading-relaxed flex items-start gap-2 animate-bounce">
                      <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{copierSuccess}</span>
                    </div>
                  )}

                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-900 space-y-2 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 text-indigo-950">
                      <Info size={14} /> Nghiệp vụ sao chép lịch trực:
                    </p>
                    <p>Hệ thống tự động quét lịch làm việc của chi nhánh từ tuần trước và sao chép chính xác sang tuần này (Dịch chuyển +7 ngày).</p>
                    <p className="font-bold text-rose-700">🛡️ Tự động loại trừ nhân sự đã có đơn xin nghỉ phép được phê duyệt trong tuần này!</p>
                  </div>

                  <div className="border border-gray-150 rounded-2xl p-3 bg-gray-50/50 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-500">Ca trực tìm thấy ở tuần trước:</span>
                      <span className="font-black text-gray-800">{prevWeekSchedules.length} ca</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-600 flex items-center gap-1"><Check size={12} /> Hợp lệ để chép:</span>
                      <span className="font-black text-emerald-700">{validCopierCount} ca</span>
                    </div>
                    {conflictCopierCount > 0 && (
                      <div className="flex justify-between items-center text-xs bg-rose-50 p-1.5 rounded-lg border border-rose-100">
                        <span className="font-bold text-rose-600 flex items-center gap-1"><AlertTriangle size={12} /> Xung đột lịch nghỉ:</span>
                        <span className="font-black text-rose-700">{conflictCopierCount} ca bị bỏ qua</span>
                      </div>
                    )}
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Tùy chọn sao chép</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setCopierMode('merge')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          copierMode === 'merge'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Chỉ điền ô trống
                      </button>
                      <button
                        onClick={() => setCopierMode('overwrite')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          copierMode === 'overwrite'
                            ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Ghi đè hoàn toàn
                      </button>
                    </div>
                  </div>

                  {/* Conflicting Shifts Alert */}
                  {conflictCopierCount > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Chi tiết xung đột (Sẽ bị bỏ qua):</span>
                      <div className="max-h-24 overflow-y-auto space-y-1 text-[10px] border border-gray-100 p-2 rounded-xl bg-white">
                        {copierAnalysis.filter(x => x.onLeave).map((item, i) => (
                          <div key={i} className="text-rose-700 font-medium flex items-center gap-1 leading-normal">
                            • {item.prevSched.staffName} ({item.prevSched.shift.name}) - Trùng ngày {item.targetDate}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleExecuteCopy}
                    disabled={prevWeekSchedules.length === 0}
                    className="w-full btn-primary py-2.5 text-xs font-bold justify-center rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100"
                  >
                    <Copy size={13} /> Xác nhận sao chép ca
                  </button>
                </div>
              )}

              {/* C. AI AUTO-SCHEDULER PANEL */}
              {activePanel === 'ai' && (
                <div className="space-y-4">
                  {aiSuccess && (
                    <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-2xl p-3 text-xs font-semibold leading-relaxed flex items-start gap-2 animate-bounce">
                      <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{aiSuccess}</span>
                    </div>
                  )}

                  {/* Constraints Checkbox */}
                  <div className="space-y-3 bg-gray-50 border border-gray-150 p-3 rounded-2xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Hệ thống ràng buộc AI:</span>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 select-none">
                        <input
                          type="checkbox"
                          checked={aiWorkloadLimit}
                          onChange={e => setAiWorkloadLimit(e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Cân bằng tải: Tối đa 1 ca/ngày/nhân sự</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 select-none opacity-80 cursor-not-allowed">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="rounded border-gray-300 text-indigo-600"
                        />
                        <span>Đúng chuyên môn: Lễ tân - Lễ tân, Kỹ thuật - Dịch vụ</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 select-none opacity-80 cursor-not-allowed">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="rounded border-gray-300 text-indigo-600"
                        />
                        <span>Không trùng lịch phép của nhân viên</span>
                      </label>
                    </div>
                  </div>

                  {/* AI Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Chế độ áp dụng</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setAiMode('fill'); setAiDraftSchedules(null); }}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          aiMode === 'fill'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Chỉ xếp ca còn trống
                      </button>
                      <button
                        onClick={() => { setAiMode('rebuild'); setAiDraftSchedules(null); }}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          aiMode === 'rebuild'
                            ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Xóa lịch cũ & Xếp mới
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateAiSchedule}
                    className="w-full btn-secondary py-2.5 text-xs font-bold justify-center rounded-2xl border-indigo-200 hover:bg-indigo-50/50 text-indigo-700 shadow-sm flex items-center gap-1.5"
                  >
                    <Sparkles size={13} className="text-amber-500 animate-spin-slow" /> Chạy thuật toán lập lịch AI
                  </button>

                  {/* DRAFT PREVIEW STATE */}
                  {aiDraftSchedules && (
                    <div className="space-y-3 pt-3 border-t border-gray-100 animate-slideIn">
                      <div className="bg-indigo-900 text-white rounded-2xl p-3 text-xs space-y-1.5 shadow-md">
                        <div className="font-black flex items-center gap-1"><CheckCircle size={13} /> DỰ THẢO LẬP LỊCH AI:</div>
                        <div>• Đã sắp xếp thành công <span className="font-black text-amber-400">{aiDraftSchedules.length} ca trực mới</span>.</div>
                        <div>• Độ rộng tải được tối ưu hóa đồng đều cho tuần này.</div>
                      </div>

                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Xem trước danh sách phân ca AI:</span>
                      <div className="max-h-36 overflow-y-auto border border-gray-150 rounded-2xl divide-y divide-gray-100 text-[10px] bg-white">
                        {aiDraftSchedules.map((draftItem, i) => (
                          <div key={i} className="flex justify-between items-center p-2 hover:bg-gray-50">
                            <div>
                              <span className="font-bold text-gray-800">{draftItem.staffName}</span>
                              <span className="text-[8px] uppercase tracking-wider font-mono text-gray-400 ml-1.5 bg-gray-100 px-1 py-0.5 rounded">
                                {draftItem.shift.name}
                              </span>
                            </div>
                            <span className="font-black text-indigo-600">{new Date(draftItem.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit' })}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          onClick={() => setAiDraftSchedules(null)}
                          className="py-2 text-xs font-bold rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
                        >
                          Hủy bản nháp
                        </button>
                        <button
                          onClick={handleApplyAiSchedule}
                          className="py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-150 transition-all flex items-center justify-center gap-1"
                        >
                          <Check size={12} /> Áp dụng lịch
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* D. WEEKLY COVERAGE & ANALYSIS PANEL */}
              {activePanel === 'coverage' && (
                <div className="space-y-4">
                  {/* Total Weekly Tally per staff */}
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2.5">Thống kê công suất nhân viên:</span>
                    <div className="space-y-2.5">
                      {staffWorkloads.map(({ staff, count }) => {
                        const isOverloaded = count > 5
                        const isUnderutilized = count === 0
                        return (
                          <div key={staff.id} className="bg-gray-50/50 border border-gray-150 rounded-xl p-2.5 space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-gray-800">{staff.fullName} ({staff.position})</span>
                              <span className={`font-black text-[10px] px-2 py-0.5 rounded-full ${
                                isOverloaded ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                isUnderutilized ? 'bg-gray-100 text-gray-500' :
                                'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {count} ca {isOverloaded ? '⚠️ Quá tải' : isUnderutilized ? '💤 Trống ca' : '✅ Tối ưu'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${isOverloaded ? 'bg-amber-500' : 'bg-indigo-600'}`}
                                style={{ width: `${Math.min((count / 6) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Coverage Warnings List */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Cảnh báo thiếu hụt nhân sự ({coverageGaps.length}):</span>
                    {coverageGaps.length === 0 ? (
                      <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-2xl p-3 text-xs font-semibold leading-relaxed flex items-start gap-2">
                        <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>Tuyệt vời! Tất cả các ca trực tuần này đều đã đủ Lễ tân và Nhân viên chăm sóc đạt chuẩn 100% độ phủ!</span>
                      </div>
                    ) : (
                      <div className="max-h-56 overflow-y-auto space-y-2 border border-gray-150 rounded-2xl p-2 bg-gray-50/50">
                        {coverageGaps.map((gap, i) => (
                          <button
                            key={i}
                            onClick={() => handleGoToCell(gap.date, gap.shiftId)}
                            className="w-full text-left bg-white border border-gray-150 hover:border-indigo-400 rounded-xl p-2.5 flex items-center justify-between text-xs transition-all hover:shadow-sm"
                          >
                            <div className="space-y-0.5">
                              <div className="font-black text-gray-800">
                                {new Date(gap.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })} - {gap.shiftName}
                              </div>
                              <div className={`text-[10px] font-bold ${
                                gap.type === 'empty' ? 'text-rose-600' : 'text-amber-600'
                              }`}>
                                {gap.label}
                              </div>
                            </div>
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wide bg-indigo-50 px-2 py-1 rounded-lg">Gán ngay</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* E. SHIFT SWAP APPROVER PANEL */}
              {activePanel === 'swap' && (
                <div className="space-y-4">
                  {swapFeedback && (
                    <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-2xl p-3 text-xs font-semibold leading-relaxed flex items-start gap-2 animate-bounce">
                      <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{swapFeedback}</span>
                    </div>
                  )}

                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-900 space-y-2 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 text-amber-950">
                      <Info size={14} /> Quy trình hoán đổi ca:
                    </p>
                    <p>Khi duyệt yêu cầu, hệ thống sẽ **tự động tráo đổi vị trí của 2 nhân sự** trong danh sách lịch trực, giúp bạn không cần sửa tay từng ô.</p>
                  </div>

                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Yêu cầu đổi ca chờ duyệt ({currentWeekSwaps.length}):</span>

                  {currentWeekSwaps.length === 0 ? (
                    <div className="text-xs text-gray-400 italic bg-gray-50 rounded-2xl p-4 border border-dashed border-gray-200 text-center font-medium">
                      Không có yêu cầu đổi ca nào đang chờ duyệt trong tuần này.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {currentWeekSwaps.map(swap => {
                        const reqSched = schedules.find(s => s.id === swap.requesterScheduleId)
                        const tarSched = schedules.find(s => s.id === swap.targetScheduleId)
                        if (!reqSched || !tarSched) return null

                        return (
                          <div key={swap.id} className="bg-white border border-gray-150 rounded-2xl p-3.5 space-y-3.5 hover:shadow-sm transition-all">
                            {/* Comparison Row */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-indigo-50/50 p-2 rounded-xl border border-indigo-100">
                                <span className="font-black text-indigo-700 text-[10px] block">Người yêu cầu</span>
                                <span className="font-bold text-gray-800 block mt-0.5">{swap.requesterName}</span>
                                <span className="text-[9px] text-gray-500 font-mono mt-1 block">
                                  {new Date(reqSched.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} ({reqSched.shift.name})
                                </span>
                              </div>
                              <div className="bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                                <span className="font-black text-amber-700 text-[10px] block">Người được đề nghị</span>
                                <span className="font-bold text-gray-800 block mt-0.5">{swap.targetStaffName}</span>
                                <span className="text-[9px] text-gray-500 font-mono mt-1 block">
                                  {new Date(tarSched.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} ({tarSched.shift.name})
                                </span>
                              </div>
                            </div>

                            {/* Reason */}
                            <div className="bg-gray-50 p-2.5 rounded-xl text-[10px] font-semibold text-gray-600 leading-normal">
                              <span className="font-bold text-gray-800">Lý do: </span>
                              "{swap.reason}"
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleRejectSwap(swap)}
                                className="py-1.5 text-xs font-bold rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center gap-1"
                              >
                                <X size={12} /> Từ chối
                              </button>
                              <button
                                onClick={() => handleApproveSwap(swap)}
                                className="py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-1"
                              >
                                <Check size={12} /> Duyệt đổi
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* CLOSING BUTTON */}
            <div className="pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => { setActivePanel(null); setSelectedCell(null); setWarningMsg(''); setAiDraftSchedules(null); }}
                className="w-full btn-secondary py-2.5 text-xs font-bold justify-center rounded-2xl"
              >
                Đóng bảng cấu hình
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
