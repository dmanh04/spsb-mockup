import { useState, useMemo, useEffect } from 'react'
import {
  Search, Plus, Edit, Trash2, Package, AlertTriangle, AlertCircle,
  Grid3X3, CheckCircle, Filter, BarChart2, DollarSign, ArrowUpDown,
  Boxes, X, ChevronDown, Info, TrendingUp, Tag, MapPin,
  QrCode, Ruler, Weight, ShieldCheck, Warehouse, RefreshCw,
  Thermometer, Droplets, Lock, Unlock, Sparkles, Printer,
  Wrench, Shield, FileText, ChevronRight, Activity, Scan
} from 'lucide-react'
import { CAGE_MOCK_LIST, saveCages } from '@/data/cageMockData'
import { formatPrice } from '@/utils/format'
import { useAuthContext } from '@/auth/AuthContext'
import type { Cage, CageMaintenanceLog } from '@/types'

type SortField = 'name' | 'code' | 'price' | 'stock' | 'createdAt'
type SortDir = 'asc' | 'desc'
type Perspective = 'admin' | 'warehouse'

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

const CLEANLINESS_MAP = {
  cleaned: { label: 'Đã khử trùng', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ShieldCheck, dot: 'bg-emerald-500' },
  dirty: { label: 'Cần vệ sinh', badge: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle, dot: 'bg-red-500' },
  cleaning: { label: 'Đang dọn dẹp', badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: RefreshCw, dot: 'bg-amber-500' }
}

const ASSEMBLY_MAP = {
  flat_packed: { label: 'Nguyên kiện (Hộp)', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  assembled: { label: 'Đã lắp ráp', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
}

const CONDITION_MAP = {
  new: { label: 'Mới 100%', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  good: { label: 'Hoạt động tốt', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  fair: { label: 'Khá (Hao mòn)', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  damaged: { label: 'Hỏng hóc', badge: 'bg-red-50 text-red-700 border-red-200' }
}

// Visual shelves grouping for visual shelving grid representation
const WAREHOUSE_ZONES = [
  { id: 'Zone A', name: 'Khu A (Chó)', color: 'border-blue-200 bg-blue-50/20 text-blue-800', shelves: ['A1-01', 'A1-02', 'A1-03', 'A1-04', 'A2-01'] },
  { id: 'Zone B', name: 'Khu B (Mèo)', color: 'border-pink-200 bg-pink-50/20 text-pink-800', shelves: ['B1-01', 'B1-02', 'B2-01'] },
  { id: 'Zone C', name: 'Khu C (Lồng VC)', color: 'border-amber-200 bg-amber-50/20 text-amber-800', shelves: ['C1-01', 'C1-02'] },
  { id: 'Zone D', name: 'Khu D (Chim)', color: 'border-emerald-200 bg-emerald-50/20 text-emerald-800', shelves: ['D1-01'] },
  { id: 'Zone E', name: 'Khu E (Thỏ/Khác)', color: 'border-purple-200 bg-purple-50/20 text-purple-800', shelves: ['E1-01'] }
]

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
  const { currentUser } = useAuthContext()
  
  // Default perspective based on role, with manual fallback
  const defaultPerspective: Perspective = useMemo(() => {
    return currentUser?.role === 'warehouse_manager' ? 'warehouse' : 'admin'
  }, [currentUser])

  const [perspective, setPerspective] = useState<Perspective>(defaultPerspective)
  const [cages, setCages] = useState<Cage[]>(CAGE_MOCK_LIST)
  const [search, setSearch] = useState('')
  const [filterPet, setFilterPet] = useState<Cage['petType'] | 'all'>('all')
  const [filterSize, setFilterSize] = useState<Cage['size'] | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<Cage['status'] | 'all'>('all')
  
  // Warehouse specific filters
  const [filterAssembly, setFilterAssembly] = useState<'all' | Cage['assemblyStatus']>('all')
  const [filterCleanliness, setFilterCleanliness] = useState<'all' | Cage['cleanliness']>('all')
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null)
  
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  // ── Modals & Drawer States ──
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Cage | null>(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false)
  const [labelTarget, setLabelTarget] = useState<Cage | null>(null)

  // ── Form State Fields ──
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
  const [fSupplierName, setFSupplierName] = useState('')
  const [fAssemblyStatus, setFAssemblyStatus] = useState<Cage['assemblyStatus']>('flat_packed')
  const [fCondition, setFCondition] = useState<Cage['condition']>('new')
  const [fCleanliness, setFCleanliness] = useState<Cage['cleanliness']>('cleaned')

  // ── Quick stock adjust state ──
  const [adjustId, setAdjustId] = useState<string | null>(null)
  const [adjustDelta, setAdjustDelta] = useState(0)
  const [adjustNote, setAdjustNote] = useState('')

  // ── Barcode Scanner Simulator State ──
  const [scanCode, setScanCode] = useState('')
  const [scanResult, setScanResult] = useState<Cage | null>(null)
  const [scanActionStatus, setScanActionStatus] = useState('')

  // ── Maintenance Logger state ──
  const [mTask, setMTask] = useState('')
  const [mTechnician, setMTechnician] = useState('')
  const [mCost, setMCost] = useState(0)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  // ── Simulate Smart IoT Telemetry changes over time ──
  useEffect(() => {
    const timer = setInterval(() => {
      setCages(prevCages => {
        let changed = false
        const updated = prevCages.map(c => {
          if (c.assemblyStatus === 'assembled' && c.status === 'active' && c.sensorData) {
            changed = true
            // Temperature fluctuations +/- 0.1°C
            const tempDelta = (Math.random() - 0.5) * 0.2
            // Humidity fluctuations +/- 0.5%
            const humDelta = (Math.random() - 0.5) * 0.8
            // 5% chance of door open status changing
            const doorChanged = Math.random() < 0.05
            
            return {
              ...c,
              sensorData: {
                temp: Math.round((c.sensorData.temp + tempDelta) * 10) / 10,
                humidity: Math.round(Math.min(100, Math.max(0, c.sensorData.humidity + humDelta))),
                doorOpen: doorChanged ? !c.sensorData.doorOpen : c.sensorData.doorOpen
              }
            }
          }
          return c
        })
        if (changed) {
          saveCages(updated)
        }
        return updated
      })
    }, 4000)

    return () => clearInterval(timer)
  }, [])

  // ── Calculate Stats ──
  const stats = useMemo(() => {
    const totalModels = cages.length
    const active = cages.filter(c => c.status === 'active').length
    const totalInventoryValue = cages.reduce((s, c) => s + c.stock * c.costPrice, 0)
    const totalRevenuePotential = cages.reduce((s, c) => s + c.stock * c.price, 0)
    const totalStock = cages.reduce((s, c) => s + c.stock, 0)
    
    // Assembled vs flat packed
    const assembledQty = cages.filter(c => c.assemblyStatus === 'assembled').reduce((s, c) => s + c.stock, 0)
    const flatPackedQty = cages.filter(c => c.assemblyStatus === 'flat_packed').reduce((s, c) => s + c.stock, 0)
    
    // Cleanliness status for assembled cages
    const needsCleaning = cages.filter(c => c.assemblyStatus === 'assembled' && c.cleanliness === 'dirty').length
    const cleaningInProgress = cages.filter(c => c.assemblyStatus === 'assembled' && c.cleanliness === 'cleaning').length
    const activeMaintenance = cages.filter(c => c.status === 'maintenance').length
    const outOfStock = cages.filter(c => c.stock === 0).length
    const lowStock = cages.filter(c => c.stock > 0 && c.stock <= c.minStock).length

    const avgMargin = cages.length > 0
      ? cages.reduce((s, c) => s + (c.price > 0 ? ((c.price - c.costPrice) / c.price) * 100 : 0), 0) / cages.length
      : 0

    return {
      totalModels,
      active,
      totalInventoryValue,
      totalRevenuePotential,
      totalStock,
      assembledQty,
      flatPackedQty,
      needsCleaning,
      cleaningInProgress,
      activeMaintenance,
      outOfStock,
      lowStock,
      avgMargin
    }
  }, [cages])

  // ── Distribution Charts Data ──
  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    cages.forEach(c => {
      counts[c.petType] = (counts[c.petType] || 0) + c.stock
    })
    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      label: PET_TYPE_MAP[type as Cage['petType']]?.label ?? type,
      emoji: PET_TYPE_MAP[type as Cage['petType']]?.emoji ?? '🐾'
    }))
  }, [cages])

  const sizeDistribution = useMemo(() => {
    const counts: Record<string, number> = { S: 0, M: 0, L: 0, XL: 0 }
    cages.forEach(c => {
      counts[c.size] = (counts[c.size] || 0) + c.stock
    })
    return Object.entries(counts).map(([size, count]) => ({ size, count }))
  }, [cages])

  // ── Filtered and Sorted list ──
  const displayed = useMemo(() => {
    let list = cages.filter(c => {
      const q = search.toLowerCase()
      // Generic search
      const matchSearch = !search ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.barcode ?? '').includes(q) ||
        (c.supplierName ?? '').toLowerCase().includes(q)

      const matchPet = filterPet === 'all' || c.petType === filterPet
      const matchSize = filterSize === 'all' || c.size === filterSize
      const matchStatus = filterStatus === 'all' || c.status === filterStatus
      
      // Warehouse specific filters
      const matchAssembly = filterAssembly === 'all' || c.assemblyStatus === filterAssembly
      const matchCleanliness = filterCleanliness === 'all' || c.cleanliness === filterCleanliness
      
      // Visual shelf coordinate filter
      const matchShelf = !selectedShelf || (c.location ?? '').includes(selectedShelf)

      return matchSearch && matchPet && matchSize && matchStatus && matchAssembly && matchCleanliness && matchShelf
    })

    // Sort
    list = list.sort((a, b) => {
      let va = a[sortField] ?? ''
      let vb = b[sortField] ?? ''
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [cages, search, filterPet, filterSize, filterStatus, filterAssembly, filterCleanliness, selectedShelf, sortField, sortDir])

  const selected = selectedId ? cages.find(c => c.id === selectedId) : null

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  // ── Form Actions ──
  function openCreate() {
    setEditing(null)
    setFName(''); setFCode(''); setFSize('M'); setFMaterial('Inox 304'); setFColor('Bạc')
    setFPetType('dog'); setFCostPrice(100000); setFPrice(150000); setFStock(10); setFMinStock(3)
    setFBarcode(''); setFStatus('active'); setFDesc('')
    setFL(60); setFW(45); setFH(50); setFMaxWeight(10); setFWarranty(12)
    setFLocation('Zone A - Hàng 1 - Kệ A1-01'); setFSupplierName('Xưởng Cơ Khí Inox Hoàng Gia')
    setFAssemblyStatus('assembled'); setFCondition('new'); setFCleanliness('cleaned')
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
    setFSupplierName(cage.supplierName ?? '')
    setFAssemblyStatus(cage.assemblyStatus ?? 'flat_packed')
    setFCondition(cage.condition ?? 'new')
    setFCleanliness(cage.cleanliness ?? 'cleaned')
    setIsFormOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fName.trim() || !fCode.trim()) return

    const petColors: Record<Cage['petType'], string> = { dog: '3B82F6', cat: 'EC4899', bird: '10B981', rabbit: '8B5CF6', other: '94A3B8' }
    const img = `https://placehold.co/200x200/${petColors[fPetType]}/white?text=${encodeURIComponent(fCode)}`

    // Generate mock serial numbers if assembled
    let serials = editing?.serialNumbers ?? []
    if (fAssemblyStatus === 'assembled' && serials.length < fStock) {
      const needed = fStock - serials.length
      const newSerials = Array.from({ length: needed }).map((_, i) => `SN-${fCode}-${Date.now().toString().slice(-4)}-${serials.length + i + 1}`)
      serials = [...serials, ...newSerials]
    } else if (fAssemblyStatus === 'flat_packed') {
      serials = []
    }

    if (editing) {
      const updated = cages.map(c => c.id === editing.id ? {
        ...c,
        name: fName, code: fCode.toUpperCase(), size: fSize, material: fMaterial, color: fColor,
        petType: fPetType, costPrice: fCostPrice, price: fPrice, stock: fStock, minStock: fMinStock,
        barcode: fBarcode, status: fStatus, description: fDesc,
        lengthCm: fL !== '' ? Number(fL) : undefined,
        widthCm: fW !== '' ? Number(fW) : undefined,
        heightCm: fH !== '' ? Number(fH) : undefined,
        maxWeight: fMaxWeight !== '' ? Number(fMaxWeight) : undefined,
        warranty: fWarranty !== '' ? Number(fWarranty) : undefined,
        location: fLocation, image: img,
        supplierName: fSupplierName,
        assemblyStatus: fAssemblyStatus,
        condition: fCondition,
        cleanliness: fCleanliness,
        serialNumbers: serials,
      } : c)
      setCages(updated)
      saveCages(updated)
      showToast(`📝 Đã cập nhật chuồng: ${fCode.toUpperCase()}`)
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
        supplierName: fSupplierName,
        assemblyStatus: fAssemblyStatus,
        condition: fCondition,
        cleanliness: fCleanliness,
        serialNumbers: serials,
        maintenanceLogs: [],
        sensorData: fAssemblyStatus === 'assembled' ? { temp: 24.5, humidity: 60, doorOpen: false } : undefined
      }
      const updated = [newCage, ...cages]
      setCages(updated)
      saveCages(updated)
      showToast(`✅ Đã tạo mới chuồng: ${fCode.toUpperCase()}`)
    }
    setIsFormOpen(false)
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Hệ thống sẽ xóa mã chuồng "${name}". Xác nhận tiếp tục?`)) return
    const updated = cages.filter(c => c.id !== id)
    setCages(updated)
    saveCages(updated)
    if (selectedId === id) setSelectedId(null)
    showToast('❌ Đã xóa chuồng khỏi danh mục')
  }

  // ── Quick operational status switchers ──
  function handleCleanlinessChange(cage: Cage, value: Cage['cleanliness']) {
    const updated = cages.map(c => c.id === cage.id ? { ...c, cleanliness: value } : c)
    setCages(updated)
    saveCages(updated)
    showToast(`🧼 Cập nhật vệ sinh: ${CLEANLINESS_MAP[value].label}`)
  }

  function handleAssemblyChange(cage: Cage, value: Cage['assemblyStatus']) {
    const isNowAssembled = value === 'assembled'
    const updated = cages.map(c => {
      if (c.id !== cage.id) return c
      let serials = c.serialNumbers ?? []
      if (isNowAssembled && serials.length === 0) {
        serials = Array.from({ length: c.stock }).map((_, i) => `SN-${c.code}-${Date.now().toString().slice(-4)}-${i + 1}`)
      }
      return {
        ...c,
        assemblyStatus: value,
        serialNumbers: isNowAssembled ? serials : [],
        sensorData: isNowAssembled ? { temp: 24.5, humidity: 60, doorOpen: false } : undefined
      }
    })
    setCages(updated)
    saveCages(updated)
    showToast(`🔧 Đã chuyển trạng thái: ${ASSEMBLY_MAP[value].label}`)
  }

  function handleConditionChange(cage: Cage, value: Cage['condition']) {
    const updated = cages.map(c => c.id === cage.id ? { ...c, condition: value } : c)
    setCages(updated)
    saveCages(updated)
    showToast(`📈 Tình trạng thiết bị: ${CONDITION_MAP[value].label}`)
  }

  // ── Quick Stock adjustment confirmation ──
  function confirmAdjust() {
    if (!adjustId || adjustDelta === 0) return
    const updated = cages.map(c => {
      if (c.id !== adjustId) return c
      const nextStock = Math.max(0, c.stock + adjustDelta)
      
      // Update serial numbers accordingly if assembled
      let serials = c.serialNumbers ?? []
      if (c.assemblyStatus === 'assembled') {
        if (adjustDelta > 0) {
          const newSerials = Array.from({ length: adjustDelta }).map((_, i) => `SN-${c.code}-${Date.now().toString().slice(-4)}-${serials.length + i + 1}`)
          serials = [...serials, ...newSerials]
        } else if (adjustDelta < 0) {
          serials = serials.slice(0, nextStock)
        }
      }

      return {
        ...c,
        stock: nextStock,
        serialNumbers: serials,
        lastRestockedAt: adjustDelta > 0 ? new Date().toISOString().slice(0, 10) : c.lastRestockedAt
      }
    })
    setCages(updated)
    saveCages(updated)
    showToast(`📦 Đã điều chỉnh tồn kho (${adjustDelta > 0 ? '+' : ''}${adjustDelta})`)
    setAdjustId(null); setAdjustDelta(0); setAdjustNote('')
  }

  // ── Add Maintenance Log Entry ──
  function handleAddMaintenance(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId || !mTask.trim()) return
    const updated = cages.map(c => {
      if (c.id !== selectedId) return c
      const logs = c.maintenanceLogs ? [...c.maintenanceLogs] : []
      const newLog: CageMaintenanceLog = {
        id: `LOG-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        task: mTask,
        technician: mTechnician || 'Nhân viên kỹ thuật',
        cost: mCost,
        status: 'completed'
      }
      return {
        ...c,
        maintenanceLogs: [...logs, newLog],
        condition: 'good' as const, // usually repairs return it to good
        status: c.status === 'maintenance' ? 'active' as const : c.status
      }
    })
    setCages(updated)
    saveCages(updated)
    setMTask(''); setMTechnician(''); setMCost(0)
    showToast('🔧 Đã ghi nhận lịch sử sửa chữa thành công')
  }

  // ── Simulated Scan trigger action ──
  function handleSimulateScan() {
    if (!scanCode.trim()) return
    const target = cages.find(c => c.barcode === scanCode || c.code === scanCode.toUpperCase())
    
    // Simulated scan beep sound via web audio API if supported
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.frequency.setValueAtTime(880, audioCtx.currentTime) // High pitch beep
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.1)
    } catch (e) {
      console.log('Audio Context beep not supported or blocked by policy')
    }

    if (target) {
      setScanResult(target)
      setScanActionStatus(`Đã tìm thấy: ${target.name}`)
    } else {
      setScanResult(null)
      setScanActionStatus('❌ Không tìm thấy mã barcode hoặc Model ID tương ứng!')
    }
  }

  function handleScanQuickUpdate(action: 'clean' | 'dirty' | 'stock_in' | 'stock_out') {
    if (!scanResult) return
    let updatedCage = { ...scanResult }
    
    if (action === 'clean') {
      updatedCage.cleanliness = 'cleaned'
      setScanActionStatus('🧼 Đã quét: Vệ sinh khử trùng chuồng hoàn tất!')
    } else if (action === 'dirty') {
      updatedCage.cleanliness = 'dirty'
      setScanActionStatus('⚠️ Đã quét: Đánh dấu chuồng bẩn cần vệ sinh!')
    } else if (action === 'stock_in') {
      updatedCage.stock += 1
      if (updatedCage.assemblyStatus === 'assembled') {
        const serials = updatedCage.serialNumbers ?? []
        updatedCage.serialNumbers = [...serials, `SN-${updatedCage.code}-${Date.now().toString().slice(-4)}-${serials.length + 1}`]
      }
      setScanActionStatus('📥 Đã quét: Tăng số lượng tồn kho lên +1 sản phẩm')
    } else if (action === 'stock_out') {
      if (updatedCage.stock > 0) {
        updatedCage.stock -= 1
        if (updatedCage.assemblyStatus === 'assembled') {
          updatedCage.serialNumbers = (updatedCage.serialNumbers ?? []).slice(0, updatedCage.stock)
        }
        setScanActionStatus('📤 Đã quét: Xuất kho bàn giao hoặc lắp ráp thành công')
      } else {
        setScanActionStatus('⚠️ Lỗi: Không thể xuất kho do tồn kho đang bằng 0!')
        return
      }
    }

    const nextCages = cages.map(c => c.id === scanResult.id ? updatedCage : c)
    setCages(nextCages)
    saveCages(nextCages)
    setScanResult(updatedCage)
  }

  // ── Open label printer modal ──
  function triggerLabelPrint(cage: Cage) {
    setLabelTarget(cage)
    setIsLabelModalOpen(true)
  }

  const SortBtn = ({ field, label }: { field: SortField; label: string }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-0.5 hover:text-gray-900 transition-colors cursor-pointer font-bold">
      {label}
      <ArrowUpDown size={11} className={sortField === field ? 'text-primary-500' : 'text-gray-300'} />
    </button>
  )

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900/95 backdrop-blur text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800 animate-slideIn">
          <Sparkles size={16} className="text-amber-400 shrink-0 animate-pulse" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Dynamic Sub-Header with Perspective Toggle */}
      <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-150">
            <Warehouse size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              Quản lý Chuồng Thú Cưng
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Vị trí kho, lắp ráp, tình trạng vệ sinh khử trùng và giám sát IoT thông minh.
            </p>
          </div>
        </div>

        {/* Perspective Toggle Buttons */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 w-fit self-start md:self-auto">
          <button
            onClick={() => setPerspective('admin')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              perspective === 'admin'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <BarChart2 size={13} />
            Kinh Doanh & Giá Vốn
          </button>
          <button
            onClick={() => setPerspective('warehouse')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              perspective === 'warehouse'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Warehouse size={13} />
            Kho & Vận Hành Thực Tế
          </button>
        </div>
      </div>

      {/* ── PERSPECTIVE 1: ADMIN BUSINESS VIEW ── */}
      {perspective === 'admin' && (
        <div className="space-y-6">
          {/* Business KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-50/40 to-white rounded-3xl border border-indigo-100 p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Tổng giá trị tồn kho</span>
                <span className="text-2xl font-black text-indigo-900 mt-1 block">{formatPrice(stats.totalInventoryValue)}</span>
                <span className="text-[10px] text-indigo-600 font-bold block mt-1">Vốn bỏ ra nhập {stats.totalStock} cái</span>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 shrink-0">
                <DollarSign size={20} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50/40 to-white rounded-3xl border border-emerald-100 p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Doanh thu dự kiến</span>
                <span className="text-2xl font-black text-emerald-850 mt-1 block">{formatPrice(stats.totalRevenuePotential)}</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">Biên lợi nhuận trung bình: {stats.avgMargin.toFixed(1)}%</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 shrink-0">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50/40 to-white rounded-3xl border border-amber-100 p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Sắp hết hàng / Cần Nhập</span>
                <span className="text-2xl font-black text-amber-850 mt-1 block">{stats.lowStock} <span className="text-xs text-gray-500 font-bold">mã</span></span>
                <span className="text-[10px] text-amber-600 font-bold block mt-1">Số lượng ≤ ngưỡng tối thiểu</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50/40 to-white rounded-3xl border border-red-100 p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Hết hàng tồn kho</span>
                <span className="text-2xl font-black text-red-700 mt-1 block">{stats.outOfStock} <span className="text-xs text-gray-500 font-bold">loại</span></span>
                <span className="text-[10px] text-red-500 font-bold block mt-1">Cần lập phiếu nhập kho lập tức</span>
              </div>
              <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-500 shrink-0">
                <Boxes size={20} />
              </div>
            </div>
          </div>

          {/* SVG Statistics Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chart 1: Pet Type Stock breakdown */}
            <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-sm">
              <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <BarChart2 size={14} className="text-indigo-600" /> Tỷ lệ tồn kho theo loài động vật
              </h3>
              <div className="space-y-3">
                {typeDistribution.map(item => {
                  const maxCount = Math.max(...typeDistribution.map(d => d.count), 1)
                  const percent = (item.count / maxCount) * 100
                  return (
                    <div key={item.type} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-600">
                        <span className="flex items-center gap-1">{item.emoji} {item.label}</span>
                        <span>{item.count} cái ({Math.round(percent)}%)</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Chart 2: Size Distribution */}
            <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-sm flex flex-col justify-between">
              <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Grid3X3 size={14} className="text-indigo-600" /> Phân bổ kích cỡ chuồng đang có
              </h3>
              <div className="flex items-end justify-between gap-4 h-36 px-4 pt-4">
                {sizeDistribution.map(item => {
                  const maxVal = Math.max(...sizeDistribution.map(d => d.count), 1)
                  const heightPct = (item.count / maxVal) * 100
                  return (
                    <div key={item.size} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-extrabold text-gray-600">{item.count}</span>
                      <div
                        className="w-8 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${Math.max(10, heightPct)}%` }}
                      />
                      <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">Size {item.size}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PERSPECTIVE 2: WAREHOUSE VIEW (Visual Shelving & Scanner) ── */}
      {perspective === 'warehouse' && (
        <div className="space-y-6">
          {/* Quick Scanner & Printers Bar */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-3xl p-5 text-white shadow-md shadow-indigo-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-300 shrink-0" />
                Công cụ hỗ trợ kho vận chuyên dụng
              </h3>
              <p className="text-xs text-indigo-100">
                Nhà kho được quét tự động bằng Barcode và in trực tiếp nhãn thông số dán vào kệ.
              </p>
            </div>
            
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setScanCode('')
                  setScanResult(null)
                  setScanActionStatus('')
                  setIsScannerOpen(true)
                }}
                className="px-4 py-2.5 bg-white text-indigo-700 rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 hover:bg-indigo-50 transition-all cursor-pointer"
              >
                <Scan size={14} />
                Quét Barcode / Model
              </button>
            </div>
          </div>

          {/* Visual Shelf Layout Grid */}
          <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-indigo-600" />
                <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                  Sơ đồ phân loại kệ chuồng (Warehouse Shelf Mapping)
                </h3>
              </div>
              {selectedShelf && (
                <button
                  onClick={() => setSelectedShelf(null)}
                  className="text-xs text-indigo-650 hover:underline font-bold"
                >
                  Xóa lọc kệ
                </button>
              )}
            </div>

            <p className="text-[11px] text-gray-500">
              Nhấp vào một kệ cụ thể bên dưới để lọc danh mục sản phẩm đang được xếp ở ô kệ đó:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 pt-2">
              {WAREHOUSE_ZONES.map(zone => (
                <div key={zone.id} className={`border rounded-2xl p-3.5 space-y-2.5 ${zone.color}`}>
                  <span className="text-[10px] font-black tracking-wider block uppercase">{zone.name}</span>
                  <div className="flex flex-col gap-1.5">
                    {zone.shelves.map(shelf => {
                      const isActive = selectedShelf === shelf
                      // Count cages on this shelf
                      const cageCount = cages.filter(c => (c.location ?? '').includes(shelf)).reduce((s, c) => s + c.stock, 0)
                      return (
                        <button
                          key={shelf}
                          onClick={() => setSelectedShelf(isActive ? null : shelf)}
                          className={`w-full py-1.5 px-2 rounded-xl text-center text-xs font-bold transition-all flex justify-between items-center ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <span>Kệ {shelf}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-800 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {cageCount}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Section */}
      <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-3.5">
          {/* Main search bar */}
          <div className="relative flex-1 min-w-[280px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="form-input pl-10 text-xs w-full py-2.5 rounded-xl border-gray-250 focus:border-indigo-500"
              placeholder="Tìm theo Tên chuồng, Model, Barcode, Nhà cung cấp..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Pet Type */}
            <select
              className="form-input text-xs py-2 px-3 border-gray-250 rounded-xl focus:border-indigo-500"
              value={filterPet}
              onChange={e => setFilterPet(e.target.value as any)}
            >
              <option value="all">🐾 Tất cả loài thú</option>
              <option value="dog">🐕 Chó</option>
              <option value="cat">🐈 Mèo</option>
              <option value="bird">🐦 Chim</option>
              <option value="rabbit">🐇 Thỏ</option>
              <option value="other">🐾 Khác</option>
            </select>

            {/* Size */}
            <select
              className="form-input text-xs py-2 px-3 border-gray-250 rounded-xl focus:border-indigo-500"
              value={filterSize}
              onChange={e => setFilterSize(e.target.value as any)}
            >
              <option value="all">📐 Tất cả size</option>
              <option value="S">Size S</option>
              <option value="M">Size M</option>
              <option value="L">Size L</option>
              <option value="XL">Size XL</option>
            </select>

            {/* Status */}
            <select
              className="form-input text-xs py-2 px-3 border-gray-250 rounded-xl focus:border-indigo-500"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
            >
              <option value="all">Trạng thái bán</option>
              <option value="active">Đang kinh doanh</option>
              <option value="inactive">Ngừng kinh doanh</option>
            </select>

            {/* Assembly Filter (Warehouse only) */}
            {perspective === 'warehouse' && (
              <>
                <select
                  className="form-input text-xs py-2 px-3 border-gray-250 rounded-xl focus:border-indigo-500"
                  value={filterAssembly}
                  onChange={e => setFilterAssembly(e.target.value as any)}
                >
                  <option value="all">🔧 Trạng thái lắp ráp</option>
                  <option value="flat_packed">Nguyên hộp đóng gói</option>
                  <option value="assembled">Đã lắp ráp hoàn chỉnh</option>
                </select>

                <select
                  className="form-input text-xs py-2 px-3 border-gray-250 rounded-xl focus:border-indigo-500"
                  value={filterCleanliness}
                  onChange={e => setFilterCleanliness(e.target.value as any)}
                >
                  <option value="all">🧼 Khử trùng (Assembled)</option>
                  <option value="cleaned">Đã khử trùng sạch</option>
                  <option value="dirty">Chuồng bẩn cần vệ sinh</option>
                  <option value="cleaning">Đang vệ sinh dọn dẹp</option>
                </select>
              </>
            )}
          </div>
          
          <button
            onClick={openCreate}
            className="btn-primary gap-1.5 py-2.5 px-4 rounded-xl text-xs ml-auto shadow-md shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={14} /> Thêm Mẫu Chuồng
          </button>
        </div>

        {/* Selected shelf tag identifier */}
        {selectedShelf && (
          <div className="bg-indigo-50 text-indigo-800 rounded-xl px-4 py-2 text-xs font-bold flex items-center justify-between border border-indigo-100">
            <span>Đang chỉ hiển thị các sản phẩm tại: <strong>Kệ {selectedShelf}</strong></span>
            <button onClick={() => setSelectedShelf(null)} className="text-indigo-650 hover:underline">Xóa lọc</button>
          </div>
        )}
      </div>

      {/* Main content grid: Table + Detailed Side Panel */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Cages List Table */}
        <div className={`bg-white rounded-3xl border border-gray-150 overflow-hidden flex-1 w-full shadow-sm ${selected ? 'lg:max-w-[55%]' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">
                  <th className="py-3.5 px-4"><SortBtn field="name" label="Mẫu chuồng" /></th>
                  <th className="py-3.5 px-4">Loại thú / Size</th>
                  
                  {/* Conditional columns based on role perspective */}
                  {perspective === 'admin' ? (
                    <>
                      <th className="py-3.5 px-4 text-right"><SortBtn field="price" label="Giá bán lẻ" /></th>
                      <th className="py-3.5 px-4 text-right">Giá vốn</th>
                      <th className="py-3.5 px-4 text-center">Biên Lợi Nhuận</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3.5 px-4">Tình trạng kệ</th>
                      <th className="py-3.5 px-4">Vệ sinh / Lắp ráp</th>
                    </>
                  )}

                  <th className="py-3.5 px-4"><SortBtn field="stock" label="Tồn kho" /></th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map(c => {
                  const isOut = c.stock === 0
                  const isLow = c.stock > 0 && c.stock <= c.minStock
                  const margin = c.price > 0 ? ((c.price - c.costPrice) / c.price * 100) : 0
                  const isAssembled = c.assemblyStatus === 'assembled'

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                      className={`cursor-pointer hover:bg-gray-50/50 transition-colors ${
                        selectedId === c.id ? 'bg-indigo-50/30 border-l-4 border-l-indigo-650' : ''
                      } ${isOut ? 'bg-red-50/10' : isLow ? 'bg-amber-50/10' : ''}`}
                    >
                      {/* Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={c.image} alt={c.name} className="w-10 h-10 rounded-xl object-cover border border-gray-150 shrink-0" />
                          <div>
                            <div className="font-extrabold text-gray-900 text-xs leading-tight">{c.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="bg-gray-100 text-gray-600 px-1 rounded font-bold">{c.code}</span>
                              {c.barcode && <span className="text-gray-300">· Barcode: {c.barcode}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Pet Type & Size */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg border w-fit ${PET_TYPE_MAP[c.petType].color}`}>
                            {PET_TYPE_MAP[c.petType].emoji} {PET_TYPE_MAP[c.petType].label}
                          </span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 font-black px-2 py-0.5 rounded-lg w-fit">Size {c.size}</span>
                        </div>
                      </td>

                      {/* Admin Perspective columns */}
                      {perspective === 'admin' && (
                        <>
                          <td className="py-3.5 px-4 text-right">
                            <div className="font-black text-gray-900 text-xs">{formatPrice(c.price)}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="text-xs font-semibold text-gray-500">{formatPrice(c.costPrice)}</div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-black px-2 py-1 rounded-lg">
                              +{margin.toFixed(0)}%
                            </span>
                          </td>
                        </>
                      )}

                      {/* Warehouse Perspective columns */}
                      {perspective === 'warehouse' && (
                        <>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <MapPin size={11} className="text-gray-400 shrink-0" />
                              <span className="text-xs font-bold text-gray-600 leading-tight">{c.location || 'Chưa định vị'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                              {/* Assembly status toggle */}
                              <button
                                onClick={() => handleAssemblyChange(c, c.assemblyStatus === 'assembled' ? 'flat_packed' : 'assembled')}
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded border w-fit text-left hover:scale-[1.02] transition-transform ${ASSEMBLY_MAP[c.assemblyStatus ?? 'flat_packed'].badge}`}
                              >
                                {ASSEMBLY_MAP[c.assemblyStatus ?? 'flat_packed'].label}
                              </button>

                              {/* Cleanliness status (Only for assembled cages) */}
                              {isAssembled && (
                                <div className="flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${CLEANLINESS_MAP[c.cleanliness ?? 'cleaned'].dot} animate-pulse`} />
                                  <select
                                    value={c.cleanliness ?? 'cleaned'}
                                    onChange={e => handleCleanlinessChange(c, e.target.value as any)}
                                    className="text-[9px] font-bold text-gray-500 bg-transparent border-0 py-0 pl-0 pr-4 focus:ring-0 cursor-pointer"
                                  >
                                    <option value="cleaned">Sạch</option>
                                    <option value="dirty">Bẩn</option>
                                    <option value="cleaning">Dọn dẹp</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          </td>
                        </>
                      )}

                      {/* Stock levels */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <StockBar stock={c.stock} minStock={c.minStock} />
                          {isOut && <div className="text-[9px] text-red-500 font-extrabold flex items-center gap-0.5"><AlertCircle size={9} /> Hết hàng</div>}
                          {isLow && <div className="text-[9px] text-amber-600 font-bold flex items-center gap-0.5"><AlertTriangle size={9} /> Tồn kho thấp (≤{c.minStock})</div>}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${STATUS_MAP[c.status].badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_MAP[c.status].dot}`} />
                          {STATUS_MAP[c.status].label}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => { setAdjustId(c.id); setAdjustDelta(0); setAdjustNote('') }}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Điều chỉnh nhanh tồn kho"
                          >
                            <RefreshCw size={13} />
                          </button>
                          <button
                            onClick={() => triggerLabelPrint(c)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                            title="In nhãn QR sản phẩm"
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            onClick={() => openEdit(c)}
                            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-indigo-650 rounded-xl transition-all"
                            title="Chỉnh sửa chi tiết"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            className="p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                            title="Xóa chuồng"
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
              <div className="p-16 text-center text-gray-400 text-xs">
                <Grid3X3 size={32} className="mx-auto mb-3 text-gray-200" />
                Không tìm thấy mẫu chuồng nào phù hợp bộ lọc tìm kiếm!
              </div>
            )}
          </div>
        </div>

        {/* Detailed Side Panel (360 Degree View) */}
        {selected && (
          <div className="w-full lg:w-[45%] shrink-0 bg-white rounded-3xl border border-gray-150 p-5 space-y-4 shadow-sm animate-slideIn sticky top-6 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black border ${STATUS_MAP[selected.status].badge}`}>
                    {STATUS_MAP[selected.status].label}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-lg border ${PET_TYPE_MAP[selected.petType].color}`}>
                    {PET_TYPE_MAP[selected.petType].emoji} {PET_TYPE_MAP[selected.petType].label}
                  </span>
                  <span className="text-[9px] bg-gray-100 text-gray-600 font-black px-1.5 py-0.5 rounded-lg">Size {selected.size}</span>
                </div>
                <h3 className="text-sm font-black text-gray-900 mt-2 leading-snug">{selected.name}</h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selected.code}</p>
              </div>
              
              <button
                onClick={() => setSelectedId(null)}
                className="text-gray-300 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all shrink-0 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Smart IoT Sensor Panel (Only display if assembled and active) */}
            {selected.assemblyStatus === 'assembled' && selected.status === 'active' && selected.sensorData && (
              <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-4 space-y-3.5 border border-indigo-850 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                    <Activity size={12} className="text-indigo-400 animate-pulse" /> Giám sát cảm biến IoT trực tiếp
                  </span>
                  <span className="text-[9px] bg-indigo-800 text-indigo-100 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Online
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/10 rounded-xl p-2 border border-white/5">
                    <div className="text-[9px] text-gray-300 font-bold uppercase flex items-center justify-center gap-1">
                      <Thermometer size={10} className="text-red-400" /> Nhiệt độ
                    </div>
                    <div className={`text-base font-black mt-1 ${selected.sensorData.temp > 26 ? 'text-amber-300 animate-pulse' : 'text-white'}`}>
                      {selected.sensorData.temp} °C
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-2 border border-white/5">
                    <div className="text-[9px] text-gray-300 font-bold uppercase flex items-center justify-center gap-1">
                      <Droplets size={10} className="text-blue-400" /> Độ ẩm
                    </div>
                    <div className="text-base font-black mt-1">{selected.sensorData.humidity}%</div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-2 border border-white/5">
                    <div className="text-[9px] text-gray-300 font-bold uppercase flex items-center justify-center gap-1">
                      {selected.sensorData.doorOpen ? <Unlock size={10} className="text-amber-400" /> : <Lock size={10} className="text-emerald-400" />} Cửa
                    </div>
                    <div className={`text-xs font-black mt-1.5 ${selected.sensorData.doorOpen ? 'text-amber-300' : 'text-emerald-400'}`}>
                      {selected.sensorData.doorOpen ? 'MỞ' : 'KHÓA'}
                    </div>
                  </div>
                </div>

                {selected.sensorData.temp > 26 && (
                  <div className="bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded-xl px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1.5">
                    <AlertTriangle size={12} className="shrink-0" />
                    Cảnh báo: Nhiệt độ vượt ngưỡng lý tưởng (lý tưởng: 22-25°C). Hãy bật điều hòa!
                  </div>
                )}
                {selected.sensorData.doorOpen && (
                  <div className="bg-red-500/20 text-red-200 border border-red-500/30 rounded-xl px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1.5">
                    <AlertCircle size={12} className="shrink-0" />
                    Cảnh báo: Cửa chuồng đang mở! Đảm bảo an toàn cho thú cưng bên trong.
                  </div>
                )}
              </div>
            )}

            {/* Financial Overview (Admin perspective details) */}
            <div className="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1">
                <DollarSign size={12} /> Báo cáo doanh số & giá trị tồn kho
              </div>
              
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-white rounded-xl p-2.5 border border-indigo-100/50">
                  <div className="text-[8px] text-gray-400 font-bold uppercase">Giá vốn nhập</div>
                  <div className="text-xs font-black text-gray-700 mt-1">{formatPrice(selected.costPrice)}</div>
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-indigo-150">
                  <div className="text-[8px] text-indigo-500 font-bold uppercase">Giá bán lẻ</div>
                  <div className="text-xs font-black text-indigo-900 mt-1">{formatPrice(selected.price)}</div>
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-emerald-150">
                  <div className="text-[8px] text-emerald-600 font-bold uppercase">Lợi nhuận</div>
                  <div className="text-xs font-black text-emerald-700 mt-1">
                    {selected.price > 0 ? ((selected.price - selected.costPrice) / selected.price * 100).toFixed(0) : 0}%
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-indigo-100/50">
                <span className="text-gray-500 font-medium">Tổng vốn đang tồn ở kho:</span>
                <span className="font-extrabold text-gray-800">{formatPrice(selected.stock * selected.costPrice)}</span>
              </div>
            </div>

            {/* Detailed specs */}
            <div className="border border-gray-150 rounded-2xl p-4 space-y-3.5">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Ruler size={12} /> Thông số kỹ thuật & Vận hành
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                {selected.lengthCm && selected.widthCm && selected.heightCm && (
                  <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Kích thước (D x R x C)</span>
                    <span className="font-bold text-gray-800 block mt-0.5">{selected.lengthCm} × {selected.widthCm} × {selected.heightCm} cm</span>
                  </div>
                )}
                {selected.maxWeight && (
                  <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Tải trọng tối đa</span>
                    <span className="font-bold text-gray-800 block mt-0.5">≤ {selected.maxWeight} kg</span>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Chất liệu chính</span>
                  <span className="font-bold text-gray-800 block mt-0.5">{selected.material}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Nhà cung cấp</span>
                  <span className="font-bold text-gray-800 block mt-0.5 truncate" title={selected.supplierName}>{selected.supplierName || 'N/A'}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Vị trí lưu kho</span>
                  <span className="font-bold text-gray-800 block mt-0.5 font-mono">{selected.location || 'Chưa xếp kệ'}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Bảo hành chính hãng</span>
                  <span className="font-bold text-gray-800 block mt-0.5">{selected.warranty ? `${selected.warranty} tháng` : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Serial Numbers (For assembled cages) */}
            {selected.assemblyStatus === 'assembled' && selected.serialNumbers && selected.serialNumbers.length > 0 && (
              <div className="border border-gray-150 rounded-2xl p-4 space-y-2.5">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <QrCode size={12} /> Mã tài sản / Số Serial số lượng lắp ráp ({selected.serialNumbers.length})
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {selected.serialNumbers.map(sn => (
                    <span key={sn} className="bg-gray-100 text-gray-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-gray-200">
                      {sn}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Maintenance History Logs */}
            <div className="border border-gray-150 rounded-2xl p-4 space-y-3">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Wrench size={12} /> Nhật ký sửa chữa & bảo dưỡng định kỳ
              </div>

              {selected.maintenanceLogs && selected.maintenanceLogs.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 divide-y divide-gray-100">
                  {selected.maintenanceLogs.map(log => (
                    <div key={log.id} className="pt-2 first:pt-0 flex justify-between items-start text-xs">
                      <div>
                        <div className="font-bold text-gray-800">{log.task}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">Kỹ thuật: {log.technician} · Ngày: {log.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatPrice(log.cost)}</div>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1 rounded block mt-0.5 w-fit ml-auto">Xong</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-400 text-[11px] bg-gray-50 rounded-xl border border-dashed">
                  Chưa ghi nhận lịch sử sửa chữa nào cho mã chuồng này.
                </div>
              )}

              {/* Quick Logger Form */}
              <form onSubmit={handleAddMaintenance} className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-wide block">Ghi nhận bảo trì nhanh</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    placeholder="Nội dung sửa..."
                    className="form-input text-[11px] py-1 px-2 bg-white"
                    value={mTask}
                    onChange={e => setMTask(e.target.value)}
                  />
                  <input
                    placeholder="Thợ sửa..."
                    className="form-input text-[11px] py-1 px-2 bg-white"
                    value={mTechnician}
                    onChange={e => setMTechnician(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Chi phí (VND)..."
                    className="form-input text-[11px] py-1 px-2 bg-white col-span-2"
                    value={mCost || ''}
                    onChange={e => setMCost(Number(e.target.value))}
                  />
                </div>
                <button type="submit" className="w-full py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-colors">
                  Lưu nhật ký bảo dưỡng
                </button>
              </form>
            </div>

            {/* Quick action buttons */}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => { setAdjustId(selected.id); setAdjustDelta(0); setAdjustNote('') }}
                className="flex-1 py-2 text-xs font-bold border border-indigo-250 text-indigo-700 hover:bg-indigo-50/50 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={13} /> Điều chỉnh tồn kho
              </button>
              <button
                onClick={() => openEdit(selected)}
                className="flex-1 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Edit size={13} /> Chỉnh sửa
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
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-black text-gray-900">Điều chỉnh thủ công tồn kho</h3>
                <button onClick={() => setAdjustId(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs space-y-1">
                <div className="font-extrabold text-gray-950 truncate">{cage.name}</div>
                <div className="text-[10px] text-gray-400 font-mono">{cage.code}</div>
                <div className="flex items-center justify-between text-xs mt-2.5 pt-2 border-t border-gray-200">
                  <span className="text-gray-500 font-medium">Tồn kho trong hệ thống:</span>
                  <span className="font-black text-lg text-gray-950">{cage.stock} cái</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Thay đổi số lượng tồn kho (+/-)</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setAdjustDelta(d => d - 1)} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl text-lg font-bold transition-all select-none">−</button>
                  <input
                    type="number"
                    className="form-input text-center text-lg font-black flex-1 py-2 rounded-xl"
                    value={adjustDelta}
                    onChange={e => setAdjustDelta(parseInt(e.target.value) || 0)}
                  />
                  <button onClick={() => setAdjustDelta(d => d + 1)} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl text-lg font-bold transition-all select-none">+</button>
                </div>
                <div className="text-center text-xs text-gray-500">
                  Tồn kho sau khi lưu: <strong className={Math.max(0, cage.stock + adjustDelta) <= cage.minStock ? 'text-amber-600' : 'text-indigo-600'}>{Math.max(0, cage.stock + adjustDelta)} cái</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Lý do điều chỉnh kho</label>
                <input
                  className="form-input text-xs py-2 rounded-xl"
                  placeholder="VD: Kiểm kê định kỳ, hao mòn hư hỏng..."
                  value={adjustNote}
                  onChange={e => setAdjustNote(e.target.value)}
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-gray-100">
                <button onClick={() => setAdjustId(null)} className="btn-secondary flex-1 justify-center py-2.5 rounded-xl text-xs font-bold">Hủy</button>
                <button
                  onClick={confirmAdjust}
                  disabled={adjustDelta === 0}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                >
                  Xác nhận lưu
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
            <div className="flex items-center justify-between border-b border-gray-150 pb-3">
              <h3 className="text-base font-black text-gray-900">
                {editing ? `Chỉnh sửa danh mục: ${editing.code}` : 'Thêm Mẫu Chuồng Mới'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Basic Info */}
              <div className="space-y-3">
                <div className="text-[10px] font-black text-indigo-650 uppercase tracking-widest flex items-center gap-1.5">
                  <Info size={11} /> Thông tin mô tả cơ bản
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-600">Tên sản phẩm chuồng <span className="text-red-500">*</span></label>
                    <input className="form-input text-xs py-2 rounded-xl" placeholder="VD: Chuồng Chó Inox Lắp Ráp VIP 304" required value={fName} onChange={e => setFName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Mã Model Code <span className="text-red-500">*</span></label>
                    <input className="form-input text-xs py-2 rounded-xl font-mono uppercase" placeholder="CAGE-DOG-M-INOX" required value={fCode} onChange={e => setFCode(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Mã Barcode định danh</label>
                    <input className="form-input text-xs py-2 rounded-xl font-mono" placeholder="8934588001001" value={fBarcode} onChange={e => setFBarcode(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Loại thú cưng sử dụng</label>
                    <select className="form-input text-xs py-2 rounded-xl" value={fPetType} onChange={e => setFPetType(e.target.value as Cage['petType'])}>
                      <option value="dog">🐕 Chó</option>
                      <option value="cat">🐈 Mèo</option>
                      <option value="bird">🐦 Chim</option>
                      <option value="rabbit">🐇 Thỏ</option>
                      <option value="other">🐾 Khác</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Phân cỡ (Size)</label>
                    <select className="form-input text-xs py-2 rounded-xl" value={fSize} onChange={e => setFSize(e.target.value as Cage['size'])}>
                      <option value="S">S (Thú nhỏ dưới 5kg)</option>
                      <option value="M">M (Thú vừa 5-15kg)</option>
                      <option value="L">L (Thú to 15-30kg)</option>
                      <option value="XL">XL (Rất to trên 30kg)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Chất liệu cấu tạo</label>
                    <input className="form-input text-xs py-2 rounded-xl" placeholder="Inox 304, sắt sơn tĩnh điện..." value={fMaterial} onChange={e => setFMaterial(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Màu sắc sơn phủ</label>
                    <input className="form-input text-xs py-2 rounded-xl" placeholder="Bạc, Đen nhám..." value={fColor} onChange={e => setFColor(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Nhà cung cấp / Phân phối</label>
                    <input className="form-input text-xs py-2 rounded-xl" placeholder="Công ty Inox Hoàng Gia" value={fSupplierName} onChange={e => setFSupplierName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Vị trí xếp kệ lưu kho</label>
                    <input className="form-input text-xs py-2 rounded-xl font-mono" placeholder="Zone A - Kệ A1-02" value={fLocation} onChange={e => setFLocation(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Commercials & Setup */}
              <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-4 space-y-3">
                <div className="text-[10px] font-black text-indigo-650 uppercase tracking-widest flex items-center gap-1.5">
                  <DollarSign size={11} /> Quản trị thương mại & Tồn kho
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-gray-600">Giá nhập vốn gốc (VND)</label>
                    <input type="number" className="form-input text-xs py-2 rounded-xl" value={fCostPrice} onChange={e => setFCostPrice(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-gray-600">Giá niêm yết bán lẻ (VND) <span className="text-red-500">*</span></label>
                    <input type="number" required className="form-input text-xs py-2 rounded-xl" value={fPrice} onChange={e => setFPrice(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Tồn kho ban đầu</label>
                    <input type="number" className="form-input text-xs py-2 rounded-xl" value={fStock} onChange={e => setFStock(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Ngưỡng báo động</label>
                    <input type="number" className="form-input text-xs py-2 rounded-xl" value={fMinStock} onChange={e => setFMinStock(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Tình trạng lắp ráp</label>
                    <select className="form-input text-xs py-2 rounded-xl" value={fAssemblyStatus} onChange={e => setFAssemblyStatus(e.target.value as any)}>
                      <option value="flat_packed">Flat-packed (Trong hộp)</option>
                      <option value="assembled">Assembled (Lắp ráp sẵn)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Thiết bị bảo hành</label>
                    <input type="number" placeholder="12 tháng" className="form-input text-xs py-2 rounded-xl" value={fWarranty} onChange={e => setFWarranty(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                </div>
              </div>

              {/* Dimensions specs */}
              <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-4 space-y-3">
                <div className="text-[10px] font-black text-indigo-650 uppercase tracking-widest flex items-center gap-1.5">
                  <Ruler size={11} /> Kích thước & Tải trọng
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Chiều dài (cm)</label>
                    <input type="number" className="form-input text-xs py-2 rounded-xl" placeholder="80" value={fL} onChange={e => setFL(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Chiều rộng (cm)</label>
                    <input type="number" className="form-input text-xs py-2 rounded-xl" placeholder="55" value={fW} onChange={e => setFW(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Chiều cao (cm)</label>
                    <input type="number" className="form-input text-xs py-2 rounded-xl" placeholder="60" value={fH} onChange={e => setFH(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Tải trọng pet (kg)</label>
                    <input type="number" className="form-input text-xs py-2 rounded-xl" placeholder="20" value={fMaxWeight} onChange={e => setFMaxWeight(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Mô tả đặc điểm sản phẩm</label>
                <textarea className="form-input text-xs p-3 rounded-xl resize-none" rows={3} placeholder="Ghi chú thêm về khóa an toàn, độ dày khay vệ sinh..." value={fDesc} onChange={e => setFDesc(e.target.value)} />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-150">
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary flex-1 justify-center py-2.5 rounded-xl text-xs font-bold">Hủy bỏ</button>
                <button type="submit" className="btn-primary flex-1 justify-center py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                  Lưu thay đổi danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: BARCODE SCANNER SIMULATOR ── */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-150 pb-2">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                <Scan className="text-indigo-650" size={16} /> Giả lập đầu đọc quét mã vạch
              </h3>
              <button onClick={() => setIsScannerOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>

            <div className="space-y-3.5">
              <p className="text-xs text-gray-500 leading-relaxed">
                Nhập Barcode EAN của sản phẩm hoặc Mã Model (hoặc chọn nhanh từ danh mục mẫu có sẵn dưới đây) để giả lập thao tác bắn máy quét mã vạch ngoài đời:
              </p>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block">Chọn nhanh mã có sẵn</label>
                <select
                  className="form-input text-xs py-2 rounded-xl"
                  value={scanCode}
                  onChange={e => setScanCode(e.target.value)}
                >
                  <option value="">-- Click để chọn chuồng mẫu --</option>
                  {cages.map(c => (
                    <option key={c.id} value={c.barcode || c.code}>
                      [{c.code}] - {c.name} {c.barcode ? `(${c.barcode})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  className="form-input text-xs py-2 rounded-xl font-mono uppercase"
                  placeholder="Nhập mã barcode hoặc mã Code mẫu..."
                  value={scanCode}
                  onChange={e => setScanCode(e.target.value)}
                />
                <button
                  onClick={handleSimulateScan}
                  disabled={!scanCode}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Quét (Beep)
                </button>
              </div>

              {scanActionStatus && (
                <div className={`p-3 rounded-2xl text-xs font-bold ${
                  scanActionStatus.startsWith('❌') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-indigo-50 text-indigo-850 border border-indigo-150'
                }`}>
                  {scanActionStatus}
                </div>
              )}

              {/* Scan Result Profile with Operations */}
              {scanResult && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3 animate-slideIn">
                  <div className="flex items-center gap-3">
                    <img src={scanResult.image} alt={scanResult.name} className="w-12 h-12 rounded-xl object-cover border" />
                    <div>
                      <div className="font-extrabold text-xs text-gray-900 leading-tight">{scanResult.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{scanResult.code} · Tồn: {scanResult.stock} cái</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => handleScanQuickUpdate('clean')}
                      className="py-2 text-[10px] font-black bg-white hover:bg-emerald-50 text-emerald-700 rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-1"
                    >
                      🧼 Quét: Báo Sạch
                    </button>
                    <button
                      onClick={() => handleScanQuickUpdate('dirty')}
                      className="py-2 text-[10px] font-black bg-white hover:bg-red-50 text-red-700 rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-1"
                    >
                      ⚠️ Quét: Báo Bẩn
                    </button>
                    <button
                      onClick={() => handleScanQuickUpdate('stock_in')}
                      className="py-2 text-[10px] font-black bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-1"
                    >
                      📥 Quét: Nhập +1
                    </button>
                    <button
                      onClick={() => handleScanQuickUpdate('stock_out')}
                      className="py-2 text-[10px] font-black bg-white hover:bg-amber-50 text-amber-700 rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-1"
                    >
                      📤 Quét: Xuất -1
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-150">
              <button onClick={() => setIsScannerOpen(false)} className="w-full btn-secondary justify-center py-2.5 rounded-xl text-xs font-bold">Hủy Bỏ</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: PRINTABLE BARCODE LABEL PREVIEW ── */}
      {isLabelModalOpen && labelTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-150 pb-2">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                <Printer className="text-indigo-650" size={16} /> Mẫu in tem nhãn tài sản kệ kho
              </h3>
              <button onClick={() => setIsLabelModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-center border border-gray-200">
              {/* Virtual Labelsticker design */}
              <div id="printable-label" className="bg-white border-2 border-gray-950 p-4 rounded shadow-md w-72 space-y-3 text-gray-950 font-sans">
                <div className="flex justify-between items-start border-b border-gray-900 pb-1.5">
                  <div className="text-[9px] font-black tracking-widest text-indigo-700">PETCARE SYSTEM</div>
                  <div className="text-[8px] font-black border border-gray-950 px-1 rounded">SIZE {labelTarget.size}</div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-xs font-black leading-tight uppercase truncate">{labelTarget.name}</div>
                  <div className="text-[9px] font-semibold text-gray-600">Model: {labelTarget.code}</div>
                  <div className="text-[9px] font-bold text-indigo-900">Vị trí: {labelTarget.location || 'CHƯA PHÂN KỆ'}</div>
                </div>

                {/* Simulated Barcode Graphic */}
                <div className="flex flex-col items-center justify-center py-2.5 bg-gray-50 rounded border">
                  <div className="flex gap-[1.5px] items-center h-8">
                    {[1,2,1,3,1,1,2,3,1,2,2,1,1,3,1,2,1,2,3,1,1,2,1,3,1,1,2].map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-black h-full"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono tracking-widest mt-1 block font-bold">{labelTarget.barcode || 'NO BARCODE'}</span>
                </div>

                <div className="flex justify-between items-center text-[8px] text-gray-500 pt-1.5 border-t border-gray-200">
                  <span>Khử trùng: {labelTarget.cleanliness ? labelTarget.cleanliness.toUpperCase() : 'CLEANED'}</span>
                  <span>Ngày in: {new Date().toISOString().slice(0, 10)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-gray-150">
              <button onClick={() => setIsLabelModalOpen(false)} className="btn-secondary flex-1 justify-center py-2.5 rounded-xl text-xs font-bold">Hủy Bỏ</button>
              <button
                onClick={() => {
                  alert('🖨️ Yêu cầu in mã vạch đã được gửi tới máy in nhiệt tại quầy kho thành công!')
                  setIsLabelModalOpen(false)
                }}
                className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Printer size={13} />
                Xác nhận In tem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
