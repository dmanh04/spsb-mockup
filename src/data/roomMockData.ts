import type { Room, RoomCategory } from '@/types'

export const ROOM_CATEGORIES: RoomCategory[] = [
  { id: 'RC01', name: 'Phòng Grooming', color: '#3B82F6', shopId: 'SH01' },
  { id: 'RC02', name: 'Phòng Spa', color: '#8B5CF6', shopId: 'SH01' },
  { id: 'RC03', name: 'Phòng Tắm', color: '#10B981', shopId: 'SH01' },
  { id: 'RC04', name: 'Phòng Grooming', color: '#3B82F6', shopId: 'SH02' },
  { id: 'RC05', name: 'Phòng Spa', color: '#8B5CF6', shopId: 'SH02' },
]

const INITIAL_ROOM_MOCK_LIST: Room[] = [
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

