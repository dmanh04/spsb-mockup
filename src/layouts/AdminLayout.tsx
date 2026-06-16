import {
  LayoutDashboard, Users, Shield, Store, ShoppingBag, Layers,
  Scissors, CalendarCheck, Warehouse, Tag, BarChart3, Bot, Settings, Truck
} from 'lucide-react'
import BaseLayout, { type NavItem } from './_BaseLayout'

const NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
  { to: '/admin/roles', label: 'Phân quyền', icon: Shield },
  { to: '/admin/shops', label: 'Chi nhánh', icon: Store },
  { to: '/admin/products', label: 'Sản phẩm', icon: ShoppingBag },
  { to: '/admin/product-categories', label: 'Danh mục SP', icon: Layers },
  { to: '/admin/services', label: 'Dịch vụ', icon: Scissors },
  { to: '/admin/bookings', label: 'Booking', icon: CalendarCheck },
  { to: '/admin/inventory', label: 'Tồn kho', icon: Warehouse },
  { to: '/admin/suppliers', label: 'Nhà cung cấp', icon: Truck },
  { to: '/admin/vouchers', label: 'Voucher & KM', icon: Tag },
  { to: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
  { to: '/admin/ai/breed', label: 'AI Nhận diện', icon: Bot },
  { to: '/admin/settings', label: 'Cài đặt', icon: Settings },
]

export default function AdminLayout() {
  return (
    <BaseLayout
      title="Cổng Quản trị"
      subtitle="System Admin"
      accentClass="bg-red-500"
      navItems={NAV}
    />
  )
}
