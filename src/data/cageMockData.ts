import type { Cage } from '@/types'

export interface CageCategory {
  id: string
  name: string
  color: string
}

export const CAGE_CATEGORIES: CageCategory[] = [
  { id: 'CC01', name: 'Chuồng Grooming', color: '#3B82F6' },
  { id: 'CC02', name: 'Chuồng Spa', color: '#8B5CF6' },
  { id: 'CC03', name: 'Chuồng Tắm', color: '#10B981' },
  { id: 'CC04', name: 'Chuồng Lưu trú / Nội trú', color: '#F59E0B' },
]

export const getCageCategoryByCode = (code: string): { id: string; name: string } => {
  const c = code.toUpperCase()
  if (c.includes('TRAVEL') || c.includes('CAT-M-2T') || c.includes('006') || c.includes('007') || c.includes('012')) {
    return { id: 'CC03', name: 'Chuồng Tắm' }
  }
  if (c.includes('BIRD') || c.includes('SPA') || c.includes('DECO') || c.includes('008')) {
    return { id: 'CC02', name: 'Chuồng Spa' }
  }
  if (c.includes('XL') || c.includes('3T') || c.includes('RABBIT') || c.includes('WOOD') || c.includes('STEEL') || c.includes('004') || c.includes('005') || c.includes('009')) {
    return { id: 'CC04', name: 'Chuồng Lưu trú / Nội trú' }
  }
  return { id: 'CC01', name: 'Chuồng Grooming' }
}

const INITIAL_CAGES: Cage[] = [
  {
    id: 'CAGE-001',
    name: 'Chuồng Chó Inox 304 Size S',
    code: 'CAGE-DOG-S-INOX',
    categoryId: 'CC01',
    categoryName: 'Chuồng Grooming',
    size: 'S',
    material: 'Inox 304',
    color: 'Bạc',
    petTypes: ['dog', 'cat'],
    costPrice: 520000,
    price: 850000,
    stock: 15,
    minStock: 5,
    barcode: '8934588001001',
    image: 'https://placehold.co/200x200/3B82F6/white?text=Chu%E1%BB%93ng+Ch%C3%B3+S',
    status: 'active',
    description: 'Chuồng chó inox 304 size S, phù hợp cho chó dưới 5kg. Khay hứng vệ sinh rời, dễ tháo rời vệ sinh. Khung hàn chắc chắn, chống gỉ sét.',
    lengthCm: 50,
    widthCm: 35,
    heightCm: 42,
    maxWeight: 5,
    warranty: 12,
    location: 'Zone A - Hàng 1 - Kệ A1-01',
    createdAt: '2026-05-10',
    lastRestockedAt: '2026-06-05',
    // Operational details
    assemblyStatus: 'assembled',
    condition: 'good',
    cleanliness: 'cleaned',
    supplierName: 'Xưởng Cơ Khí Inox Hoàng Gia',
    serialNumbers: ['SN-CAGE-001-A1', 'SN-CAGE-001-A2', 'SN-CAGE-001-A3'],
    maintenanceLogs: [
      { id: 'M-101', date: '2026-05-20', task: 'Hàn lại góc bản lề cửa', technician: 'Nguyễn Văn Hùng', cost: 80000, status: 'completed' },
      { id: 'M-102', date: '2026-06-15', task: 'Vệ sinh rỉ sét nhẹ & đánh bóng', technician: 'Lê Văn Tám', cost: 50000, status: 'completed' }
    ],
    sensorData: {
      temp: 24.8,
      humidity: 60,
      doorOpen: false
    },
    occupantName: 'Milu',
    occupiedAt: '2026-06-20 08:30'
  },
  {
    id: 'CAGE-002',
    name: 'Chuồng Chó Inox 304 Size M',
    code: 'CAGE-DOG-M-INOX',
    categoryId: 'CC01',
    categoryName: 'Chuồng Grooming',
    size: 'M',
    material: 'Inox 304',
    color: 'Bạc',
    petTypes: ['dog', 'cat'],
    costPrice: 780000,
    price: 1250000,
    stock: 10,
    minStock: 4,
    barcode: '8934588001002',
    image: 'https://placehold.co/200x200/3B82F6/white?text=Chu%E1%BB%93ng+Ch%C3%B3+M',
    status: 'active',
    description: 'Chuồng chó inox 304 size M, phù hợp cho chó 5–15kg. Cửa kép an toàn, có chốt khóa kép tránh chó tự mở.',
    lengthCm: 70,
    widthCm: 50,
    heightCm: 58,
    maxWeight: 15,
    warranty: 12,
    location: 'Zone A - Hàng 1 - Kệ A1-02',
    createdAt: '2026-05-10',
    lastRestockedAt: '2026-06-05',
    // Operational details
    assemblyStatus: 'assembled',
    condition: 'new',
    cleanliness: 'cleaned',
    supplierName: 'Xưởng Cơ Khí Inox Hoàng Gia',
    serialNumbers: ['SN-CAGE-002-B1', 'SN-CAGE-002-B2'],
    maintenanceLogs: [
      { id: 'M-201', date: '2026-06-01', task: 'Lắp thêm đệm cao su chân đế chống ồn', technician: 'Trần Minh Hải', cost: 40000, status: 'completed' }
    ],
    sensorData: {
      temp: 25.2,
      humidity: 62,
      doorOpen: true
    }
  },
  {
    id: 'CAGE-003',
    name: 'Chuồng Chó Inox 304 Size L',
    code: 'CAGE-DOG-L-INOX',
    categoryId: 'CC01',
    categoryName: 'Chuồng Grooming',
    size: 'L',
    material: 'Inox 304',
    color: 'Bạc',
    petTypes: ['dog'],
    costPrice: 1150000,
    price: 1850000,
    stock: 8,
    minStock: 3,
    barcode: '8934588001003',
    image: 'https://placehold.co/200x200/3B82F6/white?text=Chu%E1%BB%93ng+Ch%C3%B3+L',
    status: 'active',
    description: 'Chuồng chó inox 304 size L, phù hợp cho chó 15–30kg. Có bánh xe di chuyển với khóa hãm, khay vệ sinh rời.',
    lengthCm: 90,
    widthCm: 60,
    heightCm: 70,
    maxWeight: 30,
    warranty: 24,
    location: 'Zone A - Hàng 1 - Kệ A1-03',
    createdAt: '2026-05-10',
    lastRestockedAt: '2026-06-12',
    // Operational details
    assemblyStatus: 'flat_packed',
    condition: 'new',
    cleanliness: 'cleaned',
    supplierName: 'Nhà Nhập Khẩu PetLand Corp',
    serialNumbers: [],
    maintenanceLogs: [],
    sensorData: {
      temp: 24.5,
      humidity: 58,
      doorOpen: false
    }
  },
  {
    id: 'CAGE-004',
    name: 'Chuồng Chó Sắt Sơn TĐ Size XL',
    code: 'CAGE-DOG-XL-STEEL',
    categoryId: 'CC04',
    categoryName: 'Chuồng Lưu trú / Nội trú',
    size: 'XL',
    material: 'Sắt sơn tĩnh điện',
    color: 'Đen',
    petTypes: ['dog'],
    costPrice: 1600000,
    price: 2500000,
    stock: 3,
    minStock: 3,
    barcode: '8934588001004',
    image: 'https://placehold.co/200x200/1E293B/white?text=Chu%E1%BB%93ng+Ch%C3%B3+XL',
    status: 'active',
    description: 'Chuồng chó sắt sơn tĩnh điện size XL dành cho chó trên 30kg. Khung thép dày 2mm, lớp phủ epoxy không độc. Có ngăn nghỉ ngơi phía trên và khu vực chạy nhảy phía dưới.',
    lengthCm: 120,
    widthCm: 75,
    heightCm: 90,
    maxWeight: 60,
    warranty: 24,
    location: 'Zone A - Hàng 2 - Kệ A2-01',
    createdAt: '2026-05-12',
    lastRestockedAt: '2026-06-10',
    // Operational details
    assemblyStatus: 'assembled',
    condition: 'fair',
    cleanliness: 'dirty',
    supplierName: 'Nhà Phân Phối Thiết Bị Thú Cưng Việt Nam',
    serialNumbers: ['SN-CAGE-004-C1'],
    maintenanceLogs: [
      { id: 'M-401', date: '2026-05-25', task: 'Sơn dặm vết trầy xước chống rỉ sét', technician: 'Nguyễn Văn Hùng', cost: 120000, status: 'completed' },
      { id: 'M-402', date: '2026-06-20', task: 'Sửa kẹt chốt khóa chính', technician: 'Trần Minh Hải', cost: 60000, status: 'pending' }
    ],
    sensorData: {
      temp: 26.5,
      humidity: 65,
      doorOpen: false
    },
    occupantName: 'Kiki',
    occupiedAt: '2026-06-21 14:00'
  },
  {
    id: 'CAGE-005',
    name: 'Chuồng Mèo 3 Tầng Inox',
    code: 'CAGE-CAT-L-3T',
    categoryId: 'CC04',
    categoryName: 'Chuồng Lưu trú / Nội trú',
    size: 'L',
    material: 'Inox 304',
    color: 'Bạc',
    petTypes: ['cat'],
    costPrice: 1380000,
    price: 2200000,
    stock: 12,
    minStock: 4,
    barcode: '8934588002001',
    image: 'https://placehold.co/200x200/EC4899/white?text=Chu%E1%BB%93ng+M%C3%A8o+3T',
    status: 'active',
    description: 'Chuồng mèo 3 tầng inox 304. Sàn nhựa chống trượt, thang gỗ an toàn. Tháo lắp dễ dàng, phù hợp nuôi 1–3 con mèo.',
    lengthCm: 60,
    widthCm: 45,
    heightCm: 120,
    maxWeight: 15,
    warranty: 12,
    location: 'Zone B - Hàng 1 - Kệ B1-01',
    createdAt: '2026-05-15',
    lastRestockedAt: '2026-06-12',
    // Operational details
    assemblyStatus: 'assembled',
    condition: 'good',
    cleanliness: 'cleaning',
    supplierName: 'Xưởng Cơ Khí Inox Hoàng Gia',
    serialNumbers: ['SN-CAGE-005-D1', 'SN-CAGE-005-D2'],
    maintenanceLogs: [
      { id: 'M-501', date: '2026-06-10', task: 'Thay thế thang gỗ leo bị gãy', technician: 'Lê Văn Tám', cost: 150000, status: 'completed' }
    ],
    sensorData: {
      temp: 24.2,
      humidity: 55,
      doorOpen: false
    }
  },
  {
    id: 'CAGE-006',
    name: 'Chuồng Mèo 2 Tầng Gấp Gọn',
    code: 'CAGE-CAT-M-2T',
    categoryId: 'CC03',
    categoryName: 'Chuồng Tắm',
    size: 'M',
    material: 'Sắt sơn tĩnh điện',
    color: 'Trắng',
    petTypes: ['cat'],
    costPrice: 950000,
    price: 1500000,
    stock: 18,
    minStock: 6,
    barcode: '8934588002002',
    image: 'https://placehold.co/200x200/EC4899/white?text=Chu%E1%BB%93ng+M%C3%A8o+2T',
    status: 'active',
    description: 'Chuồng mèo 2 tầng gấp gọn, tiện lợi khi vận chuyển. Có khay vệ sinh kèm theo, thiết kế gọn nhẹ tiết kiệm diện tích.',
    lengthCm: 55,
    widthCm: 40,
    heightCm: 80,
    maxWeight: 10,
    warranty: 12,
    location: 'Zone B - Hàng 1 - Kệ B1-02',
    createdAt: '2026-05-18',
    lastRestockedAt: '2026-06-01',
    // Operational details
    assemblyStatus: 'flat_packed',
    condition: 'new',
    cleanliness: 'cleaned',
    supplierName: 'Xưởng Nhựa & Kim Khí Việt Nhật',
    serialNumbers: [],
    maintenanceLogs: [],
    sensorData: {
      temp: 25.0,
      humidity: 59,
      doorOpen: false
    }
  },
  {
    id: 'CAGE-007',
    name: 'Lồng Vận Chuyển Nhựa PP Size S',
    code: 'CAGE-TRAVEL-S-PP',
    categoryId: 'CC03',
    categoryName: 'Chuồng Tắm',
    size: 'S',
    material: 'Nhựa PP cao cấp',
    color: 'Be/Nâu',
    petTypes: ['dog', 'cat', 'rabbit'],
    costPrice: 280000,
    price: 450000,
    stock: 25,
    minStock: 10,
    barcode: '8934588003001',
    image: 'https://placehold.co/200x200/F59E0B/white?text=L%E1%BB%93ng+V%E1%BA%ADn+Chuy%E1%BB%83n',
    status: 'active',
    description: 'Lồng vận chuyển nhựa PP cao cấp cho mèo hoặc chó nhỏ. Cửa sắt chắc chắn, có lỗ thông hơi xung quanh. Nhẹ, dễ cầm xách.',
    lengthCm: 44,
    widthCm: 28,
    heightCm: 30,
    maxWeight: 6,
    warranty: 6,
    location: 'Zone C - Hàng 1 - Kệ C1-01',
    createdAt: '2026-05-20',
    lastRestockedAt: '2026-06-08',
    // Operational details
    assemblyStatus: 'flat_packed',
    condition: 'new',
    cleanliness: 'cleaned',
    supplierName: 'Công ty Nhựa Việt Nhật',
    serialNumbers: [],
    maintenanceLogs: [],
    sensorData: {
      temp: 24.6,
      humidity: 61,
      doorOpen: false
    }
  },
  {
    id: 'CAGE-008',
    name: 'Chuồng Chim Trang Trí Châu Âu',
    code: 'CAGE-BIRD-M-DECO',
    categoryId: 'CC02',
    categoryName: 'Chuồng Spa',
    size: 'M',
    material: 'Sắt mạ kẽm',
    color: 'Trắng/Vàng đồng',
    petTypes: ['bird'],
    costPrice: 420000,
    price: 680000,
    stock: 7,
    minStock: 3,
    barcode: '8934588004001',
    image: 'https://placehold.co/200x200/10B981/white?text=Chu%E1%BB%93ng+Chim',
    status: 'active',
    description: 'Chuồng chim trang trí phong cách Châu Âu cổ điển. Sắt mạ kẽm 3 lớp chống rỉ. Kèm 2 máng ăn, 2 máng nước và 2 thanh gỗ đậu.',
    lengthCm: 38,
    widthCm: 38,
    heightCm: 65,
    maxWeight: 2,
    warranty: 6,
    location: 'Zone D - Hàng 1 - Kệ D1-01',
    createdAt: '2026-05-22',
    lastRestockedAt: '2026-05-22',
    // Operational details
    assemblyStatus: 'assembled',
    condition: 'good',
    cleanliness: 'cleaned',
    supplierName: 'Tổng Kho Phụ Kiện Thú Cưng Sài Gòn',
    serialNumbers: ['SN-CAGE-008-E1', 'SN-CAGE-008-E2'],
    maintenanceLogs: [
      { id: 'M-801', date: '2026-06-05', task: 'Thay mới 2 cóng nước thủy tinh', technician: 'Lê Văn Tám', cost: 30000, status: 'completed' }
    ],
    sensorData: {
      temp: 25.8,
      humidity: 57,
      doorOpen: false
    },
    occupantName: 'Vẹt Đốm',
    occupiedAt: '2026-06-18 10:00'
  },
  {
    id: 'CAGE-009',
    name: 'Chuồng Thỏ Gỗ Thông 2 Tầng',
    code: 'CAGE-RABBIT-L-WOOD',
    categoryId: 'CC04',
    categoryName: 'Chuồng Lưu trú / Nội trú',
    size: 'L',
    material: 'Gỗ thông tự nhiên',
    color: 'Vân gỗ tự nhiên',
    petTypes: ['rabbit'],
    costPrice: 1150000,
    price: 1800000,
    stock: 4,
    minStock: 2,
    barcode: '8934588005001',
    image: 'https://placehold.co/200x200/8B5CF6/white?text=Chu%E1%BB%93ng+Th%E1%BB%8F',
    status: 'active',
    description: 'Chuồng thỏ gỗ thông tự nhiên 2 tầng. Phân vùng khu vực nghỉ và khu vực vui chơi. Có cầu thang gỗ and hộc kéo vệ sinh tiện lợi.',
    lengthCm: 100,
    widthCm: 55,
    heightCm: 85,
    maxWeight: 8,
    warranty: 12,
    location: 'Zone E - Hàng 1 - Kệ E1-01',
    createdAt: '2026-05-25',
    lastRestockedAt: '2026-06-10',
    // Operational details
    assemblyStatus: 'assembled',
    condition: 'good',
    cleanliness: 'cleaned',
    supplierName: 'Xưởng Gỗ Thủ Công Đồng Nai',
    serialNumbers: ['SN-CAGE-009-F1'],
    maintenanceLogs: [],
    sensorData: {
      temp: 24.1,
      humidity: 56,
      doorOpen: false
    }
  },
  {
    id: 'CAGE-010',
    name: 'Chuồng Mèo Inox 201 Size S',
    code: 'CAGE-CAT-S-INOX',
    categoryId: 'CC01',
    categoryName: 'Chuồng Grooming',
    size: 'S',
    material: 'Inox 201',
    color: 'Bạc',
    petTypes: ['cat'],
    costPrice: 390000,
    price: 650000,
    stock: 0,
    minStock: 5,
    barcode: '8934588002003',
    image: 'https://placehold.co/200x200/94A3B8/white?text=Ng%C6%B0ng+KD',
    status: 'inactive',
    description: 'Chuồng mèo inox 201 size S. Model đã ngừng sản xuất, đã thay thế bằng CAGE-DOG-S-INOX dùng inox 304 cao cấp hơn.',
    lengthCm: 42,
    widthCm: 30,
    heightCm: 38,
    maxWeight: 5,
    warranty: 6,
    location: 'Zone B - Hàng 2 - Kệ B2-01',
    createdAt: '2026-04-01',
    lastRestockedAt: '2026-04-01',
    // Operational details
    assemblyStatus: 'flat_packed',
    condition: 'damaged',
    cleanliness: 'dirty',
    supplierName: 'Xưởng Cơ Khí Inox Hoàng Gia',
    serialNumbers: [],
    maintenanceLogs: [
      { id: 'M-010', date: '2026-04-10', task: 'Bản lề bị rỉ nặng khó mở cửa', technician: 'Trần Minh Hải', cost: 100000, status: 'completed' }
    ],
    sensorData: {
      temp: 25.1,
      humidity: 63,
      doorOpen: false
    }
  },
  {
    id: 'CAGE-011',
    name: 'Chuồng Chó Lưới Sắt Size M Nâng Cấp',
    code: 'CAGE-DOG-M-MESH',
    categoryId: 'CC01',
    categoryName: 'Chuồng Grooming',
    size: 'M',
    material: 'Lưới sắt mạ kẽm',
    color: 'Đen/Bạc',
    petTypes: ['dog', 'cat'],
    costPrice: 680000,
    price: 1100000,
    stock: 2,
    minStock: 4,
    barcode: '8934588001005',
    image: 'https://placehold.co/200x200/475569/white?text=L%C6%B0%E1%BB%9Bi+S%E1%BA%AFt',
    status: 'active',
    description: 'Chuồng chó lưới sắt mạ kẽm loại M nâng cấp. Thoáng khí tối đa nhờ lưới mắt nhỏ, phù hợp chó dễ bị stress.',
    lengthCm: 76,
    widthCm: 53,
    heightCm: 61,
    maxWeight: 15,
    warranty: 12,
    location: 'Zone A - Hàng 1 - Kệ A1-04',
    createdAt: '2026-06-01',
    lastRestockedAt: '2026-06-12',
    // Operational details
    assemblyStatus: 'assembled',
    condition: 'good',
    cleanliness: 'cleaned',
    supplierName: 'Xưởng Nhựa & Kim Khí Việt Nhật',
    serialNumbers: ['SN-CAGE-011-G1'],
    maintenanceLogs: [],
    sensorData: {
      temp: 24.9,
      humidity: 59,
      doorOpen: false
    }
  },
  {
    id: 'CAGE-012',
    name: 'Lồng Nhựa Vận Chuyển Size M',
    code: 'CAGE-TRAVEL-M-PP',
    categoryId: 'CC03',
    categoryName: 'Chuồng Tắm',
    size: 'M',
    material: 'Nhựa ABS',
    color: 'Xanh dương/Xám',
    petTypes: ['dog', 'cat'],
    costPrice: 480000,
    price: 780000,
    stock: 1,
    minStock: 5,
    barcode: '8934588003002',
    image: 'https://placehold.co/200x200/3B82F6/white?text=L%E1%BB%93ng+VC+M',
    status: 'active',
    description: 'Lồng nhựa ABS vận chuyển size M. Thiết kế 2 mảnh rời dễ lắp ráp, cửa bằng thép không gỉ. Đạt tiêu chuẩn hàng không IATA.',
    lengthCm: 58,
    widthCm: 40,
    heightCm: 42,
    maxWeight: 12,
    warranty: 12,
    location: 'Zone C - Hàng 1 - Kệ C1-02',
    createdAt: '2026-06-05',
    lastRestockedAt: '2026-06-05',
    // Operational details
    assemblyStatus: 'flat_packed',
    condition: 'new',
    cleanliness: 'cleaned',
    supplierName: 'Công ty Nhựa Việt Nhật',
    serialNumbers: [],
    maintenanceLogs: [],
    sensorData: {
      temp: 24.3,
      humidity: 60,
      doorOpen: false
    }
  }
]

const KEY = 'spsb_cages'

const getStored = (): Cage[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(KEY)
    if (data) {
      try {
        const parsed = JSON.parse(data) as Cage[]
        let mutated = false
        const migrated = parsed.map(c => {
          if (!c.categoryId) {
            mutated = true
            const category = getCageCategoryByCode(c.code || c.id)
            return {
              ...c,
              categoryId: category.id,
              categoryName: category.name
            }
          }
          return c
        })
        if (mutated) {
          localStorage.setItem(KEY, JSON.stringify(migrated))
        }
        return migrated
      } catch {
        /* ignore */
      }
    }
  }
  return INITIAL_CAGES
}

export const CAGE_MOCK_LIST: Cage[] = getStored()

export const saveCages = (list: Cage[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(KEY, JSON.stringify(list))
  }
  CAGE_MOCK_LIST.length = 0
  CAGE_MOCK_LIST.push(...list)
}
