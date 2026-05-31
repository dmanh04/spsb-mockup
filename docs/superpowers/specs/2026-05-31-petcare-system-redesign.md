# Pet Care & Pet Shop Management System — Full Redesign Spec

**Date:** 2026-05-31  
**Status:** Approved  
**Approach:** Full redesign (Approach B) — keep visual/CSS design system, rebuild architecture

---

## 1. Overview

Redesign the existing basic React mock (3 roles, no variants, no schedule) into a professional multi-portal pet care management platform with:

- 6 distinct role-based portals
- Product SKU variant system (multi-attribute)
- Booking calendar + queue workflow + customer wizard
- Staff schedule management with leave request/approval
- Role × Module permission matrix (admin-configurable)

---

## 2. Architecture

### Auth System

```
src/auth/
  AuthContext.tsx       — currentUser, permissions, login(), logout()
  ProtectedRoute.tsx    — role guard, redirects to correct portal
  permissions.ts        — default PermissionMatrix per role
```

`AuthContext` exposes:
```typescript
{
  currentUser: User | null
  permissions: Record<Module, PermissionSet>
  login(email, password): void   // mock: detect role from email domain
  logout(): void
  hasPermission(module: Module, action: 'read'|'write'|'delete'): boolean
}
```

Login mock logic:
- `*@customer.com` or no domain → role: customer
- `*@operation.petcare.com` → role: operation_staff
- `*@petcare.com` → role: petcare_staff
- `*@shophead.petcare.com` → role: shop_head
- `admin@petcare.com` → role: admin
- `*@warehouse.petcare.com` → role: warehouse_manager

After login → redirect to role's home portal.

### URL Structure

```
/login
/customer/         → Customer Portal
/operation/        → Operation Staff Portal
/petcare/          → Pet Care Staff Portal
/shop-head/        → Shop Head Portal
/admin/            → Admin Portal
/warehouse/        → Warehouse Manager Portal
```

### Folder Structure

```
src/
  auth/
    AuthContext.tsx
    ProtectedRoute.tsx
    permissions.ts
  layouts/
    CustomerLayout.tsx
    OperationLayout.tsx
    PetCareLayout.tsx
    ShopHeadLayout.tsx
    AdminLayout.tsx
    WarehouseLayout.tsx
  pages/
    auth/
      LoginPage.tsx
    customer/
    operation/
    petcare/
    shop-head/
    admin/
    warehouse/
  components/
    shared/           — buttons, badges, cards, tables, modals
    booking/          — CalendarView, BookingCard, BookingQueue, BookingWizard
    product/          — SKUEditor, VariantSelector, ProductForm
    schedule/         — ScheduleGrid, ShiftCell, LeaveRequestModal
    permission/       — PermissionMatrixTable
  data/               — mock data (TypeScript, expanded)
  types/              — all TypeScript interfaces
  hooks/
    usePageTitle.ts
    useAuth.ts
    usePermission.ts
  utils/
    devMock.ts
```

---

## 3. Data Models

### User & Roles

```typescript
type Role = 
  | 'customer'
  | 'operation_staff'
  | 'petcare_staff'
  | 'shop_head'
  | 'admin'
  | 'warehouse_manager'

type UserStatus = 'active' | 'inactive' | 'banned'

interface User {
  id: string
  fullName: string
  email: string
  phone: string
  role: Role
  shopId?: string       // staff linked to a branch (undefined for admin/customer)
  status: UserStatus
  avatar: string
  createdAt: string
  lastLogin: string
  hireDate?: string     // for staff roles
  position?: string     // job title display
}
```

### Permission Matrix

```typescript
type Module = 
  | 'booking' | 'product' | 'inventory' | 'order'
  | 'user' | 'shop' | 'schedule' | 'voucher' | 'report' | 'service' | 'room'

type PermissionSet = { read: boolean; write: boolean; delete: boolean }

type PermissionMatrix = Record<Role, Record<Module, PermissionSet>>
```

Default matrix (Admin can modify):

| Module | Customer | Operation | PetCare | Shop Head | Admin | Warehouse |
|---|---|---|---|---|---|---|
| booking | R | R W | R W | R W D | R W D | - |
| product | R | R | - | R W D | R W D | R |
| inventory | - | - | - | R W | R W D | R W D |
| order | R | R W | - | R W D | R W D | R |
| user | - | - | - | R | R W D | - |
| shop | - | R | - | R W | R W D | - |
| schedule | - | R | R | R W D | R W D | - |
| voucher | R | - | - | R W D | R W D | - |
| report | - | - | - | R | R W D | R |
| service | R | R | R | R W D | R W D | - |
| room | - | R W | - | R W D | R W D | - |

### Product + SKU

```typescript
interface ProductAttribute {
  name: string           // 'Trọng lượng', 'Hương vị', 'Màu sắc', 'Size'
  values: string[]       // ['3kg', '7.5kg', '10kg']
}

interface SKU {
  id: string
  productId: string
  sku: string            // P001-10KG-GA
  attributes: Record<string, string>   // { 'Trọng lượng': '10kg', 'Hương vị': 'Gà' }
  price: number
  originalPrice?: number  // for showing discount
  stock: number
  image?: string
  barcode?: string
}

interface Product {
  id: string
  name: string
  category: string
  brand: string
  description: string
  status: 'active' | 'inactive'
  attributes: ProductAttribute[]
  skus: SKU[]
  basePrice: number       // shown before variant selection
  rating: number
  reviewCount: number
  images: string[]        // main product images
  tags: string[]
  createdAt: string
}
```

### Service

```typescript
interface Service {
  id: string
  name: string
  category: 'grooming' | 'bathing' | 'spa' | 'boarding' | 'nail' | 'ear'
  description: string
  duration: number          // minutes
  price: number
  petTypes: ('dog' | 'cat' | 'other')[]
  petSizes?: ('small' | 'medium' | 'large' | 'xlarge')[]  // affects price/duration
  pricingMatrix?: { size: string; price: number; duration: number }[]
  status: 'active' | 'inactive'
  image: string
  shopIds: string[]         // available at which branches
}
```

### Booking — Full State Machine

```typescript
type BookingStatus =
  | 'pending'      // customer just booked
  | 'confirmed'    // operation staff confirmed, assigned staff+room
  | 'checked_in'   // pet arrived at counter
  | 'in_progress'  // pet care staff started
  | 'completed'    // service done, invoice created
  | 'paid'         // payment collected
  | 'cancelled'    // any party cancelled
  | 'no_show'      // customer didn't show up

interface BookingStatusHistory {
  status: BookingStatus
  changedBy: string
  changedAt: string
  note?: string
}

interface Booking {
  id: string
  customerId: string
  customerName: string      // denormalized for display
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
```

### Staff Schedule

```typescript
interface ShiftTemplate {
  id: string
  name: string              // 'Ca sáng', 'Ca chiều', 'Ca tối'
  startTime: string         // '07:00'
  endTime: string           // '12:00'
  color: string             // for calendar display
}

type ScheduleStatus = 'scheduled' | 'confirmed' | 'working' | 'absent' | 'on_leave'

interface StaffSchedule {
  id: string
  staffId: string
  staffName: string
  shopId: string
  date: string              // '2026-06-02'
  shiftId: string
  shift: ShiftTemplate      // denormalized
  status: ScheduleStatus
  note?: string
}

type LeaveRequestStatus = 'pending' | 'approved' | 'rejected'

interface LeaveRequest {
  id: string
  staffId: string
  staffName: string
  shopId: string
  dates: string[]           // can request multiple consecutive days
  type: 'annual' | 'sick' | 'personal' | 'unpaid'
  reason: string
  status: LeaveRequestStatus
  requestedAt: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNote?: string
}

interface ShiftSwapRequest {
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
```

### Room

```typescript
interface RoomCategory {
  id: string
  name: string              // 'Phòng Grooming', 'Phòng Spa', 'Phòng Boarding'
  color: string
  shopId: string
}

interface Room {
  id: string
  name: string              // 'Phòng Grooming 1'
  categoryId: string
  shopId: string
  capacity: number          // số pet cùng lúc
  status: 'available' | 'occupied' | 'maintenance' | 'inactive'
  equipment: string[]
}
```

### Inventory

```typescript
type InventoryTxType = 'stock_in' | 'stock_out' | 'transfer_in' | 'transfer_out' | 'adjustment'

interface InventoryItem {
  skuId: string
  shopId: string            // null = central warehouse
  quantity: number
  minStock: number          // low stock threshold
  lastUpdated: string
}

interface InventoryTransaction {
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

type TransferStatus = 'pending' | 'approved' | 'shipped' | 'received' | 'rejected'

interface StockTransfer {
  id: string
  fromShopId: string | 'warehouse'
  toShopId: string | 'warehouse'
  items: { skuId: string; quantity: number; skuCode: string; productName: string }[]
  status: TransferStatus
  requestedBy: string
  requestedAt: string
  approvedBy?: string
  note: string
}
```

---

## 4. Portal Pages

### Customer Portal `/customer/*`

| Route | Page | Key Features |
|---|---|---|
| `/customer` | Home | Banner slider, featured products, service grid, promotions |
| `/customer/products` | Product List | Category filter, search, SKU badge (e.g. "5 variants") |
| `/customer/products/:id` | Product Detail | Variant selector (attribute buttons → SKU lookup), stock status, add to cart |
| `/customer/services` | Service List | Filter by type/pet, pricing display |
| `/customer/services/:id` | Service Detail | Pricing matrix by pet size, reviews |
| `/customer/booking` | Booking Wizard | 4-step: Service → Pet → Date/Time → Confirm |
| `/customer/bookings` | My Bookings | List with status timeline |
| `/customer/bookings/:id` | Booking Detail | Status history, before/after photos |
| `/customer/cart` | Cart | Line items with variant display |
| `/customer/checkout` | Checkout | Address, voucher, payment method |
| `/customer/orders` | Order List | |
| `/customer/orders/:id` | Order Detail | |
| `/customer/my-pets` | Pet Profiles | List + create/edit |
| `/customer/my-pets/:id` | Pet Detail | Profile + service history |
| `/customer/notifications` | Notifications | |
| `/customer/profile` | Profile | Edit info, change password |

### Operation Staff Portal `/operation/*`

| Route | Page | Key Features |
|---|---|---|
| `/operation` | Dashboard | Today's booking count, check-in queue, room status grid |
| `/operation/queue` | Booking Queue | Kanban: Pending → Confirmed → Checked-in → In Progress → Done |
| `/operation/calendar` | Calendar View | Week view, lane per room, booking blocks colored by status |
| `/operation/checkin` | Check-in Counter | Search booking by ID/phone, check-in action, note |
| `/operation/checkout` | Checkout Counter | Complete booking → generate invoice → collect payment |
| `/operation/orders` | Orders | Process walk-in orders |
| `/operation/my-schedule` | My Schedule | View own shifts, submit leave/swap request |

### Pet Care Staff Portal `/petcare/*`

| Route | Page | Key Features |
|---|---|---|
| `/petcare` | My Today | Assigned bookings sorted by time, status badge |
| `/petcare/bookings/:id` | Booking Work | Pet info card, start service button, note editor, photo upload (before/after), complete button |
| `/petcare/pets/:id` | Pet History | Full service history for this pet |
| `/petcare/my-schedule` | My Schedule | Weekly view, leave request form, pending swap requests |

### Shop Head Portal `/shop-head/*`

| Route | Page | Key Features |
|---|---|---|
| `/shop-head` | Dashboard | Shop revenue, booking stats, staff workload heatmap |
| `/shop-head/staff` | Staff List | Staff in this shop, performance metrics |
| `/shop-head/schedule` | Schedule Manager | Weekly grid per staff, assign shifts, approve leave requests |
| `/shop-head/leave-requests` | Leave Requests | Pending list, approve/reject with note |
| `/shop-head/bookings` | Booking Overview | All shop bookings, reassign staff/room |
| `/shop-head/rooms` | Room Management | Room list, category CRUD, availability status |
| `/shop-head/products` | Products | Product list for this branch |
| `/shop-head/orders` | Orders | Branch orders |
| `/shop-head/vouchers` | Vouchers | Branch-level voucher creation |
| `/shop-head/reports` | Reports | Revenue, booking, staff performance charts |

### Admin Portal `/admin/*`

| Route | Page | Key Features |
|---|---|---|
| `/admin` | System Dashboard | Multi-branch KPIs, charts |
| `/admin/users` | User Management | Full CRUD, assign role + shop |
| `/admin/roles` | Role & Permissions | **Permission matrix table** — toggle R/W/D per role per module |
| `/admin/shops` | Shop Management | CRUD branches, assign shop head |
| `/admin/products` | Product Management | CRUD + SKU editor |
| `/admin/services` | Service Management | CRUD + pricing matrix |
| `/admin/bookings` | Booking Management | System-wide |
| `/admin/inventory` | Inventory Cross-branch | Stock view all branches |
| `/admin/vouchers` | Vouchers | System-wide |
| `/admin/promotions` | Promotions | Campaign management |
| `/admin/reports` | Reports | Multi-branch analytics |
| `/admin/ai/breed` | AI Breed Recognition | |
| `/admin/ai/chatbot` | AI Chatbot | |
| `/admin/settings` | System Settings | |

### Warehouse Manager Portal `/warehouse/*`

| Route | Page | Key Features |
|---|---|---|
| `/warehouse` | Inventory Dashboard | Stock overview by SKU, low-stock alerts, value summary |
| `/warehouse/stock-in` | Stock In | Select supplier → select SKU → enter quantity → confirm |
| `/warehouse/stock-out` | Stock Out | Record outgoing, reason selection |
| `/warehouse/transfers` | Transfer Management | Create transfer request, list pending/approved |
| `/warehouse/transfers/:id` | Transfer Detail | Approve/ship/receive actions |
| `/warehouse/history` | Inventory History | Full transaction log, filter by SKU/type/date |
| `/warehouse/suppliers` | Supplier Management | CRUD suppliers, purchase orders |
| `/warehouse/reports` | Warehouse Reports | Stock value, turnover, supplier performance |

---

## 5. Key UI Components

### BookingCalendar
- Week view (7 columns × time rows 07:00–21:00)
- Lane per room (different color per room category)
- Booking block: pet name + service + staff assigned
- Block color = booking status
- Click → side panel with detail + actions
- "Today" highlight, prev/next week navigation

### BookingQueueBoard
- 5 Kanban columns: Chờ xác nhận / Đã xác nhận / Check-in / Đang làm / Hoàn thành
- Each card: pet avatar, service name, time, staff badge
- Click card → modal: confirm, assign staff dropdown, assign room dropdown

### BookingWizard (4 steps)
1. **Service**: grid of service cards, select one
2. **Pet**: select from customer's pet profiles, or add new
3. **Date/Time**: month calendar → select date → time slot grid (available = white, taken = gray, selected = blue). Only shows slots where: room available AND staff on shift
4. **Confirm**: summary card, note field, submit

### SKUVariantSelector
- Attribute rows: each value is a button (selected=filled, out-of-stock=strikethrough+disabled)
- On selection change: lookup matching SKU, update price/stock display
- "Hết hàng" state disables add-to-cart

### PermissionMatrixTable
- Rows: 5 staff roles (customer excluded)
- Columns: 11 modules
- Each cell: 3 mini-toggles (R/W/D) — color: R=blue, W=yellow, D=red
- Unsaved changes indicator, Save button
- Hover row/column highlight

### StaffScheduleGrid
- 7 columns (Mon–Sun) × 3 rows (Morning/Afternoon/Evening)
- Each cell: list of staff chips assigned to that shift
- Click cell → modal to add/remove staff (dropdown of available staff)
- Leave badge: red chip overlay on staff name when leave approved
- "Conflict" warning if same staff in 2 overlapping shifts

---

## 6. Mock Data Strategy

Each mock data file exports realistic Vietnamese data:

| File | Contents |
|---|---|
| `userMockData.ts` | 20+ users across all 6 roles, 3 shops |
| `productMockData.ts` | 15 products with full SKU matrices (2–3 attributes each) |
| `serviceMockData.ts` | 10 services with pet-size pricing matrices |
| `bookingMockData.ts` | 30+ bookings across all statuses with full history |
| `schedulesMockData.ts` | 2 weeks of shift assignments for 8 staff |
| `leaveRequestMockData.ts` | Mix of pending/approved/rejected leave requests |
| `inventoryMockData.ts` | Stock per SKU per shop + transaction history |
| `transferMockData.ts` | Stock transfers in various states |
| `permissionMockData.ts` | Default matrix (editable in Admin portal) |
| `shopMockData.ts` | 3 branches with rooms |
| `roomMockData.ts` | 4–5 rooms per branch by category |
| `voucherMockData.ts` | Vouchers with usage conditions |
| `orderMockData.ts` | Orders with line items referencing SKUs |

---

## 7. Implementation Notes

- Keep existing Tailwind CSS design tokens (colors, card/badge classes from `index.css`)
- `isDevMock()` utility remains for toggling mock data
- All components use TypeScript strict types
- No external state management library — React Context only (AuthContext + optional mock data contexts)
- All pages functional with realistic mock data — no "Trang đang phát triển" stubs for core pages
- Login page: quick-select buttons for each role (dev convenience)
