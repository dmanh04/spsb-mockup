import type { Booking, BookingStatus } from '@/types'

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  checked_in: 'Đã check-in',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  paid: 'Đã thanh toán',
  cancelled: 'Đã hủy',
  no_show: 'Không đến',
}

export const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'badge-orange',
  confirmed: 'badge-blue',
  checked_in: 'badge-blue',
  in_progress: 'badge-green',
  completed: 'badge-green',
  paid: 'badge-gray',
  cancelled: 'badge-red',
  no_show: 'badge-red',
}

export const STATUS_BG: Record<BookingStatus, string> = {
  pending: 'bg-orange-100 border-orange-300 text-orange-800',
  confirmed: 'bg-blue-100 border-blue-300 text-blue-800',
  checked_in: 'bg-blue-100 border-blue-300 text-blue-800',
  in_progress: 'bg-purple-100 border-purple-300 text-purple-800',
  completed: 'bg-green-100 border-green-300 text-green-800',
  paid: 'bg-gray-100 border-gray-300 text-gray-700',
  cancelled: 'bg-red-100 border-red-300 text-red-800',
  no_show: 'bg-red-100 border-red-300 text-red-800',
}

const INITIAL_BOOKING_MOCK_LIST: Booking[] = [
  {
    id: 'BK-001',
    customerId: 'U001', customerName: 'Nguyễn Văn An', customerPhone: '0901234567',
    petId: 'PET001', petName: 'Milo', petBreed: 'Poodle',
    serviceId: 'SV001', serviceName: 'Cắt tỉa & Tắm cơ bản',
    shopId: 'SH01', assignedStaffId: 'U020', assignedStaffName: 'Trần Hùng',
    roomId: 'R001', roomName: 'Grooming 1',
    date: '2026-05-31', startTime: '09:00', endTime: '10:00', duration: 60, price: 150000,
    status: 'confirmed',
    statusHistory: [
      { status: 'pending', changedBy: 'Nguyễn Văn An', changedAt: '2026-05-30 20:15' },
      { status: 'confirmed', changedBy: 'Nguyễn Thị Cẩm', changedAt: '2026-05-31 08:00', note: 'Đã gán Trần Hùng - Grooming 1' },
    ],
    note: '', createdAt: '2026-05-30 20:15',
  },
  {
    id: 'BK-002',
    customerId: 'U002', customerName: 'Trần Thị Bình', customerPhone: '0912345678',
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
    note: 'Bé hay bị căng thẳng, cần nhẹ nhàng',
    checkinNote: 'Pet khỏe mạnh, không có vấn đề gì',
    beforePhotoUrl: 'https://placehold.co/300x200/94A3B8/white?text=Before',
    createdAt: '2026-05-30 15:00',
  },
  {
    id: 'BK-003',
    customerId: 'U003', customerName: 'Phạm Thu Hà', customerPhone: '0923456789',
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
    id: 'BK-004',
    customerId: 'U001', customerName: 'Nguyễn Văn An', customerPhone: '0901234567',
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
    id: 'BK-008',
    customerId: 'U002', customerName: 'Trần Thị Bình', customerPhone: '0912345678',
    petId: 'PET002', petName: 'Luna', petBreed: 'Persian Cat',
    serviceId: 'SV_BOARDING', serviceName: 'Dịch vụ Khách sạn & Nội trú Thú cưng (Pet Boarding)',
    shopId: 'SH01', assignedStaffId: 'U021', assignedStaffName: 'Lê Lan',
    roomId: 'R011', roomName: 'Lưu trú Premium VIP Suite',
    date: '2026-05-31', startTime: '08:00', endTime: '18:00', duration: 600, price: 750000,
    status: 'checked_in',
    statusHistory: [
      { status: 'pending', changedBy: 'Trần Thị Bình', changedAt: '2026-05-30 10:00' },
      { status: 'confirmed', changedBy: 'Nguyễn Thị Cẩm', changedAt: '2026-05-30 11:30', note: 'Đã xếp phòng Lưu trú VIP và Lê Lan chăm sóc' },
      { status: 'checked_in', changedBy: 'Nguyễn Thị Cẩm', changedAt: '2026-05-31 08:15', note: ' Luna đã nhận phòng. Mang theo hạt cá hồi riêng, tính tình nhút nhát.' }
    ],
    note: 'Luna cần ăn hạt cá hồi riêng mang theo, bé hơi nhát',
    checkinNote: 'Luna đã nhận phòng, lông da sạch sẽ, hơi lo lắng khi mới đến.',
    beforePhotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=60',
    boardingDiet: {
      foodType: 'Hạt cá hồi hữu cơ (Chủ mang theo)',
      feedTimes: 2,
      portionWeight: 150,
      waterFrequency: 'Mỗi 4 tiếng thay nước mới',
      allergies: 'Dị ứng thịt gà, tuyệt đối không ăn thịt gà ⚠️'
    },
    createdAt: '2026-05-30 10:00',
  },
  {
    id: 'BK-005',
    customerId: 'U002', customerName: 'Trần Thị Bình', customerPhone: '0912345678',
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
    note: '',
    beforePhotoUrl: 'https://placehold.co/300x200/94A3B8/white?text=Before',
    afterPhotoUrl: 'https://placehold.co/300x200/10B981/white?text=After',
    serviceNote: 'Bé ngoan, không quấy. Lông đẹp sau khi sấy.',
    invoiceId: 'INV-0045',
    createdAt: '2026-05-29 18:00',
  },
  {
    id: 'BK-006',
    customerId: 'U005', customerName: 'Hoàng Đức Long', customerPhone: '0945678901',
    petId: 'PET005', petName: 'Buddy', petBreed: 'Golden Retriever',
    serviceId: 'SV003', serviceName: 'Tắm & Sấy',
    shopId: 'SH01',
    date: '2026-06-01', startTime: '09:00', endTime: '10:15', duration: 75, price: 150000,
    status: 'pending',
    statusHistory: [
      { status: 'pending', changedBy: 'Hoàng Đức Long', changedAt: '2026-05-31 11:00' },
    ],
    note: 'Buddy hay bị sợ máy sấy, xin làm nhẹ nhàng', createdAt: '2026-05-31 11:00',
  },
  {
    id: 'BK-007',
    customerId: 'U003', customerName: 'Phạm Thu Hà', customerPhone: '0923456789',
    petId: 'PET003', petName: 'Rex', petBreed: 'German Shepherd',
    serviceId: 'SV004', serviceName: 'Cắt móng & Vệ sinh tai',
    shopId: 'SH02', assignedStaffId: 'U023', assignedStaffName: 'Phạm Tuấn',
    date: '2026-05-28', startTime: '10:00', endTime: '10:30', duration: 30, price: 80000,
    status: 'cancelled',
    statusHistory: [
      { status: 'pending', changedBy: 'Phạm Thu Hà', changedAt: '2026-05-27 14:00' },
      { status: 'confirmed', changedBy: 'Hoàng Văn Bảo', changedAt: '2026-05-27 15:00' },
      { status: 'cancelled', changedBy: 'Phạm Thu Hà', changedAt: '2026-05-28 08:00', note: 'Khách hủy do có việc đột xuất' },
    ],
    note: '', createdAt: '2026-05-27 14:00',
  },
]

const LOCAL_STORAGE_KEY = 'spsb_bookings_data'

const getStoredBookings = (): Booking[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (data) {
      try {
        const parsed = JSON.parse(data) as Booking[]
        let merged = [...parsed]
        let changed = false
        INITIAL_BOOKING_MOCK_LIST.forEach(initB => {
          if (!merged.some(b => b.id === initB.id)) {
            merged.push(initB)
            changed = true
          }
        })
        if (changed) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged))
        }
        return merged
      } catch (e) {
        console.error('Failed to parse stored bookings', e)
      }
    }
  }
  return INITIAL_BOOKING_MOCK_LIST
}

export const BOOKING_MOCK_LIST: Booking[] = getStoredBookings()

export const saveBookings = (bookings: Booking[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookings))
  }
  BOOKING_MOCK_LIST.length = 0
  BOOKING_MOCK_LIST.push(...bookings)
}
