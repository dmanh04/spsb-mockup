import type { StockReceipt } from '@/types'

const INITIAL_STOCK_RECEIPTS: StockReceipt[] = [
  {
    id: 'GRN-20260528-001',
    supplierId: 'SP001',
    supplierName: 'Công ty TNHH Royal Canin Vietnam',
    warehouseId: 'warehouse',
    poReference: 'PO-2026051',
    items: [
      { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', itemType: 'product', orderedQty: 60, receivedQty: 60, unitCost: 285000, estimatedCost: 280000, actualCost: 285000 },
      { skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', itemType: 'product', orderedQty: 40, receivedQty: 40, unitCost: 520000, estimatedCost: 510000, actualCost: 520000 },
      { skuId: 'P001-S5', skuCode: 'P001-10KG-GA', productName: 'Royal Canin Adult 10kg Gà', itemType: 'product', orderedQty: 20, receivedQty: 18, unitCost: 1150000, estimatedCost: 1100000, actualCost: 1150000, note: 'Thiếu 2 bao, NCC hẹn giao bổ sung' },
    ],
    totalValue: 58500000,
    estimatedTotalValue: 56200000,
    actualTotalValue: 58500000,
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
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', itemType: 'product', orderedQty: 100, receivedQty: 100, unitCost: 65000, estimatedCost: 62000, actualCost: 65000 },
    ],
    totalValue: 6500000,
    estimatedTotalValue: 6200000,
    actualTotalValue: 6500000,
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
      { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', itemType: 'product', orderedQty: 80, receivedQty: 80, unitCost: 75000, estimatedCost: 72000, actualCost: 75000 },
      { skuId: 'P005-S3', skuCode: 'P005-500ML-NS', productName: 'Sữa tắm Haan 500ml Nhạy cảm', itemType: 'product', orderedQty: 50, receivedQty: 50, unitCost: 120000, estimatedCost: 115000, actualCost: 120000 },
      { skuId: 'CAGE-001', skuCode: 'CAGE-DOG-S-INOX', productName: 'Chuồng Chó Inox Cao Cấp (S)', itemType: 'cage', orderedQty: 10, receivedQty: 10, unitCost: 550000, estimatedCost: 520000, actualCost: 550000 },
    ],
    totalValue: 17500000,
    estimatedTotalValue: 16760000,
    actualTotalValue: 17500000,
    status: 'completed',
    createdBy: 'Bùi Văn Khánh',
    createdAt: '2026-06-05 10:00',
    approvedBy: 'Admin PetCare',
    approvedAt: '2026-06-05 11:00',
    note: 'Nhập vật tư chăm sóc, cát vệ sinh và chuồng chó',
  },
  {
    id: 'GRN-20260610-004',
    supplierId: 'SP001',
    supplierName: 'Công ty TNHH Royal Canin Vietnam',
    warehouseId: 'warehouse',
    poReference: 'PO-2026061',
    items: [
      { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', itemType: 'product', orderedQty: 50, receivedQty: 50, unitCost: 0 },
      { skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', itemType: 'product', orderedQty: 30, receivedQty: 30, unitCost: 0 },
      { skuId: 'CAGE-005', skuCode: 'CAGE-CAT-L-3T', productName: 'Chuồng Mèo 3 Tầng (L)', itemType: 'cage', orderedQty: 5, receivedQty: 5, unitCost: 0 },
    ],
    totalValue: 0,
    status: 'pending_approval',
    createdBy: 'Bùi Văn Khánh',
    createdAt: '2026-06-10 08:30',
    note: 'Nhập bổ sung Royal Canin và chuồng mèo cho các chi nhánh',
  },
  {
    id: 'GRN-20260612-006',
    supplierId: 'SP003',
    supplierName: 'Pet Accessories Vietnam',
    warehouseId: 'warehouse',
    items: [
      { skuId: 'CAGE-002', skuCode: 'CAGE-DOG-M-INOX', productName: 'Chuồng Chó Inox Cao Cấp (M)', itemType: 'cage', orderedQty: 8, receivedQty: 8, unitCost: 0 },
      { skuId: 'CAGE-006', skuCode: 'CAGE-CAT-M-2T', productName: 'Chuồng Mèo 2 Tầng Gấp Gọn (M)', itemType: 'cage', orderedQty: 10, receivedQty: 10, unitCost: 0 },
      { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', itemType: 'product', orderedQty: 60, receivedQty: 60, unitCost: 0 },
    ],
    totalValue: 0,
    status: 'pending_approval',
    createdBy: 'Bùi Văn Khánh',
    createdAt: '2026-06-12 10:00',
    note: 'Yêu cầu nhập chuồng và cát vệ sinh bổ sung',
  },
  {
    id: 'GRN-20260614-007',
    supplierId: 'SP002',
    supplierName: 'Mars Vietnam (Pedigree/Whiskas)',
    warehouseId: 'warehouse',
    items: [
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', itemType: 'product', orderedQty: 80, receivedQty: 80, unitCost: 0, estimatedCost: 63000 },
    ],
    totalValue: 0,
    estimatedTotalValue: 5040000,
    status: 'approved',
    createdBy: 'Bùi Văn Khánh',
    createdAt: '2026-06-14 09:00',
    approvedBy: 'Admin PetCare',
    approvedAt: '2026-06-14 10:00',
    note: 'Đã duyệt, chờ hàng về kho để nhập giá thực tế',
  },
  {
    id: 'GRN-20260615-005',
    supplierId: 'SP002',
    supplierName: 'Mars Vietnam (Pedigree/Whiskas)',
    warehouseId: 'warehouse',
    items: [
      { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', itemType: 'product', orderedQty: 80, receivedQty: 0, unitCost: 0 },
    ],
    totalValue: 0,
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
