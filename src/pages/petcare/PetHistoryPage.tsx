import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Camera, Clock, Star } from 'lucide-react'
import { PET_MOCK_LIST, SPECIES_LABELS, GENDER_LABELS } from '@/data/petMockData'
import { BOOKING_MOCK_LIST, STATUS_LABELS, STATUS_COLORS } from '@/data/bookingMockData'
import { formatPrice } from '@/utils/format'

export default function PetHistoryPage() {
  const { id } = useParams<{ id: string }>()
  const pet = PET_MOCK_LIST.find(p => p.id === id)
  const bookings = BOOKING_MOCK_LIST.filter(b => b.petId === id)
    .sort((a, b) => b.date.localeCompare(a.date))

  if (!pet) return (
    <div className="text-center py-20">
      <div className="text-4xl mb-3">🐾</div>
      <h2 className="text-lg font-semibold text-gray-700">Không tìm thấy thú cưng</h2>
      <Link to="/petcare" className="btn-secondary mt-4 inline-flex">← Quay lại</Link>
    </div>
  )

  const totalServices = bookings.filter(b => b.status === 'paid' || b.status === 'completed').length
  const lastService = bookings[0]

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/petcare" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-lg font-bold text-gray-900">Hồ sơ thú cưng</h1>
      </div>

      {/* Pet info */}
      <div className="card p-5">
        <div className="flex items-start gap-4 mb-4">
          <img src={pet.avatar} alt={pet.name} className="w-16 h-16 rounded-full border-2 border-primary-100 shrink-0" />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{pet.name}</h2>
            <p className="text-sm text-gray-500">{pet.breed} · {SPECIES_LABELS[pet.species]} · {GENDER_LABELS[pet.gender]}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span>🎂 {pet.birthDate}</span>
              <span>⚖️ {pet.weight}kg</span>
              <span>🎨 {pet.color}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-primary-600">{totalServices}</div>
            <div className="text-xs text-gray-400">lần dịch vụ</div>
          </div>
        </div>

        {pet.notes && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700">
            ⚠️ <strong>Lưu ý đặc biệt:</strong> {pet.notes}
          </div>
        )}

        {lastService && (
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">Dịch vụ cuối:</span>
            <span className="font-medium">{lastService.serviceName} — {lastService.date}</span>
          </div>
        )}
      </div>

      {/* Service history */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-900">Lịch sử dịch vụ ({bookings.length})</h3>
        </div>
        {bookings.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">Chưa có lịch sử dịch vụ</div>
        ) : (
          <div className="divide-y">
            {bookings.map(b => (
              <Link key={b.id} to={`/petcare/bookings/${b.id}`}
                className="block px-4 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="text-center w-12 shrink-0">
                    <div className="text-xs font-bold text-primary-600">{b.date.split('-').slice(1).join('/')}</div>
                    <div className="text-[10px] text-gray-400">{b.date.split('-')[0]}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-900">{b.serviceName}</span>
                      <span className={STATUS_COLORS[b.status]}>{STATUS_LABELS[b.status]}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={10} />{b.startTime}–{b.endTime}</span>
                      {b.assignedStaffName && <span>NV: {b.assignedStaffName}</span>}
                      {b.roomName && <span>🚪 {b.roomName}</span>}
                    </div>
                    {b.serviceNote && (
                      <p className="text-xs text-gray-400 mt-1 italic">"{b.serviceNote}"</p>
                    )}
                    {(b.beforePhotoUrl || b.afterPhotoUrl) && (
                      <div className="flex items-center gap-2 mt-2">
                        {b.beforePhotoUrl && (
                          <img src={b.beforePhotoUrl} alt="before" className="w-12 h-12 rounded object-cover border" />
                        )}
                        {b.afterPhotoUrl && (
                          <img src={b.afterPhotoUrl} alt="after" className="w-12 h-12 rounded object-cover border" />
                        )}
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Camera size={9} /> Ảnh trước/sau</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-gray-900">{formatPrice(b.price)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
