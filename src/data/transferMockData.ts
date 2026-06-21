import type { StockTransfer } from '@/types'

const INITIAL_TRANSFER_MOCK_LIST: StockTransfer[] = [
  {
    id: 'TF-001', fromShopId: 'warehouse', toShopId: 'SH01',
    items: [{ skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', itemType: 'product', quantity: 20 }],
    status: 'received',
    requestedBy: 'Nguyễn Quang Minh', requestedAt: '2026-05-28 16:00',
    approvedBy: 'Bùi Văn Khánh',
    note: 'Bổ sung hàng cho SH01',
  },
  {
    id: 'TF-002', fromShopId: 'warehouse', toShopId: 'SH02',
    items: [
      { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', itemType: 'product', quantity: 15 },
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', itemType: 'product', quantity: 10 },
    ],
    status: 'pending',
    requestedBy: 'Đặng Thu Hương', requestedAt: '2026-05-31 08:00',
    note: 'SH02 sắp hết hàng Royal Canin và Whiskas',
  },
  {
    id: 'TF-003', fromShopId: 'SH01', toShopId: 'SH02',
    items: [{ skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', itemType: 'product', quantity: 10 }],
    status: 'approved',
    requestedBy: 'Đặng Thu Hương', requestedAt: '2026-05-30 10:00',
    approvedBy: 'Bùi Văn Khánh',
    note: 'SH01 có dư, SH02 thiếu cát',
  },
  {
    id: 'TF-004', fromShopId: 'warehouse', toShopId: 'SH01',
    items: [
      { skuId: 'RC01', skuCode: 'CAGE-GROOMING', productName: 'Chuồng Grooming', itemType: 'cage', quantity: 2 },
      { skuId: 'RC02', skuCode: 'CAGE-SPA', productName: 'Chuồng Spa', itemType: 'cage', quantity: 1 },
      { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', itemType: 'product', quantity: 10 },
    ],
    status: 'pending',
    requestedBy: 'Nguyễn Quang Minh', requestedAt: '2026-06-21 10:00',
    note: 'Yêu cầu cấp thêm chuồng dịch vụ và thức ăn hạt',
  }
]

const LOCAL_STORAGE_KEY = 'spsb_transfers_data'

const getStoredTransfers = (): StockTransfer[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        console.error('Failed to parse transfers', e)
      }
    }
  }
  return INITIAL_TRANSFER_MOCK_LIST
}

export const TRANSFER_MOCK_LIST: StockTransfer[] = getStoredTransfers()

export const saveTransfers = (transfers: StockTransfer[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transfers))
  }
  TRANSFER_MOCK_LIST.length = 0
  TRANSFER_MOCK_LIST.push(...transfers)
}
