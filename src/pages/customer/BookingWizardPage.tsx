import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Check, ChevronRight, CalendarDays, Clock, PawPrint, Scissors } from 'lucide-react'
import { SERVICE_MOCK_LIST, SERVICE_CATEGORY_LABELS } from '@/data/serviceMockData'
import { PET_MOCK_LIST } from '@/data/petMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'

const STEPS = ['Chọn dịch vụ', 'Chọn thú cưng', 'Chọn ngày & giờ', 'Xác nhận']

// Mock available time slots — in real app, fetch based on selected date + staff on shift
const TIME_SLOTS = [
  { time: '08:00', available: true }, { time: '09:00', available: true },
  { time: '09:30', available: false }, { time: '10:00', available: true },
  { time: '10:30', available: false }, { time: '11:00', available: true },
  { time: '13:00', available: true }, { time: '13:30', available: true },
  { time: '14:00', available: false }, { time: '14:30', available: true },
  { time: '15:00', available: true }, { time: '15:30', available: true },
  { time: '16:00', available: false }, { time: '17:00', available: true },
]

function getWeekDates() {
  const today = new Date(2026, 4, 31) // May 31 2026
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i + 1)
    return d
  })
}

const SIZE_WEIGHT_MAP: Record<string, string> = {
  small: '< 5kg', medium: '5–15kg', large: '15–30kg', xlarge: '> 30kg',
}

const CAT_ICONS: Record<string, string> = {
  grooming: '✂️', bathing: '🛁', spa: '💆', boarding: '🏠', nail: '💅', ear: '👂',
}

export default function BookingWizardPage() {
  const [searchParams] = useSearchParams()
  const { currentUser } = useAuthContext()

  const [step, setStep] = useState(0)
  const [selectedService, setSelectedService] = useState<string>(searchParams.get('serviceId') ?? '')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedPet, setSelectedPet] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const myPets = PET_MOCK_LIST.filter(p => p.ownerId === currentUser?.id)
  const service = SERVICE_MOCK_LIST.find(s => s.id === selectedService)
  const pet = PET_MOCK_LIST.find(p => p.id === selectedPet)
  const pricing = service?.pricingMatrix.find(p => p.size === selectedSize)
  const weekDates = getWeekDates()

  function canNext() {
    if (step === 0) return !!selectedService && !!selectedSize
    if (step === 1) return !!selectedPet
    if (step === 2) return !!selectedDate && !!selectedTime
    return true
  }

  function handleSubmit() {
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Đặt lịch thành công!</h2>
        <p className="text-sm text-gray-500 mb-1">
          Mã lịch hẹn: <span className="font-bold text-primary-600">BK-{String(Date.now()).slice(-4)}</span>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {service?.name} — {pet?.name} — {selectedDate} lúc {selectedTime}
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Chúng tôi sẽ xác nhận lịch hẹn trong vòng 30 phút qua email và SMS.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/customer/bookings" className="btn-primary">Xem lịch hẹn</Link>
          <Link to="/customer" className="btn-secondary">Về trang chủ</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Đặt lịch dịch vụ</h1>
        <p className="text-sm text-gray-500 mt-0.5">Chọn dịch vụ, thú cưng và thời gian phù hợp</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`flex flex-col items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                i < step ? 'bg-primary-500 border-primary-500 text-white'
                : i === step ? 'border-primary-500 text-primary-600 bg-white'
                : 'border-gray-200 text-gray-300 bg-white'
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <div className={`text-[10px] font-medium mt-1 hidden sm:block ${i === step ? 'text-primary-600' : i < step ? 'text-gray-500' : 'text-gray-300'}`}>
                {label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 ${i < step ? 'bg-primary-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Choose service */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-800">Chọn dịch vụ</h2>
          <div className="grid grid-cols-1 gap-3">
            {SERVICE_MOCK_LIST.map(svc => (
              <button key={svc.id} onClick={() => { setSelectedService(svc.id); setSelectedSize('') }}
                className={`card p-4 text-left transition-all ${selectedService === svc.id ? 'border-primary-400 bg-primary-50 shadow-sm' : 'hover:border-gray-300 hover:shadow-sm'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{CAT_ICONS[svc.category]}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-900">{svc.name}</span>
                      <span className="badge-blue text-[10px]">{SERVICE_CATEGORY_LABELS[svc.category]}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{svc.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {svc.petTypes.map(pt => (
                        <span key={pt} className="badge-gray text-[10px]">{pt === 'dog' ? 'Chó' : 'Mèo'}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-primary-600">Từ {formatPrice(Math.min(...svc.pricingMatrix.map(p => p.price)))}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedService && service && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Kích thước thú cưng</h3>
              <div className="grid grid-cols-2 gap-2">
                {service.pricingMatrix.map(p => (
                  <button key={p.size} onClick={() => setSelectedSize(p.size)}
                    className={`p-3 rounded-xl border text-left transition-all ${selectedSize === p.size ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="text-sm font-semibold text-gray-900">{p.label}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-primary-600">{formatPrice(p.price)}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-0.5"><Clock size={10} />{p.duration}ph</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Choose pet */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-800">Chọn thú cưng</h2>
          {myPets.length === 0 ? (
            <div className="card p-6 text-center">
              <PawPrint size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 mb-3">Bạn chưa có hồ sơ thú cưng nào</p>
              <Link to="/customer/my-pets" className="btn-primary">Thêm thú cưng</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {myPets.map(pet => (
                <button key={pet.id} onClick={() => setSelectedPet(pet.id)}
                  className={`card p-4 text-left flex items-center gap-4 transition-all ${selectedPet === pet.id ? 'border-primary-400 bg-primary-50' : 'hover:shadow-sm'}`}>
                  <img src={pet.avatar} alt={pet.name} className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{pet.name}</div>
                    <div className="text-xs text-gray-500">{pet.breed} · {pet.gender === 'male' ? 'Đực' : 'Cái'} · {pet.weight}kg</div>
                    {pet.notes && <div className="text-xs text-orange-600 mt-1">⚠️ {pet.notes}</div>}
                  </div>
                  {selectedPet === pet.id && (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Date & time */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-800">Chọn ngày & giờ</h2>

          {/* Date picker */}
          <div>
            <p className="text-sm text-gray-600 mb-3">Chọn ngày:</p>
            <div className="grid grid-cols-7 gap-1.5">
              {weekDates.map(date => {
                const dateStr = date.toISOString().split('T')[0]
                const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' })
                const dayNum = date.getDate()
                const isSelected = selectedDate === dateStr
                return (
                  <button key={dateStr} onClick={() => { setSelectedDate(dateStr); setSelectedTime('') }}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl border transition-all ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-gray-200 hover:border-primary-300 text-gray-700'}`}>
                    <span className="text-[10px] font-medium opacity-70">{dayName}</span>
                    <span className="text-sm font-bold mt-0.5">{dayNum}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div>
              <p className="text-sm text-gray-600 mb-3">Chọn giờ:</p>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button key={slot.time}
                    disabled={!slot.available}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      !slot.available ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                      : selectedTime === slot.time ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400'
                    }`}
                  >
                    {slot.time}
                    {!slot.available && <span className="block text-[9px] opacity-60">Đã đầy</span>}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Ô xám = đã đặt hoặc nhân viên không có ca
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && service && pet && pricing && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-800">Xác nhận đặt lịch</h2>
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b">
              <span className="text-3xl">{CAT_ICONS[service.category]}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <p className="text-xs text-gray-500">{pricing.label} · {pricing.duration} phút</p>
              </div>
              <div className="ml-auto text-lg font-bold text-primary-600">{formatPrice(pricing.price)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <PawPrint size={14} className="text-gray-400 shrink-0" />
                <div>
                  <div className="text-xs text-gray-400">Thú cưng</div>
                  <div className="font-medium text-gray-900">{pet.name} ({pet.breed})</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-gray-400 shrink-0" />
                <div>
                  <div className="text-xs text-gray-400">Ngày & Giờ</div>
                  <div className="font-medium text-gray-900">{selectedDate} lúc {selectedTime}</div>
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Ghi chú cho nhân viên (tuỳ chọn)</label>
              <textarea
                className="form-input h-20 resize-none"
                placeholder="VD: Bé hay bị căng thẳng, xin nhẹ nhàng..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
              💡 Lịch hẹn sẽ được xác nhận trong 30 phút. Bạn sẽ nhận thông báo qua email.
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)} className="btn-secondary">← Quay lại</button>
        ) : (
          <Link to="/customer/services" className="btn-secondary">← Huỷ</Link>
        )}
        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
            Tiếp theo <ChevronRight size={15} />
          </button>
        ) : (
          <button onClick={handleSubmit} className="btn-primary bg-green-500 hover:bg-green-600">
            <Check size={15} /> Xác nhận đặt lịch
          </button>
        )}
      </div>
    </div>
  )
}
