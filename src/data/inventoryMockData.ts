import type { InventoryItem, InventoryTransaction } from '@/types'
import { PRODUCT_MOCK_LIST, saveProducts } from './productMockData'
import { CAGE_MOCK_LIST, saveCages } from './cageMockData'

const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  // Central warehouse - Products
  { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'warehouse', quantity: 120, minStock: 20, lastUpdated: '2026-05-28', category: 'product' },
  { skuId: 'P001-S2', skuCode: 'P001-2KG-CA', productName: 'Royal Canin Adult 2kg Cá hồi', shopId: 'warehouse', quantity: 95, minStock: 15, lastUpdated: '2026-05-28', category: 'product' },
  { skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', shopId: 'warehouse', quantity: 80, minStock: 15, lastUpdated: '2026-05-28', category: 'product' },
  { skuId: 'P001-S4', skuCode: 'P001-4KG-CA', productName: 'Royal Canin Adult 4kg Cá hồi', shopId: 'warehouse', quantity: 65, minStock: 10, lastUpdated: '2026-05-28', category: 'product' },
  { skuId: 'P001-S5', skuCode: 'P001-10KG-GA', productName: 'Royal Canin Adult 10kg Gà', shopId: 'warehouse', quantity: 30, minStock: 10, lastUpdated: '2026-05-28', category: 'product' },
  { skuId: 'P001-S6', skuCode: 'P001-10KG-CA', productName: 'Royal Canin Adult 10kg Cá hồi', shopId: 'warehouse', quantity: 24, minStock: 8, lastUpdated: '2026-05-28', category: 'product' },
  { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', shopId: 'warehouse', quantity: 200, minStock: 30, lastUpdated: '2026-05-29', category: 'product' },
  { skuId: 'P002-S2', skuCode: 'P002-3KG', productName: 'Whiskas Tuna 3kg', shopId: 'warehouse', quantity: 110, minStock: 20, lastUpdated: '2026-05-29', category: 'product' },
  { skuId: 'P002-S3', skuCode: 'P002-7KG', productName: 'Whiskas Tuna 7kg', shopId: 'warehouse', quantity: 45, minStock: 10, lastUpdated: '2026-05-29', category: 'product' },
  { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', shopId: 'warehouse', quantity: 150, minStock: 25, lastUpdated: '2026-05-30', category: 'product' },
  { skuId: 'P005-S3', skuCode: 'P005-500ML-NS', productName: 'Sữa tắm Haan 500ml Nhạy cảm', shopId: 'warehouse', quantity: 90, minStock: 15, lastUpdated: '2026-05-27', category: 'product' },
  
  // Central warehouse - Cages
  { skuId: 'CAGE-001', skuCode: 'CAGE-DOG-S-INOX', productName: 'Chuồng Chó Inox 304 Size S', shopId: 'warehouse', quantity: 15, minStock: 5, lastUpdated: '2026-06-05', category: 'cage' },
  { skuId: 'CAGE-002', skuCode: 'CAGE-DOG-M-INOX', productName: 'Chuồng Chó Inox 304 Size M', shopId: 'warehouse', quantity: 10, minStock: 4, lastUpdated: '2026-06-05', category: 'cage' },
  { skuId: 'CAGE-003', skuCode: 'CAGE-DOG-L-INOX', productName: 'Chuồng Chó Inox 304 Size L', shopId: 'warehouse', quantity: 8, minStock: 3, lastUpdated: '2026-06-12', category: 'cage' },
  { skuId: 'CAGE-004', skuCode: 'CAGE-DOG-XL-STEEL', productName: 'Chuồng Chó Sắt Sơn TĐ Size XL', shopId: 'warehouse', quantity: 3, minStock: 3, lastUpdated: '2026-06-10', category: 'cage' },
  { skuId: 'CAGE-005', skuCode: 'CAGE-CAT-L-3T', productName: 'Chuồng Mèo 3 Tầng Inox', shopId: 'warehouse', quantity: 12, minStock: 4, lastUpdated: '2026-06-12', category: 'cage' },
  { skuId: 'CAGE-006', skuCode: 'CAGE-CAT-M-2T', productName: 'Chuồng Mèo 2 Tầng Gấp Gọn', shopId: 'warehouse', quantity: 18, minStock: 6, lastUpdated: '2026-06-01', category: 'cage' },
  { skuId: 'CAGE-007', skuCode: 'CAGE-TRAVEL-S-PP', productName: 'Lồng Vận Chuyển Nhựa PP Size S', shopId: 'warehouse', quantity: 25, minStock: 10, lastUpdated: '2026-06-08', category: 'cage' },
  { skuId: 'CAGE-008', skuCode: 'CAGE-BIRD-M-DECO', productName: 'Chuồng Chim Trang Trí Châu Âu', shopId: 'warehouse', quantity: 7, minStock: 3, lastUpdated: '2026-05-22', category: 'cage' },
  { skuId: 'CAGE-009', skuCode: 'CAGE-RABBIT-L-WOOD', productName: 'Chuồng Thỏ Gỗ Thông 2 Tầng', shopId: 'warehouse', quantity: 4, minStock: 2, lastUpdated: '2026-06-10', category: 'cage' },
  { skuId: 'CAGE-010', skuCode: 'CAGE-CAT-S-PLASTIC', productName: 'Lồng Nhựa Cho Mèo Size S', shopId: 'warehouse', quantity: 14, minStock: 5, lastUpdated: '2026-06-10', category: 'cage' },
  { skuId: 'CAGE-011', skuCode: 'CAGE-DOG-M-MESH', productName: 'Chuồng Chó Lưới Sắt Size M Nâng Cấp', shopId: 'warehouse', quantity: 2, minStock: 4, lastUpdated: '2026-06-12', category: 'cage' },
  { skuId: 'CAGE-012', skuCode: 'CAGE-TRAVEL-M-PP', productName: 'Lồng Nhựa Vận Chuyển Size M', shopId: 'warehouse', quantity: 1, minStock: 5, lastUpdated: '2026-06-05', category: 'cage' },

  // SH01 — Q.1 - Products
  { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'SH01', quantity: 25, minStock: 5, lastUpdated: '2026-05-30', category: 'product' },
  { skuId: 'P001-S2', skuCode: 'P001-2KG-CA', productName: 'Royal Canin Adult 2kg Cá hồi', shopId: 'SH01', quantity: 18, minStock: 5, lastUpdated: '2026-05-30', category: 'product' },
  { skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', shopId: 'SH01', quantity: 12, minStock: 5, lastUpdated: '2026-05-30', category: 'product' },
  { skuId: 'P001-S5', skuCode: 'P001-10KG-GA', productName: 'Royal Canin Adult 10kg Gà', shopId: 'SH01', quantity: 4, minStock: 3, lastUpdated: '2026-05-30', category: 'product' },
  { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', shopId: 'SH01', quantity: 3, minStock: 5, lastUpdated: '2026-05-31', category: 'product' },
  { skuId: 'P002-S2', skuCode: 'P002-3KG', productName: 'Whiskas Tuna 3kg', shopId: 'SH01', quantity: 14, minStock: 5, lastUpdated: '2026-05-31', category: 'product' },
  { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', shopId: 'SH01', quantity: 45, minStock: 10, lastUpdated: '2026-05-29', category: 'product' },
  { skuId: 'P005-S3', skuCode: 'P005-500ML-NS', productName: 'Sữa tắm Haan 500ml Nhạy cảm', shopId: 'SH01', quantity: 18, minStock: 5, lastUpdated: '2026-05-30', category: 'product' },
  
  // SH01 — Q.1 - Cages
  { skuId: 'CAGE-001', skuCode: 'CAGE-DOG-S-INOX', productName: 'Chuồng Chó Inox 304 Size S', shopId: 'SH01', quantity: 5, minStock: 2, lastUpdated: '2026-06-06', category: 'cage' },
  { skuId: 'CAGE-002', skuCode: 'CAGE-DOG-M-INOX', productName: 'Chuồng Chó Inox 304 Size M', shopId: 'SH01', quantity: 3, minStock: 2, lastUpdated: '2026-06-06', category: 'cage' },
  { skuId: 'CAGE-005', skuCode: 'CAGE-CAT-L-3T', productName: 'Chuồng Mèo 3 Tầng Inox', shopId: 'SH01', quantity: 2, minStock: 1, lastUpdated: '2026-06-12', category: 'cage' },
  { skuId: 'CAGE-006', skuCode: 'CAGE-CAT-M-2T', productName: 'Chuồng Mèo 2 Tầng Gấp Gọn', shopId: 'SH01', quantity: 4, minStock: 2, lastUpdated: '2026-06-06', category: 'cage' },
  { skuId: 'CAGE-007', skuCode: 'CAGE-TRAVEL-S-PP', productName: 'Lồng Vận Chuyển Nhựa PP Size S', shopId: 'SH01', quantity: 8, minStock: 3, lastUpdated: '2026-06-08', category: 'cage' },

  // SH02 — Q.3 - Products
  { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'SH02', quantity: 0, minStock: 5, lastUpdated: '2026-05-31', category: 'product' },
  { skuId: 'P001-S2', skuCode: 'P001-2KG-CA', productName: 'Royal Canin Adult 2kg Cá hồi', shopId: 'SH02', quantity: 15, minStock: 5, lastUpdated: '2026-05-31', category: 'product' },
  { skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', shopId: 'SH02', quantity: 8, minStock: 4, lastUpdated: '2026-05-31', category: 'product' },
  { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', shopId: 'SH02', quantity: 28, minStock: 8, lastUpdated: '2026-05-28', category: 'product' },
  { skuId: 'P002-S3', skuCode: 'P002-7KG', productName: 'Whiskas Tuna 7kg', shopId: 'SH02', quantity: 6, minStock: 3, lastUpdated: '2026-05-28', category: 'product' },
  { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', shopId: 'SH02', quantity: 8, minStock: 10, lastUpdated: '2026-05-29', category: 'product' },

  // SH02 — Q.3 - Cages
  { skuId: 'CAGE-001', skuCode: 'CAGE-DOG-S-INOX', productName: 'Chuồng Chó Inox 304 Size S', shopId: 'SH02', quantity: 2, minStock: 1, lastUpdated: '2026-06-08', category: 'cage' },
  { skuId: 'CAGE-002', skuCode: 'CAGE-DOG-M-INOX', productName: 'Chuồng Chó Inox 304 Size M', shopId: 'SH02', quantity: 1, minStock: 1, lastUpdated: '2026-06-08', category: 'cage' },
  { skuId: 'CAGE-003', skuCode: 'CAGE-DOG-L-INOX', productName: 'Chuồng Chó Inox 304 Size L', shopId: 'SH02', quantity: 0, minStock: 1, lastUpdated: '2026-06-08', category: 'cage' },
  { skuId: 'CAGE-007', skuCode: 'CAGE-TRAVEL-S-PP', productName: 'Lồng Vận Chuyển Nhựa PP Size S', shopId: 'SH02', quantity: 5, minStock: 2, lastUpdated: '2026-06-08', category: 'cage' },

  // SH03 — Bình Thạnh - Products
  { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'SH03', quantity: 12, minStock: 5, lastUpdated: '2026-06-01', category: 'product' },
  { skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', shopId: 'SH03', quantity: 9, minStock: 4, lastUpdated: '2026-06-01', category: 'product' },
  { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', shopId: 'SH03', quantity: 15, minStock: 8, lastUpdated: '2026-06-02', category: 'product' },
  { skuId: 'P002-S2', skuCode: 'P002-3KG', productName: 'Whiskas Tuna 3kg', shopId: 'SH03', quantity: 8, minStock: 5, lastUpdated: '2026-06-02', category: 'product' },
  { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', shopId: 'SH03', quantity: 30, minStock: 10, lastUpdated: '2026-06-03', category: 'product' },
  { skuId: 'P005-S3', skuCode: 'P005-500ML-NS', productName: 'Sữa tắm Haan 500ml Nhạy cảm', shopId: 'SH03', quantity: 5, minStock: 5, lastUpdated: '2026-06-01', category: 'product' },

  // SH03 — Bình Thạnh - Cages
  { skuId: 'CAGE-001', skuCode: 'CAGE-DOG-S-INOX', productName: 'Chuồng Chó Inox 304 Size S', shopId: 'SH03', quantity: 3, minStock: 1, lastUpdated: '2026-06-10', category: 'cage' },
  { skuId: 'CAGE-002', skuCode: 'CAGE-DOG-M-INOX', productName: 'Chuồng Chó Inox 304 Size M', shopId: 'SH03', quantity: 2, minStock: 1, lastUpdated: '2026-06-10', category: 'cage' },
  { skuId: 'CAGE-005', skuCode: 'CAGE-CAT-L-3T', productName: 'Chuồng Mèo 3 Tầng Inox', shopId: 'SH03', quantity: 1, minStock: 1, lastUpdated: '2026-06-12', category: 'cage' },
  { skuId: 'CAGE-007', skuCode: 'CAGE-TRAVEL-S-PP', productName: 'Lồng Vận Chuyển Nhựa PP Size S', shopId: 'SH03', quantity: 6, minStock: 2, lastUpdated: '2026-06-08', category: 'cage' }
]

const INITIAL_INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
  { id: 'TX-001', type: 'stock_in', skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'warehouse', quantity: 50, note: 'Nhập hàng từ Royal Canin VN - Phiếu GRN-20260528-001', createdBy: 'Bùi Văn Khánh', createdAt: '2026-05-28 09:00' },
  { id: 'TX-002', type: 'transfer_out', skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'warehouse', quantity: 20, note: 'Chuyển hàng sang Chi nhánh Q.1', createdBy: 'Bùi Văn Khánh', createdAt: '2026-05-29 14:00', transferId: 'TF-001' },
  { id: 'TX-003', type: 'transfer_in', skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'SH01', quantity: 20, note: 'Nhận chuyển từ Kho trung tâm', createdBy: 'Nguyễn Thị Cẩm', createdAt: '2026-05-29 15:30', transferId: 'TF-001' },
  { id: 'TX-004', type: 'stock_out', skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', shopId: 'SH01', quantity: 5, note: 'Bán lẻ tại quầy ORD-002', createdBy: 'Nguyễn Thị Cẩm', createdAt: '2026-05-31 11:00' },
  { id: 'TX-005', type: 'adjustment', skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', shopId: 'SH02', quantity: -2, note: 'Cân đối kho kì kiểm kê phát hiện thiếu', createdBy: 'Đặng Thu Hương', createdAt: '2026-05-30 17:00' },
  { id: 'TX-006', type: 'stock_in', skuId: 'CAGE-001', skuCode: 'CAGE-DOG-S-INOX', productName: 'Chuồng Chó Inox 304 Size S', shopId: 'warehouse', quantity: 15, note: 'Nhập hàng từ xưởng cơ khí Hoàng Gia - Phiếu GRN-20260605-003', createdBy: 'Bùi Văn Khánh', createdAt: '2026-06-05 10:30' },
  { id: 'TX-007', type: 'transfer_out', skuId: 'CAGE-001', skuCode: 'CAGE-DOG-S-INOX', productName: 'Chuồng Chó Inox 304 Size S', shopId: 'warehouse', quantity: 5, note: 'Điều chuyển sang chi nhánh Q.1', createdBy: 'Bùi Văn Khánh', createdAt: '2026-06-06 11:00', transferId: 'TF-002' },
  { id: 'TX-008', type: 'transfer_in', skuId: 'CAGE-001', skuCode: 'CAGE-DOG-S-INOX', productName: 'Chuồng Chó Inox 304 Size S', shopId: 'SH01', quantity: 5, note: 'Nhận chuyển từ Kho trung tâm', createdBy: 'Nguyễn Thị Cẩm', createdAt: '2026-06-06 12:15', transferId: 'TF-002' },
  { id: 'TX-009', type: 'stock_out', skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', shopId: 'SH03', quantity: -1, note: 'Bao bì hỏng ẩm rách tiêu hủy', createdBy: 'Trần Văn Tùng', createdAt: '2026-06-12 15:40' },
  { id: 'TX-010', type: 'adjustment', skuId: 'CAGE-002', skuCode: 'CAGE-DOG-M-INOX', productName: 'Chuồng Chó Inox 304 Size M', shopId: 'SH01', quantity: 1, note: 'Cân đối điều chỉnh tăng hàng tìm thấy', createdBy: 'Nguyễn Thị Cẩm', createdAt: '2026-06-14 10:20' }
]

const KEY_ITEMS = 'spsb_inventory_items'
const KEY_TX = 'spsb_inventory_transactions'

const getStoredItems = (): InventoryItem[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(KEY_ITEMS)
    if (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        console.error('Failed to parse items', e)
      }
    }
  }
  return INITIAL_INVENTORY_ITEMS
}

const getStoredTx = (): InventoryTransaction[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(KEY_TX)
    if (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        console.error('Failed to parse transactions', e)
      }
    }
  }
  return INITIAL_INVENTORY_TRANSACTIONS
}

export const INVENTORY_ITEMS: InventoryItem[] = getStoredItems()
export const INVENTORY_TRANSACTIONS: InventoryTransaction[] = getStoredTx()

export const saveInventory = (items: InventoryItem[], txList: InventoryTransaction[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(KEY_ITEMS, JSON.stringify(items))
    localStorage.setItem(KEY_TX, JSON.stringify(txList))
  }
  
  INVENTORY_ITEMS.length = 0
  INVENTORY_ITEMS.push(...items)
  
  INVENTORY_TRANSACTIONS.length = 0
  INVENTORY_TRANSACTIONS.push(...txList)

  // Synchronize with PRODUCT_MOCK_LIST
  const updatedProducts = PRODUCT_MOCK_LIST.map(prod => {
    const updatedSkus = prod.skus.map(sku => {
      const totalStock = items
        .filter(i => i.skuId === sku.id && i.category === 'product')
        .reduce((sum, item) => sum + item.quantity, 0)
      return { ...sku, stock: totalStock }
    })
    return { ...prod, skus: updatedSkus }
  })
  saveProducts(updatedProducts)

  // Synchronize with CAGE_MOCK_LIST
  const updatedCages = CAGE_MOCK_LIST.map(cage => {
    const totalStock = items
      .filter(i => i.skuId === cage.id && i.category === 'cage')
      .reduce((sum, item) => sum + item.quantity, 0)
    return { ...cage, stock: totalStock }
  })
  saveCages(updatedCages)
}
