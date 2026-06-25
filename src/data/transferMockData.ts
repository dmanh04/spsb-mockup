import type { StockTransfer } from '@/types'

const INITIAL_TRANSFER_MOCK_LIST: StockTransfer[] = [
  {
    id: 'TF-001', fromShopId: 'warehouse', toShopId: 'SH01',
    items: [{ skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', itemType: 'product', quantity: 20, receivedQty: 20 }],
    status: 'completed',
    requestedBy: 'Nguyễn Quang Minh', requestedAt: '2026-05-28 16:00',
    approvedBy: 'Bùi Văn Khánh', approvedAt: '2026-05-28 16:30',
    receivedAt: '2026-05-29 10:00',
    note: 'Nhập hàng định kỳ tuần cuối tháng 5 cho SH01',
  },
  {
    id: 'TF-002', fromShopId: 'warehouse', toShopId: 'SH02',
    items: [
      { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', itemType: 'product', quantity: 15 },
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', itemType: 'product', quantity: 10 },
    ],
    status: 'pending',
    requestedBy: 'Đặng Thu Hương', requestedAt: '2026-06-24 08:00',
    note: 'Cần gấp Royal Canin và Whiskas do lượng khách tăng mạnh',
  },
  {
    id: 'TF-003', fromShopId: 'warehouse', toShopId: 'SH02',
    items: [{ skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', itemType: 'product', quantity: 12 }],
    status: 'approved',
    requestedBy: 'Đặng Thu Hương', requestedAt: '2026-06-23 10:00',
    approvedBy: 'Bùi Văn Khánh', approvedAt: '2026-06-23 11:30',
    note: 'Kho chi nhánh Q.3 hết cát vệ sinh mèo',
  },
  {
    id: 'TF-004', fromShopId: 'warehouse', toShopId: 'SH01',
    items: [
      { skuId: 'RC01', skuCode: 'CAGE-GROOMING', productName: 'Chuồng Grooming', itemType: 'cage', quantity: 2 },
      { skuId: 'RC02', skuCode: 'CAGE-SPA', productName: 'Chuồng Spa', itemType: 'cage', quantity: 1 },
      { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', itemType: 'product', quantity: 10 },
    ],
    status: 'shipped',
    requestedBy: 'Nguyễn Quang Minh', requestedAt: '2026-06-22 10:00',
    approvedBy: 'Bùi Văn Khánh', approvedAt: '2026-06-22 14:00',
    shippedAt: '2026-06-23 09:00',
    note: 'Yêu cầu cấp thêm chuồng dịch vụ và thức ăn hạt',
  },
  {
    id: 'TF-005', fromShopId: 'warehouse', toShopId: 'SH03',
    items: [
      { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', itemType: 'product', quantity: 50 },
    ],
    status: 'picking',
    requestedBy: 'Lê Hoàng Long', requestedAt: '2026-06-23 15:00',
    approvedBy: 'Bùi Văn Khánh', approvedAt: '2026-06-23 16:00',
    note: 'Nhập cát dự phòng phục vụ đợt khuyến mãi tháng 6',
  },
  {
    id: 'TF-006', fromShopId: 'warehouse', toShopId: 'SH01',
    items: [
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', itemType: 'product', quantity: 30 },
    ],
    status: 'in_transit',
    requestedBy: 'Nguyễn Quang Minh', requestedAt: '2026-06-23 08:30',
    approvedBy: 'Bùi Văn Khánh', approvedAt: '2026-06-23 09:30',
    shippedAt: '2026-06-23 13:00',
    note: 'Vận chuyển Whiskas hạt bổ sung tồn kho tối thiểu',
  },
  {
    id: 'TF-007', fromShopId: 'warehouse', toShopId: 'SH02',
    items: [
      { skuId: 'P005-S3', skuCode: 'P005-500ML-NS', productName: 'Sữa tắm Haan 500ml Nhạy cảm', itemType: 'product', quantity: 8 },
    ],
    status: 'received',
    requestedBy: 'Đặng Thu Hương', requestedAt: '2026-06-22 16:45',
    approvedBy: 'Bùi Văn Khánh', approvedAt: '2026-06-23 08:00',
    shippedAt: '2026-06-23 10:30',
    receivedAt: '2026-06-23 15:45',
    note: 'Cấp phát gấp sữa tắm Haan cho khu Spa',
  },
  {
    id: 'TF-008', fromShopId: 'warehouse', toShopId: 'SH03',
    items: [
      { skuId: 'RC03', skuCode: 'CAGE-BOARDING', productName: 'Chuồng Boarding', itemType: 'cage', quantity: 5 },
    ],
    status: 'rejected',
    requestedBy: 'Lê Hoàng Long', requestedAt: '2026-06-21 11:00',
    note: 'Xin cấp chuồng boarding mới',
    rejectReason: 'Chi nhánh SH03 hiện đã vượt quá công suất chuồng lắp đặt thực tế.',
  },
  {
    id: 'TF-009', fromShopId: 'warehouse', toShopId: 'SH01',
    items: [
      { skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', itemType: 'product', quantity: 15, receivedQty: 12 },
    ],
    status: 'partially_received',
    requestedBy: 'Nguyễn Quang Minh', requestedAt: '2026-06-20 09:00',
    approvedBy: 'Bùi Văn Khánh', approvedAt: '2026-06-20 10:30',
    shippedAt: '2026-06-21 08:00',
    receivedAt: '2026-06-21 14:00',
    note: 'Chuyển hàng Royal Canin 4kg. Giao thiếu 3 bao do xe hết chỗ chở.',
  },
  {
    id: 'TF-010', fromShopId: 'warehouse', toShopId: 'SH01',
    items: [
      { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', itemType: 'product', quantity: 25 },
      { skuId: 'P005-S3', skuCode: 'P005-500ML-NS', productName: 'Sữa tắm Haan 500ml Nhạy cảm', itemType: 'product', quantity: 12 },
    ],
    status: 'pending',
    requestedBy: 'Nguyễn Quang Minh', requestedAt: '2026-06-25 08:00',
    note: 'Cần bổ sung cát vệ sinh và sữa tắm cho tuần cuối tháng 6',
  },
  {
    id: 'TF-011', fromShopId: 'warehouse', toShopId: 'SH01',
    items: [
      { skuId: 'RC04', skuCode: 'CAGE-INOX-M', productName: 'Chuồng Inox Trung (M)', itemType: 'cage', quantity: 3 },
      { skuId: 'RC05', skuCode: 'CAGE-INOX-L', productName: 'Chuồng Inox Lớn (L)', itemType: 'cage', quantity: 2 },
    ],
    status: 'approved',
    requestedBy: 'Nguyễn Quang Minh', requestedAt: '2026-06-24 09:30',
    approvedBy: 'Bùi Văn Khánh', approvedAt: '2026-06-24 11:00',
    note: 'Bổ sung chuồng inox cho khu grooming và boarding SH01',
  },
  {
    id: 'TF-012', fromShopId: 'warehouse', toShopId: 'SH01',
    items: [
      { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', itemType: 'product', quantity: 30 },
      { skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', itemType: 'product', quantity: 20 },
      { skuId: 'P001-S5', skuCode: 'P001-10KG-GA', productName: 'Royal Canin Adult 10kg Gà', itemType: 'product', quantity: 10 },
    ],
    status: 'completed',
    requestedBy: 'Nguyễn Quang Minh', requestedAt: '2026-06-18 10:00',
    approvedBy: 'Bùi Văn Khánh', approvedAt: '2026-06-18 11:00',
    shippedAt: '2026-06-19 09:00',
    receivedAt: '2026-06-19 14:30',
    note: 'Nhập đủ Royal Canin các size phục vụ tháng 6',
  },
  {
    id: 'TF-013', fromShopId: 'warehouse', toShopId: 'SH01',
    items: [
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', itemType: 'product', quantity: 40 },
      { skuId: 'P005-S3', skuCode: 'P005-500ML-NS', productName: 'Sữa tắm Haan 500ml Nhạy cảm', itemType: 'product', quantity: 15 },
    ],
    status: 'shipped',
    requestedBy: 'Nguyễn Quang Minh', requestedAt: '2026-06-24 14:00',
    approvedBy: 'Bùi Văn Khánh', approvedAt: '2026-06-24 15:00',
    shippedAt: '2026-06-25 08:00',
    note: 'Cấp Whiskas và sữa tắm bổ sung theo đợt khuyến mãi cuối tháng',
  },
  {
    id: 'TF-014', fromShopId: 'warehouse', toShopId: 'SH01',
    items: [
      { skuId: 'RC01', skuCode: 'CAGE-GROOMING', productName: 'Chuồng Grooming', itemType: 'cage', quantity: 1 },
    ],
    status: 'rejected',
    requestedBy: 'Nguyễn Quang Minh', requestedAt: '2026-06-15 09:00',
    rejectReason: 'SH01 đã có đủ chuồng grooming theo định mức. Đề nghị luân chuyển chuồng hiện có trước.',
    note: 'Xin thêm chuồng grooming mới',
  },
  {
    id: 'TF-015', fromShopId: 'warehouse', toShopId: 'SH01',
    items: [
      { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', itemType: 'product', quantity: 30, receivedQty: 30 },
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', itemType: 'product', quantity: 20, receivedQty: 20 },
    ],
    status: 'completed',
    requestedBy: 'Nguyễn Quang Minh', requestedAt: '2026-06-10 08:00',
    approvedBy: 'Bùi Văn Khánh', approvedAt: '2026-06-10 09:00',
    shippedAt: '2026-06-11 07:30',
    receivedAt: '2026-06-11 11:00',
    note: 'Nhập cát và Whiskas định kỳ đầu tháng 6',
  },
]

const LOCAL_STORAGE_KEY = 'spsb_transfers_data'
const DATA_VERSION_KEY = 'spsb_transfers_version'
const CURRENT_VERSION = '2'  // Tăng số này khi thay đổi INITIAL_TRANSFER_MOCK_LIST

const getStoredTransfers = (): StockTransfer[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedVersion = localStorage.getItem(DATA_VERSION_KEY)
    if (storedVersion !== CURRENT_VERSION) {
      // Version mới → xóa cache cũ, dùng dữ liệu mới nhất
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION)
      return INITIAL_TRANSFER_MOCK_LIST
    }
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
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION)
  }
  TRANSFER_MOCK_LIST.length = 0
  TRANSFER_MOCK_LIST.push(...transfers)
}
