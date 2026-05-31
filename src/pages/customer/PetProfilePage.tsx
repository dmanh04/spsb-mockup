import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PawPrint, Plus, Edit, Cake, Weight, Circle } from 'lucide-react'
import { PET_MOCK_LIST, SPECIES_LABELS, GENDER_LABELS } from '@/data/petMockData'
import { BOOKING_MOCK_LIST } from '@/data/bookingMockData'
import { useAuthContext } from '@/auth/AuthContext'

export default function PetProfilePage() {
  const { currentUser } = useAuthContext()
  const myPets = PET_MOCK_LIST.filter(p => p.ownerId === currentUser?.id)
  const [selectedPet, setSelectedPet] = useState(myPets[0]?.id ?? null)

  const pet = myPets.find(p => p.id === selectedPet)
  const petBookings = BOOKING_MOCK_LIST.filter(b => b.petId === selectedPet)
    .sort((a, b) => b.date.localeCompare(a.date))

  function getAge(birthDate: string) {
    const diff = new Date().getTime() - new Date(birthDate).getTime()
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30))
    if (months < 12) return `${months} tháng tuổi`
    return `${Math.floor(months / 12)} tuổi ${months % 12 > 0 ? `${months % 12} tháng` : ''}`
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Thú cưng của tôi</h1>
        <button className="btn-primary text-sm py-2">
          <Plus size={14} /> Thêm thú cưng
        </button>
      </div>

      {myPets.length === 0 ? (
        <div className="text-center py-16 card">
          <PawPrint size={40} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Chưa có thú cưng nào</h2>
          <p className="text-sm text-gray-400 mb-4">Tạo hồ sơ để đặt lịch và theo dõi lịch sử dịch vụ</p>
          <button className="btn-primary mx-auto"><Plus size={14} /> Thêm thú cưng</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pet list */}
          <div className="space-y-2">
            {myPets.map(p => (
              <button key={p.id} onClick={() => setSelectedPet(p.id)}
                className={`w-full card p-3 flex items-center gap-3 text-left transition-all ${selectedPet === p.id ? 'border-primary-400 bg-primary-50' : 'hover:shadow-sm'}`}>
                <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500 truncate">{p.breed}</div>
                </div>
                <span className="badge-gray text-[10px]">{SPECIES_LABELS[p.species]}</span>
              </button>
            ))}
          </div>

          {/* Pet detail */}
          {pet && (
            <div className="md:col-span-2 space-y-4">
              <div className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={pet.avatar} alt={pet.name} className="w-16 h-16 rounded-full border-2 border-primary-200" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{pet.name}</h2>
                      <p className="text-sm text-gray-500">{pet.breed}</p>
                      <span className="badge-blue text-[10px] mt-1">{SPECIES_LABELS[pet.species]}</span>
                    </div>
                  </div>
                  <button className="btn-secondary text-xs py-1.5">
                    <Edit size={12} /> Sửa
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Circle, label: 'Giới tính', value: GENDER_LABELS[pet.gender] },
                    { icon: Weight, label: 'Cân nặng', value: `${pet.weight} kg` },
                    { icon: Cake, label: 'Ngày sinh', value: pet.birthDate },
                    { icon: PawPrint, label: 'Màu lông', value: pet.color },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 text-sm">
                      <item.icon size={14} className="text-gray-400 shrink-0" />
                      <div>
                        <div className="text-xs text-gray-400">{item.label}</div>
                        <div className="font-medium text-gray-900">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {pet.notes && (
                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
                    ⚠️ <strong>Lưu ý:</strong> {pet.notes}
                  </div>
                )}
              </div>

              {/* Service history */}
              <div className="card">
                <div className="card-header flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Lịch sử dịch vụ ({petBookings.length})</h3>
                  <Link to="/customer/booking" className="text-xs text-primary-600 hover:underline">Đặt lịch</Link>
                </div>
                {petBookings.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">Chưa có lịch sử dịch vụ nào</div>
                ) : (
                  <div className="divide-y">
                    {petBookings.slice(0, 5).map(b => (
                      <Link key={b.id} to={`/customer/bookings/${b.id}`}
                        className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                        <div className="text-xs text-gray-400 w-16 shrink-0">{b.date}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{b.serviceName}</div>
                          {b.assignedStaffName && (
                            <div className="text-xs text-gray-400">NV: {b.assignedStaffName}</div>
                          )}
                        </div>
                        <span className={`badge text-[10px] shrink-0 ${b.status === 'paid' || b.status === 'completed' ? 'badge-green' : b.status === 'cancelled' ? 'badge-red' : 'badge-blue'}`}>
                          {b.status === 'paid' ? 'Đã xong' : b.status === 'cancelled' ? 'Đã hủy' : 'Đang diễn ra'}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
