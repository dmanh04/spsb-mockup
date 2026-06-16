import type { StockReceipt } from '@/types'

const INITIAL_STOCK_RECEIPTS: StockReceipt[] = [
  {
    id: 'GRN-20260528-001',
    supplierId: 'SP001',
    supplierName: 'Công ty TNHH Royal Canin Vietnam',
    warehouseId: 'warehouse',
    poReference: 'PO-2026051',
    items: [
      { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', orderedQty: 60, receivedQty: 60, unitCost: 285000 },
      { skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', orderedQty: 40, receivedQty: 40, unitCost: 520000 },
      { skuId: 'P001-S5', skuCode: 'P001-10KG-GA', productName: 'Royal Canin Adult 10kg Gà', orderedQty: 20, receivedQty: 18, unitCost: 1150000, note: 'Thiếu 2 bao, NCC hẹn giao bổ sung' },
    ],
    totalValue: 58500000,
    status: 'completed',
    createdBy: 'Bùi Văn Khánh',
    createdAt: '2026-05-28 09:00',
    approvedBy: 'Admin PetCare',
    approvedAt: '2026-05-28 09:30',
    note: 'Nhập hàng định kỳ tháng 5 từ Royal Canin',
  },
  {
    id: 'GRN-20260530-002',
    supplierId: 'SP002',
    supplierName: 'Mars Vietnam (Pedigree/Whiskas)',
    warehouseId: 'warehouse',
    poReference: 'PO-2026052',
    items: [
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', orderedQty: 100, receivedQty: 100, unitCost: 65000 },
    ],
    totalValue: 6500000,
    status: 'completed',
    createdBy: 'Bùi Văn Khánh',
    createdAt: '2026-05-30 14:00',
    approvedBy: 'Admin PetCare',
    approvedAt: '2026-05-30 14:30',
    note: 'Bổ sung Whiskas cho tháng 6',
  },
  {
    id: 'GRN-20260605-003',
    supplierId: 'SP003',
    supplierName: 'Pet Accessories Vietnam',
    warehouseId: 'warehouse',
    items: [
      { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', orderedQty: 80, receivedQty: 80, unitCost: 75000 },
      { skuId: 'P005-S3', skuCode: 'P005-500ML-NS', productName: 'Sữa tắm Haan 500ml Nhạy cảm', orderedQty: 50, receivedQty: 50, unitCost: 120000 },
    ],
    totalValue: 12000000,
    status: 'approved',
    createdBy: 'Bùi Văn Khánh',
    createdAt: '2026-06-05 10:00',
    approvedBy: 'Admin PetCare',
    approvedAt: '2026-06-05 11:00',
    note: 'Nhập vật tư chăm sóc và cát vệ sinh',
  },
  {
    id: 'GRN-20260610-004',
    supplierId: 'SP001',
    supplierName: 'Công ty TNHH Royal Canin Vietnam',
    warehouseId: 'warehouse',
    poReference: 'PO-2026061',
    items: [
      { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', orderedQty: 50, receivedQty: 50, unitCost: 285000 },
      { skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', orderedQty: 30, receivedQty: 30, unitCost: 520000 },
    ],
    totalValue: 29850000,
    status: 'pending_approval',
    createdBy: 'Bùi Văn Khánh',
    createdAt: '2026-06-10 08:30',
    note: 'Nhập bổ sung Royal Canin cho các chi nhánh',
  },
  {
    id: 'GRN-20260615-005',
    supplierId: 'SP002',
    supplierName: 'Mars Vietnam (Pedigree/Whiskas)',
    warehouseId: 'warehouse',
    items: [
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', orderedQty: 80, receivedQty: 0, unitCost: 65000 },
    ],
    totalValue: 5200000,
    status: 'draft',
    createdBy: 'Bùi Văn Khánh',
    createdAt: '2026-06-15 16:00',
    note: 'Nháp - chờ xác nhận số lượng',
  },
]

const KEY = 'spsb_stock_receipts'

const getStored = (): StockReceipt[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(KEY)
    if (data) {
      try { return JSON.parse(data) } catch { /* ignore */ }
    }
  }
  return INITIAL_STOCK_RECEIPTS
}

export const STOCK_RECEIPTS: StockReceipt[] = getStored()

export const saveStockReceipts = (list: StockReceipt[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(KEY, JSON.stringify(list))
  }
  STOCK_RECEIPTS.length = 0
  STOCK_RECEIPTS.push(...list)
}
