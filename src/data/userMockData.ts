import type { User } from '@/types'

const INITIAL_USER_MOCK_LIST: User[] = [
  // Customers
  { id: 'U001', fullName: 'Nguyễn Văn An', email: 'an@customer.com', phone: '0901234567', role: 'customer', status: 'active', avatar: 'https://placehold.co/40x40/3B82F6/white?text=NVA', createdAt: '2025-03-15', lastLogin: '2026-05-30' },
  { id: 'U002', fullName: 'Trần Thị Bình', email: 'binh@customer.com', phone: '0912345678', role: 'customer', status: 'active', avatar: 'https://placehold.co/40x40/10B981/white?text=TTB', createdAt: '2025-06-20', lastLogin: '2026-05-28' },
  { id: 'U003', fullName: 'Phạm Thu Hà', email: 'ha@customer.com', phone: '0923456789', role: 'customer', status: 'active', avatar: 'https://placehold.co/40x40/8B5CF6/white?text=PTH', createdAt: '2025-08-10', lastLogin: '2026-05-25' },
  { id: 'U004', fullName: 'Lê Minh Cường', email: 'cuong@customer.com', phone: '0934567890', role: 'customer', status: 'inactive', avatar: 'https://placehold.co/40x40/6B7280/white?text=LMC', createdAt: '2025-09-01', lastLogin: '2026-03-15' },
  { id: 'U005', fullName: 'Hoàng Đức Long', email: 'long@customer.com', phone: '0945678901', role: 'customer', status: 'active', avatar: 'https://placehold.co/40x40/F59E0B/white?text=HDL', createdAt: '2025-11-10', lastLogin: '2026-05-29' },
  { id: 'U006', fullName: 'Vũ Thị Hoa', email: 'hoa@customer.com', phone: '0956789012', role: 'customer', status: 'banned', avatar: 'https://placehold.co/40x40/EF4444/white?text=VTH', createdAt: '2025-07-05', lastLogin: '2026-02-10' },
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

const LOCAL_STORAGE_KEY = 'spsb_users_data'

const getStoredUsers = (): User[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        console.error('Failed to parse stored users', e)
      }
    }
  }
  return INITIAL_USER_MOCK_LIST
}

export const USER_MOCK_LIST: User[] = getStoredUsers()

export const saveUsers = (users: User[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users))
  }
  USER_MOCK_LIST.length = 0
  USER_MOCK_LIST.push(...users)
}

export const DEMO_ACCOUNTS = [
  { label: 'Khách hàng', email: 'an@customer.com', role: 'customer' as const },
  { label: 'NV Vận hành', email: 'cam@operation.petcare.com', role: 'operation_staff' as const },
  { label: 'NV Chăm sóc', email: 'hung@petcare.com', role: 'petcare_staff' as const },
  { label: 'Quản lý CN', email: 'minh@shophead.petcare.com', role: 'shop_head' as const },
  { label: 'Admin', email: 'admin@petcare.com', role: 'admin' as const },
  { label: 'Quản lý kho', email: 'khanh@warehouse.petcare.com', role: 'warehouse_manager' as const },
]

