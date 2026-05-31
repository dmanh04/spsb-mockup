import type { Pet } from '@/types'

export const PET_MOCK_LIST: Pet[] = [
  { id: 'PET001', ownerId: 'U001', name: 'Milo', species: 'dog', breed: 'Poodle', gender: 'male', birthDate: '2022-03-15', weight: 4.5, color: 'Trắng kem', notes: 'Hay bị căng thẳng khi nghe tiếng ồn lớn.', avatar: 'https://placehold.co/80x80/3B82F6/white?text=Milo', createdAt: '2025-03-20' },
  { id: 'PET002', ownerId: 'U002', name: 'Luna', species: 'cat', breed: 'Persian Cat', gender: 'female', birthDate: '2021-07-20', weight: 3.8, color: 'Xám bạc', notes: 'Bé rất nhạy cảm, cần tiếp cận nhẹ nhàng.', avatar: 'https://placehold.co/80x80/8B5CF6/white?text=Luna', createdAt: '2025-06-25' },
  { id: 'PET003', ownerId: 'U003', name: 'Rex', species: 'dog', breed: 'German Shepherd', gender: 'male', birthDate: '2020-11-05', weight: 28.0, color: 'Vàng đen', notes: 'Rất năng động, cần 2 người hỗ trợ khi tắm.', avatar: 'https://placehold.co/80x80/F59E0B/white?text=Rex', createdAt: '2025-08-15' },
  { id: 'PET004', ownerId: 'U004', name: 'Coco', species: 'dog', breed: 'Shih Tzu', gender: 'female', birthDate: '2023-01-10', weight: 5.2, color: 'Vàng trắng', notes: '', avatar: 'https://placehold.co/80x80/10B981/white?text=Coco', createdAt: '2025-09-05' },
  { id: 'PET005', ownerId: 'U005', name: 'Buddy', species: 'dog', breed: 'Golden Retriever', gender: 'male', birthDate: '2021-05-18', weight: 32.0, color: 'Vàng sáng', notes: 'Hay bị sợ máy sấy.', avatar: 'https://placehold.co/80x80/F59E0B/white?text=Buddy', createdAt: '2025-11-15' },
  { id: 'PET006', ownerId: 'U001', name: 'Latte', species: 'cat', breed: 'British Shorthair', gender: 'female', birthDate: '2023-09-01', weight: 4.1, color: 'Xám xanh', notes: '', avatar: 'https://placehold.co/80x80/6B7280/white?text=Latte', createdAt: '2026-01-10' },
]

export function getPetsByOwner(ownerId: string) {
  return PET_MOCK_LIST.filter(p => p.ownerId === ownerId)
}

export const SPECIES_LABELS: Record<string, string> = {
  dog: 'Chó', cat: 'Mèo', other: 'Khác',
}

export const GENDER_LABELS: Record<string, string> = {
  male: 'Đực', female: 'Cái',
}
