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

export interface PurchaseOrderItem {
  skuId: string
  skuCode: string
  productName: string
  qty: number
  unitPrice: number
}

export interface PurchaseOrder {
  id: string
  supplierId: string
  supplierName: string
  items: PurchaseOrderItem[]
  total: number
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled'
  createdAt: string
  expectedDelivery: string
  note?: string
}

const INITIAL_SUPPLIER_MOCK_LIST: Supplier[] = [
  { id: 'SP001', name: 'Công ty TNHH Royal Canin Vietnam', contactPerson: 'Nguyễn Trọng Hiếu', phone: '028-3820-8899', email: 'sales@royalcanin.vn', address: '123 Lê Văn Lương, Q.7, TP.HCM', productCategories: ['Thức ăn chó', 'Thức ăn mèo'], status: 'active', totalOrders: 45, lastOrderDate: '2026-05-28' },
  { id: 'SP002', name: 'Mars Vietnam (Pedigree/Whiskas)', contactPerson: 'Trần Thị Thu', phone: '028-5412-3000', email: 'contact@mars.vn', address: '456 Nguyễn Huệ, Q.1, TP.HCM', productCategories: ['Thức ăn chó', 'Thức ăn mèo', 'Bánh thưởng'], status: 'active', totalOrders: 38, lastOrderDate: '2026-05-25' },
  { id: 'SP003', name: 'Pet Accessories Vietnam', contactPerson: 'Lê Văn Bình', phone: '028-7300-5555', email: 'binh@petacc.vn', address: '789 Trần Hưng Đạo, Q.5, TP.HCM', productCategories: ['Phụ kiện', 'Chăm sóc'], status: 'active', totalOrders: 22, lastOrderDate: '2026-05-20' },
  { id: 'SP004', name: 'Bioline Vietnam', contactPerson: 'Đỗ Hoàng Nam', phone: '028-6255-1234', email: 'info@bioline.vn', address: '321 Pasteur, Q.3, TP.HCM', productCategories: ['Dịch vụ', 'Phụ kiện'], status: 'inactive', totalOrders: 15, lastOrderDate: '2026-04-15' },
]

const INITIAL_PURCHASE_ORDER_LIST: PurchaseOrder[] = [
  {
    id: 'PO-20260515-001',
    supplierId: 'SP001',
    supplierName: 'Công ty TNHH Royal Canin Vietnam',
    items: [
      { skuId: 'P001-S5', skuCode: 'P001-10KG-GA', productName: 'Royal Canin Adult 10kg Gà', qty: 20, unitPrice: 1150000 }
    ],
    total: 23000000,
    status: 'received',
    createdAt: '2026-05-15',
    expectedDelivery: '2026-05-20',
    note: 'Đơn hàng Royal Canin tháng 5'
  },
  {
    id: 'PO-20260525-002',
    supplierId: 'SP002',
    supplierName: 'Mars Vietnam (Pedigree/Whiskas)',
    items: [
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', qty: 60, unitPrice: 65000 }
    ],
    total: 3900000,
    status: 'confirmed',
    createdAt: '2026-05-25',
    expectedDelivery: '2026-06-01',
    note: 'Đơn bổ sung thức ăn mèo Whiskas'
  },
  {
    id: 'PO-20260610-003',
    supplierId: 'SP001',
    supplierName: 'Công ty TNHH Royal Canin Vietnam',
    items: [
      { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', qty: 50, unitPrice: 285000 },
      { skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', qty: 30, unitPrice: 520000 }
    ],
    total: 29850000,
    status: 'confirmed',
    createdAt: '2026-06-10',
    expectedDelivery: '2026-06-15',
    note: 'Nhập gấp Royal Canin cho các chi nhánh'
  }
]

const KEY_SUPPLIERS = 'spsb_suppliers_data'
const KEY_PURCHASE_ORDERS = 'spsb_purchase_orders_data'

const getStoredSuppliers = (): Supplier[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(KEY_SUPPLIERS)
    if (data) {
      try { return JSON.parse(data) } catch (e) { console.error(e) }
    }
  }
  return INITIAL_SUPPLIER_MOCK_LIST
}

const getStoredPurchaseOrders = (): PurchaseOrder[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(KEY_PURCHASE_ORDERS)
    if (data) {
      try { return JSON.parse(data) } catch (e) { console.error(e) }
    }
  }
  return INITIAL_PURCHASE_ORDER_LIST
}

export const SUPPLIER_MOCK_LIST: Supplier[] = getStoredSuppliers()
export const PURCHASE_ORDER_LIST: PurchaseOrder[] = getStoredPurchaseOrders()

export const saveSuppliers = (list: Supplier[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(KEY_SUPPLIERS, JSON.stringify(list))
  }
  SUPPLIER_MOCK_LIST.length = 0
  SUPPLIER_MOCK_LIST.push(...list)
}

export const savePurchaseOrders = (list: PurchaseOrder[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(KEY_PURCHASE_ORDERS, JSON.stringify(list))
  }
  PURCHASE_ORDER_LIST.length = 0
  PURCHASE_ORDER_LIST.push(...list)
}

