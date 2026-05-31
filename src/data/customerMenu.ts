import type { LucideIcon } from 'lucide-react'
import {
  Home, Package, Scissors, PawPrint, ShoppingCart,
  ClipboardList, CalendarCheck, Bell, User,
} from 'lucide-react'

export interface CustomerMenuItem {
  label: string
  path: string
  icon?: LucideIcon
}

export const customerMenu: CustomerMenuItem[] = [
  { label: 'Trang chủ', path: '/', icon: Home },
  { label: 'Sản phẩm', path: '/products', icon: Package },
  { label: 'Dịch vụ', path: '/services', icon: Scissors },
  { label: 'Thú cưng của tôi', path: '/my-pets', icon: PawPrint },
  { label: 'Giỏ hàng', path: '/cart', icon: ShoppingCart },
  { label: 'Đơn hàng', path: '/orders', icon: ClipboardList },
  { label: 'Đặt lịch', path: '/bookings', icon: CalendarCheck },
  { label: 'Thông báo', path: '/notifications', icon: Bell },
  { label: 'Tài khoản', path: '/profile', icon: User },
]
