import {
  LayoutDashboard, Users, Store, Package, Scissors, PawPrint,
  CalendarCheck, DoorOpen, ShoppingCart, Warehouse, Truck,
  Tag, Megaphone, Bell, Cpu, ChevronRight, BarChart2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface MenuItem {
  label: string
  path: string
  icon?: LucideIcon
  children?: MenuItem[]
}

export const adminMenu: MenuItem[] = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  {
    label: 'Quản lý người dùng', path: '/admin/users', icon: Users,
    children: [
      { label: 'Danh sách người dùng', path: '/admin/users', icon: ChevronRight },
      { label: 'Phân quyền', path: '/admin/users/roles', icon: ChevronRight },
    ],
  },
  {
    label: 'Quản lý cửa hàng', path: '/admin/shops', icon: Store,
    children: [
      { label: 'Danh sách chi nhánh', path: '/admin/shops', icon: ChevronRight },
      { label: 'Phân công nhân viên', path: '/admin/shops/staff', icon: ChevronRight },
    ],
  },
  {
    label: 'Quản lý sản phẩm', path: '/admin/products', icon: Package,
    children: [
      { label: 'Danh sách sản phẩm', path: '/admin/products', icon: ChevronRight },
      { label: 'Danh mục sản phẩm', path: '/admin/products/categories', icon: ChevronRight },
      { label: 'Đánh giá sản phẩm', path: '/admin/products/reviews', icon: ChevronRight },
    ],
  },
  {
    label: 'Quản lý dịch vụ', path: '/admin/services', icon: Scissors,
    children: [
      { label: 'Danh sách dịch vụ', path: '/admin/services', icon: ChevronRight },
      { label: 'Đánh giá dịch vụ', path: '/admin/services/reviews', icon: ChevronRight },
    ],
  },
  { label: 'Hồ sơ thú cưng', path: '/admin/pets', icon: PawPrint },
  {
    label: 'Quản lý đặt lịch', path: '/admin/bookings', icon: CalendarCheck,
    children: [
      { label: 'Danh sách đặt lịch', path: '/admin/bookings', icon: ChevronRight },
      { label: 'Quản lý phòng', path: '/admin/rooms', icon: DoorOpen },
    ],
  },
  {
    label: 'Quản lý đơn hàng', path: '/admin/orders', icon: ShoppingCart,
  },
  {
    label: 'Quản lý kho', path: '/admin/inventory', icon: Warehouse,
    children: [
      { label: 'Tổng quan kho', path: '/admin/inventory', icon: BarChart2 },
      { label: 'Nhập/Xuất kho', path: '/admin/inventory/transactions', icon: ChevronRight },
      { label: 'Yêu cầu chuyển kho', path: '/admin/inventory/transfer', icon: ChevronRight },
    ],
  },
  { label: 'Nhà cung cấp', path: '/admin/suppliers', icon: Truck },
  { label: 'Voucher', path: '/admin/vouchers', icon: Tag },
  { label: 'Khuyến mãi', path: '/admin/promotions', icon: Megaphone },
  { label: 'Thông báo', path: '/admin/notifications', icon: Bell },
  {
    label: 'AI Features', path: '/admin/ai', icon: Cpu,
    children: [
      { label: 'Nhận diện giống', path: '/admin/ai/breed', icon: ChevronRight },
      { label: 'AI Chatbot', path: '/admin/ai/chatbot', icon: ChevronRight },
    ],
  },
]
