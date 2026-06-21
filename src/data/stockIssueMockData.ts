import type { StockIssue } from '@/types'

const INITIAL_STOCK_ISSUES: StockIssue[] = [
  {
    id: 'GIN-20260531-001',
    type: 'transfer',
    warehouseId: 'warehouse',
    targetShopId: 'SH01',
    items: [
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', quantity: 5, unitCost: 65000 },
    ],
    totalValue: 325000,
    status: 'completed',
    reason: 'Xuất chuyển kho định kỳ sang chi nhánh Q.1',
    createdBy: 'Nguyễn Thị Cẩm',
    createdAt: '2026-05-31 11:00',
    approvedBy: 'Nguyễn Thị Cẩm',
    approvedAt: '2026-05-31 11:00',
    note: 'Xuất chuyển kho tự động theo định mức tối thiểu',
  },
  {
    id: 'GIN-20260530-002',
    type: 'transfer',
    warehouseId: 'warehouse',
    targetShopId: 'SH02',
    items: [
      { skuId: 'P005-S3', skuCode: 'P005-500ML-NS', productName: 'Sữa tắm Haan 500ml Nhạy cảm', quantity: 1, unitCost: 120000 },
    ],
    totalValue: 120000,
    status: 'completed',
    reason: 'Xuất chuyển kho vật tư sang chi nhánh Q.3',
    createdBy: 'Trần Hùng',
    createdAt: '2026-05-30 12:45',
    approvedBy: 'Trần Hùng',
    approvedAt: '2026-05-30 12:45',
    note: 'Phục vụ nhu cầu dịch vụ tại cơ sở Q.3',
  },
  {
    id: 'GIN-20260530-003',
    type: 'transfer',
    warehouseId: 'warehouse',
    targetShopId: 'SH03',
    items: [
      { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', quantity: 2, unitCost: 75000 },
    ],
    totalValue: 150000,
    status: 'completed',
    reason: 'Chuyển kho hàng trưng bày sang chi nhánh Bình Thạnh',
    createdBy: 'Đặng Thu Hương',
    createdAt: '2026-05-30 17:00',
    approvedBy: 'Admin PetCare',
    approvedAt: '2026-05-30 17:30',
    note: 'Chuyển kho phục vụ sự kiện khai trương',
  },
  {
    id: 'GIN-20260610-004',
    type: 'transfer',
    warehouseId: 'warehouse',
    targetShopId: 'SH01',
    items: [
      { skuId: 'P001-S5', skuCode: 'P001-10KG-GA', productName: 'Royal Canin Adult 10kg Gà', quantity: 3, unitCost: 1150000 },
    ],
    totalValue: 3450000,
    status: 'pending_approval',
    reason: 'Chuyển kho hàng cận HSD để xả hàng tại chi nhánh Q.1',
    createdBy: 'Bùi Văn Khánh',
    createdAt: '2026-06-10 15:00',
    note: 'Chi nhánh Q.1 đang chạy chương trình khuyến mãi giảm giá',
  },
  {
    id: 'GIN-20260612-005',
    type: 'transfer',
    warehouseId: 'warehouse',
    targetShopId: 'SH02',
    items: [
      { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', quantity: 2, unitCost: 285000 },
      { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', quantity: 3, unitCost: 75000 },
    ],
    totalValue: 795000,
    status: 'completed',
    reason: 'Xuất chuyển kho bổ sung tồn kho chi nhánh Q.3',
    createdBy: 'Nguyễn Thị Cẩm',
    createdAt: '2026-06-12 14:30',
    approvedBy: 'Nguyễn Thị Cẩm',
    approvedAt: '2026-06-12 14:30',
    note: '',
  },
  {
    id: 'GIN-20260615-006',
    type: 'transfer',
    warehouseId: 'warehouse',
    targetShopId: 'SH02',
    items: [
      { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', quantity: 15, unitCost: 285000 },
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', quantity: 10, unitCost: 65000 },
    ],
    totalValue: 4925000,
    status: 'draft',
    reason: 'Xuất chuyển kho theo phiếu TF-002',
    createdBy: 'Bùi Văn Khánh',
    createdAt: '2026-06-15 09:00',
    note: 'Liên kết phiếu chuyển kho TF-002',
  },
]

const KEY = 'spsb_stock_issues'

const getStored = (): StockIssue[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(KEY)
    if (data) {
      try { return JSON.parse(data) } catch { /* ignore */ }
    }
  }
  return INITIAL_STOCK_ISSUES
}

export const STOCK_ISSUES: StockIssue[] = getStored()

export const saveStockIssues = (list: StockIssue[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(KEY, JSON.stringify(list))
  }
  STOCK_ISSUES.length = 0
  STOCK_ISSUES.push(...list)
}
