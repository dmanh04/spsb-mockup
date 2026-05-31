import { LayoutDashboard, ListOrdered, CalendarDays, LogIn, LogOut, Package, CalendarCheck } from 'lucide-react'
import BaseLayout, { type NavItem } from './_BaseLayout'

const NAV: NavItem[] = [
  { to: '/operation', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/operation/queue', label: 'Hàng chờ booking', icon: ListOrdered, badge: 3 },
  { to: '/operation/calendar', label: 'Lịch theo phòng', icon: CalendarDays },
  { to: '/operation/checkin', label: 'Check-in', icon: LogIn },
  { to: '/operation/checkout', label: 'Checkout & Thu tiền', icon: LogOut },
  { to: '/operation/orders', label: 'Đơn hàng', icon: Package },
  { to: '/operation/my-schedule', label: 'Lịch làm việc', icon: CalendarCheck },
]

export default function OperationLayout() {
  return (
    <BaseLayout
      title="Cổng Vận hành"
      subtitle="Operation Staff"
      accentClass="bg-orange-500"
      navItems={NAV}
    />
  )
}
