import type { Order, OrderStatus } from '@/types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'badge-orange',
  paid: 'badge-blue',
  processing: 'badge-blue',
  shipping: 'badge-orange',
  delivered: 'badge-green',
  cancelled: 'badge-red',
}

export const ORDER_MOCK_LIST: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'U001', customerName: 'Nguyễn Văn An', customerPhone: '0901234567',
    shopId: 'SH01',
    items: [
      { skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult', variantLabel: '4kg / Gà', quantity: 2, unitPrice: 520000, subtotal: 1040000 },
      { skuId: 'P005-S3', skuCode: 'P005-500ML-NS', productName: 'Sữa tắm Haan', variantLabel: '500ml / Da nhạy cảm', quantity: 1, unitPrice: 145000, subtotal: 145000 },
    ],
    subtotal: 1185000, discountAmount: 50000, voucherId: 'V001', total: 1135000,
    status: 'delivered', paymentMethod: 'momo',
    shippingAddress: '12 Nguyễn Trãi, P.Bến Thành, Q.1, TP.HCM',
    note: '', createdAt: '2026-05-25 14:30',
  },
  {
    id: 'ORD-002',
    customerId: 'U002', customerName: 'Trần Thị Bình', customerPhone: '0912345678',
    items: [
      { skuId: 'P002-S2', skuCode: 'P002-3KG', productName: 'Whiskas Tuna', variantLabel: '3kg', quantity: 1, unitPrice: 215000, subtotal: 215000 },
    ],
    subtotal: 215000, discountAmount: 0, total: 215000,
    status: 'processing', paymentMethod: 'transfer',
    shippingAddress: '88 Hai Bà Trưng, P.6, Q.3, TP.HCM',
    note: '', createdAt: '2026-05-31 09:15',
  },
  {
    id: 'ORD-003',
    customerId: 'U001', customerName: 'Nguyễn Văn An', customerPhone: '0901234567',
    items: [
      { skuId: 'P004-S2', skuCode: 'P004-5L-LV', productName: 'Cát Bioline', variantLabel: '5L / Lavender', quantity: 3, unitPrice: 105000, subtotal: 315000 },
      { skuId: 'P006-S1', skuCode: 'P006-150G-NHO', productName: 'Snack Dentix', variantLabel: '150g / Nhỏ', quantity: 2, unitPrice: 55000, subtotal: 110000 },
    ],
    subtotal: 425000, discountAmount: 42500, voucherId: 'V002', total: 382500,
    status: 'pending', paymentMethod: 'cash',
    note: 'Giao trong giờ hành chính', createdAt: '2026-05-31 16:00',
  },
]
