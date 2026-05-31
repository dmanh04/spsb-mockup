import type { Shop } from '@/types'

export const SHOP_MOCK_LIST: Shop[] = [
  {
    id: 'SH01',
    name: 'PetCare Chi nhánh Q.1',
    address: '123 Lý Tự Trọng, P.Bến Nghé, Q.1, TP.HCM',
    phone: '028 3822 1001',
    shopHeadId: 'U030',
    shopHeadName: 'Nguyễn Quang Minh',
    status: 'active',
    openTime: '07:00',
    closeTime: '21:00',
    createdAt: '2023-12-01',
  },
  {
    id: 'SH02',
    name: 'PetCare Chi nhánh Q.3',
    address: '45 Võ Văn Tần, P.6, Q.3, TP.HCM',
    phone: '028 3930 2002',
    shopHeadId: 'U031',
    shopHeadName: 'Đặng Thu Hương',
    status: 'active',
    openTime: '07:30',
    closeTime: '20:30',
    createdAt: '2023-12-15',
  },
  {
    id: 'SH03',
    name: 'PetCare Chi nhánh Bình Thạnh',
    address: '88 Đinh Tiên Hoàng, P.3, Q.Bình Thạnh, TP.HCM',
    phone: '028 3553 3003',
    status: 'active',
    openTime: '08:00',
    closeTime: '20:00',
    createdAt: '2024-03-01',
  },
]
