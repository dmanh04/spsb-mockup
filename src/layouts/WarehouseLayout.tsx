import { LayoutDashboard, PackagePlus, PackageMinus, ArrowLeftRight, History, Truck, BarChart3, ClipboardCheck, ShoppingBag, Grid3X3 } from 'lucide-react'
import BaseLayout, { type NavItem } from './_BaseLayout'

const NAV: NavItem[] = [
  { to: '/warehouse', label: 'Dashboard kho', icon: LayoutDashboard },
  { to: '/warehouse/stock-in', label: 'Nhập kho', icon: PackagePlus },
  { to: '/warehouse/stock-out', label: 'Xuất kho', icon: PackageMinus },
  { to: '/warehouse/products', label: 'Sản phẩm', icon: ShoppingBag },
  { to: '/warehouse/cages', label: 'Quản lý Chuồng', icon: Grid3X3 },
  { to: '/warehouse/transfers', label: 'Phiếu chuyển kho', icon: ArrowLeftRight, badge: 2 },
  { to: '/warehouse/history', label: 'Lịch sử kho', icon: History },
  { to: '/warehouse/replenishments', label: 'Đơn mua hàng PO', icon: ClipboardCheck },
  { to: '/warehouse/suppliers', label: 'Nhà cung cấp', icon: Truck },
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
