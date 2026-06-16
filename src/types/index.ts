export type Role =
  | 'customer'
  | 'operation_staff'
  | 'petcare_staff'
  | 'shop_head'
  | 'admin'
  | 'warehouse_manager'

export type UserStatus = 'active' | 'inactive' | 'banned'

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  role: Role
  shopId?: string
  status: UserStatus
  avatar: string
  createdAt: string
  lastLogin: string
  hireDate?: string
  position?: string
  // HR & Payroll Additions for mockup richness
  salaryType?: 'fixed' | 'commission'
  baseSalary?: number
  commissionRate?: number
  contractType?: 'full_time' | 'part_time' | 'internship' | 'freelance'
  taxCode?: string
  insuranceId?: string
  bankName?: string
  bankAccount?: string
  emergencyContactName?: string
  emergencyContactRelation?: string
  emergencyContactPhone?: string
}

export type Module =
  | 'booking' | 'product' | 'inventory' | 'order'
  | 'user' | 'shop' | 'schedule' | 'voucher'
  | 'report' | 'service' | 'room'

export interface PermissionSet {
  read: boolean
  write: boolean
  delete: boolean
}

export type PermissionMatrix = Record<Role, Record<Module, PermissionSet>>

export interface ProductCategory {
  id: string
  name: string
  parentId: string | null // null indicates it is a top-level parent category
  icon: string           // Emoji icon
  description?: string
  sortOrder: number      // Used to persist custom ordering
  createdAt: string
}

// Product & SKU
export interface ProductAttribute {
  name: string
  values: string[]
}

export interface SKU {
  id: string
  productId: string
  sku: string
  attributes: Record<string, string>
  price: number
  originalPrice?: number
  stock: number
  image?: string
  barcode?: string
}

export interface Product {
  id: string
  name: string
  category: string
  brand: string
  description: string
  status: 'active' | 'inactive'
  attributes: ProductAttribute[]
  skus: SKU[]
  basePrice: number
  rating: number
  reviewCount: number
  images: string[]
  tags: string[]
  createdAt: string
}

// Service
export interface ServicePricing {
  size: 'small' | 'medium' | 'large' | 'xlarge'
  label: string
  price: number
  duration: number
}

export interface Service {
  id: string
  name: string
  category: 'grooming' | 'bathing' | 'spa' | 'boarding' | 'nail' | 'ear' | 'checkup'
  description: string
  duration: number
  price: number
  petTypes: ('dog' | 'cat' | 'other')[]
  pricingMatrix: ServicePricing[]
  status: 'active' | 'inactive'
  image: string
  shopIds: string[]
}

// Booking
export type BookingStatus =
  | 'pending' | 'confirmed' | 'checked_in'
  | 'in_progress' | 'completed' | 'paid'
  | 'cancelled' | 'no_show'

export interface BookingStatusHistory {
  status: BookingStatus
  changedBy: string
  changedAt: string
  note?: string
}

export interface Booking {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  petId: string
  petName: string
  petBreed: string
  serviceId: string
  serviceName: string
  shopId: string
  assignedStaffId?: string
  assignedStaffName?: string
  roomId?: string
  roomName?: string
  date: string
  startTime: string
  endTime: string
  duration: number
  price: number
  status: BookingStatus
  statusHistory: BookingStatusHistory[]
  note: string
  checkinNote?: string
  checkoutNote?: string
  serviceNote?: string
  beforePhotoUrl?: string
  afterPhotoUrl?: string
  invoiceId?: string
  paymentMethod?: 'momo' | 'cash' | 'transfer' | 'card'
  boardingLogs?: any[]
  boardingDiet?: {
    foodType: string
    feedTimes: number
    portionWeight: number
    waterFrequency: string
    allergies?: string
  }
  createdAt: string
}

// Staff Schedule
export interface ShiftTemplate {
  id: string
  name: string
  startTime: string
  endTime: string
  color: string
}

export type ScheduleStatus = 'scheduled' | 'confirmed' | 'working' | 'absent' | 'on_leave'

export interface StaffSchedule {
  id: string
  staffId: string
  staffName: string
  shopId: string
  date: string
  shiftId: string
  shift: ShiftTemplate
  status: ScheduleStatus
  note?: string
}

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected'

export interface LeaveRequest {
  id: string
  staffId: string
  staffName: string
  shopId: string
  dates: string[]
  type: 'annual' | 'sick' | 'personal' | 'unpaid'
  reason: string
  status: LeaveRequestStatus
  requestedAt: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNote?: string
}

export interface ShiftSwapRequest {
  id: string
  requesterId: string
  requesterName: string
  targetStaffId: string
  targetStaffName: string
  requesterScheduleId: string
  targetScheduleId: string
  reason: string
  status: LeaveRequestStatus
  requestedAt: string
  reviewedBy?: string
  reviewedAt?: string
}

// Room
export interface RoomCategory {
  id: string
  name: string
  color: string
  shopId: string
}
export interface MaintenanceLog {
  id: string
  startedAt: string
  completedAt?: string
  requestedBy: string
  reason: string
  note?: string
}

export interface ServingRecord {
  bookingId: string
  petName: string
  customerName: string
  serviceName: string
  date: string
  checkinTime: string
  checkoutTime?: string
}

export interface Room {
  id: string
  name: string
  categoryId: string
  categoryName: string
  shopId: string
  capacity: number
  status: 'available' | 'occupied' | 'maintenance' | 'inactive'
  equipment: string[]
  maintenanceLogs?: MaintenanceLog[]
  servingHistory?: ServingRecord[]
}

// Shop
export interface Shop {
  id: string
  name: string
  address: string
  phone: string
  shopHeadId?: string
  shopHeadName?: string
  status: 'active' | 'inactive' | 'renovating'
  openTime: string
  closeTime: string
  createdAt: string
}

// Pet
export interface Pet {
  id: string
  ownerId: string
  name: string
  species: 'dog' | 'cat' | 'other'
  breed: string
  gender: 'male' | 'female'
  birthDate: string
  weight: number
  color: string
  microchip?: string
  notes: string
  avatar: string
  createdAt: string
}

// Inventory
export type InventoryTxType =
  | 'stock_in' | 'stock_out'
  | 'transfer_in' | 'transfer_out' | 'adjustment'

export type InventoryItemCategory = 'product' | 'consumable'

export interface InventoryItem {
  skuId: string
  skuCode: string
  productName: string
  shopId: string | 'warehouse'
  quantity: number
  minStock: number
  lastUpdated: string
  category?: InventoryItemCategory
  unitPrice?: number
}

export interface InventoryTransaction {
  id: string
  type: InventoryTxType
  skuId: string
  skuCode: string
  productName: string
  shopId?: string
  quantity: number
  note: string
  createdBy: string
  createdAt: string
  transferId?: string
  receiptId?: string
  issueId?: string
}

export type TransferStatus = 'pending' | 'approved' | 'picking' | 'shipped' | 'in_transit' | 'received' | 'completed' | 'rejected' | 'partially_received'

export interface StockTransfer {
  id: string
  fromShopId: string | 'warehouse'
  toShopId: string | 'warehouse'
  items: { skuId: string; skuCode: string; productName: string; quantity: number; receivedQty?: number }[]
  status: TransferStatus
  requestedBy: string
  requestedAt: string
  approvedBy?: string
  approvedAt?: string
  shippedAt?: string
  receivedAt?: string
  note: string
}

// Stock Receipt (Phiếu Nhập Kho - GRN)
export type StockReceiptStatus = 'draft' | 'pending_approval' | 'approved' | 'completed' | 'cancelled'

export interface StockReceiptItem {
  skuId: string
  skuCode: string
  productName: string
  orderedQty: number
  receivedQty: number
  unitCost: number
  batchNumber?: string
  expiryDate?: string
  note?: string
}

export interface StockReceipt {
  id: string
  supplierId: string
  supplierName: string
  warehouseId: string
  poReference?: string
  inboundType?: 'supplier' | 'transfer' | 'return' | 'adjustment' | 'sample'
  referenceId?: string
  items: StockReceiptItem[]
  totalValue: number
  status: StockReceiptStatus
  createdBy: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string
  note: string
}

// Stock Issue (Phiếu Xuất Kho - GIN)
export type StockIssueType = 'sale' | 'service_consumable' | 'return_supplier' | 'damaged' | 'transfer'
export type StockIssueStatus = 'draft' | 'pending_approval' | 'approved' | 'completed' | 'cancelled'

export interface StockIssueItem {
  skuId: string
  skuCode: string
  productName: string
  quantity: number
  unitCost: number
}

export interface StockIssue {
  id: string
  type: StockIssueType
  warehouseId: string
  targetShopId?: string
  orderId?: string
  bookingId?: string
  items: StockIssueItem[]
  totalValue: number
  status: StockIssueStatus
  reason: string
  createdBy: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string
  note: string
}

// Stock Count (Kiểm Kê Kho)
export type StockCountStatus = 'planned' | 'in_progress' | 'pending_review' | 'approved' | 'adjusted'

export interface StockCountItem {
  skuId: string
  skuCode: string
  productName: string
  systemQty: number
  actualQty: number
  variance: number
  note?: string
}

export interface StockCount {
  id: string
  warehouseId: string
  warehouseName: string
  items: StockCountItem[]
  status: StockCountStatus
  createdBy: string
  createdAt: string
  countDate: string
  approvedBy?: string
  approvedAt?: string
  note: string
}

// Order
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipping' | 'delivered' | 'cancelled'

export interface OrderItem {
  skuId: string
  skuCode: string
  productName: string
  variantLabel: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  shopId?: string
  items: OrderItem[]
  subtotal: number
  discountAmount: number
  voucherId?: string
  total: number
  status: OrderStatus
  paymentMethod: 'cash' | 'transfer' | 'card' | 'momo'
  shippingAddress?: string
  note: string
  createdAt: string
}

// Voucher
export interface Voucher {
  id: string
  code: string
  name: string
  type: 'percent' | 'fixed'
  value: number
  minOrderValue: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'expired'
  shopId?: string
}

// Supplier
export interface Supplier {
  id: string
  name: string
  contactName: string
  phone: string
  email: string
  address: string
  status: 'active' | 'inactive'
  createdAt: string
}
