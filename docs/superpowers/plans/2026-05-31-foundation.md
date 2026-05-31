---
title: Pet Care System — Foundation
status: Đã lập kế hoạch
created_date: 2026-05-31
started_date:
completed_date:
cancel_reason:
owner: ai
related_spec: docs/superpowers/specs/2026-05-31-petcare-system-redesign.md
---

# Pet Care System — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng nền tảng cho hệ thống: TypeScript types, AuthContext, PermissionMatrix, 13 mock data files, 6 layouts, routing, và Login page với role quick-select.

**Architecture:** Full redesign — giữ nguyên Tailwind CSS design system (card/badge/btn classes), rebuild toàn bộ types/auth/routing. AuthContext cung cấp currentUser + permissions cho toàn app. ProtectedRoute redirect sai role về /login.

**Tech Stack:** React 18, TypeScript 5, React Router DOM v6, Tailwind CSS v3, Lucide React, Vite

---

## File Map

| File | Action | Mô tả |
|---|---|---|
| `src/types/index.ts` | Create | Tất cả TypeScript interfaces |
| `src/auth/AuthContext.tsx` | Create | Auth state, login/logout, currentUser |
| `src/auth/ProtectedRoute.tsx` | Create | Role guard, redirect |
| `src/auth/permissions.ts` | Create | Default PermissionMatrix |
| `src/data/userMockData.ts` | Rewrite | 20+ users, 6 roles |
| `src/data/shopMockData.ts` | Rewrite | 3 branches + rooms |
| `src/data/roomMockData.ts` | Create | Rooms per branch |
| `src/data/productMockData.ts` | Rewrite | 15 products + SKU matrices |
| `src/data/serviceMockData.ts` | Rewrite | 10 services + pricing |
| `src/data/bookingMockData.ts` | Rewrite | 30+ bookings với full history |
| `src/data/schedulesMockData.ts` | Create | 2 tuần shift assignments |
| `src/data/leaveRequestMockData.ts` | Create | Leave/swap requests |
| `src/data/inventoryMockData.ts` | Rewrite | Stock per SKU per shop |
| `src/data/transferMockData.ts` | Create | Stock transfers |
| `src/data/permissionMockData.ts` | Create | Editable permission matrix |
| `src/data/voucherMockData.ts` | Rewrite | Vouchers với conditions |
| `src/data/orderMockData.ts` | Rewrite | Orders với SKU line items |
| `src/layouts/CustomerLayout.tsx` | Rewrite | Customer sidebar/topbar |
| `src/layouts/OperationLayout.tsx` | Create | Operation staff layout |
| `src/layouts/PetCareLayout.tsx` | Create | Pet care staff layout |
| `src/layouts/ShopHeadLayout.tsx` | Create | Shop head layout |
| `src/layouts/AdminLayout.tsx` | Rewrite | Admin layout |
| `src/layouts/WarehouseLayout.tsx` | Create | Warehouse layout |
| `src/pages/auth/LoginPage.tsx` | Rewrite | Login + role quick-select |
| `src/App.tsx` | Rewrite | 6-portal routing |
| `src/hooks/useAuth.ts` | Create | useAuth hook |

---

## Task 1: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Tạo file types**

```typescript
// src/types/index.ts

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
  category: 'grooming' | 'bathing' | 'spa' | 'boarding' | 'nail' | 'ear'
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
  serviceNote?: string
  beforePhotoUrl?: string
  afterPhotoUrl?: string
  invoiceId?: string
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
}

// Room
export interface RoomCategory {
  id: string
  name: string
  color: string
  shopId: string
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
}

// Shop
export interface Shop {
  id: string
  name: string
  address: string
  phone: string
  shopHeadId?: string
  shopHeadName?: string
  status: 'active' | 'inactive'
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

export interface InventoryItem {
  skuId: string
  skuCode: string
  productName: string
  shopId: string | 'warehouse'
  quantity: number
  minStock: number
  lastUpdated: string
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
}

export type TransferStatus = 'pending' | 'approved' | 'shipped' | 'received' | 'rejected'

export interface StockTransfer {
  id: string
  fromShopId: string | 'warehouse'
  toShopId: string | 'warehouse'
  items: { skuId: string; skuCode: string; productName: string; quantity: number }[]
  status: TransferStatus
  requestedBy: string
  requestedAt: string
  approvedBy?: string
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add comprehensive TypeScript type definitions"
```

---

## Task 2: Auth System

**Files:**
- Create: `src/auth/permissions.ts`
- Create: `src/auth/AuthContext.tsx`
- Create: `src/auth/ProtectedRoute.tsx`
- Create: `src/hooks/useAuth.ts`

- [ ] **Step 1: Tạo permissions.ts**

```typescript
// src/auth/permissions.ts
import type { PermissionMatrix, Module, Role } from '@/types'

const ALL: { read: boolean; write: boolean; delete: boolean } = { read: true, write: true, delete: true }
const RW = { read: true, write: true, delete: false }
const RO = { read: true, write: false, delete: false }
const NO = { read: false, write: false, delete: false }

export const DEFAULT_PERMISSIONS: PermissionMatrix = {
  customer: {
    booking: RO, product: RO, inventory: NO, order: RO,
    user: NO, shop: NO, schedule: NO, voucher: RO,
    report: NO, service: RO, room: NO,
  },
  operation_staff: {
    booking: RW, product: RO, inventory: NO, order: RW,
    user: NO, shop: RO, schedule: RO, voucher: NO,
    report: NO, service: RO, room: RW,
  },
  petcare_staff: {
    booking: RW, product: NO, inventory: NO, order: NO,
    user: NO, shop: NO, schedule: RO, voucher: NO,
    report: NO, service: RO, room: NO,
  },
  shop_head: {
    booking: ALL, product: ALL, inventory: RW, order: ALL,
    user: RO, shop: RW, schedule: ALL, voucher: ALL,
    report: RO, service: ALL, room: ALL,
  },
  admin: {
    booking: ALL, product: ALL, inventory: ALL, order: ALL,
    user: ALL, shop: ALL, schedule: ALL, voucher: ALL,
    report: ALL, service: ALL, room: ALL,
  },
  warehouse_manager: {
    booking: NO, product: RO, inventory: ALL, order: RO,
    user: NO, shop: NO, schedule: NO, voucher: NO,
    report: RO, service: NO, room: NO,
  },
}

export function getPortalPath(role: Role): string {
  const map: Record<Role, string> = {
    customer: '/customer',
    operation_staff: '/operation',
    petcare_staff: '/petcare',
    shop_head: '/shop-head',
    admin: '/admin',
    warehouse_manager: '/warehouse',
  }
  return map[role]
}
```

- [ ] **Step 2: Tạo AuthContext.tsx**

```typescript
// src/auth/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User, Module, Role } from '@/types'
import { DEFAULT_PERMISSIONS, getPortalPath } from './permissions'
import { USER_MOCK_LIST } from '@/data/userMockData'

interface AuthContextType {
  currentUser: User | null
  login: (email: string, password: string) => { success: boolean; redirectTo: string }
  logout: () => void
  hasPermission: (module: Module, action: 'read' | 'write' | 'delete') => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  function login(email: string, _password: string) {
    const user = USER_MOCK_LIST.find(u => u.email === email)
    if (!user) return { success: false, redirectTo: '/login' }
    setCurrentUser(user)
    return { success: true, redirectTo: getPortalPath(user.role) }
  }

  function logout() {
    setCurrentUser(null)
  }

  function hasPermission(module: Module, action: 'read' | 'write' | 'delete') {
    if (!currentUser) return false
    return DEFAULT_PERMISSIONS[currentUser.role][module][action]
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
```

- [ ] **Step 3: Tạo ProtectedRoute.tsx**

```typescript
// src/auth/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import type { Role } from '@/types'
import { useAuthContext } from './AuthContext'

interface Props {
  allowedRole: Role
  children: React.ReactNode
}

export default function ProtectedRoute({ allowedRole, children }: Props) {
  const { currentUser } = useAuthContext()
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== allowedRole) {
    // redirect to their correct portal
    const map: Record<Role, string> = {
      customer: '/customer', operation_staff: '/operation',
      petcare_staff: '/petcare', shop_head: '/shop-head',
      admin: '/admin', warehouse_manager: '/warehouse',
    }
    return <Navigate to={map[currentUser.role]} replace />
  }
  return <>{children}</>
}
```

- [ ] **Step 4: Tạo useAuth hook**

```typescript
// src/hooks/useAuth.ts
export { useAuthContext as useAuth } from '@/auth/AuthContext'
```

- [ ] **Step 5: Wrap main.tsx với AuthProvider**

```typescript
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
```

- [ ] **Step 6: Verify build**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add src/auth/ src/hooks/useAuth.ts src/main.tsx
git commit -m "feat: add auth system with permission matrix"
```

---

## Task 3: Mock Data — Users & Shops

**Files:**
- Rewrite: `src/data/userMockData.ts`
- Rewrite: `src/data/shopMockData.ts`
- Create: `src/data/roomMockData.ts`

- [ ] **Step 1: Rewrite userMockData.ts**

```typescript
// src/data/userMockData.ts
import type { User, Role } from '@/types'

export const USER_MOCK_LIST: User[] = [
  // Customers
  { id: 'U001', fullName: 'Nguyễn Văn An', email: 'an@customer.com', phone: '0901234567', role: 'customer', status: 'active', avatar: 'https://placehold.co/40x40/3B82F6/white?text=NVA', createdAt: '2025-03-15', lastLogin: '2026-05-30' },
  { id: 'U002', fullName: 'Trần Thị Bình', email: 'binh@customer.com', phone: '0912345678', role: 'customer', status: 'active', avatar: 'https://placehold.co/40x40/10B981/white?text=TTB', createdAt: '2025-06-20', lastLogin: '2026-05-28' },
  { id: 'U003', fullName: 'Phạm Thu Hà', email: 'ha@customer.com', phone: '0923456789', role: 'customer', status: 'active', avatar: 'https://placehold.co/40x40/8B5CF6/white?text=PTH', createdAt: '2025-08-10', lastLogin: '2026-05-25' },
  { id: 'U004', fullName: 'Lê Minh Cường', email: 'cuong@customer.com', phone: '0934567890', role: 'customer', status: 'inactive', avatar: 'https://placehold.co/40x40/6B7280/white?text=LMC', createdAt: '2025-09-01', lastLogin: '2026-03-15' },
  // Operation Staff
  { id: 'U010', fullName: 'Nguyễn Thị Cẩm', email: 'cam@operation.petcare.com', phone: '0945001001', role: 'operation_staff', shopId: 'SH01', status: 'active', avatar: 'https://placehold.co/40x40/F59E0B/white?text=NTC', createdAt: '2024-01-10', lastLogin: '2026-05-31', hireDate: '2024-01-10', position: 'Nhân viên lễ tân' },
  { id: 'U011', fullName: 'Hoàng Văn Bảo', email: 'bao@operation.petcare.com', phone: '0945001002', role: 'operation_staff', shopId: 'SH02', status: 'active', avatar: 'https://placehold.co/40x40/F59E0B/white?text=HVB', createdAt: '2024-03-05', lastLogin: '2026-05-31', hireDate: '2024-03-05', position: 'Nhân viên lễ tân' },
  { id: 'U012', fullName: 'Vũ Thị Diễm', email: 'diem@operation.petcare.com', phone: '0945001003', role: 'operation_staff', shopId: 'SH03', status: 'active', avatar: 'https://placehold.co/40x40/F59E0B/white?text=VTD', createdAt: '2024-06-01', lastLogin: '2026-05-30', hireDate: '2024-06-01', position: 'Nhân viên lễ tân' },
  // Pet Care Staff
  { id: 'U020', fullName: 'Trần Hùng', email: 'hung@petcare.com', phone: '0956001001', role: 'petcare_staff', shopId: 'SH01', status: 'active', avatar: 'https://placehold.co/40x40/10B981/white?text=TH', createdAt: '2024-01-15', lastLogin: '2026-05-31', hireDate: '2024-01-15', position: 'Groomer' },
  { id: 'U021', fullName: 'Lê Lan', email: 'lan@petcare.com', phone: '0956001002', role: 'petcare_staff', shopId: 'SH01', status: 'active', avatar: 'https://placehold.co/40x40/10B981/white?text=LL', createdAt: '2024-02-01', lastLogin: '2026-05-31', hireDate: '2024-02-01', position: 'Spa Specialist' },
  { id: 'U022', fullName: 'Nguyễn Mai', email: 'mai@petcare.com', phone: '0956001003', role: 'petcare_staff', shopId: 'SH01', status: 'active', avatar: 'https://placehold.co/40x40/10B981/white?text=NM', createdAt: '2024-03-10', lastLogin: '2026-05-30', hireDate: '2024-03-10', position: 'Groomer' },
  { id: 'U023', fullName: 'Phạm Tuấn', email: 'tuan@petcare.com', phone: '0956001004', role: 'petcare_staff', shopId: 'SH02', status: 'active', avatar: 'https://placehold.co/40x40/10B981/white?text=PT', createdAt: '2024-04-05', lastLogin: '2026-05-31', hireDate: '2024-04-05', position: 'Groomer' },
  // Shop Head
  { id: 'U030', fullName: 'Nguyễn Quang Minh', email: 'minh@shophead.petcare.com', phone: '0967001001', role: 'shop_head', shopId: 'SH01', status: 'active', avatar: 'https://placehold.co/40x40/6366F1/white?text=NQM', createdAt: '2023-12-01', lastLogin: '2026-05-31', hireDate: '2023-12-01', position: 'Quản lý chi nhánh Q.1' },
  { id: 'U031', fullName: 'Đặng Thu Hương', email: 'huong@shophead.petcare.com', phone: '0967001002', role: 'shop_head', shopId: 'SH02', status: 'active', avatar: 'https://placehold.co/40x40/6366F1/white?text=DTH', createdAt: '2023-12-15', lastLogin: '2026-05-30', hireDate: '2023-12-15', position: 'Quản lý chi nhánh Q.3' },
  // Admin
  { id: 'U040', fullName: 'Admin PetCare', email: 'admin@petcare.com', phone: '0978001001', role: 'admin', status: 'active', avatar: 'https://placehold.co/40x40/EF4444/white?text=AD', createdAt: '2023-01-01', lastLogin: '2026-05-31' },
  // Warehouse Manager
  { id: 'U050', fullName: 'Bùi Văn Khánh', email: 'khanh@warehouse.petcare.com', phone: '0989001001', role: 'warehouse_manager', status: 'active', avatar: 'https://placehold.co/40x40/78716C/white?text=BVK', createdAt: '2024-01-05', lastLogin: '2026-05-31', hireDate: '2024-01-05', position: 'Quản lý kho' },
]

export const ROLE_LABELS: Record<string, string> = {
  customer: 'Khách hàng',
  operation_staff: 'NV Vận hành',
  petcare_staff: 'NV Chăm sóc',
  shop_head: 'Quản lý chi nhánh',
  admin: 'Quản trị viên',
  warehouse_manager: 'Quản lý kho',
}

export const ROLE_COLORS: Record<string, string> = {
  customer: 'badge-blue',
  operation_staff: 'badge-orange',
  petcare_staff: 'badge-green',
  shop_head: 'badge-gray',
  admin: 'badge-red',
  warehouse_manager: 'badge-gray',
}

// Demo accounts for quick login
export const DEMO_ACCOUNTS = [
  { label: 'Khách hàng', email: 'an@customer.com', role: 'customer' as const },
  { label: 'NV Vận hành', email: 'cam@operation.petcare.com', role: 'operation_staff' as const },
  { label: 'NV Chăm sóc', email: 'hung@petcare.com', role: 'petcare_staff' as const },
  { label: 'Quản lý CN', email: 'minh@shophead.petcare.com', role: 'shop_head' as const },
  { label: 'Admin', email: 'admin@petcare.com', role: 'admin' as const },
  { label: 'Quản lý kho', email: 'khanh@warehouse.petcare.com', role: 'warehouse_manager' as const },
]
```

- [ ] **Step 2: Rewrite shopMockData.ts**

```typescript
// src/data/shopMockData.ts
import type { Shop } from '@/types'

export const SHOP_MOCK_LIST: Shop[] = [
  { id: 'SH01', name: 'PetCare Chi nhánh Q.1', address: '123 Lý Tự Trọng, P.Bến Nghé, Q.1, TP.HCM', phone: '028 3822 1001', shopHeadId: 'U030', shopHeadName: 'Nguyễn Quang Minh', status: 'active', openTime: '07:00', closeTime: '21:00', createdAt: '2023-12-01' },
  { id: 'SH02', name: 'PetCare Chi nhánh Q.3', address: '45 Võ Văn Tần, P.6, Q.3, TP.HCM', phone: '028 3930 2002', shopHeadId: 'U031', shopHeadName: 'Đặng Thu Hương', status: 'active', openTime: '07:30', closeTime: '20:30', createdAt: '2023-12-15' },
  { id: 'SH03', name: 'PetCare Chi nhánh Bình Thạnh', address: '88 Đinh Tiên Hoàng, P.3, Q.Bình Thạnh, TP.HCM', phone: '028 3553 3003', status: 'active', openTime: '08:00', closeTime: '20:00', createdAt: '2024-03-01' },
]
```

- [ ] **Step 3: Create roomMockData.ts**

```typescript
// src/data/roomMockData.ts
import type { Room, RoomCategory } from '@/types'

export const ROOM_CATEGORIES: RoomCategory[] = [
  { id: 'RC01', name: 'Phòng Grooming', color: '#3B82F6', shopId: 'SH01' },
  { id: 'RC02', name: 'Phòng Spa', color: '#8B5CF6', shopId: 'SH01' },
  { id: 'RC03', name: 'Phòng Tắm', color: '#10B981', shopId: 'SH01' },
  { id: 'RC04', name: 'Phòng Grooming', color: '#3B82F6', shopId: 'SH02' },
  { id: 'RC05', name: 'Phòng Spa', color: '#8B5CF6', shopId: 'SH02' },
]

export const ROOM_MOCK_LIST: Room[] = [
  { id: 'R001', name: 'Grooming 1', categoryId: 'RC01', categoryName: 'Phòng Grooming', shopId: 'SH01', capacity: 1, status: 'available', equipment: ['Bàn grooming', 'Máy sấy', 'Kéo chuyên dụng'] },
  { id: 'R002', name: 'Grooming 2', categoryId: 'RC01', categoryName: 'Phòng Grooming', shopId: 'SH01', capacity: 1, status: 'occupied', equipment: ['Bàn grooming', 'Máy sấy'] },
  { id: 'R003', name: 'Grooming 3', categoryId: 'RC01', categoryName: 'Phòng Grooming', shopId: 'SH01', capacity: 1, status: 'available', equipment: ['Bàn grooming', 'Máy sấy'] },
  { id: 'R004', name: 'Spa Premium 1', categoryId: 'RC02', categoryName: 'Phòng Spa', shopId: 'SH01', capacity: 1, status: 'occupied', equipment: ['Bồn tắm xông', 'Máy massage', 'Đèn UV'] },
  { id: 'R005', name: 'Spa Premium 2', categoryId: 'RC02', categoryName: 'Phòng Spa', shopId: 'SH01', capacity: 1, status: 'available', equipment: ['Bồn tắm xông', 'Máy massage'] },
  { id: 'R006', name: 'Tắm cơ bản 1', categoryId: 'RC03', categoryName: 'Phòng Tắm', shopId: 'SH01', capacity: 2, status: 'available', equipment: ['Bồn tắm', 'Máy sấy cơ bản'] },
  { id: 'R007', name: 'Grooming Q3-1', categoryId: 'RC04', categoryName: 'Phòng Grooming', shopId: 'SH02', capacity: 1, status: 'available', equipment: ['Bàn grooming', 'Máy sấy'] },
  { id: 'R008', name: 'Grooming Q3-2', categoryId: 'RC04', categoryName: 'Phòng Grooming', shopId: 'SH02', capacity: 1, status: 'maintenance', equipment: ['Bàn grooming'] },
  { id: 'R009', name: 'Spa Q3-1', categoryId: 'RC05', categoryName: 'Phòng Spa', shopId: 'SH02', capacity: 1, status: 'available', equipment: ['Bồn tắm xông', 'Máy massage'] },
]
```

- [ ] **Step 4: Commit**

```bash
git add src/data/userMockData.ts src/data/shopMockData.ts src/data/roomMockData.ts
git commit -m "feat: expand user/shop/room mock data for 6 roles"
```

---

## Task 4: Mock Data — Products với SKU Matrix

**Files:**
- Rewrite: `src/data/productMockData.ts`

- [ ] **Step 1: Rewrite productMockData.ts**

```typescript
// src/data/productMockData.ts
import type { Product, SKU } from '@/types'

export const PRODUCT_CATEGORIES = [
  { id: 'C001', name: 'Thức ăn chó', icon: '🐕', count: 45 },
  { id: 'C002', name: 'Thức ăn mèo', icon: '🐈', count: 38 },
  { id: 'C003', name: 'Phụ kiện', icon: '🎀', count: 62 },
  { id: 'C004', name: 'Vệ sinh', icon: '🧴', count: 24 },
  { id: 'C005', name: 'Chăm sóc', icon: '💊', count: 31 },
  { id: 'C006', name: 'Snack & Bánh thưởng', icon: '🦴', count: 19 },
]

function makeSKUs(productId: string, attrs: { weight: string; price: number; stock: number }[]): SKU[] {
  return attrs.map((a, i) => ({
    id: `${productId}-SKU${i + 1}`,
    productId,
    sku: `${productId}-${a.weight.replace('.', '').toUpperCase()}`,
    attributes: { 'Trọng lượng': a.weight },
    price: a.price,
    stock: a.stock,
  }))
}

function makeFlavorSKUs(productId: string, combos: { weight: string; flavor: string; price: number; stock: number }[]): SKU[] {
  return combos.map((c, i) => ({
    id: `${productId}-SKU${i + 1}`,
    productId,
    sku: `${productId}-${c.weight.replace('.', '').toUpperCase()}-${c.flavor.toUpperCase().slice(0, 3)}`,
    attributes: { 'Trọng lượng': c.weight, 'Hương vị': c.flavor },
    price: c.price,
    stock: c.stock,
  }))
}

export const PRODUCT_MOCK_LIST: Product[] = [
  {
    id: 'P001',
    name: 'Royal Canin Adult',
    category: 'Thức ăn chó',
    brand: 'Royal Canin',
    description: 'Thức ăn hạt cao cấp cho chó trưởng thành, giàu protein, hỗ trợ tiêu hóa và làm đẹp lông.',
    status: 'active',
    attributes: [
      { name: 'Trọng lượng', values: ['2kg', '4kg', '10kg', '15kg'] },
      { name: 'Hương vị', values: ['Gà', 'Cá hồi'] },
    ],
    skus: makeFlavorSKUs('P001', [
      { weight: '2kg', flavor: 'Gà', price: 285000, stock: 30 },
      { weight: '2kg', flavor: 'Cá hồi', price: 310000, stock: 20 },
      { weight: '4kg', flavor: 'Gà', price: 520000, stock: 25 },
      { weight: '4kg', flavor: 'Cá hồi', price: 560000, stock: 15 },
      { weight: '10kg', flavor: 'Gà', price: 1150000, stock: 10 },
      { weight: '10kg', flavor: 'Cá hồi', price: 1280000, stock: 8 },
      { weight: '15kg', flavor: 'Gà', price: 1650000, stock: 5 },
      { weight: '15kg', flavor: 'Cá hồi', price: 1800000, stock: 0 },
    ]),
    basePrice: 285000,
    rating: 4.8,
    reviewCount: 142,
    images: ['https://placehold.co/400x400/3B82F6/white?text=Royal+Canin'],
    tags: ['chó trưởng thành', 'hạt khô', 'premium'],
    createdAt: '2024-01-15',
  },
  {
    id: 'P002',
    name: 'Whiskas Tuna',
    category: 'Thức ăn mèo',
    brand: 'Whiskas',
    description: 'Thức ăn hạt mèo vị cá ngừ thơm ngon, bổ sung taurine cho mắt và tim mèo.',
    status: 'active',
    attributes: [
      { name: 'Trọng lượng', values: ['1.2kg', '3kg', '7kg'] },
    ],
    skus: makeSKUs('P002', [
      { weight: '1.2kg', price: 95000, stock: 50 },
      { weight: '3kg', price: 215000, stock: 35 },
      { weight: '7kg', price: 460000, stock: 12 },
    ]),
    basePrice: 95000,
    rating: 4.3,
    reviewCount: 87,
    images: ['https://placehold.co/400x400/F59E0B/white?text=Whiskas'],
    tags: ['mèo', 'cá ngừ', 'hạt khô'],
    createdAt: '2024-01-20',
  },
  {
    id: 'P003',
    name: 'Vòng cổ chó Rogz',
    category: 'Phụ kiện',
    brand: 'Rogz',
    description: 'Vòng cổ nylon phản quang, khóa nhựa bền, điều chỉnh được kích thước.',
    status: 'active',
    attributes: [
      { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
      { name: 'Màu sắc', values: ['Đỏ', 'Xanh navy', 'Hồng', 'Đen'] },
    ],
    skus: (() => {
      const sizes = ['S', 'M', 'L', 'XL']
      const colors = ['Đỏ', 'Xanh navy', 'Hồng', 'Đen']
      const priceMap: Record<string, number> = { S: 85000, M: 105000, L: 135000, XL: 165000 }
      const skus: SKU[] = []
      let i = 0
      for (const size of sizes) {
        for (const color of colors) {
          skus.push({
            id: `P003-SKU${++i}`,
            productId: 'P003',
            sku: `P003-${size}-${color.slice(0, 2).toUpperCase()}`,
            attributes: { Size: size, 'Màu sắc': color },
            price: priceMap[size],
            stock: Math.floor(Math.random() * 20) + 2,
          })
        }
      }
      return skus
    })(),
    basePrice: 85000,
    rating: 4.5,
    reviewCount: 65,
    images: ['https://placehold.co/400x400/10B981/white?text=Rogz+Collar'],
    tags: ['vòng cổ', 'phụ kiện chó'],
    createdAt: '2024-02-01',
  },
  {
    id: 'P004',
    name: 'Cát vệ sinh Bioline',
    category: 'Vệ sinh',
    brand: 'Bioline',
    description: 'Cát bentonite vón cục tốt, khử mùi hiệu quả, ít bụi.',
    status: 'active',
    attributes: [
      { name: 'Trọng lượng', values: ['5L', '10L', '20L'] },
      { name: 'Mùi hương', values: ['Không mùi', 'Lavender', 'Chanh'] },
    ],
    skus: makeFlavorSKUs('P004', [
      { weight: '5L', flavor: 'Không mùi', price: 95000, stock: 80 },
      { weight: '5L', flavor: 'Lavender', price: 105000, stock: 60 },
      { weight: '5L', flavor: 'Chanh', price: 105000, stock: 45 },
      { weight: '10L', flavor: 'Không mùi', price: 175000, stock: 40 },
      { weight: '10L', flavor: 'Lavender', price: 190000, stock: 30 },
      { weight: '20L', flavor: 'Không mùi', price: 320000, stock: 20 },
    ]),
    basePrice: 95000,
    rating: 4.6,
    reviewCount: 120,
    images: ['https://placehold.co/400x400/6B7280/white?text=Bioline+Cat'],
    tags: ['cát vệ sinh', 'mèo', 'khử mùi'],
    createdAt: '2024-02-10',
  },
  {
    id: 'P005',
    name: 'Sữa tắm chó Haan',
    category: 'Chăm sóc',
    brand: 'Haan',
    description: 'Sữa tắm dịu nhẹ cho chó, pH cân bằng, không gây kích ứng da.',
    status: 'active',
    attributes: [
      { name: 'Dung tích', values: ['200ml', '500ml', '1000ml'] },
      { name: 'Loại da', values: ['Da nhạy cảm', 'Lông dài', 'Chống ve bọ'] },
    ],
    skus: makeFlavorSKUs('P005', [
      { weight: '200ml', flavor: 'Da nhạy cảm', price: 75000, stock: 30 },
      { weight: '200ml', flavor: 'Lông dài', price: 80000, stock: 25 },
      { weight: '500ml', flavor: 'Da nhạy cảm', price: 145000, stock: 40 },
      { weight: '500ml', flavor: 'Lông dài', price: 155000, stock: 35 },
      { weight: '500ml', flavor: 'Chống ve bọ', price: 175000, stock: 20 },
      { weight: '1000ml', flavor: 'Da nhạy cảm', price: 265000, stock: 15 },
    ]),
    basePrice: 75000,
    rating: 4.7,
    reviewCount: 43,
    images: ['https://placehold.co/400x400/10B981/white?text=Haan+Shampoo'],
    tags: ['sữa tắm', 'chó', 'chăm sóc da'],
    createdAt: '2024-03-01',
  },
]

export function getProductById(id: string) {
  return PRODUCT_MOCK_LIST.find(p => p.id === id)
}

export function getSKUByAttributes(product: Product, selectedAttrs: Record<string, string>): SKU | undefined {
  return product.skus.find(sku =>
    Object.entries(selectedAttrs).every(([key, val]) => sku.attributes[key] === val)
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/productMockData.ts
git commit -m "feat: product mock data with multi-attribute SKU matrix"
```

---

## Task 5: Mock Data — Services, Bookings, Schedules

**Files:**
- Rewrite: `src/data/serviceMockData.ts`
- Rewrite: `src/data/bookingMockData.ts`
- Create: `src/data/schedulesMockData.ts`
- Create: `src/data/leaveRequestMockData.ts`

- [ ] **Step 1: Rewrite serviceMockData.ts**

```typescript
// src/data/serviceMockData.ts
import type { Service } from '@/types'

export const SERVICE_MOCK_LIST: Service[] = [
  {
    id: 'SV001', name: 'Cắt tỉa & Tắm cơ bản', category: 'grooming',
    description: 'Tắm sạch, sấy khô, cắt tỉa lông theo yêu cầu cơ bản.',
    duration: 60, price: 150000, petTypes: ['dog', 'cat'], shopIds: ['SH01', 'SH02', 'SH03'],
    pricingMatrix: [
      { size: 'small', label: 'Nhỏ (< 5kg)', price: 120000, duration: 45 },
      { size: 'medium', label: 'Vừa (5–15kg)', price: 170000, duration: 60 },
      { size: 'large', label: 'Lớn (15–30kg)', price: 250000, duration: 90 },
      { size: 'xlarge', label: 'Rất lớn (> 30kg)', price: 350000, duration: 120 },
    ],
    status: 'active', image: 'https://placehold.co/300x200/3B82F6/white?text=Grooming',
  },
  {
    id: 'SV002', name: 'Spa Premium', category: 'spa',
    description: 'Tắm thảo dược, massage toàn thân, xông hơi, cắt tỉa và làm đẹp toàn diện.',
    duration: 120, price: 350000, petTypes: ['dog', 'cat'], shopIds: ['SH01', 'SH02'],
    pricingMatrix: [
      { size: 'small', label: 'Nhỏ (< 5kg)', price: 280000, duration: 90 },
      { size: 'medium', label: 'Vừa (5–15kg)', price: 380000, duration: 120 },
      { size: 'large', label: 'Lớn (15–30kg)', price: 520000, duration: 150 },
      { size: 'xlarge', label: 'Rất lớn (> 30kg)', price: 700000, duration: 180 },
    ],
    status: 'active', image: 'https://placehold.co/300x200/8B5CF6/white?text=Spa+Premium',
  },
  {
    id: 'SV003', name: 'Tắm & Sấy', category: 'bathing',
    description: 'Tắm sạch với sữa tắm chuyên dụng, sấy khô hoàn toàn.',
    duration: 45, price: 90000, petTypes: ['dog', 'cat'], shopIds: ['SH01', 'SH02', 'SH03'],
    pricingMatrix: [
      { size: 'small', label: 'Nhỏ (< 5kg)', price: 70000, duration: 30 },
      { size: 'medium', label: 'Vừa (5–15kg)', price: 100000, duration: 45 },
      { size: 'large', label: 'Lớn (15–30kg)', price: 150000, duration: 60 },
      { size: 'xlarge', label: 'Rất lớn (> 30kg)', price: 220000, duration: 75 },
    ],
    status: 'active', image: 'https://placehold.co/300x200/10B981/white?text=Bath+%26+Dry',
  },
  {
    id: 'SV004', name: 'Cắt móng & Vệ sinh tai', category: 'nail',
    description: 'Cắt móng an toàn, làm sạch tai, vệ sinh mắt.',
    duration: 30, price: 60000, petTypes: ['dog', 'cat'], shopIds: ['SH01', 'SH02', 'SH03'],
    pricingMatrix: [
      { size: 'small', label: 'Tất cả size', price: 60000, duration: 30 },
      { size: 'medium', label: 'Tất cả size', price: 60000, duration: 30 },
      { size: 'large', label: 'Tất cả size', price: 80000, duration: 30 },
      { size: 'xlarge', label: 'Tất cả size', price: 100000, duration: 45 },
    ],
    status: 'active', image: 'https://placehold.co/300x200/F59E0B/white?text=Nail+%26+Ear',
  },
]

export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  grooming: 'Cắt tỉa', bathing: 'Tắm rửa', spa: 'Spa', boarding: 'Lưu trú', nail: 'Móng & Tai', ear: 'Vệ sinh tai',
}
```

- [ ] **Step 2: Rewrite bookingMockData.ts**

```typescript
// src/data/bookingMockData.ts
import type { Booking, BookingStatus } from '@/types'

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', checked_in: 'Đã check-in',
  in_progress: 'Đang thực hiện', completed: 'Hoàn thành', paid: 'Đã thanh toán',
  cancelled: 'Đã hủy', no_show: 'Không đến',
}

export const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'badge-orange', confirmed: 'badge-blue', checked_in: 'badge-blue',
  in_progress: 'badge-green', completed: 'badge-green', paid: 'badge-gray',
  cancelled: 'badge-red', no_show: 'badge-red',
}

export const BOOKING_MOCK_LIST: Booking[] = [
  {
    id: 'BK-001', customerId: 'U001', customerName: 'Nguyễn Văn An', customerPhone: '0901234567',
    petId: 'PET001', petName: 'Milo', petBreed: 'Poodle',
    serviceId: 'SV001', serviceName: 'Cắt tỉa & Tắm cơ bản',
    shopId: 'SH01', assignedStaffId: 'U020', assignedStaffName: 'Trần Hùng',
    roomId: 'R001', roomName: 'Grooming 1',
    date: '2026-05-31', startTime: '09:00', endTime: '10:00', duration: 60, price: 150000,
    status: 'confirmed',
    statusHistory: [
      { status: 'pending', changedBy: 'Nguyễn Văn An', changedAt: '2026-05-30 20:15', note: '' },
      { status: 'confirmed', changedBy: 'Nguyễn Thị Cẩm', changedAt: '2026-05-31 08:00', note: 'Đã gán Trần Hùng - Grooming 1' },
    ],
    note: '', createdAt: '2026-05-30 20:15',
  },
  {
    id: 'BK-002', customerId: 'U002', customerName: 'Trần Thị Bình', customerPhone: '0912345678',
    petId: 'PET002', petName: 'Luna', petBreed: 'Persian Cat',
    serviceId: 'SV002', serviceName: 'Spa Premium',
    shopId: 'SH01', assignedStaffId: 'U021', assignedStaffName: 'Lê Lan',
    roomId: 'R004', roomName: 'Spa Premium 1',
    date: '2026-05-31', startTime: '10:30', endTime: '12:30', duration: 120, price: 380000,
    status: 'in_progress',
    statusHistory: [
      { status: 'pending', changedBy: 'Trần Thị Bình', changedAt: '2026-05-30 15:00' },
      { status: 'confirmed', changedBy: 'Nguyễn Thị Cẩm', changedAt: '2026-05-31 08:30' },
      { status: 'checked_in', changedBy: 'Nguyễn Thị Cẩm', changedAt: '2026-05-31 10:25', note: 'Pet đã đến, tình trạng tốt' },
      { status: 'in_progress', changedBy: 'Lê Lan', changedAt: '2026-05-31 10:35', note: 'Bắt đầu tắm thảo dược' },
    ],
    note: 'Bé hay bị căng thẳng, cần nhẹ nhàng', checkinNote: 'Pet khỏe mạnh, không có vấn đề gì',
    createdAt: '2026-05-30 15:00',
  },
  {
    id: 'BK-003', customerId: 'U003', customerName: 'Phạm Thu Hà', customerPhone: '0923456789',
    petId: 'PET003', petName: 'Rex', petBreed: 'German Shepherd',
    serviceId: 'SV001', serviceName: 'Cắt tỉa & Tắm cơ bản',
    shopId: 'SH01',
    date: '2026-05-31', startTime: '13:00', endTime: '14:30', duration: 90, price: 250000,
    status: 'pending',
    statusHistory: [
      { status: 'pending', changedBy: 'Phạm Thu Hà', changedAt: '2026-05-31 07:00' },
    ],
    note: 'Rex khá lớn, cần 2 người hỗ trợ', createdAt: '2026-05-31 07:00',
  },
  {
    id: 'BK-004', customerId: 'U001', customerName: 'Nguyễn Văn An', customerPhone: '0901234567',
    petId: 'PET001', petName: 'Milo', petBreed: 'Poodle',
    serviceId: 'SV004', serviceName: 'Cắt móng & Vệ sinh tai',
    shopId: 'SH01', assignedStaffId: 'U022', assignedStaffName: 'Nguyễn Mai',
    roomId: 'R003', roomName: 'Grooming 3',
    date: '2026-05-31', startTime: '14:30', endTime: '15:00', duration: 30, price: 60000,
    status: 'confirmed',
    statusHistory: [
      { status: 'pending', changedBy: 'Nguyễn Văn An', changedAt: '2026-05-31 09:00' },
      { status: 'confirmed', changedBy: 'Nguyễn Thị Cẩm', changedAt: '2026-05-31 09:30' },
    ],
    note: '', createdAt: '2026-05-31 09:00',
  },
  {
    id: 'BK-005', customerId: 'U002', customerName: 'Trần Thị Bình', customerPhone: '0912345678',
    petId: 'PET002', petName: 'Luna', petBreed: 'Persian Cat',
    serviceId: 'SV003', serviceName: 'Tắm & Sấy',
    shopId: 'SH01', assignedStaffId: 'U021', assignedStaffName: 'Lê Lan',
    roomId: 'R006', roomName: 'Tắm cơ bản 1',
    date: '2026-05-30', startTime: '15:00', endTime: '15:45', duration: 45, price: 100000,
    status: 'paid',
    statusHistory: [
      { status: 'pending', changedBy: 'Trần Thị Bình', changedAt: '2026-05-29 18:00' },
      { status: 'confirmed', changedBy: 'Nguyễn Thị Cẩm', changedAt: '2026-05-30 08:00' },
      { status: 'checked_in', changedBy: 'Nguyễn Thị Cẩm', changedAt: '2026-05-30 14:55' },
      { status: 'in_progress', changedBy: 'Lê Lan', changedAt: '2026-05-30 15:05' },
      { status: 'completed', changedBy: 'Lê Lan', changedAt: '2026-05-30 15:50' },
      { status: 'paid', changedBy: 'Nguyễn Thị Cẩm', changedAt: '2026-05-30 16:00', note: 'Thanh toán tiền mặt' },
    ],
    note: '', beforePhotoUrl: 'https://placehold.co/300x200/gray/white?text=Before',
    afterPhotoUrl: 'https://placehold.co/300x200/10B981/white?text=After',
    invoiceId: 'INV-0045', createdAt: '2026-05-29 18:00',
  },
  {
    id: 'BK-006', customerId: 'U004', customerName: 'Lê Minh Cường', customerPhone: '0934567890',
    petId: 'PET004', petName: 'Coco', petBreed: 'Shih Tzu',
    serviceId: 'SV001', serviceName: 'Cắt tỉa & Tắm cơ bản',
    shopId: 'SH01',
    date: '2026-06-02', startTime: '10:00', endTime: '11:00', duration: 60, price: 170000,
    status: 'pending',
    statusHistory: [
      { status: 'pending', changedBy: 'Lê Minh Cường', changedAt: '2026-05-31 10:00' },
    ],
    note: '', createdAt: '2026-05-31 10:00',
  },
]
```

- [ ] **Step 3: Create schedulesMockData.ts**

```typescript
// src/data/schedulesMockData.ts
import type { StaffSchedule, ShiftTemplate } from '@/types'

export const SHIFT_TEMPLATES: ShiftTemplate[] = [
  { id: 'SH_MORNING', name: 'Ca sáng', startTime: '07:00', endTime: '12:00', color: '#3B82F6' },
  { id: 'SH_AFTERNOON', name: 'Ca chiều', startTime: '12:00', endTime: '17:00', color: '#10B981' },
  { id: 'SH_EVENING', name: 'Ca tối', startTime: '17:00', endTime: '21:00', color: '#8B5CF6' },
]

// Week of 2026-06-01 to 2026-06-07
const dates = ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07']
const morning = SHIFT_TEMPLATES[0]
const afternoon = SHIFT_TEMPLATES[1]
const evening = SHIFT_TEMPLATES[2]

export const SCHEDULE_MOCK_LIST: StaffSchedule[] = [
  // Trần Hùng (U020) - SH01
  ...dates.slice(0, 5).map((date, i) => ({
    id: `SCH-U020-${i}`, staffId: 'U020', staffName: 'Trần Hùng', shopId: 'SH01',
    date, shiftId: morning.id, shift: morning, status: 'scheduled' as const,
  })),
  // Lê Lan (U021) - SH01
  ...dates.slice(0, 5).map((date, i) => ({
    id: `SCH-U021-${i}`, staffId: 'U021', staffName: 'Lê Lan', shopId: 'SH01',
    date, shiftId: afternoon.id, shift: afternoon, status: 'scheduled' as const,
  })),
  // Nguyễn Mai (U022) - SH01
  { id: 'SCH-U022-0', staffId: 'U022', staffName: 'Nguyễn Mai', shopId: 'SH01', date: '2026-06-01', shiftId: morning.id, shift: morning, status: 'scheduled' },
  { id: 'SCH-U022-1', staffId: 'U022', staffName: 'Nguyễn Mai', shopId: 'SH01', date: '2026-06-02', shiftId: morning.id, shift: morning, status: 'on_leave' },
  { id: 'SCH-U022-2', staffId: 'U022', staffName: 'Nguyễn Mai', shopId: 'SH01', date: '2026-06-03', shiftId: afternoon.id, shift: afternoon, status: 'scheduled' },
  { id: 'SCH-U022-3', staffId: 'U022', staffName: 'Nguyễn Mai', shopId: 'SH01', date: '2026-06-04', shiftId: afternoon.id, shift: afternoon, status: 'scheduled' },
  { id: 'SCH-U022-4', staffId: 'U022', staffName: 'Nguyễn Mai', shopId: 'SH01', date: '2026-06-05', shiftId: evening.id, shift: evening, status: 'scheduled' },
  // Nguyễn Thị Cẩm (U010) - Operation - SH01
  ...dates.slice(0, 6).map((date, i) => ({
    id: `SCH-U010-${i}`, staffId: 'U010', staffName: 'Nguyễn Thị Cẩm', shopId: 'SH01',
    date, shiftId: morning.id, shift: morning, status: 'scheduled' as const,
  })),
]
```

- [ ] **Step 4: Create leaveRequestMockData.ts**

```typescript
// src/data/leaveRequestMockData.ts
import type { LeaveRequest, ShiftSwapRequest } from '@/types'

export const LEAVE_REQUEST_MOCK_LIST: LeaveRequest[] = [
  {
    id: 'LR-001', staffId: 'U022', staffName: 'Nguyễn Mai', shopId: 'SH01',
    dates: ['2026-06-02'], type: 'personal',
    reason: 'Có việc gia đình quan trọng cần giải quyết.',
    status: 'approved', requestedAt: '2026-05-30 16:00',
    reviewedBy: 'Nguyễn Quang Minh', reviewedAt: '2026-05-30 17:30',
    reviewNote: 'Đã duyệt, nhớ sắp xếp bàn giao công việc.',
  },
  {
    id: 'LR-002', staffId: 'U020', staffName: 'Trần Hùng', shopId: 'SH01',
    dates: ['2026-06-10', '2026-06-11'], type: 'annual',
    reason: 'Nghỉ phép năm còn lại, đi du lịch.',
    status: 'pending', requestedAt: '2026-05-31 09:00',
  },
  {
    id: 'LR-003', staffId: 'U021', staffName: 'Lê Lan', shopId: 'SH01',
    dates: ['2026-06-05'], type: 'sick',
    reason: 'Bị sốt, cần nghỉ để hồi phục.',
    status: 'pending', requestedAt: '2026-06-04 21:00',
  },
]

export const SHIFT_SWAP_MOCK_LIST: ShiftSwapRequest[] = [
  {
    id: 'SS-001', requesterId: 'U020', requesterName: 'Trần Hùng',
    targetStaffId: 'U022', targetStaffName: 'Nguyễn Mai',
    requesterScheduleId: 'SCH-U020-3', targetScheduleId: 'SCH-U022-3',
    reason: 'Tôi có việc buổi sáng thứ 5, đổi ca chiều với Nguyễn Mai được không?',
    status: 'pending', requestedAt: '2026-05-31 11:00',
  },
]
```

- [ ] **Step 5: Commit**

```bash
git add src/data/serviceMockData.ts src/data/bookingMockData.ts src/data/schedulesMockData.ts src/data/leaveRequestMockData.ts
git commit -m "feat: service/booking/schedule mock data with full state history"
```

---

## Task 6: Mock Data — Inventory, Permissions, Orders, Vouchers

**Files:**
- Rewrite: `src/data/inventoryMockData.ts`
- Create: `src/data/transferMockData.ts`
- Create: `src/data/permissionMockData.ts`
- Rewrite: `src/data/orderMockData.ts`
- Rewrite: `src/data/voucherMockData.ts`

- [ ] **Step 1: Rewrite inventoryMockData.ts**

```typescript
// src/data/inventoryMockData.ts
import type { InventoryItem, InventoryTransaction } from '@/types'

export const INVENTORY_ITEMS: InventoryItem[] = [
  // Central warehouse
  { skuId: 'P001-SKU1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'warehouse', quantity: 120, minStock: 20, lastUpdated: '2026-05-28' },
  { skuId: 'P001-SKU3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', shopId: 'warehouse', quantity: 80, minStock: 15, lastUpdated: '2026-05-28' },
  { skuId: 'P001-SKU5', skuCode: 'P001-10KG-GA', productName: 'Royal Canin Adult 10kg Gà', shopId: 'warehouse', quantity: 30, minStock: 10, lastUpdated: '2026-05-28' },
  { skuId: 'P002-SKU1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', shopId: 'warehouse', quantity: 200, minStock: 30, lastUpdated: '2026-05-29' },
  { skuId: 'P004-SKU1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', shopId: 'warehouse', quantity: 150, minStock: 25, lastUpdated: '2026-05-30' },
  // SH01
  { skuId: 'P001-SKU1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'SH01', quantity: 25, minStock: 5, lastUpdated: '2026-05-30' },
  { skuId: 'P001-SKU3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', shopId: 'SH01', quantity: 12, minStock: 5, lastUpdated: '2026-05-30' },
  { skuId: 'P002-SKU1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', shopId: 'SH01', quantity: 3, minStock: 5, lastUpdated: '2026-05-31' }, // low stock
  { skuId: 'P004-SKU1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', shopId: 'SH01', quantity: 45, minStock: 10, lastUpdated: '2026-05-29' },
  // SH02
  { skuId: 'P001-SKU1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'SH02', quantity: 0, minStock: 5, lastUpdated: '2026-05-31' }, // out of stock
  { skuId: 'P002-SKU1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', shopId: 'SH02', quantity: 28, minStock: 8, lastUpdated: '2026-05-28' },
]

export const INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
  { id: 'TX-001', type: 'stock_in', skuId: 'P001-SKU1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'warehouse', quantity: 50, note: 'Nhập từ Royal Canin VN', createdBy: 'Bùi Văn Khánh', createdAt: '2026-05-28 09:00' },
  { id: 'TX-002', type: 'transfer_out', skuId: 'P001-SKU1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'warehouse', quantity: 20, note: 'Chuyển kho → SH01', createdBy: 'Bùi Văn Khánh', createdAt: '2026-05-29 14:00', transferId: 'TF-001' },
  { id: 'TX-003', type: 'transfer_in', skuId: 'P001-SKU1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'SH01', quantity: 20, note: 'Nhận từ kho trung tâm', createdBy: 'Nguyễn Thị Cẩm', createdAt: '2026-05-29 15:30', transferId: 'TF-001' },
  { id: 'TX-004', type: 'stock_out', skuId: 'P002-SKU1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', shopId: 'SH01', quantity: 5, note: 'Bán tại quầy', createdBy: 'Nguyễn Thị Cẩm', createdAt: '2026-05-31 11:00' },
]
```

- [ ] **Step 2: Create transferMockData.ts**

```typescript
// src/data/transferMockData.ts
import type { StockTransfer } from '@/types'

export const TRANSFER_MOCK_LIST: StockTransfer[] = [
  {
    id: 'TF-001', fromShopId: 'warehouse', toShopId: 'SH01',
    items: [{ skuId: 'P001-SKU1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', quantity: 20 }],
    status: 'received', requestedBy: 'Nguyễn Quang Minh', requestedAt: '2026-05-28 16:00',
    approvedBy: 'Bùi Văn Khánh', note: 'Bổ sung hàng cho SH01',
  },
  {
    id: 'TF-002', fromShopId: 'warehouse', toShopId: 'SH02',
    items: [
      { skuId: 'P001-SKU1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', quantity: 15 },
      { skuId: 'P002-SKU1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', quantity: 10 },
    ],
    status: 'pending', requestedBy: 'Đặng Thu Hương', requestedAt: '2026-05-31 08:00', note: 'SH02 sắp hết hàng',
  },
  {
    id: 'TF-003', fromShopId: 'SH01', toShopId: 'SH02',
    items: [{ skuId: 'P004-SKU1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L', quantity: 10 }],
    status: 'approved', requestedBy: 'Đặng Thu Hương', requestedAt: '2026-05-30 10:00',
    approvedBy: 'Bùi Văn Khánh', note: '',
  },
]
```

- [ ] **Step 3: Create permissionMockData.ts**

```typescript
// src/data/permissionMockData.ts
import { DEFAULT_PERMISSIONS } from '@/auth/permissions'
import type { PermissionMatrix } from '@/types'

// This is the editable version — Admin can modify in UI
// In a real app this would be persisted; here we use module-level state
let _matrix: PermissionMatrix = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS))

export function getPermissionMatrix(): PermissionMatrix {
  return _matrix
}

export function updatePermission(
  role: keyof PermissionMatrix,
  module: string,
  action: 'read' | 'write' | 'delete',
  value: boolean
) {
  _matrix = {
    ..._matrix,
    [role]: {
      ..._matrix[role],
      [module]: {
        ..._matrix[role][module as keyof typeof _matrix[typeof role]],
        [action]: value,
      },
    },
  }
}
```

- [ ] **Step 4: Rewrite orderMockData.ts**

```typescript
// src/data/orderMockData.ts
import type { Order, OrderStatus } from '@/types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ thanh toán', paid: 'Đã thanh toán', processing: 'Đang xử lý',
  shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'badge-orange', paid: 'badge-blue', processing: 'badge-blue',
  shipping: 'badge-orange', delivered: 'badge-green', cancelled: 'badge-red',
}

export const ORDER_MOCK_LIST: Order[] = [
  {
    id: 'ORD-001', customerId: 'U001', customerName: 'Nguyễn Văn An', customerPhone: '0901234567',
    shopId: 'SH01',
    items: [
      { skuId: 'P001-SKU3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult', variantLabel: '4kg / Gà', quantity: 2, unitPrice: 520000, subtotal: 1040000 },
      { skuId: 'P005-SKU3', skuCode: 'P005-500ML-NS', productName: 'Sữa tắm Haan', variantLabel: '500ml / Da nhạy cảm', quantity: 1, unitPrice: 145000, subtotal: 145000 },
    ],
    subtotal: 1185000, discountAmount: 50000, voucherId: 'V001', total: 1135000,
    status: 'delivered', paymentMethod: 'momo',
    shippingAddress: '12 Nguyễn Trãi, Q.1, TP.HCM', note: '', createdAt: '2026-05-25 14:30',
  },
  {
    id: 'ORD-002', customerId: 'U002', customerName: 'Trần Thị Bình', customerPhone: '0912345678',
    items: [
      { skuId: 'P002-SKU2', skuCode: 'P002-3KG', productName: 'Whiskas Tuna', variantLabel: '3kg', quantity: 1, unitPrice: 215000, subtotal: 215000 },
    ],
    subtotal: 215000, discountAmount: 0, total: 215000,
    status: 'processing', paymentMethod: 'transfer',
    shippingAddress: '88 Hai Bà Trưng, Q.3, TP.HCM', note: '', createdAt: '2026-05-31 09:15',
  },
]
```

- [ ] **Step 5: Rewrite voucherMockData.ts**

```typescript
// src/data/voucherMockData.ts
import type { Voucher } from '@/types'

export const VOUCHER_MOCK_LIST: Voucher[] = [
  { id: 'V001', code: 'PETCARE50K', name: 'Giảm 50.000đ cho đơn từ 500k', type: 'fixed', value: 50000, minOrderValue: 500000, usageLimit: 100, usedCount: 42, startDate: '2026-05-01', endDate: '2026-06-30', status: 'active' },
  { id: 'V002', code: 'SUMMER10', name: 'Giảm 10% mùa hè, tối đa 100k', type: 'percent', value: 10, minOrderValue: 300000, maxDiscount: 100000, usageLimit: 200, usedCount: 78, startDate: '2026-06-01', endDate: '2026-08-31', status: 'active' },
  { id: 'V003', code: 'NEWCUS20', name: 'Khách mới giảm 20%', type: 'percent', value: 20, minOrderValue: 0, maxDiscount: 150000, usageLimit: 500, usedCount: 312, startDate: '2026-01-01', endDate: '2026-12-31', status: 'active', shopId: 'SH01' },
  { id: 'V004', code: 'FLASH30', name: 'Flash sale 30k', type: 'fixed', value: 30000, minOrderValue: 200000, usageLimit: 50, usedCount: 50, startDate: '2026-04-01', endDate: '2026-04-30', status: 'expired' },
]
```

- [ ] **Step 6: Commit**

```bash
git add src/data/inventoryMockData.ts src/data/transferMockData.ts src/data/permissionMockData.ts src/data/orderMockData.ts src/data/voucherMockData.ts
git commit -m "feat: inventory/transfer/permission/order/voucher mock data"
```

---

## Task 7: App.tsx — 6-Portal Routing

**Files:**
- Rewrite: `src/App.tsx`

- [ ] **Step 1: Rewrite App.tsx**

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'

// Layouts
import CustomerLayout from './layouts/CustomerLayout'
import OperationLayout from './layouts/OperationLayout'
import PetCareLayout from './layouts/PetCareLayout'
import ShopHeadLayout from './layouts/ShopHeadLayout'
import AdminLayout from './layouts/AdminLayout'
import WarehouseLayout from './layouts/WarehouseLayout'

// Auth
import LoginPage from './pages/auth/LoginPage'

// Stub for pages not yet implemented
function StubPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4 text-3xl">🚧</div>
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <p className="text-sm text-gray-400 mt-1">Đang phát triển — Plan 2/3</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Customer Portal */}
        <Route path="/customer" element={
          <ProtectedRoute allowedRole="customer"><CustomerLayout /></ProtectedRoute>
        }>
          <Route index element={<StubPage title="Trang chủ khách hàng" />} />
          <Route path="products" element={<StubPage title="Sản phẩm" />} />
          <Route path="products/:id" element={<StubPage title="Chi tiết sản phẩm" />} />
          <Route path="services" element={<StubPage title="Dịch vụ" />} />
          <Route path="services/:id" element={<StubPage title="Chi tiết dịch vụ" />} />
          <Route path="booking" element={<StubPage title="Đặt lịch" />} />
          <Route path="bookings" element={<StubPage title="Lịch hẹn của tôi" />} />
          <Route path="bookings/:id" element={<StubPage title="Chi tiết lịch hẹn" />} />
          <Route path="cart" element={<StubPage title="Giỏ hàng" />} />
          <Route path="checkout" element={<StubPage title="Thanh toán" />} />
          <Route path="orders" element={<StubPage title="Đơn hàng" />} />
          <Route path="orders/:id" element={<StubPage title="Chi tiết đơn hàng" />} />
          <Route path="my-pets" element={<StubPage title="Thú cưng của tôi" />} />
          <Route path="my-pets/:id" element={<StubPage title="Chi tiết thú cưng" />} />
          <Route path="notifications" element={<StubPage title="Thông báo" />} />
          <Route path="profile" element={<StubPage title="Tài khoản" />} />
        </Route>

        {/* Operation Staff Portal */}
        <Route path="/operation" element={
          <ProtectedRoute allowedRole="operation_staff"><OperationLayout /></ProtectedRoute>
        }>
          <Route index element={<StubPage title="Dashboard vận hành" />} />
          <Route path="queue" element={<StubPage title="Hàng chờ booking" />} />
          <Route path="calendar" element={<StubPage title="Lịch theo phòng" />} />
          <Route path="checkin" element={<StubPage title="Check-in" />} />
          <Route path="checkout" element={<StubPage title="Checkout & Thu tiền" />} />
          <Route path="orders" element={<StubPage title="Đơn hàng" />} />
          <Route path="my-schedule" element={<StubPage title="Lịch làm việc" />} />
        </Route>

        {/* Pet Care Staff Portal */}
        <Route path="/petcare" element={
          <ProtectedRoute allowedRole="petcare_staff"><PetCareLayout /></ProtectedRoute>
        }>
          <Route index element={<StubPage title="Lịch hôm nay" />} />
          <Route path="bookings/:id" element={<StubPage title="Thực hiện dịch vụ" />} />
          <Route path="pets/:id" element={<StubPage title="Lịch sử thú cưng" />} />
          <Route path="my-schedule" element={<StubPage title="Lịch làm việc" />} />
        </Route>

        {/* Shop Head Portal */}
        <Route path="/shop-head" element={
          <ProtectedRoute allowedRole="shop_head"><ShopHeadLayout /></ProtectedRoute>
        }>
          <Route index element={<StubPage title="Dashboard chi nhánh" />} />
          <Route path="staff" element={<StubPage title="Nhân viên" />} />
          <Route path="schedule" element={<StubPage title="Xếp ca làm việc" />} />
          <Route path="leave-requests" element={<StubPage title="Đơn xin nghỉ" />} />
          <Route path="bookings" element={<StubPage title="Booking chi nhánh" />} />
          <Route path="rooms" element={<StubPage title="Quản lý phòng" />} />
          <Route path="products" element={<StubPage title="Sản phẩm chi nhánh" />} />
          <Route path="orders" element={<StubPage title="Đơn hàng chi nhánh" />} />
          <Route path="vouchers" element={<StubPage title="Voucher chi nhánh" />} />
          <Route path="reports" element={<StubPage title="Báo cáo chi nhánh" />} />
        </Route>

        {/* Admin Portal */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>
        }>
          <Route index element={<StubPage title="Dashboard hệ thống" />} />
          <Route path="users" element={<StubPage title="Quản lý người dùng" />} />
          <Route path="roles" element={<StubPage title="Phân quyền" />} />
          <Route path="shops" element={<StubPage title="Chi nhánh" />} />
          <Route path="products" element={<StubPage title="Sản phẩm" />} />
          <Route path="services" element={<StubPage title="Dịch vụ" />} />
          <Route path="bookings" element={<StubPage title="Booking toàn hệ thống" />} />
          <Route path="inventory" element={<StubPage title="Tồn kho" />} />
          <Route path="vouchers" element={<StubPage title="Voucher" />} />
          <Route path="promotions" element={<StubPage title="Khuyến mãi" />} />
          <Route path="reports" element={<StubPage title="Báo cáo" />} />
          <Route path="ai/breed" element={<StubPage title="AI Nhận diện giống" />} />
          <Route path="ai/chatbot" element={<StubPage title="AI Chatbot" />} />
          <Route path="settings" element={<StubPage title="Cài đặt hệ thống" />} />
        </Route>

        {/* Warehouse Portal */}
        <Route path="/warehouse" element={
          <ProtectedRoute allowedRole="warehouse_manager"><WarehouseLayout /></ProtectedRoute>
        }>
          <Route index element={<StubPage title="Dashboard kho" />} />
          <Route path="stock-in" element={<StubPage title="Nhập kho" />} />
          <Route path="stock-out" element={<StubPage title="Xuất kho" />} />
          <Route path="transfers" element={<StubPage title="Phiếu chuyển kho" />} />
          <Route path="transfers/:id" element={<StubPage title="Chi tiết phiếu chuyển" />} />
          <Route path="history" element={<StubPage title="Lịch sử kho" />} />
          <Route path="suppliers" element={<StubPage title="Nhà cung cấp" />} />
          <Route path="reports" element={<StubPage title="Báo cáo kho" />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: 6-portal routing with ProtectedRoute guards"
```

---

## Task 8: Login Page

**Files:**
- Create: `src/pages/auth/LoginPage.tsx`

- [ ] **Step 1: Create LoginPage.tsx**

```typescript
// src/pages/auth/LoginPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, PawPrint } from 'lucide-react'
import { useAuthContext } from '@/auth/AuthContext'
import { DEMO_ACCOUNTS } from '@/data/userMockData'

const ROLE_COLORS: Record<string, string> = {
  customer: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  operation_staff: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  petcare_staff: 'bg-green-100 text-green-700 hover:bg-green-200',
  shop_head: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  admin: 'bg-red-100 text-red-700 hover:bg-red-200',
  warehouse_manager: 'bg-stone-100 text-stone-700 hover:bg-stone-200',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      const result = login(email, password || 'demo')
      if (result.success) {
        navigate(result.redirectTo)
      } else {
        setError('Email không tồn tại trong hệ thống demo.')
      }
      setLoading(false)
    }, 500)
  }

  function handleQuickLogin(demoEmail: string) {
    setLoading(true)
    setTimeout(() => {
      const result = login(demoEmail, 'demo')
      if (result.success) navigate(result.redirectTo)
      setLoading(false)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 shadow-lg">
            <PawPrint size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PetCare System</h1>
          <p className="text-sm text-gray-500 mt-1">Hệ thống quản lý Pet Care đa chi nhánh</p>
        </div>

        {/* Login Form */}
        <div className="card p-6 mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              <LogIn size={16} />
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        {/* Quick Login */}
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Đăng nhập nhanh (Demo)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.role}
                onClick={() => handleQuickLogin(acc.email)}
                disabled={loading}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${ROLE_COLORS[acc.role]}`}
              >
                <div className="font-semibold">{acc.label}</div>
                <div className="opacity-60 text-[10px] mt-0.5 truncate">{acc.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/auth/LoginPage.tsx
git commit -m "feat: login page with role quick-select buttons"
```

---

## Task 9: Layout Components

**Files:**
- Rewrite: `src/layouts/CustomerLayout.tsx`
- Create: `src/layouts/OperationLayout.tsx`
- Create: `src/layouts/PetCareLayout.tsx`
- Create: `src/layouts/ShopHeadLayout.tsx`
- Rewrite: `src/layouts/AdminLayout.tsx`
- Create: `src/layouts/WarehouseLayout.tsx`

- [ ] **Step 1: Create shared layout helper**

```typescript
// src/layouts/_BaseLayout.tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Bell } from 'lucide-react'
import { useAuthContext } from '@/auth/AuthContext'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  badge?: number
}

interface Props {
  title: string
  accentColor: string
  navItems: NavItem[]
  logo?: React.ReactNode
}

export default function BaseLayout({ title, accentColor, navItems, logo }: Props) {
  const { currentUser, logout } = useAuthContext()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r flex flex-col shrink-0">
        {/* Logo */}
        <div className={`px-5 py-4 border-b`}>
          {logo ?? (
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${accentColor} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">PetCare</div>
                <div className="text-[10px] text-gray-400">{title}</div>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length <= 2}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={16} />
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t">
          <div className="flex items-center gap-3 px-2 py-2">
            <img src={currentUser?.avatar} alt="" className="w-8 h-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate">{currentUser?.fullName}</div>
              <div className="text-[10px] text-gray-400 truncate">{currentUser?.position ?? currentUser?.role}</div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Đăng xuất">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <button className="relative text-gray-500 hover:text-gray-700">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <div className="text-xs text-gray-500">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create CustomerLayout.tsx**

```typescript
// src/layouts/CustomerLayout.tsx
import { Home, ShoppingBag, Scissors, PawPrint, ShoppingCart, Package, CalendarDays, Bell, User } from 'lucide-react'
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/auth/AuthContext'

export default function CustomerLayout() {
  const { currentUser, logout } = useAuthContext()
  const navigate = useNavigate()

  const navItems = [
    { to: '/customer', label: 'Trang chủ', icon: Home },
    { to: '/customer/products', label: 'Sản phẩm', icon: ShoppingBag },
    { to: '/customer/services', label: 'Dịch vụ', icon: Scissors },
    { to: '/customer/my-pets', label: 'Thú cưng', icon: PawPrint },
    { to: '/customer/cart', label: 'Giỏ hàng', icon: ShoppingCart },
    { to: '/customer/orders', label: 'Đơn hàng', icon: Package },
    { to: '/customer/bookings', label: 'Lịch hẹn', icon: CalendarDays },
    { to: '/customer/notifications', label: 'Thông báo', icon: Bell },
    { to: '/customer/profile', label: 'Tài khoản', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/customer" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="font-bold text-gray-900">PetCare</span>
          </Link>
          <div className="flex items-center gap-4">
            {navItems.slice(0, 5).map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/customer'}
                className={({ isActive }) => `flex items-center gap-1.5 text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}>
                <item.icon size={15} />
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <NavLink to="/customer/notifications" className="text-gray-500 hover:text-gray-700">
              <Bell size={18} />
            </NavLink>
            {currentUser ? (
              <div className="flex items-center gap-2">
                <img src={currentUser.avatar} alt="" className="w-7 h-7 rounded-full" />
                <span className="text-sm font-medium text-gray-700">{currentUser.fullName.split(' ').pop()}</span>
                <button onClick={() => { logout(); navigate('/login') }} className="text-xs text-gray-400 hover:text-red-500">Đăng xuất</button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary">Đăng nhập</Link>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Create OperationLayout.tsx**

```typescript
// src/layouts/OperationLayout.tsx
import { LayoutDashboard, ListOrdered, CalendarDays, LogIn, LogOut as LogOutIcon, Package, CalendarCheck } from 'lucide-react'
import BaseLayout, { type NavItem } from './_BaseLayout'

const NAV: NavItem[] = [
  { to: '/operation', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/operation/queue', label: 'Hàng chờ booking', icon: ListOrdered, badge: 3 },
  { to: '/operation/calendar', label: 'Lịch phòng', icon: CalendarDays },
  { to: '/operation/checkin', label: 'Check-in', icon: LogIn },
  { to: '/operation/checkout', label: 'Checkout & Thu tiền', icon: LogOutIcon },
  { to: '/operation/orders', label: 'Đơn hàng', icon: Package },
  { to: '/operation/my-schedule', label: 'Lịch làm việc', icon: CalendarCheck },
]

export default function OperationLayout() {
  return <BaseLayout title="Vận hành" accentColor="bg-orange-500" navItems={NAV} />
}
```

- [ ] **Step 4: Create PetCareLayout.tsx**

```typescript
// src/layouts/PetCareLayout.tsx
import { CalendarDays, ClipboardList, PawPrint, CalendarCheck } from 'lucide-react'
import BaseLayout, { type NavItem } from './_BaseLayout'

const NAV: NavItem[] = [
  { to: '/petcare', label: 'Lịch hôm nay', icon: CalendarDays, badge: 4 },
  { to: '/petcare/bookings', label: 'Chi tiết booking', icon: ClipboardList },
  { to: '/petcare/pets', label: 'Lịch sử thú cưng', icon: PawPrint },
  { to: '/petcare/my-schedule', label: 'Lịch làm việc', icon: CalendarCheck },
]

export default function PetCareLayout() {
  return <BaseLayout title="Chăm sóc" accentColor="bg-green-500" navItems={NAV} />
}
```

- [ ] **Step 5: Create ShopHeadLayout.tsx**

```typescript
// src/layouts/ShopHeadLayout.tsx
import { LayoutDashboard, Users, CalendarDays, FileCheck, CalendarCheck, DoorOpen, ShoppingBag, Package, Tag, BarChart3 } from 'lucide-react'
import BaseLayout, { type NavItem } from './_BaseLayout'

const NAV: NavItem[] = [
  { to: '/shop-head', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/shop-head/staff', label: 'Nhân viên', icon: Users },
  { to: '/shop-head/schedule', label: 'Xếp ca làm việc', icon: CalendarDays },
  { to: '/shop-head/leave-requests', label: 'Đơn xin nghỉ', icon: FileCheck, badge: 2 },
  { to: '/shop-head/bookings', label: 'Booking chi nhánh', icon: CalendarCheck },
  { to: '/shop-head/rooms', label: 'Quản lý phòng', icon: DoorOpen },
  { to: '/shop-head/products', label: 'Sản phẩm', icon: ShoppingBag },
  { to: '/shop-head/orders', label: 'Đơn hàng', icon: Package },
  { to: '/shop-head/vouchers', label: 'Voucher', icon: Tag },
  { to: '/shop-head/reports', label: 'Báo cáo', icon: BarChart3 },
]

export default function ShopHeadLayout() {
  return <BaseLayout title="Quản lý CN" accentColor="bg-indigo-500" navItems={NAV} />
}
```

- [ ] **Step 6: Rewrite AdminLayout.tsx**

```typescript
// src/layouts/AdminLayout.tsx
import { LayoutDashboard, Users, Shield, Store, ShoppingBag, Scissors, CalendarCheck, Warehouse, Tag, Megaphone, BarChart3, Bot, Settings } from 'lucide-react'
import BaseLayout, { type NavItem } from './_BaseLayout'

const NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
  { to: '/admin/roles', label: 'Phân quyền', icon: Shield },
  { to: '/admin/shops', label: 'Chi nhánh', icon: Store },
  { to: '/admin/products', label: 'Sản phẩm', icon: ShoppingBag },
  { to: '/admin/services', label: 'Dịch vụ', icon: Scissors },
  { to: '/admin/bookings', label: 'Booking', icon: CalendarCheck },
  { to: '/admin/inventory', label: 'Tồn kho', icon: Warehouse },
  { to: '/admin/vouchers', label: 'Voucher & KM', icon: Tag },
  { to: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
  { to: '/admin/ai/breed', label: 'AI Nhận diện', icon: Bot },
  { to: '/admin/settings', label: 'Cài đặt', icon: Settings },
]

export default function AdminLayout() {
  return <BaseLayout title="Quản trị hệ thống" accentColor="bg-red-500" navItems={NAV} />
}
```

- [ ] **Step 7: Create WarehouseLayout.tsx**

```typescript
// src/layouts/WarehouseLayout.tsx
import { LayoutDashboard, PackagePlus, PackageMinus, ArrowLeftRight, History, Truck, BarChart3 } from 'lucide-react'
import BaseLayout, { type NavItem } from './_BaseLayout'

const NAV: NavItem[] = [
  { to: '/warehouse', label: 'Dashboard kho', icon: LayoutDashboard },
  { to: '/warehouse/stock-in', label: 'Nhập kho', icon: PackagePlus },
  { to: '/warehouse/stock-out', label: 'Xuất kho', icon: PackageMinus },
  { to: '/warehouse/transfers', label: 'Chuyển kho', icon: ArrowLeftRight, badge: 2 },
  { to: '/warehouse/history', label: 'Lịch sử kho', icon: History },
  { to: '/warehouse/suppliers', label: 'Nhà cung cấp', icon: Truck },
  { to: '/warehouse/reports', label: 'Báo cáo', icon: BarChart3 },
]

export default function WarehouseLayout() {
  return <BaseLayout title="Quản lý kho" accentColor="bg-stone-600" navItems={NAV} />
}
```

- [ ] **Step 8: Verify tất cả layouts build OK**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 9: Start dev server, test login flow**

```bash
npm run dev
```

- Mở `http://localhost:5173`
- Click "Đăng nhập nhanh → Admin" → phải redirect đến `/admin` với AdminLayout
- Click "Đăng nhập nhanh → Khách hàng" → phải redirect đến `/customer`
- Click "Đăng nhập nhanh → NV Vận hành" → phải redirect đến `/operation`
- Thử truy cập `/admin` khi chưa login → phải redirect về `/login`

- [ ] **Step 10: Commit**

```bash
git add src/layouts/ src/pages/auth/
git commit -m "feat: 6 portal layouts with sidebar navigation and role-based routing"
```

---

## Verification Checklist

- [ ] `npm run dev` chạy không có lỗi console
- [ ] Mỗi demo account redirect đúng portal
- [ ] Sidebar hiển thị đúng menu cho từng role
- [ ] Truy cập portal sai role bị redirect về đúng portal của mình
- [ ] User info hiển thị đúng ở footer sidebar
- [ ] Logout redirect về `/login`
- [ ] `npx tsc --noEmit` không có errors

---

## Ghi chú cho Plan 2 (Customer + Staff Portals)

Plan 2 sẽ implement nội dung các trang:
- Customer: Home, ProductList + SKUSelector, BookingWizard
- Operation: Dashboard, BookingQueueBoard, CalendarView
- PetCare: Today list, Booking work detail with photos
- Shared components: BookingCalendar, SKUVariantSelector

## Ghi chú cho Plan 3 (Management Portals)

Plan 3 sẽ implement:
- ShopHead: StaffScheduleGrid, LeaveRequest approval
- Admin: PermissionMatrixTable (toggle R/W/D per role)
- Warehouse: Inventory dashboard, Stock-in/out forms, Transfer management
