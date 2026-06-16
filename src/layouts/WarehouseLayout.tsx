import { LayoutDashboard, PackagePlus, PackageMinus, ArrowLeftRight, History, Truck, BarChart3 } from 'lucide-react'
import BaseLayout, { type NavItem } from './_BaseLayout'

const NAV: NavItem[] = [
  { to: '/warehouse', label: 'Dashboard kho', icon: LayoutDashboard },
  { to: '/warehouse/stock-in', label: 'Nhập kho', icon: PackagePlus },
  { to: '/warehouse/stock-out', label: 'Xuất kho', icon: PackageMinus },
  { to: '/warehouse/transfers', label: 'Phiếu chuyển kho', icon: ArrowLeftRight, badge: 2 },
  { to: '/warehouse/history', label: 'Lịch sử kho', icon: History },
  { to: '/warehouse/suppliers', label: 'Mua hàng & NCC', icon: Truck },
  { to: '/warehouse/reports', label: 'Báo cáo', icon: BarChart3 },
]

export default function WarehouseLayout() {
  return (
    <BaseLayout
      title="Cổng Kho"
      subtitle="Warehouse Manager"
      accentClass="bg-stone-600"
      navItems={NAV}
    />
  )
}
