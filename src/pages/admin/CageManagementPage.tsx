import { useState, useMemo } from 'react'
import {
  Search, Plus, Edit, Trash2, Package, AlertTriangle, AlertCircle,
  Grid3X3, CheckCircle, Filter, BarChart2, DollarSign, ArrowUpDown,
  Boxes, X, ChevronDown, Info, TrendingUp, Tag, MapPin,
  QrCode, Ruler, Weight, ShieldCheck, Warehouse, RefreshCw,
} from 'lucide-react'
import { CAGE_MOCK_LIST, saveCages } from '@/data/cageMockData'
import { formatPrice } from '@/utils/format'
import type { Cage } from '@/types'

type SortField = 'name' | 'code' | 'price' | 'stock' | 'createdAt'
type SortDir = 'asc' | 'desc'

const PET_TYPE_MAP: Record<Cage['petType'], { label: string; color: string; emoji: string }> = {
  dog: { label: 'Chó', color: 'bg-blue-100 text-blue-800 border-blue-200', emoji: '🐕' },
  cat: { label: 'Mèo', color: 'bg-pink-100 text-pink-800 border-pink-200', emoji: '🐈' },
  bird: { label: 'Chim', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', emoji: '🐦' },
  rabbit: { label: 'Thỏ', color: 'bg-purple-100 text-purple-800 border-purple-200', emoji: '🐇' },
  other: { label: 'Khác', color: 'bg-gray-100 text-gray-700 border-gray-200', emoji: '🐾' },
}

const STATUS_MAP: Record<Cage['status'], { label: string; badge: string; dot: string }> = {
  active: { label: 'Đang kinh doanh', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  inactive: { label: 'Ngừng kinh doanh', badge: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' },
  maintenance: { label: 'Đang bảo trì', badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
}

function StockBar({ stock, minStock }: { stock: number; minStock: number }) {
  const isOut = stock === 0
  const isLow = stock > 0 && stock <= minStock
  const pct = Math.min(100, minStock > 0 ? (stock / (minStock * 3)) * 100 : 100)
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-400' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] font-bold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-700'}`}>
        {stock}
      </span>
    </div>
  )
}

export default function CageManagementPage() {
  const [cages, setCages] = useState<Cage[]>(CAGE_MOCK_LIST)
  const [search, setSearch] = useState('')
  const [filterPet, setFilterPet] = useState<Cage['petType'] | 'all'>('all')
  const [filterSize, setFilterSize] = useState<Cage['size'] | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<Cage['status'] | 'all'>('all')
  const [filterStock, setFilterStock] = useState<'all' | 'out' | 'low' | 'ok'>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  // ── Form state ──
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Cage | null>(null)
  const [fName, setFName] = useState('')
  const [fCode, setFCode] = useState('')
  const [fSize, setFSize] = useState<Cage['size']>('M')
  const [fMaterial, setFMaterial] = useState('')
  const [fColor, setFColor] = useState('')
  const [fPetType, setFPetType] = useState<Cage['petType']>('dog')
  const [fCostPrice, setFCostPrice] = useState(0)
  const [fPrice, setFPrice] = useState(0)
  const [fStock, setFStock] = useState(0)
  const [fMinStock, setFMinStock] = useState(3)
  const [fBarcode, setFBarcode] = useState('')
  const [fStatus, setFStatus] = useState<Cage['status']>('active')
  const [fDesc, setFDesc] = useState('')
  const [fL, setFL] = useState<number | ''>('')
  const [fW, setFW] = useState<number | ''>('')
  const [fH, setFH] = useState<number | ''>('')
  const [fMaxWeight, setFMaxWeight] = useState<number | ''>('')
  const [fWarranty, setFWarranty] = useState<number | ''>('')
  const [fLocation, setFLocation] = useState('')

  // ── Quick stock adjust state ──
  const [adjustId, setAdjustId] = useState<string | null>(null)
  const [adjustDelta, setAdjustDelta] = useState(0)
  const [adjustNote, setAdjustNote] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // ── Stats ──
  const stats = useMemo(() => {
    const active = cages.filter(c => c.status === 'active').length
    const outOfStock = cages.filter(c => c.stock === 0).length
    const lowStock = cages.filter(c => c.stock > 0 && c.stock <= c.minStock).length
    const totalInventoryValue = cages.reduce((s, c) => s + c.stock * c.costPrice, 0)
    const totalRevenuePotential = cages.reduce((s, c) => s + c.stock * c.price, 0)
    const totalStock = cages.reduce((s, c) => s + c.stock, 0)
    const avgMargin = cages.length > 0
      ? cages.reduce((s, c) => s + (c.price > 0 ? ((c.price - c.costPrice) / c.price) * 100 : 0), 0) / cages.length
      : 0
    return { active, outOfStock, lowStock, totalInventoryValue, totalRevenuePotential, totalStock, avgMargin }
  }, [cages])

  // ── Filtered + Sorted ──
  const displayed = useMemo(() => {
    let list = cages.filter(c => {
      const q = search.toLowerCase()
      const matchSearch = !search || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (c.barcode ?? '').includes(q)
      const matchPet = filterPet === 'all' || c.petType === filterPet
      const matchSize = filterSize === 'all' || c.size === filterSize
      const matchStatus = filterStatus === 'all' || c.status === filterStatus
      const matchStock = filterStock === 'all'
        || (filterStock === 'out' && c.stock === 0)
        || (filterStock === 'low' && c.stock > 0 && c.stock <= c.minStock)
        || (filterStock === 'ok' && c.stock > c.minStock)
      return matchSearch && matchPet && matchSize && matchStatus && matchStock
    })
    list = list.sort((a, b) => {
      let va: number | string = a[sortField] as any
      let vb: number | string = b[sortField] as any
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [cages, search, filterPet, filterSize, filterStatus, filterStock, sortField, sortDir])

  const selected = selectedId ? cages.find(c => c.id === selectedId) : null

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  // ── Form handlers ──
  function openCreate() {
    setEditing(null)
    setFName(''); setFCode(''); setFSize('M'); setFMaterial(''); setFColor('')
    setFPetType('dog'); setFCostPrice(0); setFPrice(0); setFStock(0); setFMinStock(3)
    setFBarcode(''); setFStatus('active'); setFDesc('')
    setFL(''); setFW(''); setFH(''); setFMaxWeight(''); setFWarranty(''); setFLocation('')
    setIsFormOpen(true)
  }

  function openEdit(cage: Cage) {
    setEditing(cage)
    setFName(cage.name); setFCode(cage.code); setFSize(cage.size)
    setFMaterial(cage.material); setFColor(cage.color ?? '')
    setFPetType(cage.petType); setFCostPrice(cage.costPrice); setFPrice(cage.price)
    setFStock(cage.stock); setFMinStock(cage.minStock); setFBarcode(cage.barcode ?? '')
    setFStatus(cage.status); setFDesc(cage.description ?? '')
    setFL(cage.lengthCm ?? ''); setFW(cage.widthCm ?? ''); setFH(cage.heightCm ?? '')
    setFMaxWeight(cage.maxWeight ?? ''); setFWarranty(cage.warranty ?? '')
    setFLocation(cage.location ?? '')
    setIsFormOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fName.trim() || !fCode.trim() || !fMaterial.trim()) return

    const petColors: Record<Cage['petType'], string> = { dog: '3B82F6', cat: 'EC4899', bird: '10B981', rabbit: '8B5CF6', other: '94A3B8' }
    const img = `https://placehold.co/200x200/${petColors[fPetType]}/white?text=${encodeURIComponent(fCode)}`

    if (editing) {
      const updated = cages.map(c => c.id === editing.id ? {
        ...c, name: fName, code: fCode.toUpperCase(), size: fSize, material: fMaterial, color: fColor,
        petType: fPetType, costPrice: fCostPrice, price: fPrice, stock: fStock, minStock: fMinStock,
        barcode: fBarcode, status: fStatus, description: fDesc,
        lengthCm: fL !== '' ? Number(fL) : undefined,
        widthCm: fW !== '' ? Number(fW) : undefined,
        heightCm: fH !== '' ? Number(fH) : undefined,
        maxWeight: fMaxWeight !== '' ? Number(fMaxWeight) : undefined,
        warranty: fWarranty !== '' ? Number(fWarranty) : undefined,
        location: fLocation, image: img,
      } : c)
      setCages(updated); saveCages(updated)
      showToast(`✅ Đã cập nhật: ${fCode.toUpperCase()}`)
    } else {
      const newCage: Cage = {
        id: `CAGE-${Date.now()}`, name: fName, code: fCode.toUpperCase(), size: fSize,
        material: fMaterial, color: fColor, petType: fPetType, costPrice: fCostPrice,
        price: fPrice, stock: fStock, minStock: fMinStock, barcode: fBarcode, image: img,
        status: fStatus, description: fDesc,
        lengthCm: fL !== '' ? Number(fL) : undefined,
        widthCm: fW !== '' ? Number(fW) : undefined,
        heightCm: fH !== '' ? Number(fH) : undefined,
        maxWeight: fMaxWeight !== '' ? Number(fMaxWeight) : undefined,
        warranty: fWarranty !== '' ? Number(fWarranty) : undefined,
        location: fLocation, createdAt: new Date().toISOString().slice(0, 10),
      }
      const updated = [newCage, ...cages]
      setCages(updated); saveCages(updated)
      showToast(`✅ Đã thêm chuồng: ${fCode.toUpperCase()}`)
    }
    setIsFormOpen(false)
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Xác nhận xóa chuồng "${name}"?`)) return
    const updated = cages.filter(c => c.id !== id)
    setCages(updated); saveCages(updated)
    if (selectedId === id) setSelectedId(null)
    showToast('Đã xóa chuồng')
  }

  function handleToggleStatus(cage: Cage) {
    const next = cage.status === 'active' ? 'inactive' : 'active'
    const updated = cages.map(c => c.id === cage.id ? { ...c, status: next as Cage['status'] } : c)
    setCages(updated); saveCages(updated)
    showToast(`Đã ${next === 'active' ? 'kích hoạt' : 'tạm dừng'}: ${cage.code}`)
  }

  function confirmAdjust() {
    if (!adjustId || adjustDelta === 0) return
    const updated = cages.map(c => {
      if (c.id !== adjustId) return c
      const newStock = Math.max(0, c.stock + adjustDelta)
      return { ...c, stock: newStock, lastRestockedAt: adjustDelta > 0 ? new Date().toISOString().slice(0, 10) : c.lastRestockedAt }
    })
    setCages(updated); saveCages(updated)
    showToast(`Đã điều chỉnh tồn kho (${adjustDelta > 0 ? '+' : ''}${adjustDelta}) — ${adjustNote || 'Không có ghi chú'}`)
    setAdjustId(null); setAdjustDelta(0); setAdjustNote('')
  }

  const SortBtn = ({ field, label }: { field: SortField; label: string }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-0.5 hover:text-gray-900 transition-colors cursor-pointer">
      {label}
      <ArrowUpDown size={10} className={sortField === field ? 'text-primary-500' : 'text-gray-300'} />
    </button>
  )

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-950 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-gray-800">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Grid3X3 size={22} className="text-primary-600" /> Quản lý Danh mục Chuồng
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Quản lý danh mục, tồn kho, giá vốn và thông số kỹ thuật các loại chuồng nuôi thú cưng
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-1.5">
          <Plus size={15} /> Thêm chuồng mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Đang kinh doanh', value: stats.active,
            sub: `/${cages.length} loại chuồng`, icon: Grid3X3,
            color: 'bg-primary-50 text-primary-700 border-primary-100',
          },
          {
            label: 'Tổng tồn kho', value: stats.totalStock,
            sub: 'chuồng trong kho', icon: Boxes,
            color: 'bg-blue-50 text-blue-700 border-blue-100',
          },
          {
            label: 'Hết hàng / Sắp hết', value: stats.outOfStock,
            sub: `+${stats.lowStock} sắp hết (≤ ngưỡng)`, icon: AlertTriangle,
            color: stats.outOfStock > 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-50 text-gray-600 border-gray-100',
            pulse: stats.outOfStock > 0,
          },
          {
            label: 'Giá trị tồn kho', value: formatPrice(stats.totalInventoryValue),
            sub: `Tiềm năng doanh thu: ${formatPrice(stats.totalRevenuePotential)}`, icon: DollarSign,
            color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{s.label}</div>
              <div className={`text-lg font-extrabold mt-0.5 ${s.pulse ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>{s.value}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{s.sub}</div>
            </div>
            <div className={`p-2.5 rounded-xl border ${s.color} shrink-0`}>
              <s.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Margin Highlight Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-primary-50 border border-indigo-100 rounded-2xl px-4 py-3 flex items-center gap-3 text-xs text-indigo-800">
        <TrendingUp size={16} className="text-indigo-500 shrink-0" />
        <div>
          <span className="font-bold">Biên lợi nhuận trung bình: {stats.avgMargin.toFixed(1)}%</span>
          <span className="text-indigo-600 ml-2">— Tiềm năng lợi nhuận: {formatPrice(stats.totalRevenuePotential - stats.totalInventoryValue)}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="form-input pl-9 text-sm w-full"
              placeholder="Tìm tên, mã code, barcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Pet type */}
            <select className="form-input text-xs py-1.5 pr-7 pl-3" value={filterPet} onChange={e => setFilterPet(e.target.value as any)}>
              <option value="all">🐾 Tất cả loại thú</option>
              <option value="dog">🐕 Chó</option>
              <option value="cat">🐈 Mèo</option>
              <option value="bird">🐦 Chim</option>
              <option value="rabbit">🐇 Thỏ</option>
              <option value="other">Khác</option>
            </select>
            {/* Size */}
            <select className="form-input text-xs py-1.5 pr-7 pl-3" value={filterSize} onChange={e => setFilterSize(e.target.value as any)}>
              <option value="all">Tất cả size</option>
              <option value="S">Size S</option>
              <option value="M">Size M</option>
              <option value="L">Size L</option>
              <option value="XL">Size XL</option>
            </select>
            {/* Status */}
            <select className="form-input text-xs py-1.5 pr-7 pl-3" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang KD</option>
              <option value="inactive">Ngừng KD</option>
              <option value="maintenance">Bảo trì</option>
            </select>
            {/* Stock alert */}
            <select className="form-input text-xs py-1.5 pr-7 pl-3" value={filterStock} onChange={e => setFilterStock(e.target.value as any)}>
              <option value="all">Tất cả tồn kho</option>
              <option value="out">Hết hàng (0)</option>
              <option value="low">Sắp hết (≤ ngưỡng)</option>
              <option value="ok">Đủ hàng</option>
            </select>
          </div>
          <div className="text-xs text-gray-400 ml-auto font-medium">{displayed.length} / {cages.length} kết quả</div>
        </div>
      </div>

      {/* Main content: Table + Detail Panel */}
      <div className="flex gap-5 items-start">
        {/* Table */}
        <div className={`card overflow-hidden flex-1 min-w-0 ${selected ? 'max-w-[58%]' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  <th className="table-th"><SortBtn field="name" label="Chuồng" /></th>
                  <th className="table-th">Loại thú / Size</th>
                  <th className="table-th text-right"><SortBtn field="price" label="Giá bán" /></th>
                  <th className="table-th text-right">Giá vốn</th>
                  <th className="table-th"><SortBtn field="stock" label="Tồn kho" /></th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayed.map(c => {
                  const isOut = c.stock === 0
                  const isLow = c.stock > 0 && c.stock <= c.minStock
                  const margin = c.price > 0 ? ((c.price - c.costPrice) / c.price * 100) : 0
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                      className={`cursor-pointer hover:bg-gray-50/70 transition-colors ${selectedId === c.id ? 'bg-primary-50/30 border-l-2 border-l-primary-500' : ''} ${isOut ? 'bg-red-50/20' : isLow ? 'bg-amber-50/20' : ''}`}
                    >
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <img src={c.image} alt={c.name} className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0" />
                          <div>
                            <div className="font-bold text-gray-900 text-xs leading-tight">{c.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center gap-1">
                              <span>{c.code}</span>
                              {c.color && <span className="text-gray-300">· {c.color}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border w-fit ${PET_TYPE_MAP[c.petType].color}`}>
                            {PET_TYPE_MAP[c.petType].emoji} {PET_TYPE_MAP[c.petType].label}
                          </span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded w-fit">Size {c.size}</span>
                        </div>
                      </td>
                      <td className="table-td text-right">
                        <div className="font-bold text-gray-900 text-sm">{formatPrice(c.price)}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold">+{margin.toFixed(0)}% lợi nhuận</div>
                      </td>
                      <td className="table-td text-right">
                        <div className="text-xs font-semibold text-gray-500">{formatPrice(c.costPrice)}</div>
                      </td>
                      <td className="table-td">
                        <div className="space-y-0.5">
                          <StockBar stock={c.stock} minStock={c.minStock} />
                          {isOut && <div className="text-[9px] text-red-500 font-bold">⚠ Hết hàng</div>}
                          {isLow && <div className="text-[9px] text-amber-500 font-bold">↓ Sắp hết (≤{c.minStock})</div>}
                        </div>
                      </td>
                      <td className="table-td">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${STATUS_MAP[c.status].badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_MAP[c.status].dot}`} />
                          {STATUS_MAP[c.status].label}
                        </span>
                      </td>
                      <td className="table-td text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => { setAdjustId(c.id); setAdjustDelta(0); setAdjustNote('') }}
                            className="p-1.5 text-blue-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                            title="Điều chỉnh tồn kho"
                          >
                            <RefreshCw size={13} />
                          </button>
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-600 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            className="p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {displayed.length === 0 && (
              <div className="p-16 text-center text-gray-400 text-sm">
                <Grid3X3 size={28} className="mx-auto mb-2 text-gray-200" />
                Không tìm thấy chuồng nào
              </div>
            )}
          </div>
        </div>

        {/* Detail Side Panel */}
        {selected && (
          <div className="w-[42%] shrink-0 card p-5 space-y-4 animate-slideIn sticky top-4 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${STATUS_MAP[selected.status].badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_MAP[selected.status].dot}`} />
                    {STATUS_MAP[selected.status].label}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-1 rounded-lg border ${PET_TYPE_MAP[selected.petType].color}`}>
                    {PET_TYPE_MAP[selected.petType].emoji} {PET_TYPE_MAP[selected.petType].label}
                  </span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-1.5 py-1 rounded-lg">Size {selected.size}</span>
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mt-1.5 leading-tight">{selected.name}</h3>
                <p className="text-[10px] text-gray-400 font-mono">{selected.code}</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-gray-300 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0 mt-0.5">
                <X size={16} />
              </button>
            </div>

            {/* Image */}
            <img src={selected.image} alt={selected.name} className="w-full h-36 object-cover rounded-2xl border border-gray-100" />

            {/* Pricing block */}
            <div className="bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-100 rounded-2xl p-4 space-y-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><DollarSign size={11} /> Thông tin giá</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white rounded-xl p-2.5 border border-primary-100 shadow-sm">
                  <div className="text-[9px] text-gray-400 font-bold uppercase">Giá vốn</div>
                  <div className="text-sm font-extrabold text-gray-700 mt-0.5">{formatPrice(selected.costPrice)}</div>
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-emerald-200 shadow-sm">
                  <div className="text-[9px] text-emerald-500 font-bold uppercase">Giá bán</div>
                  <div className="text-sm font-extrabold text-emerald-700 mt-0.5">{formatPrice(selected.price)}</div>
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-indigo-100 shadow-sm">
                  <div className="text-[9px] text-indigo-400 font-bold uppercase">Biên LN</div>
                  <div className="text-sm font-extrabold text-indigo-700 mt-0.5">
                    {selected.price > 0 ? ((selected.price - selected.costPrice) / selected.price * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-primary-100">
                <span className="text-gray-500">Giá trị tồn kho hiện tại</span>
                <span className="font-extrabold text-gray-800">{formatPrice(selected.stock * selected.costPrice)}</span>
              </div>
            </div>

            {/* Stock block */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Boxes size={11} /> Tồn kho</div>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-2xl font-extrabold ${selected.stock === 0 ? 'text-red-500' : selected.stock <= selected.minStock ? 'text-amber-500' : 'text-gray-900'}`}>{selected.stock}</span>
                  <span className="text-gray-400 text-xs ml-1">cái</span>
                </div>
                <div className="text-right text-xs">
                  <div className="text-gray-400">Ngưỡng cảnh báo: <span className="font-bold text-gray-700">{selected.minStock}</span></div>
                  {selected.lastRestockedAt && <div className="text-gray-400">Nhập gần nhất: <span className="font-semibold text-gray-600">{selected.lastRestockedAt}</span></div>}
                </div>
              </div>
              {selected.stock === 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-2 text-xs text-red-600 font-bold flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Hết hàng — Cần lên yêu cầu nhập kho ngay!
                </div>
              )}
              {selected.stock > 0 && selected.stock <= selected.minStock && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 text-xs text-amber-700 font-bold flex items-center gap-1.5">
                  <AlertCircle size={12} /> Tồn kho ở mức cảnh báo — Nên nhập thêm
                </div>
              )}
            </div>

            {/* Specs block */}
            {(selected.lengthCm || selected.maxWeight || selected.warranty) && (
              <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Ruler size={11} /> Thông số kỹ thuật</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selected.lengthCm && selected.widthCm && selected.heightCm && (
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <div className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1"><Ruler size={9} /> Kích thước</div>
                      <div className="font-bold text-gray-800 mt-0.5">{selected.lengthCm} × {selected.widthCm} × {selected.heightCm} cm</div>
                    </div>
                  )}
                  {selected.maxWeight && (
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <div className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1"><Weight size={9} /> Tải trọng thú</div>
                      <div className="font-bold text-gray-800 mt-0.5">≤ {selected.maxWeight} kg</div>
                    </div>
                  )}
                  {selected.warranty && (
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <div className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1"><ShieldCheck size={9} /> Bảo hành</div>
                      <div className="font-bold text-gray-800 mt-0.5">{selected.warranty} tháng</div>
                    </div>
                  )}
                  {selected.material && (
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <div className="text-[9px] text-gray-400 font-bold uppercase">Chất liệu</div>
                      <div className="font-bold text-gray-800 mt-0.5">{selected.material}</div>
                    </div>
                  )}
                  {selected.color && (
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <div className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1"><Tag size={9} /> Màu sắc</div>
                      <div className="font-bold text-gray-800 mt-0.5">{selected.color}</div>
                    </div>
                  )}
                  {selected.location && (
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <div className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1"><MapPin size={9} /> Vị trí kho</div>
                      <div className="font-bold text-gray-800 mt-0.5">{selected.location}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Barcode + description */}
            {(selected.barcode || selected.description) && (
              <div className="space-y-2">
                {selected.barcode && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                    <QrCode size={14} className="text-gray-400 shrink-0" />
                    <div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase">Barcode</div>
                      <div className="text-xs font-mono font-bold text-gray-800">{selected.barcode}</div>
                    </div>
                  </div>
                )}
                {selected.description && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs text-gray-600 leading-relaxed flex items-start gap-2">
                    <Info size={12} className="text-blue-400 shrink-0 mt-0.5" />
                    <span>{selected.description}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-gray-100">
              <button
                onClick={() => { setAdjustId(selected.id); setAdjustDelta(0); setAdjustNote('') }}
                className="flex-1 py-2 text-xs font-bold border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={13} /> Điều chỉnh tồn
              </button>
              <button
                onClick={() => openEdit(selected)}
                className="flex-1 py-2 text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit size={13} /> Chỉnh sửa
              </button>
              <button
                onClick={() => handleToggleStatus(selected)}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 border ${selected.status === 'active' ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
              >
                {selected.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: Quick Stock Adjust ── */}
      {adjustId && (() => {
        const cage = cages.find(c => c.id === adjustId)!
        return (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl animate-scaleUp">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-900">Điều Chỉnh Tồn Kho</h3>
                <button onClick={() => setAdjustId(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm space-y-1">
                <div className="font-extrabold text-gray-900 truncate">{cage.name}</div>
                <div className="text-[10px] text-gray-400 font-mono">{cage.code}</div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-gray-500">Tồn kho hiện tại:</span>
                  <span className="font-extrabold text-xl text-gray-900">{cage.stock}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Điều chỉnh số lượng (+ nhập thêm, - xuất/giảm)</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setAdjustDelta(d => d - 1)} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl text-lg font-bold transition-colors">−</button>
                  <input
                    type="number"
                    className="form-input text-center text-lg font-extrabold flex-1 py-2"
                    value={adjustDelta}
                    onChange={e => setAdjustDelta(parseInt(e.target.value) || 0)}
                  />
                  <button onClick={() => setAdjustDelta(d => d + 1)} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl text-lg font-bold transition-colors">+</button>
                </div>
                <div className="text-center text-xs text-gray-500">
                  Tồn kho sau điều chỉnh: <strong className={Math.max(0, cage.stock + adjustDelta) <= cage.minStock ? 'text-amber-600' : 'text-emerald-600'}>{Math.max(0, cage.stock + adjustDelta)}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Lý do điều chỉnh</label>
                <input
                  className="form-input text-sm"
                  placeholder="VD: Nhập thêm từ kho, kiểm kê thực tế..."
                  value={adjustNote}
                  onChange={e => setAdjustNote(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => setAdjustId(null)} className="btn-secondary flex-1 justify-center py-2.5">Hủy</button>
                <button
                  onClick={confirmAdjust}
                  disabled={adjustDelta === 0}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── MODAL: Create / Edit Cage ── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 space-y-5 shadow-2xl animate-scaleUp my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">
                {editing ? `Chỉnh sửa: ${editing.code}` : 'Thêm Chuồng Mới'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Basic Info */}
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Info size={10} /> Thông tin cơ bản
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="form-label text-xs font-bold">Tên chuồng <span className="text-red-500">*</span></label>
                    <input className="form-input text-sm" placeholder="VD: Chuồng Chó Inox 304 Size M" required value={fName} onChange={e => setFName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Mã code <span className="text-red-500">*</span></label>
                    <input className="form-input text-sm font-mono uppercase" placeholder="CAGE-DOG-M-INOX" required value={fCode} onChange={e => setFCode(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Barcode / EAN</label>
                    <input className="form-input text-sm font-mono" placeholder="8934588001001" value={fBarcode} onChange={e => setFBarcode(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Loại thú cưng <span className="text-red-500">*</span></label>
                    <select className="form-input text-sm" value={fPetType} onChange={e => setFPetType(e.target.value as Cage['petType'])}>
                      <option value="dog">🐕 Chó</option>
                      <option value="cat">🐈 Mèo</option>
                      <option value="bird">🐦 Chim</option>
                      <option value="rabbit">🐇 Thỏ</option>
                      <option value="other">🐾 Khác</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Kích thước</label>
                    <select className="form-input text-sm" value={fSize} onChange={e => setFSize(e.target.value as Cage['size'])}>
                      <option value="S">S (Nhỏ)</option>
                      <option value="M">M (Vừa)</option>
                      <option value="L">L (Lớn)</option>
                      <option value="XL">XL (Rất lớn)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Chất liệu <span className="text-red-500">*</span></label>
                    <input className="form-input text-sm" placeholder="Inox 304, Sắt sơn tĩnh điện..." required value={fMaterial} onChange={e => setFMaterial(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Màu sắc</label>
                    <input className="form-input text-sm" placeholder="Bạc, Đen, Trắng..." value={fColor} onChange={e => setFColor(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Trạng thái</label>
                    <select className="form-input text-sm" value={fStatus} onChange={e => setFStatus(e.target.value as Cage['status'])}>
                      <option value="active">Đang kinh doanh</option>
                      <option value="inactive">Ngừng kinh doanh</option>
                      <option value="maintenance">Bảo trì</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Vị trí trong kho</label>
                    <input className="form-input text-sm font-mono" placeholder="Kệ A1-01" value={fLocation} onChange={e => setFLocation(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <DollarSign size={10} /> Giá & Tồn kho
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Giá vốn nhập (VND)</label>
                    <input type="number" min={0} className="form-input text-sm" value={fCostPrice} onChange={e => setFCostPrice(+e.target.value)} />
                    {fCostPrice > 0 && fPrice > 0 && <div className="text-[10px] text-emerald-600 font-bold">Biên LN: {((fPrice - fCostPrice) / fPrice * 100).toFixed(1)}%</div>}
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Giá bán lẻ (VND) <span className="text-red-500">*</span></label>
                    <input type="number" min={0} className="form-input text-sm" required value={fPrice} onChange={e => setFPrice(+e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Tồn kho hiện tại</label>
                    <input type="number" min={0} className="form-input text-sm" value={fStock} onChange={e => setFStock(+e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Ngưỡng tồn tối thiểu</label>
                    <input type="number" min={0} className="form-input text-sm" value={fMinStock} onChange={e => setFMinStock(+e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Dimensions & Specs */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Ruler size={10} /> Thông số kỹ thuật
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Dài (cm)</label>
                    <input type="number" min={0} className="form-input text-sm" placeholder="90" value={fL} onChange={e => setFL(e.target.value === '' ? '' : +e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Rộng (cm)</label>
                    <input type="number" min={0} className="form-input text-sm" placeholder="60" value={fW} onChange={e => setFW(e.target.value === '' ? '' : +e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Cao (cm)</label>
                    <input type="number" min={0} className="form-input text-sm" placeholder="70" value={fH} onChange={e => setFH(e.target.value === '' ? '' : +e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Tải trọng tối đa (kg)</label>
                    <input type="number" min={0} className="form-input text-sm" placeholder="30" value={fMaxWeight} onChange={e => setFMaxWeight(e.target.value === '' ? '' : +e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label text-xs font-bold">Bảo hành (tháng)</label>
                    <input type="number" min={0} className="form-input text-sm" placeholder="12" value={fWarranty} onChange={e => setFWarranty(e.target.value === '' ? '' : +e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="form-label text-xs font-bold">Mô tả chi tiết</label>
                <textarea className="form-input text-sm resize-none" rows={3} placeholder="Mô tả tính năng, chất liệu, phù hợp với loại thú nào..." value={fDesc} onChange={e => setFDesc(e.target.value)} />
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary flex-1 justify-center py-2.5">Hủy</button>
                <button type="submit" className="btn-primary flex-1 justify-center py-2.5">
                  {editing ? '💾 Lưu thay đổi' : '✅ Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
