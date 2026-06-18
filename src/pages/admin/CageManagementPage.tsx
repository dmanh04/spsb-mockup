import { useState } from 'react'
import { Plus, Search, Trash2, Edit3, CheckCircle, X, Grid3X3, AlertTriangle } from 'lucide-react'
import { CAGE_MOCK_LIST, saveCages } from '@/data/cageMockData'
import { formatPrice } from '@/utils/format'
import type { Cage } from '@/types'

const PET_TYPE_LABELS: Record<string, string> = {
  dog: '🐕 Chó', cat: '🐱 Mèo', bird: '🐦 Chim', rabbit: '🐰 Thỏ', other: '🐾 Khác'
}
const SIZE_COLORS: Record<string, string> = {
  S: 'bg-blue-50 text-blue-700 border-blue-200',
  M: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  L: 'bg-amber-50 text-amber-700 border-amber-200',
  XL: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function CageManagementPage() {
  const [cages, setCages] = useState<Cage[]>([...CAGE_MOCK_LIST])
  const [search, setSearch] = useState('')
  const [filterPet, setFilterPet] = useState('all')
  const [filterSize, setFilterSize] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCage, setEditingCage] = useState<Cage | null>(null)
  const [toast, setToast] = useState('')

  // Form fields
  const [fName, setFName] = useState('')
  const [fCode, setFCode] = useState('')
  const [fSize, setFSize] = useState<Cage['size']>('M')
  const [fMaterial, setFMaterial] = useState('')
  const [fPetType, setFPetType] = useState<Cage['petType']>('dog')
  const [fPrice, setFPrice] = useState(500000)
  const [fStock, setFStock] = useState(0)
  const [fDescription, setFDescription] = useState('')
  const [fStatus, setFStatus] = useState<'active' | 'inactive'>('active')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const filtered = cages.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.material.toLowerCase().includes(search.toLowerCase())
    const matchPet = filterPet === 'all' || c.petType === filterPet
    const matchSize = filterSize === 'all' || c.size === filterSize
    return matchSearch && matchPet && matchSize
  })

  function openCreate() {
    setEditingCage(null)
    setFName(''); setFCode(''); setFSize('M'); setFMaterial(''); setFPetType('dog')
    setFPrice(500000); setFStock(0); setFDescription(''); setFStatus('active')
    setIsFormOpen(true)
  }

  function openEdit(cage: Cage) {
    setEditingCage(cage)
    setFName(cage.name); setFCode(cage.code); setFSize(cage.size); setFMaterial(cage.material)
    setFPetType(cage.petType); setFPrice(cage.price); setFStock(cage.stock)
    setFDescription(cage.description || ''); setFStatus(cage.status)
    setIsFormOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fName.trim() || !fCode.trim() || !fMaterial.trim()) return

    if (editingCage) {
      const updated = cages.map(c => c.id === editingCage.id ? {
        ...c, name: fName, code: fCode.toUpperCase(), size: fSize, material: fMaterial,
        petType: fPetType, price: fPrice, stock: fStock, description: fDescription, status: fStatus,
        image: `https://placehold.co/200x200/${fPetType === 'cat' ? 'EC4899' : fPetType === 'dog' ? '3B82F6' : '10B981'}/white?text=${encodeURIComponent(fName.substring(0, 8))}`,
      } : c)
      setCages(updated); saveCages(updated)
      showToast(`Đã cập nhật chuồng: ${fCode.toUpperCase()}`)
    } else {
      const newCage: Cage = {
        id: `CAGE-${Date.now()}`, name: fName, code: fCode.toUpperCase(), size: fSize,
        material: fMaterial, petType: fPetType, price: fPrice, stock: fStock,
        image: `https://placehold.co/200x200/${fPetType === 'cat' ? 'EC4899' : fPetType === 'dog' ? '3B82F6' : '10B981'}/white?text=${encodeURIComponent(fName.substring(0, 8))}`,
        status: fStatus, description: fDescription, createdAt: new Date().toISOString().slice(0, 10),
      }
      const updated = [newCage, ...cages]
      setCages(updated); saveCages(updated)
      showToast(`Đã thêm chuồng mới: ${fCode.toUpperCase()}`)
    }
    setIsFormOpen(false)
  }

  function handleDelete(id: string) {
    if (!confirm('Xác nhận xóa chuồng này?')) return
    const updated = cages.filter(c => c.id !== id)
    setCages(updated); saveCages(updated)
    showToast('Đã xóa chuồng')
  }

  function toggleStatus(cage: Cage) {
    const newStatus = cage.status === 'active' ? 'inactive' : 'active'
    const updated = cages.map(c => c.id === cage.id ? { ...c, status: newStatus as 'active' | 'inactive' } : c)
    setCages(updated); saveCages(updated)
    showToast(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'tạm ngừng'} chuồng: ${cage.code}`)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-gray-900 to-slate-800 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideIn border border-slate-700">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Grid3X3 size={24} className="text-violet-600" />
            Quản Lý Chuồng Thú Cưng
          </h1>
          <p className="text-xs text-gray-500 mt-1">Quản lý danh mục chuồng, lồng nuôi thú cưng trong hệ thống.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-violet-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <Plus size={16} /> Thêm Chuồng Mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng chuồng', value: cages.length, color: 'text-violet-600 bg-violet-50' },
          { label: 'Đang hoạt động', value: cages.filter(c => c.status === 'active').length, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Hết hàng', value: cages.filter(c => c.stock === 0).length, color: 'text-rose-600 bg-rose-50' },
          { label: 'Tổng tồn kho', value: cages.reduce((s, c) => s + c.stock, 0), color: 'text-blue-600 bg-blue-50' },
        ].map((stat, i) => (
          <div key={i} className="card p-4">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stat.label}</div>
            <div className={`text-2xl font-black mt-1 ${stat.color.split(' ')[0]}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="form-input pl-9 text-xs py-2"
            placeholder="Tìm kiếm theo tên, mã hoặc chất liệu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-input text-xs py-2 w-40" value={filterPet} onChange={e => setFilterPet(e.target.value)}>
          <option value="all">-- Tất cả loại --</option>
          {Object.entries(PET_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="form-input text-xs py-2 w-32" value={filterSize} onChange={e => setFilterSize(e.target.value)}>
          <option value="all">-- Size --</option>
          <option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200/80 text-[11px] font-bold">
                <th className="table-th text-slate-500 py-3.5 pl-5">Chuồng</th>
                <th className="table-th text-slate-500 py-3.5">Mã</th>
                <th className="table-th text-slate-500 py-3.5">Size</th>
                <th className="table-th text-slate-500 py-3.5">Chất liệu</th>
                <th className="table-th text-slate-500 py-3.5">Loại thú</th>
                <th className="table-th text-slate-500 py-3.5">Giá bán</th>
                <th className="table-th text-slate-500 py-3.5">Tồn kho</th>
                <th className="table-th text-slate-500 py-3.5">Trạng thái</th>
                <th className="table-th text-slate-500 py-3.5 pr-5">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(cage => (
                <tr key={cage.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 pl-5">
                    <div className="flex items-center gap-3">
                      <img src={cage.image} alt={cage.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200 bg-white" />
                      <div>
                        <div className="text-xs font-bold text-gray-900">{cage.name}</div>
                        {cage.description && <div className="text-[10px] text-gray-400 truncate max-w-48">{cage.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="font-mono text-[10px] font-bold text-gray-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{cage.code}</span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${SIZE_COLORS[cage.size]}`}>{cage.size}</span>
                  </td>
                  <td className="py-3.5 text-xs text-gray-700">{cage.material}</td>
                  <td className="py-3.5 text-xs">{PET_TYPE_LABELS[cage.petType]}</td>
                  <td className="py-3.5 text-xs font-bold text-gray-900">{formatPrice(cage.price)}</td>
                  <td className="py-3.5">
                    <span className={`text-xs font-bold ${cage.stock === 0 ? 'text-rose-600' : cage.stock <= 5 ? 'text-amber-600' : 'text-gray-900'}`}>
                      {cage.stock}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <button
                      onClick={() => toggleStatus(cage)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                        cage.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {cage.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                    </button>
                  </td>
                  <td className="py-3.5 pr-5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(cage)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer" title="Sửa">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cage.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer" title="Xóa">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="py-12 text-center text-gray-400 text-sm">Không tìm thấy chuồng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 animate-scaleIn">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Grid3X3 size={16} className="text-violet-500" />
                {editingCage ? 'Chỉnh sửa Chuồng' : 'Thêm Chuồng Mới'}
              </h3>
              <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="form-label font-bold text-gray-700 text-xs">Tên chuồng <span className="text-rose-500">*</span></label>
                    <input required className="form-input text-xs" placeholder="VD: Chuồng Chó Inox Cao Cấp" value={fName} onChange={e => setFName(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Mã chuồng <span className="text-rose-500">*</span></label>
                    <input required className="form-input text-xs font-mono" placeholder="VD: CAGE-DOG-M" value={fCode} onChange={e => setFCode(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Kích thước</label>
                    <select className="form-input text-xs" value={fSize} onChange={e => setFSize(e.target.value as Cage['size'])}>
                      <option value="S">S (Nhỏ)</option><option value="M">M (Vừa)</option><option value="L">L (Lớn)</option><option value="XL">XL (Rất lớn)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Chất liệu <span className="text-rose-500">*</span></label>
                    <input required className="form-input text-xs" placeholder="VD: Inox 304" value={fMaterial} onChange={e => setFMaterial(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Loại thú cưng</label>
                    <select className="form-input text-xs" value={fPetType} onChange={e => setFPetType(e.target.value as Cage['petType'])}>
                      {Object.entries(PET_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Giá bán (đ)</label>
                    <input type="number" min={0} className="form-input text-xs font-bold" value={fPrice} onChange={e => setFPrice(+e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label font-bold text-gray-700 text-xs">Tồn kho</label>
                    <input type="number" min={0} className="form-input text-xs" value={fStock} onChange={e => setFStock(+e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label font-bold text-gray-700 text-xs">Mô tả</label>
                    <textarea rows={2} className="form-input text-xs resize-none" placeholder="Mô tả chi tiết chuồng..." value={fDescription} onChange={e => setFDescription(e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label font-bold text-gray-700 text-xs">Trạng thái</label>
                    <select className="form-input text-xs" value={fStatus} onChange={e => setFStatus(e.target.value as 'active' | 'inactive')}>
                      <option value="active">Hoạt động</option><option value="inactive">Ngừng hoạt động</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-slate-50 flex gap-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all">Hủy</button>
                <button type="submit" className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                  <CheckCircle size={13} /> {editingCage ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
