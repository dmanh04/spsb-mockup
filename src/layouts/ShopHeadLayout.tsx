import {
  LayoutDashboard, Users, CalendarDays, FileCheck,
  CalendarCheck, DoorOpen, ShoppingBag, Package, Tag, BarChart3,
} from 'lucide-react'
import BaseLayout, { type NavItem } from './_BaseLayout'

const NAV: NavItem[] = [
  { to: '/shop-head', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/shop-head/staff', label: 'Nhân viên', icon: Users },
  { to: '/shop-head/schedule', label: 'Xếp ca làm việc', icon: CalendarDays },
  { to: '/shop-head/leave-requests', label: 'Đơn xin nghỉ', icon: FileCheck, badge: 2 },
  { to: '/shop-head/bookings', label: 'Booking chi nhánh', icon: CalendarCheck },
  { to: '/shop-head/rooms', label: 'Quản lý phòng', icon: DoorOpen },
  { to: '/shop-head/products', label: 'Sản phẩm', icon: ShoppingBag },
  { to: '/shop-head/orders', label: 'Đơn hàng', icon: Package },
  { to: '/shop-head/vouchers', label: 'Voucher', icon: Tag },
  { to: '/shop-head/reports', label: 'Báo cáo', icon: BarChart3 },
]

export default function ShopHeadLayout() {
  return (
    <BaseLayout
      title="Cổng Quản lý CN"
      subtitle="Shop Head"
      accentClass="bg-indigo-500"
      navItems={NAV}
    />
  )
}
