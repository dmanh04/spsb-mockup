import type { Room, RoomCategory } from '@/types'

export const ROOM_CATEGORIES: RoomCategory[] = [
  { id: 'RC01', name: 'Chuồng Grooming', color: '#3B82F6', shopId: 'SH01' },
  { id: 'RC02', name: 'Chuồng Spa', color: '#8B5CF6', shopId: 'SH01' },
  { id: 'RC03', name: 'Chuồng Tắm', color: '#10B981', shopId: 'SH01' },
  { id: 'RC_BOARDING', name: 'Chuồng Lưu trú / Nội trú', color: '#F59E0B', shopId: 'SH01' },
  { id: 'RC04', name: 'Chuồng Grooming', color: '#3B82F6', shopId: 'SH02' },
  { id: 'RC05', name: 'Chuồng Spa', color: '#8B5CF6', shopId: 'SH02' },
]

export const CAGE_CATEGORIES = ROOM_CATEGORIES;

const INITIAL_ROOM_MOCK_LIST: Room[] = [
  { id: 'R001', name: 'Chuồng Grooming 1', categoryId: 'RC01', categoryName: 'Chuồng Grooming', shopId: 'SH01', capacity: 1, status: 'available', equipment: ['Bàn grooming', 'Máy sấy', 'Kéo chuyên dụng'], size: 'M', material: 'Inox 304', condition: 'good', costPrice: 780000, serialNumber: 'SN-CAGE-G01', stock: 1, minStock: 0 },
  { id: 'R002', name: 'Chuồng Grooming 2', categoryId: 'RC01', categoryName: 'Chuồng Grooming', shopId: 'SH01', capacity: 1, status: 'occupied', equipment: ['Bàn grooming', 'Máy sấy'], size: 'M', material: 'Inox 304', condition: 'good', costPrice: 780000, serialNumber: 'SN-CAGE-G02', stock: 1, minStock: 0 },
  { id: 'R003', name: 'Chuồng Grooming 3', categoryId: 'RC01', categoryName: 'Chuồng Grooming', shopId: 'SH01', capacity: 1, status: 'available', equipment: ['Bàn grooming', 'Máy sấy'], size: 'M', material: 'Inox 304', condition: 'good', costPrice: 780000, serialNumber: 'SN-CAGE-G03', stock: 1, minStock: 0 },
  { id: 'R004', name: 'Chuồng Spa Premium 1', categoryId: 'RC02', categoryName: 'Chuồng Spa', shopId: 'SH01', capacity: 1, status: 'occupied', equipment: ['Bồn tắm xông', 'Máy massage', 'Đèn UV'], size: 'L', material: 'Inox 304', condition: 'new', costPrice: 1150000, serialNumber: 'SN-CAGE-S01', stock: 1, minStock: 0 },
  { id: 'R005', name: 'Chuồng Spa Premium 2', categoryId: 'RC02', categoryName: 'Chuồng Spa', shopId: 'SH01', capacity: 1, status: 'available', equipment: ['Bồn tắm xông', 'Máy massage'], size: 'L', material: 'Inox 304', condition: 'good', costPrice: 1150000, serialNumber: 'SN-CAGE-S02', stock: 1, minStock: 0 },
  { id: 'R006', name: 'Chuồng Tắm cơ bản 1', categoryId: 'RC03', categoryName: 'Chuồng Tắm', shopId: 'SH01', capacity: 2, status: 'available', equipment: ['Bồn tắm', 'Máy sấy cơ bản'], size: 'S', material: 'Nhựa PP', condition: 'good', costPrice: 280000, serialNumber: 'SN-CAGE-B01', stock: 1, minStock: 0 },
  { id: 'R010', name: 'Chuồng Lưu trú Standard Suite', categoryId: 'RC_BOARDING', categoryName: 'Chuồng Lưu trú / Nội trú', shopId: 'SH01', capacity: 4, status: 'available', equipment: ['Chuồng đệm êm', 'Bát tự động', 'Hệ thống khử mùi'], size: 'L', material: 'Gỗ thông', condition: 'good', costPrice: 1150000, serialNumber: 'SN-CAGE-L01', stock: 1, minStock: 0 },
  { 
    id: 'R011', 
    name: 'Chuồng Lưu trú Premium VIP Suite', 
    categoryId: 'RC_BOARDING', 
    categoryName: 'Chuồng Lưu trú / Nội trú', 
    shopId: 'SH01', 
    capacity: 2, 
    status: 'available', 
    equipment: ['Camera giám sát 24/7', 'Điều hòa nhiệt độ', 'Đệm Memory Foam'],
    size: 'XL',
    material: 'Thép sơn tĩnh điện',
    condition: 'new',
    costPrice: 1600000,
    serialNumber: 'SN-CAGE-L02',
    stock: 1,
    minStock: 0,
    maintenanceLogs: [
      { id: 'M-101', startedAt: '2026-05-25 09:00', completedAt: '2026-05-25 15:30', requestedBy: 'Trần Hùng', reason: 'Bảo trì định kỳ điều hòa chi nhánh', note: 'Đã nạp gas và vệ sinh lưới lọc sạch sẽ.' }
    ],
    servingHistory: [
      { bookingId: 'BK-002', petName: 'Luna', customerName: 'Trần Thị Bình', serviceName: 'Spa Premium', date: '2026-05-30', checkinTime: '10:25', checkoutTime: '12:45' }
    ]
  },
  { id: 'R007', name: 'Chuồng Grooming Q3-1', categoryId: 'RC04', categoryName: 'Chuồng Grooming', shopId: 'SH02', capacity: 1, status: 'available', equipment: ['Bàn grooming', 'Máy sấy'], size: 'M', material: 'Inox 304', condition: 'good', costPrice: 780000, serialNumber: 'SN-CAGE-G04', stock: 1, minStock: 0 },
  { 
    id: 'R008', 
    name: 'Chuồng Grooming Q3-2', 
    categoryId: 'RC04', 
    categoryName: 'Chuồng Grooming', 
    shopId: 'SH02', 
    capacity: 1, 
    status: 'maintenance', 
    equipment: ['Bàn grooming'],
    size: 'M',
    material: 'Inox 304',
    condition: 'damaged',
    costPrice: 780000,
    serialNumber: 'SN-CAGE-G05',
    stock: 1,
    minStock: 0,
    maintenanceLogs: [
      { id: 'M-102', startedAt: '2026-05-30 10:00', requestedBy: 'Lê Lan', reason: 'Bàn grooming bị lỏng chốt xoay cơ học', note: 'Chờ thợ linh kiện thay thế cơ cấu chốt.' }
    ]
  },
  { id: 'R009', name: 'Chuồng Spa Q3-1', categoryId: 'RC05', categoryName: 'Chuồng Spa', shopId: 'SH02', capacity: 1, status: 'available', equipment: ['Bồn tắm xông', 'Máy massage'], size: 'L', material: 'Inox 304', condition: 'good', costPrice: 1150000, serialNumber: 'SN-CAGE-S03', stock: 1, minStock: 0 },
]

const LOCAL_STORAGE_KEY = 'spsb_rooms_data'

const getStoredRooms = (): Room[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        console.error('Failed to parse stored rooms', e)
      }
    }
  }
  return INITIAL_ROOM_MOCK_LIST
}

export const ROOM_MOCK_LIST: Room[] = getStoredRooms()

export const saveRooms = (rooms: Room[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rooms))
  }
  ROOM_MOCK_LIST.length = 0
  ROOM_MOCK_LIST.push(...rooms)
}

