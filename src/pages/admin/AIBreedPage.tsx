import { useState, useRef } from 'react'
import { Upload, RefreshCw, CheckCircle, Camera, Zap } from 'lucide-react'

interface BreedResult {
  breed: string
  confidence: number
  species: 'dog' | 'cat'
  description: string
  traits: string[]
  careLevel: 'easy' | 'medium' | 'hard'
  avgWeight: string
  lifespan: string
}

const MOCK_RESULTS: BreedResult[] = [
  { breed: 'Golden Retriever', confidence: 96.4, species: 'dog', description: 'Chó trinh sát thân thiện, thông minh và yêu trẻ em. Phù hợp với gia đình có trẻ nhỏ.', traits: ['Thân thiện', 'Thông minh', 'Năng động', 'Trung thành'], careLevel: 'medium', avgWeight: '25–34 kg', lifespan: '10–12 năm' },
  { breed: 'Labrador Retriever', confidence: 91.2, species: 'dog', description: 'Một trong những giống chó phổ biến nhất. Dễ huấn luyện và thích hợp làm chó hỗ trợ.', traits: ['Vui vẻ', 'Dễ huấn luyện', 'Kiên nhẫn'], careLevel: 'easy', avgWeight: '25–36 kg', lifespan: '10–12 năm' },
  { breed: 'Maine Coon', confidence: 94.8, species: 'cat', description: 'Mèo lớn, lông dài và rất thông minh. Được mệnh danh là "chú chó trong thế giới mèo".', traits: ['Thân thiện', 'Năng động', 'Thích chơi'], careLevel: 'medium', avgWeight: '4–8 kg', lifespan: '12–15 năm' },
]

const CARE_LABELS: Record<string, string> = { easy: 'Dễ chăm sóc', medium: 'Trung bình', hard: 'Cần nhiều chăm sóc' }
const CARE_COLORS: Record<string, string> = { easy: 'badge-green', medium: 'badge-orange', hard: 'badge-red' }

export default function AIBreedPage() {
  const [image, setImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<BreedResult | null>(null)
  const [candidates, setCandidates] = useState<BreedResult[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImage(url)
    setResult(null)
    setCandidates([])
    setAnalyzing(true)
    setTimeout(() => {
      const picked = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)]
      setResult(picked)
      setCandidates(MOCK_RESULTS.filter(r => r !== picked).slice(0, 2))
      setAnalyzing(false)
    }, 2200)
  }

  function handleDemo() {
    setImage('https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400')
    setResult(null)
    setCandidates([])
    setAnalyzing(true)
    setTimeout(() => {
      setResult(MOCK_RESULTS[0])
      setCandidates(MOCK_RESULTS.slice(1))
      setAnalyzing(false)
    }, 2200)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Zap size={20} className="text-yellow-500" /> AI Nhận diện Giống thú cưng
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Tải ảnh thú cưng lên để nhận diện giống bằng AI. Hỗ trợ chó và mèo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload panel */}
        <div className="space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:border-primary-400 hover:bg-primary-50/30 ${image ? 'border-primary-300' : 'border-gray-200'}`}
            style={{ minHeight: 240 }}
          >
            {image ? (
              <img src={image} alt="pet" className="w-full h-60 object-cover rounded-2xl" />
            ) : (
              <div className="flex flex-col items-center justify-center h-60 gap-3">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center">
                  <Camera size={28} className="text-primary-400" />
                </div>
                <div className="text-sm font-medium text-gray-700">Tải ảnh lên</div>
                <p className="text-xs text-gray-400">JPG, PNG, WEBP · Tối đa 10MB</p>
              </div>
            )}
            {analyzing && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center gap-3">
                <RefreshCw size={28} className="text-white animate-spin" />
                <span className="text-sm text-white font-medium">Đang phân tích AI...</span>
              </div>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()} className="btn-primary flex-1 justify-center">
              <Upload size={14} /> Chọn ảnh
            </button>
            <button onClick={handleDemo} className="btn-secondary text-sm">
              Demo
            </button>
          </div>

          {image && !analyzing && !result && (
            <p className="text-xs text-gray-400 text-center">Đang chờ kết quả...</p>
          )}
        </div>

        {/* Result panel */}
        <div>
          {analyzing && (
            <div className="card p-6 text-center h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-4">
                <Zap size={28} className="text-yellow-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Đang phân tích...</h3>
              <p className="text-sm text-gray-400">AI đang nhận diện giống thú cưng</p>
              <div className="mt-4 flex gap-1 justify-center">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}

          {result && !analyzing && (
            <div className="space-y-3">
              <div className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">{result.breed}</h3>
                      <CheckCircle size={18} className="text-green-500" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge-blue">{result.species === 'dog' ? '🐕 Chó' : '🐈 Mèo'}</span>
                      <span className={CARE_COLORS[result.careLevel]}>{CARE_LABELS[result.careLevel]}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-green-600">{result.confidence}%</div>
                    <div className="text-xs text-gray-400">độ chính xác</div>
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${result.confidence}%` }} />
                </div>

                <p className="text-sm text-gray-600 mb-3">{result.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Cân nặng TB</div>
                    <div className="font-semibold">{result.avgWeight}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Tuổi thọ</div>
                    <div className="font-semibold">{result.lifespan}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {result.traits.map(t => (
                    <span key={t} className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">{t}</span>
                  ))}
                </div>
              </div>

              {candidates.length > 0 && (
                <div className="card p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Giống tương tự</h4>
                  <div className="space-y-2">
                    {candidates.map(c => (
                      <div key={c.breed} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{c.breed}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded h-1.5">
                            <div className="bg-gray-400 h-1.5 rounded" style={{ width: `${c.confidence}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-10 text-right">{c.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!image && !analyzing && !result && (
            <div className="card h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="text-5xl mb-3">🤖</div>
              <h3 className="font-semibold text-gray-700 mb-1">AI Vision Ready</h3>
              <p className="text-sm text-gray-400">Tải ảnh lên để nhận diện giống tức thì</p>
            </div>
          )}
        </div>
      </div>

      {/* Info footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>💡 Về công nghệ:</strong> AI sử dụng mô hình học sâu (Deep CNN) được huấn luyện trên 250+ giống chó và 80+ giống mèo. Độ chính xác trung bình đạt 94% trên tập dữ liệu kiểm định.
      </div>
    </div>
  )
}
