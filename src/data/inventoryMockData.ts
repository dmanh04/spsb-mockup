import type { InventoryItem, InventoryTransaction } from '@/types'
import { PRODUCT_MOCK_LIST, saveProducts } from './productMockData'

const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  // Central warehouse
  { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'warehouse', quantity: 120, minStock: 20, lastUpdated: '2026-05-28' },
  { skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', shopId: 'warehouse', quantity: 80, minStock: 15, lastUpdated: '2026-05-28' },
  { skuId: 'P001-S5', skuCode: 'P001-10KG-GA', productName: 'Royal Canin Adult 10kg Gà', shopId: 'warehouse', quantity: 30, minStock: 10, lastUpdated: '2026-05-28' },
  { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', shopId: 'warehouse', quantity: 200, minStock: 30, lastUpdated: '2026-05-29' },
  { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', shopId: 'warehouse', quantity: 150, minStock: 25, lastUpdated: '2026-05-30' },
  { skuId: 'P005-S3', skuCode: 'P005-500ML-NS', productName: 'Sữa tắm Haan 500ml Nhạy cảm', shopId: 'warehouse', quantity: 90, minStock: 15, lastUpdated: '2026-05-27' },
  // SH01 — Q.1
  { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'SH01', quantity: 25, minStock: 5, lastUpdated: '2026-05-30' },
  { skuId: 'P001-S3', skuCode: 'P001-4KG-GA', productName: 'Royal Canin Adult 4kg Gà', shopId: 'SH01', quantity: 12, minStock: 5, lastUpdated: '2026-05-30' },
  { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', shopId: 'SH01', quantity: 3, minStock: 5, lastUpdated: '2026-05-31' },
  { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', shopId: 'SH01', quantity: 45, minStock: 10, lastUpdated: '2026-05-29' },
  { skuId: 'P005-S3', skuCode: 'P005-500ML-NS', productName: 'Sữa tắm Haan 500ml Nhạy cảm', shopId: 'SH01', quantity: 18, minStock: 5, lastUpdated: '2026-05-30' },
  // SH02 — Q.3
  { skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'SH02', quantity: 0, minStock: 5, lastUpdated: '2026-05-31' },
  { skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', shopId: 'SH02', quantity: 28, minStock: 8, lastUpdated: '2026-05-28' },
  { skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', shopId: 'SH02', quantity: 8, minStock: 10, lastUpdated: '2026-05-29' },
]

const INITIAL_INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
  { id: 'TX-001', type: 'stock_in', skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'warehouse', quantity: 50, note: 'Nhập từ Royal Canin VN - PO#2026051', createdBy: 'Bùi Văn Khánh', createdAt: '2026-05-28 09:00' },
  { id: 'TX-002', type: 'transfer_out', skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'warehouse', quantity: 20, note: 'Chuyển → SH01', createdBy: 'Bùi Văn Khánh', createdAt: '2026-05-29 14:00', transferId: 'TF-001' },
  { id: 'TX-003', type: 'transfer_in', skuId: 'P001-S1', skuCode: 'P001-2KG-GA', productName: 'Royal Canin Adult 2kg Gà', shopId: 'SH01', quantity: 20, note: 'Nhận từ kho trung tâm', createdBy: 'Nguyễn Thị Cẩm', createdAt: '2026-05-29 15:30', transferId: 'TF-001' },
  { id: 'TX-004', type: 'stock_out', skuId: 'P002-S1', skuCode: 'P002-12KG', productName: 'Whiskas Tuna 1.2kg', shopId: 'SH01', quantity: 5, note: 'Bán tại quầy ORD-002', createdBy: 'Nguyễn Thị Cẩm', createdAt: '2026-05-31 11:00' },
  { id: 'TX-005', type: 'adjustment', skuId: 'P004-S1', skuCode: 'P004-5L-KM', productName: 'Cát Bioline 5L Không mùi', shopId: 'SH02', quantity: -2, note: 'Kiểm kho phát hiện thiếu 2 túi', createdBy: 'Đặng Thu Hương', createdAt: '2026-05-30 17:00' },
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
        .filter(i => i.skuId === sku.id)
        .reduce((sum, item) => sum + item.quantity, 0)
      return { ...sku, stock: totalStock }
    })
    return { ...prod, skus: updatedSkus }
  })
  saveProducts(updatedProducts)
}
