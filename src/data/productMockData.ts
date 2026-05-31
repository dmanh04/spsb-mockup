import type { Product, SKU } from '@/types'

export const PRODUCT_CATEGORIES = [
  { id: 'C001', name: 'Thức ăn chó', icon: '🐕', count: 45 },
  { id: 'C002', name: 'Thức ăn mèo', icon: '🐈', count: 38 },
  { id: 'C003', name: 'Phụ kiện', icon: '🎀', count: 62 },
  { id: 'C004', name: 'Vệ sinh', icon: '🧴', count: 24 },
  { id: 'C005', name: 'Chăm sóc', icon: '💊', count: 31 },
  { id: 'C006', name: 'Snack & Bánh thưởng', icon: '🦴', count: 19 },
]

const INITIAL_PRODUCT_MOCK_LIST: Product[] = [
  {
    id: 'P001',
    name: 'Royal Canin Adult',
    category: 'Thức ăn chó',
    brand: 'Royal Canin',
    description: 'Thức ăn hạt cao cấp cho chó trưởng thành, giàu protein, hỗ trợ tiêu hóa và làm đẹp lông.',
    status: 'active',
    attributes: [
      { name: 'Trọng lượng', values: ['2kg', '4kg', '10kg', '15kg'] },
      { name: 'Hương vị', values: ['Gà', 'Cá hồi'] },
    ],
    skus: [
      { id: 'P001-S1', productId: 'P001', sku: 'P001-2KG-GA', attributes: { 'Trọng lượng': '2kg', 'Hương vị': 'Gà' }, price: 285000, stock: 30 },
      { id: 'P001-S2', productId: 'P001', sku: 'P001-2KG-CA', attributes: { 'Trọng lượng': '2kg', 'Hương vị': 'Cá hồi' }, price: 310000, stock: 20 },
      { id: 'P001-S3', productId: 'P001', sku: 'P001-4KG-GA', attributes: { 'Trọng lượng': '4kg', 'Hương vị': 'Gà' }, price: 520000, stock: 25 },
      { id: 'P001-S4', productId: 'P001', sku: 'P001-4KG-CA', attributes: { 'Trọng lượng': '4kg', 'Hương vị': 'Cá hồi' }, price: 560000, stock: 15 },
      { id: 'P001-S5', productId: 'P001', sku: 'P001-10KG-GA', attributes: { 'Trọng lượng': '10kg', 'Hương vị': 'Gà' }, price: 1150000, stock: 10 },
      { id: 'P001-S6', productId: 'P001', sku: 'P001-10KG-CA', attributes: { 'Trọng lượng': '10kg', 'Hương vị': 'Cá hồi' }, price: 1280000, stock: 8 },
      { id: 'P001-S7', productId: 'P001', sku: 'P001-15KG-GA', attributes: { 'Trọng lượng': '15kg', 'Hương vị': 'Gà' }, price: 1650000, stock: 5 },
      { id: 'P001-S8', productId: 'P001', sku: 'P001-15KG-CA', attributes: { 'Trọng lượng': '15kg', 'Hương vị': 'Cá hồi' }, price: 1800000, stock: 0 },
    ],
    basePrice: 285000, rating: 4.8, reviewCount: 142,
    images: ['https://placehold.co/400x400/3B82F6/white?text=Royal+Canin'],
    tags: ['chó trưởng thành', 'hạt khô', 'premium'],
    createdAt: '2024-01-15',
  },
  {
    id: 'P002',
    name: 'Whiskas Tuna',
    category: 'Thức ăn mèo',
    brand: 'Whiskas',
    description: 'Thức ăn hạt mèo vị cá ngừ thơm ngon, bổ sung taurine cho mắt và tim mèo.',
    status: 'active',
    attributes: [
      { name: 'Trọng lượng', values: ['1.2kg', '3kg', '7kg'] },
    ],
    skus: [
      { id: 'P002-S1', productId: 'P002', sku: 'P002-12KG', attributes: { 'Trọng lượng': '1.2kg' }, price: 95000, stock: 50 },
      { id: 'P002-S2', productId: 'P002', sku: 'P002-3KG', attributes: { 'Trọng lượng': '3kg' }, price: 215000, stock: 35 },
      { id: 'P002-S3', productId: 'P002', sku: 'P002-7KG', attributes: { 'Trọng lượng': '7kg' }, price: 460000, stock: 12 },
    ],
    basePrice: 95000, rating: 4.3, reviewCount: 87,
    images: ['https://placehold.co/400x400/F59E0B/white?text=Whiskas'],
    tags: ['mèo', 'cá ngừ', 'hạt khô'],
    createdAt: '2024-01-20',
  },
  {
    id: 'P003',
    name: 'Vòng cổ chó Rogz',
    category: 'Phụ kiện',
    brand: 'Rogz',
    description: 'Vòng cổ nylon phản quang, khóa nhựa bền, điều chỉnh được kích thước.',
    status: 'active',
    attributes: [
      { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
      { name: 'Màu sắc', values: ['Đỏ', 'Xanh navy', 'Hồng', 'Đen'] },
    ],
    skus: [
      { id: 'P003-S1', productId: 'P003', sku: 'P003-S-DO', attributes: { Size: 'S', 'Màu sắc': 'Đỏ' }, price: 85000, stock: 12 },
      { id: 'P003-S2', productId: 'P003', sku: 'P003-S-XN', attributes: { Size: 'S', 'Màu sắc': 'Xanh navy' }, price: 85000, stock: 8 },
      { id: 'P003-S3', productId: 'P003', sku: 'P003-S-HO', attributes: { Size: 'S', 'Màu sắc': 'Hồng' }, price: 85000, stock: 15 },
      { id: 'P003-S4', productId: 'P003', sku: 'P003-S-DE', attributes: { Size: 'S', 'Màu sắc': 'Đen' }, price: 85000, stock: 10 },
      { id: 'P003-S5', productId: 'P003', sku: 'P003-M-DO', attributes: { Size: 'M', 'Màu sắc': 'Đỏ' }, price: 105000, stock: 9 },
      { id: 'P003-S6', productId: 'P003', sku: 'P003-M-XN', attributes: { Size: 'M', 'Màu sắc': 'Xanh navy' }, price: 105000, stock: 14 },
      { id: 'P003-S7', productId: 'P003', sku: 'P003-M-HO', attributes: { Size: 'M', 'Màu sắc': 'Hồng' }, price: 105000, stock: 7 },
      { id: 'P003-S8', productId: 'P003', sku: 'P003-M-DE', attributes: { Size: 'M', 'Màu sắc': 'Đen' }, price: 105000, stock: 11 },
      { id: 'P003-S9', productId: 'P003', sku: 'P003-L-DO', attributes: { Size: 'L', 'Màu sắc': 'Đỏ' }, price: 135000, stock: 6 },
      { id: 'P003-S10', productId: 'P003', sku: 'P003-L-XN', attributes: { Size: 'L', 'Màu sắc': 'Xanh navy' }, price: 135000, stock: 5 },
      { id: 'P003-S11', productId: 'P003', sku: 'P003-L-HO', attributes: { Size: 'L', 'Màu sắc': 'Hồng' }, price: 135000, stock: 0 },
      { id: 'P003-S12', productId: 'P003', sku: 'P003-L-DE', attributes: { Size: 'L', 'Màu sắc': 'Đen' }, price: 135000, stock: 8 },
      { id: 'P003-S13', productId: 'P003', sku: 'P003-XL-DO', attributes: { Size: 'XL', 'Màu sắc': 'Đỏ' }, price: 165000, stock: 4 },
      { id: 'P003-S14', productId: 'P003', sku: 'P003-XL-XN', attributes: { Size: 'XL', 'Màu sắc': 'Xanh navy' }, price: 165000, stock: 3 },
      { id: 'P003-S15', productId: 'P003', sku: 'P003-XL-HO', attributes: { Size: 'XL', 'Màu sắc': 'Hồng' }, price: 165000, stock: 0 },
      { id: 'P003-S16', productId: 'P003', sku: 'P003-XL-DE', attributes: { Size: 'XL', 'Màu sắc': 'Đen' }, price: 165000, stock: 6 },
    ],
    basePrice: 85000, rating: 4.5, reviewCount: 65,
    images: ['https://placehold.co/400x400/10B981/white?text=Rogz+Collar'],
    tags: ['vòng cổ', 'phụ kiện chó'],
    createdAt: '2024-02-01',
  },
  {
    id: 'P004',
    name: 'Cát vệ sinh Bioline',
    category: 'Vệ sinh',
    brand: 'Bioline',
    description: 'Cát bentonite vón cục tốt, khử mùi hiệu quả, ít bụi.',
    status: 'active',
    attributes: [
      { name: 'Trọng lượng', values: ['5L', '10L', '20L'] },
      { name: 'Mùi hương', values: ['Không mùi', 'Lavender', 'Chanh'] },
    ],
    skus: [
      { id: 'P004-S1', productId: 'P004', sku: 'P004-5L-KM', attributes: { 'Trọng lượng': '5L', 'Mùi hương': 'Không mùi' }, price: 95000, stock: 80 },
      { id: 'P004-S2', productId: 'P004', sku: 'P004-5L-LV', attributes: { 'Trọng lượng': '5L', 'Mùi hương': 'Lavender' }, price: 105000, stock: 60 },
      { id: 'P004-S3', productId: 'P004', sku: 'P004-5L-CH', attributes: { 'Trọng lượng': '5L', 'Mùi hương': 'Chanh' }, price: 105000, stock: 45 },
      { id: 'P004-S4', productId: 'P004', sku: 'P004-10L-KM', attributes: { 'Trọng lượng': '10L', 'Mùi hương': 'Không mùi' }, price: 175000, stock: 40 },
      { id: 'P004-S5', productId: 'P004', sku: 'P004-10L-LV', attributes: { 'Trọng lượng': '10L', 'Mùi hương': 'Lavender' }, price: 190000, stock: 30 },
      { id: 'P004-S6', productId: 'P004', sku: 'P004-20L-KM', attributes: { 'Trọng lượng': '20L', 'Mùi hương': 'Không mùi' }, price: 320000, stock: 20 },
      { id: 'P004-S7', productId: 'P004', sku: 'P004-20L-LV', attributes: { 'Trọng lượng': '20L', 'Mùi hương': 'Lavender' }, price: 345000, stock: 0 },
    ],
    basePrice: 95000, rating: 4.6, reviewCount: 120,
    images: ['https://placehold.co/400x400/6B7280/white?text=Bioline+Cat'],
    tags: ['cát vệ sinh', 'mèo', 'khử mùi'],
    createdAt: '2024-02-10',
  },
  {
    id: 'P005',
    name: 'Sữa tắm chó Haan',
    category: 'Chăm sóc',
    brand: 'Haan',
    description: 'Sữa tắm dịu nhẹ cho chó, pH cân bằng, không gây kích ứng da.',
    status: 'active',
    attributes: [
      { name: 'Dung tích', values: ['200ml', '500ml', '1000ml'] },
      { name: 'Loại da', values: ['Da nhạy cảm', 'Lông dài', 'Chống ve bọ'] },
    ],
    skus: [
      { id: 'P005-S1', productId: 'P005', sku: 'P005-200ML-NS', attributes: { 'Dung tích': '200ml', 'Loại da': 'Da nhạy cảm' }, price: 75000, stock: 30 },
      { id: 'P005-S2', productId: 'P005', sku: 'P005-200ML-LD', attributes: { 'Dung tích': '200ml', 'Loại da': 'Lông dài' }, price: 80000, stock: 25 },
      { id: 'P005-S3', productId: 'P005', sku: 'P005-500ML-NS', attributes: { 'Dung tích': '500ml', 'Loại da': 'Da nhạy cảm' }, price: 145000, stock: 40 },
      { id: 'P005-S4', productId: 'P005', sku: 'P005-500ML-LD', attributes: { 'Dung tích': '500ml', 'Loại da': 'Lông dài' }, price: 155000, stock: 35 },
      { id: 'P005-S5', productId: 'P005', sku: 'P005-500ML-VB', attributes: { 'Dung tích': '500ml', 'Loại da': 'Chống ve bọ' }, price: 175000, stock: 20 },
      { id: 'P005-S6', productId: 'P005', sku: 'P005-1000ML-NS', attributes: { 'Dung tích': '1000ml', 'Loại da': 'Da nhạy cảm' }, price: 265000, stock: 15 },
      { id: 'P005-S7', productId: 'P005', sku: 'P005-1000ML-VB', attributes: { 'Dung tích': '1000ml', 'Loại da': 'Chống ve bọ' }, price: 310000, stock: 8 },
    ],
    basePrice: 75000, rating: 4.7, reviewCount: 43,
    images: ['https://placehold.co/400x400/10B981/white?text=Haan+Shampoo'],
    tags: ['sữa tắm', 'chó', 'chăm sóc da'],
    createdAt: '2024-03-01',
  },
  {
    id: 'P006',
    name: 'Snack Dentix nhai sạch răng',
    category: 'Snack & Bánh thưởng',
    brand: 'Purina',
    description: 'Thanh nhai hình xương giúp làm sạch răng và hơi thở thơm tho cho chó.',
    status: 'active',
    attributes: [
      { name: 'Trọng lượng', values: ['150g', '300g', '600g'] },
      { name: 'Size chó', values: ['Nhỏ', 'Vừa', 'Lớn'] },
    ],
    skus: [
      { id: 'P006-S1', productId: 'P006', sku: 'P006-150G-NHO', attributes: { 'Trọng lượng': '150g', 'Size chó': 'Nhỏ' }, price: 55000, stock: 45 },
      { id: 'P006-S2', productId: 'P006', sku: 'P006-150G-VUA', attributes: { 'Trọng lượng': '150g', 'Size chó': 'Vừa' }, price: 65000, stock: 38 },
      { id: 'P006-S3', productId: 'P006', sku: 'P006-300G-VUA', attributes: { 'Trọng lượng': '300g', 'Size chó': 'Vừa' }, price: 115000, stock: 22 },
      { id: 'P006-S4', productId: 'P006', sku: 'P006-300G-LON', attributes: { 'Trọng lượng': '300g', 'Size chó': 'Lớn' }, price: 125000, stock: 18 },
      { id: 'P006-S5', productId: 'P006', sku: 'P006-600G-LON', attributes: { 'Trọng lượng': '600g', 'Size chó': 'Lớn' }, price: 235000, stock: 0 },
    ],
    basePrice: 55000, rating: 4.1, reviewCount: 76,
    images: ['https://placehold.co/400x400/F59E0B/white?text=Dentix'],
    tags: ['snack', 'làm sạch răng', 'chó'],
    createdAt: '2024-03-15',
  },
]

const LOCAL_STORAGE_KEY = 'spsb_products_data'

const getStoredProducts = (): Product[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        console.error('Failed to parse stored products', e)
      }
    }
  }
  return INITIAL_PRODUCT_MOCK_LIST
}

export const PRODUCT_MOCK_LIST: Product[] = getStoredProducts()

export const saveProducts = (products: Product[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products))
  }
  // Mutate array in-place so all active references receive updates
  PRODUCT_MOCK_LIST.length = 0
  PRODUCT_MOCK_LIST.push(...products)
}

export function getProductById(id: string) {
  return PRODUCT_MOCK_LIST.find(p => p.id === id)
}

export function getSKUByAttributes(product: Product, selectedAttrs: Record<string, string>): SKU | undefined {
  return product.skus.find(sku =>
    Object.entries(selectedAttrs).every(([key, val]) => sku.attributes[key] === val)
  )
}

export function formatVariantLabel(sku: SKU): string {
  return Object.values(sku.attributes).join(' / ')
}

export const PRODUCT_REVIEWS = [
  { id: 'R001', productId: 'P001', user: 'Nguyễn Văn An', rating: 5, comment: 'Chó nhà mình rất thích, lông đẹp hơn nhiều sau 1 tháng dùng.', date: '2026-05-20', variant: '4kg / Gà' },
  { id: 'R002', productId: 'P004', user: 'Trần Thị Bình', rating: 4, comment: 'Cát kết tốt, ít bụi. Giá hợp lý.', date: '2026-05-18', variant: '5L / Lavender' },
  { id: 'R003', productId: 'P005', user: 'Lê Minh Cường', rating: 5, comment: 'Mùi thơm dễ chịu, không gây dị ứng da.', date: '2026-05-15', variant: '500ml / Da nhạy cảm' },
]
