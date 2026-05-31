export type NotifType = 'booking' | 'order' | 'inventory' | 'system' | 'leave' | 'payment'

export interface Notification {
  id: string
  type: NotifType
  title: string
  body: string
  createdAt: string
  read: boolean
  link?: string
  forRoles: string[]
}

export const NOTIFICATION_MOCK_LIST: Notification[] = [
  { id: 'N001', type: 'booking', title: 'Booking mới cần xác nhận', body: 'Phạm Thu Hà vừa đặt lịch Cắt tỉa cho Rex vào 31/05 lúc 13:00', createdAt: '2026-05-31 07:05', read: false, link: '/operation/queue', forRoles: ['operation_staff', 'shop_head'] },
  { id: 'N002', type: 'booking', title: 'Lịch hẹn được xác nhận', body: 'Lịch hẹn BK-001 của bạn đã được xác nhận. Nhân viên: Trần Hùng', createdAt: '2026-05-31 08:00', read: false, link: '/customer/bookings/BK-001', forRoles: ['customer'] },
  { id: 'N003', type: 'inventory', title: 'Cảnh báo tồn kho thấp', body: 'Whiskas Tuna 1.2kg tại SH01 chỉ còn 3 sản phẩm (dưới mức tối thiểu: 5)', createdAt: '2026-05-31 09:00', read: false, link: '/warehouse', forRoles: ['warehouse_manager', 'admin'] },
  { id: 'N004', type: 'order', title: 'Đơn hàng ORD-001 đã giao', body: 'Đơn hàng Royal Canin của bạn đã được giao thành công', createdAt: '2026-05-30 16:30', read: true, link: '/customer/orders/ORD-001', forRoles: ['customer'] },
  { id: 'N005', type: 'leave', title: 'Đơn xin nghỉ cần duyệt', body: 'Trần Hùng xin nghỉ 10–11/06 (Phép năm). Cần duyệt trước 09/06', createdAt: '2026-05-31 09:00', read: false, link: '/shop-head/leave-requests', forRoles: ['shop_head'] },
  { id: 'N006', type: 'payment', title: 'Thanh toán thành công', body: 'Đơn hàng ORD-002 đã được thanh toán qua chuyển khoản — 215.000đ', createdAt: '2026-05-31 09:20', read: true, link: '/customer/orders/ORD-002', forRoles: ['customer'] },
  { id: 'N007', type: 'booking', title: 'Dịch vụ hoàn thành', body: 'Luna — Spa Premium đã hoàn thành. Xem ảnh trước/sau!', createdAt: '2026-05-30 16:00', read: true, link: '/customer/bookings/BK-005', forRoles: ['customer'] },
  { id: 'N008', type: 'system', title: 'Cập nhật hệ thống v2.1', body: 'PetCare System v2.1 — Thêm tính năng xuất báo cáo Excel và tích hợp MoMo', createdAt: '2026-05-28 08:00', read: true, forRoles: ['admin', 'shop_head'] },
  { id: 'N009', type: 'inventory', title: 'Phiếu chuyển kho TF-002 chờ duyệt', body: 'Đặng Thu Hương yêu cầu chuyển 15 Royal Canin + 10 Whiskas từ kho TT về SH02', createdAt: '2026-05-31 08:00', read: false, link: '/warehouse/transfers', forRoles: ['warehouse_manager'] },
  { id: 'N010', type: 'booking', title: 'Được gán booking hôm nay', body: 'Bạn được gán 2 booking: Milo (09:00) và Luna (10:30). Xem chi tiết', createdAt: '2026-05-31 08:05', read: false, link: '/petcare', forRoles: ['petcare_staff'] },
]

export const NOTIF_ICONS: Record<NotifType, string> = {
  booking: '📅', order: '📦', inventory: '⚠️', system: '🔧', leave: '📋', payment: '💳',
}

export const NOTIF_COLORS: Record<NotifType, string> = {
  booking: 'bg-blue-100 text-blue-600',
  order: 'bg-green-100 text-green-600',
  inventory: 'bg-orange-100 text-orange-600',
  system: 'bg-gray-100 text-gray-600',
  leave: 'bg-purple-100 text-purple-600',
  payment: 'bg-emerald-100 text-emerald-600',
}
