import type { Service } from '@/types'

export const SERVICE_MOCK_LIST: Service[] = [
  {
    id: 'SV001', name: 'Cắt tỉa & Tắm cơ bản', category: 'grooming',
    description: 'Tắm sạch, sấy khô, cắt tỉa lông theo yêu cầu cơ bản, vệ sinh tai và cắt móng.',
    duration: 60, price: 150000, petTypes: ['dog', 'cat'], shopIds: ['SH01', 'SH02', 'SH03'],
    pricingMatrix: [
      { size: 'small', label: 'Nhỏ (< 5kg)', price: 120000, duration: 45 },
      { size: 'medium', label: 'Vừa (5–15kg)', price: 170000, duration: 60 },
      { size: 'large', label: 'Lớn (15–30kg)', price: 250000, duration: 90 },
      { size: 'xlarge', label: 'Rất lớn (> 30kg)', price: 350000, duration: 120 },
    ],
    status: 'active', image: 'https://placehold.co/300x200/3B82F6/white?text=Grooming',
  },
  {
    id: 'SV002', name: 'Spa Premium', category: 'spa',
    description: 'Tắm thảo dược, massage toàn thân, xông hơi dưỡng ẩm, cắt tỉa và làm đẹp toàn diện.',
    duration: 120, price: 350000, petTypes: ['dog', 'cat'], shopIds: ['SH01', 'SH02'],
    pricingMatrix: [
      { size: 'small', label: 'Nhỏ (< 5kg)', price: 280000, duration: 90 },
      { size: 'medium', label: 'Vừa (5–15kg)', price: 380000, duration: 120 },
      { size: 'large', label: 'Lớn (15–30kg)', price: 520000, duration: 150 },
      { size: 'xlarge', label: 'Rất lớn (> 30kg)', price: 700000, duration: 180 },
    ],
    status: 'active', image: 'https://placehold.co/300x200/8B5CF6/white?text=Spa+Premium',
  },
  {
    id: 'SV003', name: 'Tắm & Sấy', category: 'bathing',
    description: 'Tắm sạch với sữa tắm chuyên dụng phù hợp loại lông, sấy khô hoàn toàn.',
    duration: 45, price: 90000, petTypes: ['dog', 'cat'], shopIds: ['SH01', 'SH02', 'SH03'],
    pricingMatrix: [
      { size: 'small', label: 'Nhỏ (< 5kg)', price: 70000, duration: 30 },
      { size: 'medium', label: 'Vừa (5–15kg)', price: 100000, duration: 45 },
      { size: 'large', label: 'Lớn (15–30kg)', price: 150000, duration: 60 },
      { size: 'xlarge', label: 'Rất lớn (> 30kg)', price: 220000, duration: 75 },
    ],
    status: 'active', image: 'https://placehold.co/300x200/10B981/white?text=Bath+%26+Dry',
  },
  {
    id: 'SV004', name: 'Cắt móng & Vệ sinh tai', category: 'nail',
    description: 'Cắt móng an toàn, làm sạch tai, vệ sinh mắt và vùng quanh mắt.',
    duration: 30, price: 60000, petTypes: ['dog', 'cat'], shopIds: ['SH01', 'SH02', 'SH03'],
    pricingMatrix: [
      { size: 'small', label: 'Mọi giống nhỏ', price: 60000, duration: 20 },
      { size: 'medium', label: 'Mọi giống vừa', price: 60000, duration: 25 },
      { size: 'large', label: 'Giống lớn', price: 80000, duration: 30 },
      { size: 'xlarge', label: 'Giống rất lớn', price: 100000, duration: 40 },
    ],
    status: 'active', image: 'https://placehold.co/300x200/F59E0B/white?text=Nail+%26+Ear',
  },
  {
    id: 'SV005', name: 'Gói Cắt tỉa Full', category: 'grooming',
    description: 'Cắt tỉa kiểu dáng theo yêu cầu, bao gồm tắm, sấy, vệ sinh toàn thân.',
    duration: 90, price: 250000, petTypes: ['dog'], shopIds: ['SH01', 'SH02'],
    pricingMatrix: [
      { size: 'small', label: 'Nhỏ (< 5kg)', price: 200000, duration: 60 },
      { size: 'medium', label: 'Vừa (5–15kg)', price: 280000, duration: 90 },
      { size: 'large', label: 'Lớn (15–30kg)', price: 400000, duration: 120 },
      { size: 'xlarge', label: 'Rất lớn (> 30kg)', price: 550000, duration: 150 },
    ],
    status: 'active', image: 'https://placehold.co/300x200/6366F1/white?text=Full+Grooming',
  },
  {
    id: 'SV006', name: 'Lưu trú Khách sạn', category: 'boarding',
    description: 'Phòng ốc thoáng mát, ăn 3 bữa/ngày, vận động tự do 2 lần/ngày, gửi video cập nhật hàng ngày.',
    duration: 1440, price: 150000, petTypes: ['dog', 'cat'], shopIds: ['SH01', 'SH02', 'SH03'],
    pricingMatrix: [
      { size: 'small', label: 'Nhỏ (< 5kg)', price: 150000, duration: 1440 },
      { size: 'medium', label: 'Vừa (5–15kg)', price: 200000, duration: 1440 },
      { size: 'large', label: 'Lớn (15–30kg)', price: 300000, duration: 1440 },
      { size: 'xlarge', label: 'Rất lớn (> 30kg)', price: 400000, duration: 1440 },
    ],
    status: 'active', image: 'https://placehold.co/300x200/F59E0B/white?text=Boarding',
  },
  {
    id: 'SV007', name: 'Khám tổng quát', category: 'checkup',
    description: 'Khám lâm sàng, kiểm tra da lông, mắt, tai, răng miệng, tiêu hóa và tư vấn dinh dưỡng.',
    duration: 30, price: 100000, petTypes: ['dog', 'cat'], shopIds: ['SH01'],
    pricingMatrix: [
      { size: 'small', label: 'Mọi giống', price: 100000, duration: 30 },
      { size: 'medium', label: 'Mọi giống', price: 100000, duration: 30 },
      { size: 'large', label: 'Mọi giống', price: 100000, duration: 30 },
      { size: 'xlarge', label: 'Mọi giống', price: 100000, duration: 30 },
    ],
    status: 'active', image: 'https://placehold.co/300x200/EF4444/white?text=Checkup',
  },
]

export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  grooming: 'Cắt tỉa', bathing: 'Tắm rửa', spa: 'Spa',
  boarding: 'Lưu trú', nail: 'Móng & Tai', ear: 'Vệ sinh tai',
  checkup: 'Thăm khám',
}
