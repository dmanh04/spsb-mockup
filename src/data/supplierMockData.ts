export interface Supplier {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  productCategories: string[]
  status: 'active' | 'inactive'
  totalOrders: number
  lastOrderDate: string
}

export interface PurchaseOrder {
  id: string
  supplier: string
  items: Array<{ product: string; qty: number; unitPrice: number }>
  total: number
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled'
  createdAt: string
  expectedDelivery: string
}

export const SUPPLIER_MOCK_LIST: Supplier[] = [
  { id: 'SP001', name: 'Công ty TNHH Royal Canin Vietnam', contactPerson: 'Nguyễn Trọng Hiếu', phone: '028-1234-5678', email: 'hieurc@rcvn.com', address: '123 Đường ABC, Q.1, TP.HCM', productCategories: ['Thức ăn chó', 'Thức ăn mèo'], status: 'active', totalOrders: 24, lastOrderDate: '2026-05-15' },
  { id: 'SP002', name: 'Mars Vietnam (Pedigree/Whiskas)', contactPerson: 'Trần Thị Thu', phone: '028-2345-6789', email: 'thu@mars.vn', address: '456 Đường DEF, Q.2, TP.HCM', productCategories: ['Thức ăn chó', 'Thức ăn mèo', 'Snack'], status: 'active', totalOrders: 31, lastOrderDate: '2026-05-20' },
  { id: 'SP003', name: 'Pet Accessories Vietnam', contactPerson: 'Lê Văn Bình', phone: '028-3456-7890', email: 'binh@petacc.vn', address: '789 Đường GHI, Q.7, TP.HCM', productCategories: ['Phụ kiện', 'Chăm sóc'], status: 'active', totalOrders: 12, lastOrderDate: '2026-04-10' },
]

export const PURCHASE_ORDER_LIST: PurchaseOrder[] = [
  {
    id: 'PO001', supplier: 'Công ty TNHH Royal Canin Vietnam',
    items: [{ product: 'Royal Canin Adult 10kg', qty: 50, unitPrice: 750000 }],
    total: 37500000, status: 'received', createdAt: '2026-05-15', expectedDelivery: '2026-05-20'
  },
  {
    id: 'PO002', supplier: 'Mars Vietnam',
    items: [
      { product: 'Pedigree Senior 8kg', qty: 40, unitPrice: 550000 },
      { product: 'Whiskas Tuna 3kg', qty: 60, unitPrice: 200000 },
    ],
    total: 34000000, status: 'confirmed', createdAt: '2026-05-25', expectedDelivery: '2026-06-01'
  },
]
