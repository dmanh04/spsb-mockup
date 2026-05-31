import { CalendarDays, ClipboardList, PawPrint, CalendarCheck } from 'lucide-react'
import BaseLayout, { type NavItem } from './_BaseLayout'

const NAV: NavItem[] = [
  { to: '/petcare', label: 'Lịch hôm nay', icon: CalendarDays, badge: 4 },
  { to: '/petcare/bookings', label: 'Chi tiết booking', icon: ClipboardList },
  { to: '/petcare/pets', label: 'Lịch sử thú cưng', icon: PawPrint },
  { to: '/petcare/my-schedule', label: 'Lịch làm việc', icon: CalendarCheck },
]

export default function PetCareLayout() {
  return (
    <BaseLayout
      title="Cổng Chăm sóc"
      subtitle="Pet Care Staff"
      accentClass="bg-green-500"
      navItems={NAV}
    />
  )
}
