import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import StaffScheduleGrid from '@/components/schedule/StaffScheduleGrid'
import { useAuthContext } from '@/auth/AuthContext'

function getWeekDates(startDate: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

export default function SchedulePage() {
  const { currentUser } = useAuthContext()
  const [weekStart, setWeekStart] = useState(new Date('2026-06-01'))

  const weekDates = getWeekDates(weekStart)
  const weekLabel = `${new Date(weekDates[0]).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} – ${new Date(weekDates[6]).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`

  function prevWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }

  function nextWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Xếp ca làm việc</h1>
          <p className="text-sm text-gray-500">Bấm vào ô để thêm / xóa nhân viên</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="btn-secondary py-1.5 px-2"><ChevronLeft size={16} /></button>
          <span className="text-sm font-medium text-gray-700 min-w-36 text-center">{weekLabel}</span>
          <button onClick={nextWeek} className="btn-secondary py-1.5 px-2"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-400" /><span className="text-gray-600">Ca sáng (07–12h)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-400" /><span className="text-gray-600">Ca chiều (12–17h)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-purple-400" /><span className="text-gray-600">Ca tối (17–21h)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-100 border border-red-200" /><span className="text-gray-600">Nghỉ phép (đã duyệt)</span></div>
      </div>

      <StaffScheduleGrid shopId={currentUser?.shopId ?? 'SH01'} weekDates={weekDates} />
    </div>
  )
}
