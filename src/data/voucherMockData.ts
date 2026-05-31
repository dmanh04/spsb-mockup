import type { Voucher } from '@/types'

const INITIAL_VOUCHER_MOCK_LIST: Voucher[] = [
  {
    id: 'V001', code: 'PETCARE50K', name: 'Giảm 50.000đ cho đơn từ 500k',
    type: 'fixed', value: 50000, minOrderValue: 500000,
    usageLimit: 100, usedCount: 42,
    startDate: '2026-05-01', endDate: '2026-06-30', status: 'active',
  },
  {
    id: 'V002', code: 'SUMMER10', name: 'Giảm 10% mùa hè, tối đa 100k',
    type: 'percent', value: 10, minOrderValue: 300000, maxDiscount: 100000,
    usageLimit: 200, usedCount: 78,
    startDate: '2026-06-01', endDate: '2026-08-31', status: 'active',
  },
  {
    id: 'V003', code: 'NEWCUS20', name: 'Khách mới giảm 20%',
    type: 'percent', value: 20, minOrderValue: 0, maxDiscount: 150000,
    usageLimit: 500, usedCount: 312,
    startDate: '2026-01-01', endDate: '2026-12-31', status: 'active', shopId: 'SH01',
  },
  {
    id: 'V004', code: 'FLASH30', name: 'Flash sale 30k',
    type: 'fixed', value: 30000, minOrderValue: 200000,
    usageLimit: 50, usedCount: 50,
    startDate: '2026-04-01', endDate: '2026-04-30', status: 'expired',
  },
  {
    id: 'V005', code: 'SPA15', name: 'Giảm 15% dịch vụ Spa',
    type: 'percent', value: 15, minOrderValue: 250000, maxDiscount: 200000,
    usageLimit: 80, usedCount: 23,
    startDate: '2026-05-15', endDate: '2026-07-15', status: 'active', shopId: 'SH01',
  },
]

const LOCAL_STORAGE_KEY = 'spsb_vouchers_data'

const getStoredVouchers = (): Voucher[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        console.error('Failed to parse stored vouchers', e)
      }
    }
  }
  return INITIAL_VOUCHER_MOCK_LIST
}

export const VOUCHER_MOCK_LIST: Voucher[] = getStoredVouchers()

export const saveVouchers = (vouchers: Voucher[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(vouchers))
  }
  VOUCHER_MOCK_LIST.length = 0
  VOUCHER_MOCK_LIST.push(...vouchers)
}
