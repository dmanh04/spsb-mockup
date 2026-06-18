import type { Cage } from '@/types'

const INITIAL_CAGES: Cage[] = [
  {
    id: 'CAGE-001',
    name: 'Chuồng Chó Inox Cao Cấp',
    code: 'CAGE-DOG-S-INOX',
    size: 'S',
    material: 'Inox 304',
    petType: 'dog',
    price: 850000,
    stock: 15,
    image: 'https://placehold.co/200x200/3B82F6/white?text=Chu%E1%BB%93ng+Ch%C3%B3+S',
    status: 'active',
    description: 'Chuồng chó inox 304 size S, phù hợp cho chó dưới 5kg. Khay hứng vệ sinh rời, dễ vệ sinh.',
    createdAt: '2026-05-10',
  },
  {
    id: 'CAGE-002',
    name: 'Chuồng Chó Inox Cao Cấp',
    code: 'CAGE-DOG-M-INOX',
    size: 'M',
    material: 'Inox 304',
    petType: 'dog',
    price: 1250000,
    stock: 10,
    image: 'https://placehold.co/200x200/3B82F6/white?text=Chu%E1%BB%93ng+Ch%C3%B3+M',
    status: 'active',
    description: 'Chuồng chó inox 304 size M, phù hợp cho chó 5-15kg. Cửa kép an toàn.',
    createdAt: '2026-05-10',
  },
  {
    id: 'CAGE-003',
    name: 'Chuồng Chó Inox Cao Cấp',
    code: 'CAGE-DOG-L-INOX',
    size: 'L',
    material: 'Inox 304',
    petType: 'dog',
    price: 1850000,
    stock: 8,
    image: 'https://placehold.co/200x200/3B82F6/white?text=Chu%E1%BB%93ng+Ch%C3%B3+L',
    status: 'active',
    description: 'Chuồng chó inox 304 size L, phù hợp cho chó 15-30kg. Có bánh xe di chuyển.',
    createdAt: '2026-05-10',
  },
  {
    id: 'CAGE-004',
    name: 'Chuồng Chó Sắt Sơn Tĩnh Điện',
    code: 'CAGE-DOG-XL-STEEL',
    size: 'XL',
    material: 'Sắt sơn tĩnh điện',
    petType: 'dog',
    price: 2500000,
    stock: 5,
    image: 'https://placehold.co/200x200/6366F1/white?text=Chu%E1%BB%93ng+Ch%C3%B3+XL',
    status: 'active',
    description: 'Chuồng chó sắt sơn tĩnh điện size XL, phù hợp cho chó trên 30kg. Khung chắc chắn.',
    createdAt: '2026-05-12',
  },
  {
    id: 'CAGE-005',
    name: 'Chuồng Mèo 3 Tầng',
    code: 'CAGE-CAT-L-3T',
    size: 'L',
    material: 'Inox 304',
    petType: 'cat',
    price: 2200000,
    stock: 12,
    image: 'https://placehold.co/200x200/EC4899/white?text=Chu%E1%BB%93ng+M%C3%A8o+3T',
    status: 'active',
    description: 'Chuồng mèo 3 tầng inox 304, có sàn nhựa chống trượt. Đa năng, dễ lắp ráp.',
    createdAt: '2026-05-15',
  },
  {
    id: 'CAGE-006',
    name: 'Chuồng Mèo 2 Tầng Gấp Gọn',
    code: 'CAGE-CAT-M-2T',
    size: 'M',
    material: 'Sắt sơn tĩnh điện',
    petType: 'cat',
    price: 1500000,
    stock: 18,
    image: 'https://placehold.co/200x200/EC4899/white?text=Chu%E1%BB%93ng+M%C3%A8o+2T',
    status: 'active',
    description: 'Chuồng mèo 2 tầng gấp gọn, tiện lợi khi vận chuyển. Có khay vệ sinh kèm theo.',
    createdAt: '2026-05-18',
  },
  {
    id: 'CAGE-007',
    name: 'Lồng Vận Chuyển Thú Cưng',
    code: 'CAGE-TRAVEL-S',
    size: 'S',
    material: 'Nhựa PP',
    petType: 'cat',
    price: 450000,
    stock: 25,
    image: 'https://placehold.co/200x200/F59E0B/white?text=L%E1%BB%93ng+VC+S',
    status: 'active',
    description: 'Lồng vận chuyển nhựa PP cho mèo hoặc chó nhỏ, có cửa sắt chắc chắn.',
    createdAt: '2026-05-20',
  },
  {
    id: 'CAGE-008',
    name: 'Chuồng Chim Trang Trí',
    code: 'CAGE-BIRD-M-DECO',
    size: 'M',
    material: 'Sắt mạ kẽm',
    petType: 'bird',
    price: 680000,
    stock: 7,
    image: 'https://placehold.co/200x200/10B981/white?text=Chu%E1%BB%93ng+Chim',
    status: 'active',
    description: 'Chuồng chim trang trí kiểu Châu Âu, sắt mạ kẽm chống rỉ sét. Kèm máng ăn, máng nước.',
    createdAt: '2026-05-22',
  },
  {
    id: 'CAGE-009',
    name: 'Chuồng Thỏ Gỗ Tự Nhiên',
    code: 'CAGE-RABBIT-L-WOOD',
    size: 'L',
    material: 'Gỗ thông tự nhiên',
    petType: 'rabbit',
    price: 1800000,
    stock: 4,
    image: 'https://placehold.co/200x200/8B5CF6/white?text=Chu%E1%BB%93ng+Th%E1%BB%8F',
    status: 'active',
    description: 'Chuồng thỏ gỗ thông tự nhiên, 2 tầng, có khu vực chơi và nghỉ ngơi riêng biệt.',
    createdAt: '2026-05-25',
  },
  {
    id: 'CAGE-010',
    name: 'Chuồng Mèo Inox Nhỏ',
    code: 'CAGE-CAT-S-INOX',
    size: 'S',
    material: 'Inox 201',
    petType: 'cat',
    price: 650000,
    stock: 0,
    image: 'https://placehold.co/200x200/EC4899/white?text=Chu%E1%BB%93ng+M%C3%A8o+S',
    status: 'inactive',
    description: 'Chuồng mèo inox 201 size S. Đã ngừng nhập.',
    createdAt: '2026-04-01',
  },
]

const KEY = 'spsb_cages'

const getStored = (): Cage[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(KEY)
    if (data) {
      try { return JSON.parse(data) } catch { /* ignore */ }
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
