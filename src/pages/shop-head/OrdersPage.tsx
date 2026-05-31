import { useState, useMemo, useEffect } from 'react'
import { 
  Package, X, FileText, Printer, CheckCircle, Search, Calendar, 
  User, DollarSign, Tag, ShoppingBag, Landmark, CreditCard, 
  ChevronRight, ArrowRight, ShieldCheck, BarChart3, AlertCircle,
  Plus, Minus, Trash2, Percent, Sparkles, TrendingUp
} from 'lucide-react'
import { ORDER_MOCK_LIST, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, saveOrders } from '@/data/orderMockData'
import { BOOKING_MOCK_LIST, saveBookings } from '@/data/bookingMockData'
import { PRODUCT_MOCK_LIST, saveProducts } from '@/data/productMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'
import type { Order, Booking, OrderStatus, SKU } from '@/types'

interface CartLine {
  skuId: string
  skuCode: string
  productName: string
  variantLabel: string
  price: number
  quantity: number
  maxStock: number
}

export default function ShopHeadOrdersPage() {
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'

  // Reactive DB states
  const [orders, setOrders] = useState<Order[]>(() => ORDER_MOCK_LIST)
  const [bookings, setBookings] = useState<Booking[]>(() => BOOKING_MOCK_LIST)
  
  // Navigation Tabs
  const [tab, setTab] = useState<'orders' | 'services'>('orders')

  // Search & Success notification
  const [searchQuery, setSearchQuery] = useState('')
  const [successAlert, setSuccessAlert] = useState('')

  // Detailed selected drawers
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Cash Receipt Thermal Print state
  const [showOrderInvoice, setShowOrderInvoice] = useState(false)
  const [showBookingInvoice, setShowBookingInvoice] = useState(false)

  // Order status editing state
  const [editStatus, setEditStatus] = useState<OrderStatus>('pending')

  // Voucher engines
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherApplied, setVoucherApplied] = useState<{ code: string; discount: number; type: 'percent' | 'fixed'; value: number } | null>(null)
  const [voucherError, setVoucherError] = useState('')

  // Service checkout voucher engine
  const [svcVoucherCode, setSvcVoucherCode] = useState('')
  const [svcVoucherApplied, setSvcVoucherApplied] = useState<{ code: string; discount: number; type: 'percent' | 'fixed'; value: number } | null>(null)
  const [svcVoucherError, setSvcVoucherError] = useState('')
  const [svcPayMethod, setSvcPayMethod] = useState<'cash' | 'transfer' | 'card' | 'momo'>('cash')

  // Walk-In POS Drawer states
  const [showPOSDrawer, setShowPOSDrawer] = useState(false)
  const [posCart, setPosCart] = useState<CartLine[]>([])
  const [posCustomerName, setPosCustomerName] = useState('')
  const [posCustomerPhone, setPosCustomerPhone] = useState('')
  const [posNote, setPosNote] = useState('')
  const [posPayMethod, setPosPayMethod] = useState<'cash' | 'transfer' | 'card' | 'momo'>('cash')
  const [posSearchProduct, setPosSearchProduct] = useState('')

  // Service Booking Filters (All / Unpaid / Paid)
  const [bookingFilter, setBookingFilter] = useState<'all' | 'unpaid' | 'paid'>('all')

  // Charts interaction states
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null)
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<'retail' | 'spa' | 'boarding' | null>(null)

  // Reset states when changing drawer
  useEffect(() => {
    setVoucherCode('')
    setVoucherApplied(null)
    setVoucherError('')
    setSvcVoucherCode('')
    setSvcVoucherApplied(null)
    setSvcVoucherError('')
  }, [selectedOrder, selectedBooking])

  // Filtered Retail Orders
  const shopOrders = useMemo(() => {
    return orders
      .filter(o => o.shopId === shopId)
      .filter(o => 
        !searchQuery || 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerPhone.includes(searchQuery)
      )
  }, [orders, shopId, searchQuery])

  // Filtered Service Bookings
  const shopBookings = useMemo(() => {
    return bookings
      .filter(b => b.shopId === shopId)
      .filter(b => {
        if (bookingFilter === 'unpaid') return b.status !== 'paid' && b.status !== 'cancelled' && b.status !== 'no_show'
        if (bookingFilter === 'paid') return b.status === 'paid'
        return true
      })
      .filter(b =>
        !searchQuery ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerPhone.includes(searchQuery)
      )
  }, [bookings, shopId, bookingFilter, searchQuery])

  // Dynamic Financial Aggregation
  const financialStats = useMemo(() => {
    const paidOrders = orders.filter(o => o.shopId === shopId && (o.status === 'paid' || o.status === 'delivered'))
    const paidBookings = bookings.filter(b => b.shopId === shopId && b.status === 'paid')

    const retailTotal = paidOrders.reduce((s, o) => s + o.total, 0)
    const serviceTotal = paidBookings.reduce((s, b) => s + b.price, 0)
    
    // Boarding vs Spa split
    const boardingTotal = paidBookings
      .filter(b => b.serviceId === 'SV_BOARDING' || b.serviceName.toLowerCase().includes('nội trú') || b.serviceName.toLowerCase().includes('boarding'))
      .reduce((s, b) => s + b.price, 0)
    
    const spaTotal = serviceTotal - boardingTotal

    const grandTotal = retailTotal + serviceTotal

    // Calculate unpaid services count waiting for checkout
    const unpaidBookingsCount = bookings.filter(b => b.shopId === shopId && b.status !== 'paid' && b.status !== 'cancelled' && b.status !== 'no_show').length

    return {
      retailTotal,
      spaTotal,
      boardingTotal,
      serviceTotal,
      grandTotal,
      unpaidBookingsCount,
      totalOrdersCount: paidOrders.length,
      totalPaidServicesCount: paidBookings.length
    }
  }, [orders, bookings, shopId])

  // 7-Day Revenue Trend Aggregator (past 7 days including today)
  const weeklyTrendData = useMemo(() => {
    const dates: string[] = []
    const baseDate = new Date(2026, 4, 31) // May 31, 2026
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate)
      d.setDate(baseDate.getDate() - i)
      const yr = d.getFullYear()
      const mo = String(d.getMonth() + 1).padStart(2, '0')
      const dy = String(d.getDate()).padStart(2, '0')
      dates.push(`${yr}-${mo}-${dy}`)
    }

    return dates.map((dateString) => {
      const dayOrders = orders.filter(o => o.shopId === shopId && o.createdAt.startsWith(dateString) && (o.status === 'paid' || o.status === 'delivered'))
      const dayBookings = bookings.filter(b => b.shopId === shopId && b.date === dateString && b.status === 'paid')
      
      const retailRev = dayOrders.reduce((s, o) => s + o.total, 0)
      const serviceRev = dayBookings.reduce((s, b) => s + b.price, 0)
      const totalRev = retailRev + serviceRev

      // Display format
      const shortDate = dateString.split('-').slice(1).reverse().join('/') // DD/MM

      return {
        date: dateString,
        label: shortDate,
        retail: retailRev,
        service: serviceRev,
        total: totalRev
      }
    })
  }, [orders, bookings, shopId])

  // 7-day Area Chart coordinates
  const maxWeeklyRevenue = useMemo(() => {
    const maxVal = Math.max(...weeklyTrendData.map(d => d.total), 1500000)
    return Math.ceil(maxVal / 500000) * 500000 // round up for clean grid lines
  }, [weeklyTrendData])

  // Donut Chart Segment Calculations
  const donutPercentages = useMemo(() => {
    const { retailTotal, spaTotal, boardingTotal, grandTotal } = financialStats
    if (grandTotal === 0) {
      return { retailPct: 34, spaPct: 33, boardingPct: 33, retailTotal: 0, spaTotal: 0, boardingTotal: 0 }
    }
    return {
      retailPct: Math.round((retailTotal / grandTotal) * 100),
      spaPct: Math.round((spaTotal / grandTotal) * 100),
      boardingPct: Math.round((boardingTotal / grandTotal) * 100),
      retailTotal,
      spaTotal,
      boardingTotal
    }
  }, [financialStats])

  // standard vouchers Mock validator
  function applyVoucherPromo(code: string, subtotal: number, type: 'retail' | 'service') {
    const normCode = code.toUpperCase().trim()
    if (!normCode) {
      type === 'retail' ? setVoucherError('Vui lòng nhập mã!') : setSvcVoucherError('Vui lòng nhập mã!')
      return
    }

    if (normCode === 'PETCARE10') {
      const discount = Math.round(subtotal * 0.1)
      const applied = { code: normCode, discount, type: 'percent' as const, value: 10 }
      if (type === 'retail') {
        setVoucherApplied(applied)
        setVoucherError('')
      } else {
        setSvcVoucherApplied(applied)
        setSvcVoucherError('')
      }
      triggerMicroAlert('Áp dụng Voucher giảm giá 10% thành công! 🎉')
    } else if (normCode === 'HEALPET50') {
      if (subtotal < 200000) {
        const errMsg = 'Mã HEALPET50 yêu cầu đơn hàng tối thiểu từ 200.000đ!'
        type === 'retail' ? setVoucherError(errMsg) : setSvcVoucherError(errMsg)
        return
      }
      const applied = { code: normCode, discount: 50000, type: 'fixed' as const, value: 50000 }
      if (type === 'retail') {
        setVoucherApplied(applied)
        setVoucherError('')
      } else {
        setSvcVoucherApplied(applied)
        setSvcVoucherError('')
      }
      triggerMicroAlert('Đã áp dụng mã giảm giá 50.000đ! 🐾')
    } else {
      const errMsg = 'Mã Voucher không hợp lệ hoặc đã hết hạn!'
      type === 'retail' ? setVoucherError(errMsg) : setSvcVoucherError(errMsg)
    }
  }

  // Handle Order Status transitions
  function handleUpdateOrderStatus(orderId: string) {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: editStatus }
      }
      return o
    })

    setOrders(updated)
    saveOrders(updated)

    // Keep reference synced
    const fresh = updated.find(o => o.id === orderId)
    if (fresh) setSelectedOrder(fresh)

    triggerMicroAlert(`Đã cập nhật trạng thái đơn hàng "${orderId}" thành "${ORDER_STATUS_LABELS[editStatus]}"!`)
  }

  // Print invoices micro-animations
  function handlePrintInvoice(id: string) {
    triggerMicroAlert(`🖨️ Đang in hóa đơn nhiệt "${id}"... Bản in đã gửi đến máy in quầy thành công!`)
  }

  // Walk-In POS cart item select
  const allPOSProducts = useMemo(() => {
    return PRODUCT_MOCK_LIST.filter(p => p.status === 'active')
  }, [])

  const filteredPOSSKUs = useMemo(() => {
    const skus = allPOSProducts.flatMap(p => 
      p.skus.map(s => ({
        ...s,
        productName: p.name,
        category: p.category,
        brand: p.brand,
        image: p.images[0],
        variantLabel: Object.entries(s.attributes).map(([k, v]) => `${v}`).join(' / '),
        uniqueId: s.id
      }))
    )

    if (!posSearchProduct) return skus.slice(0, 10)
    return skus.filter(s => 
      s.productName.toLowerCase().includes(posSearchProduct.toLowerCase()) ||
      s.sku.toLowerCase().includes(posSearchProduct.toLowerCase()) ||
      s.category.toLowerCase().includes(posSearchProduct.toLowerCase())
    )
  }, [allPOSProducts, posSearchProduct])

  function handleAddSKUToCart(sku: typeof filteredPOSSKUs[0]) {
    if (sku.stock <= 0) {
      triggerMicroAlert('Sản phẩm đã hết hàng, không thể thêm vào giỏ! ⚠️')
      return
    }

    setPosCart(prev => {
      const existing = prev.find(c => c.skuId === sku.uniqueId)
      if (existing) {
        if (existing.quantity >= sku.stock) {
          triggerMicroAlert(`Không thể vượt quá số lượng tồn kho vật lý (${sku.stock}) của cửa hàng!`)
          return prev
        }
        return prev.map(c => c.skuId === sku.uniqueId ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, {
        skuId: sku.uniqueId,
        skuCode: sku.sku,
        productName: sku.productName,
        variantLabel: sku.variantLabel,
        price: sku.price,
        quantity: 1,
        maxStock: sku.stock
      }]
    })
  }

  function handleAdjustCartQty(skuId: string, delta: number) {
    setPosCart(prev => {
      return prev.map(c => {
        if (c.skuId === skuId) {
          const nextQty = c.quantity + delta
          if (nextQty <= 0) return null
          if (nextQty > c.maxStock) {
            triggerMicroAlert(`Số lượng yêu cầu vượt quá tồn kho hiện có (${c.maxStock})!`)
            return c
          }
          return { ...c, quantity: nextQty }
        }
        return c
      }).filter(Boolean) as CartLine[]
    })
  }

  const posSubtotal = useMemo(() => {
    return posCart.reduce((s, c) => s + c.price * c.quantity, 0)
  }, [posCart])

  const posDiscountAmount = useMemo(() => {
    if (!voucherApplied) return 0
    return voucherApplied.discount
  }, [voucherApplied])

  const posTotal = useMemo(() => {
    return Math.max(0, posSubtotal - posDiscountAmount)
  }, [posSubtotal, posDiscountAmount])

  // Submit direct walk-in checkout and decrement physical stocks
  function handlePOSCheckout() {
    if (posCart.length === 0) {
      triggerMicroAlert('Vui lòng chọn ít nhất một sản phẩm vào giỏ hàng! ⚠️')
      return
    }

    // 1. Decrement product stock in local storage databases
    const freshProducts = [...PRODUCT_MOCK_LIST]
    posCart.forEach(cartItem => {
      const pIndex = freshProducts.findIndex(p => p.skus.some(s => s.id === cartItem.skuId))
      if (pIndex !== -1) {
        const skuIndex = freshProducts[pIndex].skus.findIndex(s => s.id === cartItem.skuId)
        if (skuIndex !== -1) {
          const newStock = Math.max(0, freshProducts[pIndex].skus[skuIndex].stock - cartItem.quantity)
          freshProducts[pIndex].skus[skuIndex].stock = newStock
        }
      }
    })
    saveProducts(freshProducts)

    // 2. Create the brand new Order
    const newOrderId = `ORD-${Date.now().toString().slice(-6)}`
    const newOrder: Order = {
      id: newOrderId,
      customerId: 'U_GUEST',
      customerName: posCustomerName.trim() || 'Khách vãng lai',
      customerPhone: posCustomerPhone.trim() || '0987654321',
      shopId: shopId,
      items: posCart.map(c => ({
        skuId: c.skuId,
        skuCode: c.skuCode,
        productName: c.productName,
        variantLabel: c.variantLabel,
        quantity: c.quantity,
        unitPrice: c.price,
        subtotal: c.price * c.quantity
      })),
      subtotal: posSubtotal,
      discountAmount: posDiscountAmount,
      voucherId: voucherApplied?.code,
      total: posTotal,
      status: 'paid',
      paymentMethod: posPayMethod,
      note: posNote.trim(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    }

    const updatedOrders = [newOrder, ...orders]
    setOrders(updatedOrders)
    saveOrders(updatedOrders)

    // 3. Clear cart & open thermal invoice printer preview instantly
    setPosCart([])
    setPosCustomerName('')
    setPosCustomerPhone('')
    setPosNote('')
    setVoucherApplied(null)
    setVoucherCode('')
    
    setSelectedOrder(newOrder)
    setEditStatus('paid')
    setShowOrderInvoice(true)
    setSelectedBooking(null)
    setShowPOSDrawer(false)

    triggerMicroAlert(`Đã thanh toán thành công đơn lẻ ${newOrderId}! Hàng đã tự động trừ khỏi kho chi nhánh.`)
  }

  // Live Services checkout and settlement
  function handleServiceBookingPayment(bookingId: string) {
    const subtotal = selectedBooking?.price ?? 0
    const discount = svcVoucherApplied?.discount ?? 0
    const finalPrice = Math.max(0, subtotal - discount)
    const newInvId = `INV-${Date.now().toString().slice(-6)}`

    const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'paid' as const,
          price: finalPrice,
          paymentMethod: svcPayMethod,
          invoiceId: newInvId,
          checkoutNote: 'Quyết toán trực tiếp tại quầy thu ngân',
          statusHistory: [
            ...(b.statusHistory || []),
            { status: 'paid' as const, changedBy: currentUser?.fullName || 'Thu ngân chi nhánh', changedAt: new Date().toISOString().replace('T', ' ').slice(0, 16), note: `Quyết toán tiền bằng ${svcPayMethod.toUpperCase()}. Áp dụng Voucher: ${svcVoucherApplied?.code || 'Không'}` }
          ]
        }
      }
      return b
    })

    setBookings(updatedBookings)
    saveBookings(updatedBookings)

    const fresh = updatedBookings.find(b => b.id === bookingId)
    if (fresh) {
      setSelectedBooking(fresh)
    }

    triggerMicroAlert(`Đã thực hiện quyết toán thành công ca dịch vụ ${bookingId}! Doanh thu chi nhánh đã tăng thêm ${formatPrice(finalPrice)}.`)
  }

  function triggerMicroAlert(msg: string) {
    setSuccessAlert(msg)
    setTimeout(() => setSuccessAlert(''), 5000)
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Doanh thu & Đơn hàng quầy
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý dòng tiền, quyết toán lịch Spa/Nội trú và POS bán hàng trực tiếp tại chi nhánh {shopId}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Total revenue banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-3.5 shadow-md shadow-indigo-150/10 relative overflow-hidden flex-1 lg:flex-initial">
            <div className="absolute right-0 bottom-0 opacity-10 translate-y-2 translate-x-2 shrink-0">
              <BarChart3 size={64} className="text-white" />
            </div>
            <div>
              <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Tổng Doanh thu Chi nhánh</div>
              <strong className="text-lg font-black text-emerald-400">{formatPrice(financialStats.grandTotal)}</strong>
            </div>
          </div>

          {/* Quick Create Walk-In Order Action Button */}
          <button 
            onClick={() => {
              setShowPOSDrawer(true)
              setSelectedOrder(null)
              setSelectedBooking(null)
            }}
            className="btn-primary py-3 px-5 text-xs font-black rounded-2xl bg-indigo-650 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-lg shadow-indigo-500/10 shrink-0 self-stretch justify-center"
          >
            <ShoppingBag size={14} /> Bán lẻ tại quầy
          </button>
        </div>
      </div>

      {/* Success alert banner */}
      {successAlert && (
        <div className="bg-emerald-50 border border-emerald-250/20 text-emerald-900 rounded-2xl p-4 flex items-center gap-2.5 text-sm font-extrabold animate-pulse shadow-sm">
          <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
          <span>{successAlert}</span>
        </div>
      )}

      {/* Financial stats summary blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Doanh thu sản phẩm (Bán lẻ)', value: formatPrice(financialStats.retailTotal), color: 'text-indigo-600', sub: `${financialStats.totalOrdersCount} hóa đơn đã thanh toán` },
          { label: 'Doanh thu Spa & Làm đẹp', value: formatPrice(financialStats.spaTotal), color: 'text-purple-600', sub: 'Các dịch vụ lẻ đã hoàn tất' },
          { label: 'Doanh thu Lưu trú (Nội trú)', value: formatPrice(financialStats.boardingTotal), color: 'text-emerald-600', sub: 'Ca lưu chuồng nội trú VIP' },
          { label: 'Dịch vụ chưa thanh toán', value: `${financialStats.unpaidBookingsCount} ca`, color: 'text-rose-500', sub: 'Chờ thanh toán quyết toán', highlight: financialStats.unpaidBookingsCount > 0 }
        ].map(m => (
          <div key={m.label} className={`card p-4 rounded-2xl border border-gray-150 shadow-sm bg-white hover:shadow-md transition-shadow relative overflow-hidden ${m.highlight ? 'border-rose-200 bg-rose-50/10' : ''}`}>
            <div className={`text-[17px] font-black ${m.color}`}>{m.value}</div>
            <div className="text-xs text-gray-800 font-extrabold mt-0.5">{m.label}</div>
            <div className="text-[10px] text-gray-400 font-bold mt-1 block">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* --- STATISTICAL CHARTS BLOCK (SVG) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Trend Line Chart */}
        <div className="lg:col-span-2 card p-5 rounded-3xl border border-gray-150 shadow-sm bg-white space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h3 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-indigo-500" /> Xu hướng doanh thu 7 ngày qua
              </h3>
              <p className="text-[11px] text-gray-400 font-bold">Thống kê tích lũy dòng tiền bán lẻ và spa quầy</p>
            </div>
            
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Bán lẻ</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Dịch vụ</span>
            </div>
          </div>

          {/* SVG Graph Drawing */}
          <div className="relative pt-3">
            <svg viewBox="0 0 600 220" className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="retailArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0"/>
                </linearGradient>
                <linearGradient id="serviceArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                const y = 20 + r * 160
                return (
                  <g key={i} className="opacity-40">
                    <line x1="40" y1={y} x2="580" y2={y} stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                    <text x="35" y={y + 4} textAnchor="end" className="fill-gray-400 font-mono text-[9px] font-bold">
                      {formatPrice(maxWeeklyRevenue * (1 - r)).replace('đ', '')}
                    </text>
                  </g>
                )
              })}

              {/* Weekly nodes calculation */}
              {(() => {
                const points = weeklyTrendData.map((d, i) => {
                  const x = 50 + (i * 510) / 6
                  const yTotal = 180 - (d.total / maxWeeklyRevenue) * 160
                  const yRetail = 180 - (d.retail / maxWeeklyRevenue) * 160
                  const yService = 180 - (d.service / maxWeeklyRevenue) * 160
                  return { x, yTotal, yRetail, yService, ...d }
                })

                // Generate path string
                const retailPathD = `M ${points[0].x} ${points[0].yRetail} ` + points.slice(1).map(p => `L ${p.x} ${p.yRetail}`).join(' ')
                const retailAreaD = retailPathD + ` L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`

                const servicePathD = `M ${points[0].x} ${points[0].yService} ` + points.slice(1).map(p => `L ${p.x} ${p.yService}`).join(' ')
                const serviceAreaD = servicePathD + ` L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`

                return (
                  <g>
                    {/* Areas */}
                    <path d={retailAreaD} fill="url(#retailArea)" />
                    <path d={serviceAreaD} fill="url(#serviceArea)" />

                    {/* Lines */}
                    <path d={retailPathD} fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={servicePathD} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Hover interactive areas & labels */}
                    {points.map((p, i) => (
                      <g key={i}>
                        {/* Vertical helper line on hover */}
                        {hoveredTrendIndex === i && (
                          <line x1={p.x} y1="20" x2={p.x} y2="180" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" className="opacity-80" />
                        )}

                        {/* Retail dot */}
                        <circle cx={p.x} cy={p.yRetail} r={hoveredTrendIndex === i ? 5.5 : 4} fill="#FFFFFF" stroke="#6366F1" strokeWidth="2" />
                        
                        {/* Service dot */}
                        <circle cx={p.x} cy={p.yService} r={hoveredTrendIndex === i ? 5.5 : 4} fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />

                        {/* Interactive bar hotspot */}
                        <rect 
                          x={p.x - 30} 
                          y="10" 
                          width="60" 
                          height="180" 
                          fill="transparent" 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredTrendIndex(i)}
                          onMouseLeave={() => setHoveredTrendIndex(null)}
                        />

                        {/* X Axis Label */}
                        <text x={p.x} y="200" textAnchor="middle" className="fill-gray-500 font-bold font-mono text-[9px]">
                          {p.label}
                        </text>
                      </g>
                    ))}
                  </g>
                )
              })()}
            </svg>

            {/* Float Tooltip Portal */}
            {hoveredTrendIndex !== null && (
              <div 
                className="absolute bg-slate-900/95 text-white p-3 rounded-xl text-[10px] space-y-1 shadow-lg pointer-events-none z-10 font-sans leading-normal animate-fadeIn border border-slate-700/50"
                style={{
                  left: `${15 + (hoveredTrendIndex * 78)}%`,
                  top: '-15px',
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="font-extrabold text-indigo-300 border-b border-slate-800 pb-1 mb-1">Ngày {weeklyTrendData[hoveredTrendIndex].date}</div>
                <div className="flex justify-between gap-5 font-bold">
                  <span className="text-gray-400">🛍️ Bán lẻ:</span>
                  <span>{formatPrice(weeklyTrendData[hoveredTrendIndex].retail)}</span>
                </div>
                <div className="flex justify-between gap-5 font-bold">
                  <span className="text-gray-400">✂️ Dịch vụ:</span>
                  <span>{formatPrice(weeklyTrendData[hoveredTrendIndex].service)}</span>
                </div>
                <div className="flex justify-between gap-5 font-black border-t border-slate-850 pt-1 mt-1 text-emerald-400">
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(weeklyTrendData[hoveredTrendIndex].total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Category Revenue Pie/Donut Chart */}
        <div className="card p-5 rounded-3xl border border-gray-150 shadow-sm bg-white flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
              <BarChart3 size={15} className="text-emerald-500" /> Phân bổ Cơ cấu doanh thu
            </h3>
            <p className="text-[11px] text-gray-400 font-bold">Tỷ trọng các luồng tiền thu thực tế tại chi nhánh</p>
          </div>

          {/* Donut layout */}
          <div className="flex flex-col items-center justify-center relative py-2">
            <svg width="150" height="150" viewBox="0 0 150 150" className="transform -rotate-90">
              {/* Back circle */}
              <circle cx="75" cy="75" r="50" fill="transparent" stroke="#F1F5F9" strokeWidth="18" />

              {/* Segment 1: Retail (Indigo) */}
              <circle 
                cx="75" 
                cy="75" 
                r="50" 
                fill="transparent" 
                stroke="#6366F1" 
                strokeWidth={hoveredDonutSegment === 'retail' ? "22" : "18"}
                strokeDasharray={`${(donutPercentages.retailPct * 314.16) / 100} 314.16`}
                strokeDashoffset="0"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredDonutSegment('retail')}
                onMouseLeave={() => setHoveredDonutSegment(null)}
              />

              {/* Segment 2: Spa (Purple) */}
              <circle 
                cx="75" 
                cy="75" 
                r="50" 
                fill="transparent" 
                stroke="#A855F7" 
                strokeWidth={hoveredDonutSegment === 'spa' ? "22" : "18"}
                strokeDasharray={`${(donutPercentages.spaPct * 314.16) / 100} 314.16`}
                strokeDashoffset={`-${(donutPercentages.retailPct * 314.16) / 100}`}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredDonutSegment('spa')}
                onMouseLeave={() => setHoveredDonutSegment(null)}
              />

              {/* Segment 3: Boarding (Emerald) */}
              <circle 
                cx="75" 
                cy="75" 
                r="50" 
                fill="transparent" 
                stroke="#10B981" 
                strokeWidth={hoveredDonutSegment === 'boarding' ? "22" : "18"}
                strokeDasharray={`${(donutPercentages.boardingPct * 314.16) / 100} 314.16`}
                strokeDashoffset={`-${((donutPercentages.retailPct + donutPercentages.spaPct) * 314.16) / 100}`}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredDonutSegment('boarding')}
                onMouseLeave={() => setHoveredDonutSegment(null)}
              />
            </svg>

            {/* Middle labels */}
            <div className="absolute text-center">
              <strong className="text-sm font-black text-slate-800">
                {hoveredDonutSegment === 'retail' ? `${donutPercentages.retailPct}%` :
                 hoveredDonutSegment === 'spa' ? `${donutPercentages.spaPct}%` :
                 hoveredDonutSegment === 'boarding' ? `${donutPercentages.boardingPct}%` :
                 'Tỉ trọng'}
              </strong>
              <span className="block text-[8px] text-gray-400 font-extrabold uppercase mt-0.5">
                {hoveredDonutSegment === 'retail' ? 'Sản phẩm' :
                 hoveredDonutSegment === 'spa' ? 'Spa/Tắm lẻ' :
                 hoveredDonutSegment === 'boarding' ? 'Lưu trú VIP' :
                 'Đóng góp'}
              </span>
            </div>
          </div>

          {/* Custom legend */}
          <div className="space-y-1.5 text-[11px] font-semibold text-gray-650 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500 block"></span> 🛍️ Bán lẻ Sản phẩm
              </span>
              <strong className="text-gray-900">{formatPrice(donutPercentages.retailTotal)} ({donutPercentages.retailPct}%)</strong>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-purple-500 block"></span> ✂️ Dịch vụ Spa & Tắm
              </span>
              <strong className="text-gray-900">{formatPrice(donutPercentages.spaTotal)} ({donutPercentages.spaPct}%)</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 block"></span> 🏨 Lưu trú / Nội trú
              </span>
              <strong className="text-gray-900">{formatPrice(donutPercentages.boardingTotal)} ({donutPercentages.boardingPct}%)</strong>
            </div>
          </div>

        </div>

      </div>

      {/* FILTER & DUAL-TAB BUTTONS SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-gray-150">
        
        {/* Switch tab buttons */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl shrink-0 w-full lg:w-auto">
          <button 
            onClick={() => { 
              setTab('orders'); 
              setSelectedOrder(null); 
              setSelectedBooking(null); 
              setShowOrderInvoice(false); 
              setShowBookingInvoice(false); 
            }}
            className={`flex-1 lg:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              tab === 'orders' ? 'bg-white shadow text-indigo-750' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShoppingBag size={13} /> Hóa đơn Bán lẻ ({shopOrders.length})
          </button>
          
          <button 
            onClick={() => { 
              setTab('services'); 
              setSelectedOrder(null); 
              setSelectedBooking(null); 
              setShowOrderInvoice(false); 
              setShowBookingInvoice(false); 
            }}
            className={`flex-1 lg:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              tab === 'services' ? 'bg-white shadow text-indigo-750' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Package size={13} /> Dịch vụ & Phòng ({shopBookings.length})
          </button>
        </div>

        {/* Dynamic sub-filters */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          
          {tab === 'services' && (
            <div className="flex bg-gray-155 p-0.5 rounded-xl shrink-0 text-[10px] font-bold">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'unpaid', label: 'Chờ quyết toán' },
                { id: 'paid', label: 'Đã quyết toán' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setBookingFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${bookingFilter === f.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Search Input bar */}
          <div className="relative flex-1 lg:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              className="form-input pl-9 text-xs rounded-xl py-2" 
              placeholder={tab === 'orders' ? "Mã đơn, chủ nuôi, SĐT..." : "Mã ca, tên thú cưng, khách..."} 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* DUAL PANELS CONTENT */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* MAIN DATA GRID LIST */}
        <div className="flex-1 w-full overflow-hidden">
          {tab === 'orders' ? (
            <div className="card overflow-x-auto rounded-3xl border border-gray-150 shadow-sm bg-white">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider select-none">
                  <tr>
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-4 py-3">Khách hàng / SĐT</th>
                    <th className="px-4 py-3">Chi tiết giỏ hàng</th>
                    <th className="px-4 py-3 text-center">Thanh toán</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Tổng tiền</th>
                    <th className="px-4 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-650">
                  {shopOrders.map(o => (
                    <tr 
                      key={o.id} 
                      onClick={() => {
                        setSelectedOrder(o)
                        setEditStatus(o.status)
                        setShowOrderInvoice(false)
                        setSelectedBooking(null)
                      }}
                      className={`hover:bg-indigo-50/20 transition-colors cursor-pointer ${
                        selectedOrder?.id === o.id ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono font-black text-indigo-600">{o.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-extrabold text-gray-900">{o.customerName}</div>
                        <div className="text-gray-400 font-bold font-mono mt-0.5">{o.customerPhone}</div>
                      </td>
                      <td className="px-4 py-3.5 max-w-48 truncate" title={o.items.map(i => i.productName).join(', ')}>
                        <div className="text-gray-800 font-bold">{o.items[0]?.productName} {o.items.length > 1 ? `và ${o.items.length - 1} món khác` : ''}</div>
                        <div className="text-gray-400 text-[10px] mt-0.5">Đặt: {o.createdAt}</div>
                      </td>
                      <td className="px-4 py-3.5 text-center uppercase font-bold text-slate-700 font-mono">
                        {o.paymentMethod}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block font-black px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${ORDER_STATUS_COLORS[o.status]}`}>
                          {ORDER_STATUS_LABELS[o.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-indigo-750 text-[13px]">{formatPrice(o.total)}</td>
                      <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => {
                            setSelectedOrder(o)
                            setEditStatus(o.status)
                            setShowOrderInvoice(false)
                            setSelectedBooking(null)
                          }}
                          className="text-[10px] font-black text-indigo-650 hover:text-indigo-800 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-xl shadow-sm"
                        >
                          Chi tiết & In
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {shopOrders.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                  <ShoppingBag size={36} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-bold">Không tìm thấy đơn hàng nào tương ứng</p>
                </div>
              )}
            </div>
          ) : (
            // Tab 2: Service Bookings (both paid & unpaid checkout list)
            <div className="card overflow-x-auto rounded-3xl border border-gray-150 shadow-sm bg-white">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider select-none">
                  <tr>
                    <th className="px-4 py-3">Mã ca</th>
                    <th className="px-4 py-3">Thú cưng / Chủ nuôi</th>
                    <th className="px-4 py-3">Dịch vụ điều trị</th>
                    <th className="px-4 py-3 font-mono text-center">Thời gian hẹn</th>
                    <th className="px-4 py-3 text-center">Nhân viên / Phòng</th>
                    <th className="px-4 py-3 text-center">Đối soát Bill</th>
                    <th className="px-4 py-3 text-right">Chi phí</th>
                    <th className="px-4 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-650">
                  {shopBookings.map(b => (
                    <tr 
                      key={b.id} 
                      onClick={() => {
                        setSelectedBooking(b)
                        setShowBookingInvoice(false)
                        setSelectedOrder(null)
                      }}
                      className={`hover:bg-indigo-50/20 transition-colors cursor-pointer ${
                        selectedBooking?.id === b.id ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono font-black text-indigo-650">{b.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-extrabold text-indigo-900">{b.petName}</div>
                        <div className="text-gray-400 font-bold mt-0.5">{b.customerName} · <span className="font-mono">{b.customerPhone}</span></div>
                      </td>
                      <td className="px-4 py-3.5 font-extrabold text-gray-800">
                        {b.serviceName}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold">
                        {b.date}
                        <div className="text-[10px] text-gray-400">{b.startTime}–{b.endTime}</div>
                      </td>
                      <td className="px-4 py-3.5 text-center text-gray-700 font-bold">
                        {b.assignedStaffName ?? '—'}
                        {b.roomName && <div className="text-[10px] text-indigo-500 font-extrabold">{b.roomName}</div>}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block font-black px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${
                          b.status === 'paid' 
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                            : 'bg-amber-50 border border-amber-200 text-amber-700'
                        }`}>
                          {b.status === 'paid' ? 'Đã quyết toán' : 'Chờ tính tiền'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-slate-800 text-[13px]">{formatPrice(b.price)}</td>
                      <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                        {b.status === 'paid' ? (
                          <button 
                            onClick={() => {
                              setSelectedBooking(b)
                              setShowBookingInvoice(false)
                              setSelectedOrder(null)
                            }}
                            className="text-[10px] font-black text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-xl shadow-sm"
                          >
                            Hóa đơn đã in
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              setSelectedBooking(b)
                              setShowBookingInvoice(false)
                              setSelectedOrder(null)
                            }}
                            className="text-[10px] font-black text-amber-700 hover:text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl shadow-sm hover:scale-105 transition-all"
                          >
                            💳 Thu tiền quầy
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {shopBookings.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                  <Package size={36} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-bold">Không tìm thấy ca phục vụ tương thích</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- DETAILED SLIDING DRAWER FOR RETAIL ORDERS --- */}
        {selectedOrder && (
          <div className="w-full lg:w-[400px] shrink-0 bg-white rounded-3xl border border-gray-200 p-5 shadow-lg animate-slideIn flex flex-col justify-between space-y-4">
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
                <div>
                  <h2 className="text-sm font-black text-gray-800">
                    Chi tiết hóa đơn bán lẻ
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold font-mono mt-0.5">
                    Mã đơn hàng: {selectedOrder.id}
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setSelectedOrder(null); setShowOrderInvoice(false); }} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {showOrderInvoice ? (
                /* --- THERMAL RETAIL RECEIPT PREVIEW (2.0 PREMIUM) --- */
                <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
                  <div className="flex-1 bg-[#FAFAFA] border-2 border-gray-300 rounded-2xl p-4 overflow-y-auto font-mono text-[10px] text-gray-800 leading-normal space-y-3.5 relative shadow-inner select-all">
                    
                    {/* Thermal POS receipt header */}
                    <div className="text-center space-y-1">
                      <span className="text-xs font-black tracking-widest uppercase block text-indigo-900">🐾 PetCare Chi Nhánh {shopId}</span>
                      <p className="text-[9px] text-gray-400 font-bold">ĐC: 12 Bến Thành, Quận 1, TP.HCM</p>
                      <p className="text-[9px] text-gray-400 font-bold">SĐT: 098.765.4321</p>
                      <span className="block border-b border-dashed border-gray-300 py-0.5"></span>
                      <span className="font-bold text-xs uppercase text-gray-900 block pt-1.5 tracking-wider">HÓA ĐƠN RETAIL BÁN LẺ</span>
                      <span className="text-[8px] text-gray-400 block font-mono">Invoice ID: {selectedOrder.id}</span>
                      <span className="text-[8px] text-gray-400 block font-mono">Time: {selectedOrder.createdAt}</span>
                    </div>

                    <span className="block border-b border-dashed border-gray-300 py-0.5"></span>

                    {/* Customer info */}
                    <div className="space-y-0.5 text-gray-700">
                      <div>Khách hàng: <strong className="text-gray-900">{selectedOrder.customerName}</strong></div>
                      <div>SĐT: <span className="font-bold">{selectedOrder.customerPhone}</span></div>
                      <div>Thanh toán: <span className="uppercase font-bold">{selectedOrder.paymentMethod}</span></div>
                    </div>

                    <span className="block border-b border-dashed border-gray-300 py-0.5"></span>

                    {/* Item list table */}
                    <table className="w-full text-left table-fixed">
                      <thead>
                        <tr className="font-bold text-gray-900 border-b border-gray-200">
                          <th className="w-7/12 py-1">Tên món</th>
                          <th className="w-2/12 py-1 text-center">SL</th>
                          <th className="w-3/12 py-1 text-right">Đơn giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-100 last:border-0 align-top">
                            <td className="py-1 max-w-28 truncate">{item.productName} <span className="text-[8px] text-gray-400 block">{item.variantLabel}</span></td>
                            <td className="py-1 text-center font-bold">{item.quantity}</td>
                            <td className="py-1 text-right font-bold">{formatPrice(item.unitPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <span className="block border-b border-dashed border-gray-300 py-0.5"></span>

                    {/* Totals */}
                    <div className="space-y-1 text-right font-bold text-gray-750 pr-1">
                      <div className="flex justify-between">
                        <span>Cộng sản phẩm:</span>
                        <span>{formatPrice(selectedOrder.subtotal)}</span>
                      </div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-rose-600">
                          <span>Voucher giảm giá:</span>
                          <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                        </div>
                      )}
                      <span className="block border-b border-gray-200 my-1"></span>
                      <div className="flex justify-between text-xs text-gray-900 font-black">
                        <span>TỔNG THANH TOÁN:</span>
                        <span className="text-indigo-900 text-xs font-extrabold">{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>

                    <span className="block border-b border-dashed border-gray-300 py-0.5"></span>

                    {/* Hologram PAID STAMP */}
                    {selectedOrder.status === 'paid' && (
                      <div className="absolute right-4 top-1/2 -translate-y-12 rotate-12 border-2 border-emerald-500 text-emerald-500 font-black tracking-widest text-[9px] uppercase px-2.5 py-1 rounded bg-white/90 shadow-sm opacity-90 animate-scaleUp select-none">
                        🐾 ĐÃ THANH TOÁN
                      </div>
                    )}

                    {/* Fake Barcode */}
                    <div className="text-center pt-2 space-y-1">
                      <div className="font-mono text-gray-300 text-[16px] tracking-[6px] select-none">|||||I||I||||II|II|||I</div>
                      <p className="text-[8px] text-gray-400 text-center font-mono">Quét để kiểm tra hóa đơn quầy</p>
                    </div>

                    <div className="text-center space-y-1 text-gray-400 text-[8px] pt-1">
                      <p>Cảm ơn quý khách và bé cưng đã tin tưởng PetCare!</p>
                      <p className="font-mono text-gray-300 block">Powered by Antigravity POS 2.0</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 shrink-0">
                    <button 
                      onClick={() => handlePrintInvoice(selectedOrder.id)}
                      className="flex-1 btn-primary py-2.5 text-xs font-black justify-center rounded-2xl bg-indigo-650 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1"
                    >
                      <Printer size={13} /> Thực hiện In hóa đơn
                    </button>
                    <button 
                      onClick={() => setShowOrderInvoice(false)}
                      className="btn-secondary py-2.5 text-xs font-bold justify-center rounded-2xl"
                    >
                      Quay lại chi tiết
                    </button>
                  </div>
                </div>
              ) : (
                /* --- ORDER PROFILE READOUT & CONTROLLER --- */
                <div className="flex-1 flex flex-col overflow-hidden space-y-4">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                    
                    {/* Customer Profile card */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                      <span className="text-[9px] font-black text-indigo-500 uppercase block tracking-wider">Thông tin thanh toán</span>
                      <div className="space-y-1 leading-normal font-semibold text-gray-650">
                        <div>Chủ nuôi: <strong className="text-gray-900">{selectedOrder.customerName}</strong></div>
                        <div>Điện thoại liên hệ: <span className="font-mono font-bold text-gray-900">{selectedOrder.customerPhone}</span></div>
                        {selectedOrder.shippingAddress && (
                          <div>Địa chỉ giao: <span className="text-gray-700 font-bold">{selectedOrder.shippingAddress}</span></div>
                        )}
                        {selectedOrder.note && (
                          <div className="text-orange-700 font-medium italic mt-1">Lưu ý lễ tân: "{selectedOrder.note}"</div>
                        )}
                      </div>
                    </div>

                    {/* Cart Items list */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Chi tiết mặt hàng đã mua</span>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="bg-white border rounded-xl p-3 flex justify-between items-center shadow-sm">
                            <div>
                              <strong className="text-gray-900 font-extrabold text-[12px]">{item.productName}</strong>
                              <span className="block text-[10px] text-gray-400 font-bold mt-0.5">{item.variantLabel}</span>
                              <span className="block text-[9px] text-gray-450 font-mono mt-0.5">Mã SKU: {item.skuCode}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-800 font-extrabold">{item.quantity} x {formatPrice(item.unitPrice)}</span>
                              <span className="block text-indigo-650 font-black text-xs mt-0.5">{formatPrice(item.subtotal)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Invoice box */}
                    <div className="bg-slate-50 border rounded-2xl p-4 text-[11px] font-semibold text-gray-650 space-y-1.5 shadow-sm">
                      <div className="flex justify-between">
                        <span>Tổng tiền hàng:</span>
                        <strong className="text-gray-800 font-black">{formatPrice(selectedOrder.subtotal)}</strong>
                      </div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-rose-600">
                          <span>Khuyến mãi Voucher:</span>
                          <strong className="font-black">-{formatPrice(selectedOrder.discountAmount)}</strong>
                        </div>
                      )}
                      <span className="block border-b border-gray-200 my-1"></span>
                      <div className="flex justify-between text-xs text-gray-950 font-black">
                        <span>TỔNG CỘNG THANH TOÁN:</span>
                        <strong className="text-indigo-700 text-sm font-extrabold">{formatPrice(selectedOrder.total)}</strong>
                      </div>
                    </div>

                    {/* Payment details */}
                    <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold text-gray-700">
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border">
                        <span className="text-[9px] font-extrabold text-gray-400 block uppercase mb-1">Phương thức</span>
                        <span className="uppercase font-black text-indigo-850 block">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border">
                        <span className="text-[9px] font-extrabold text-gray-400 block uppercase mb-1">Thời gian lập</span>
                        <span className="font-bold text-gray-900 block font-mono text-[10px]">{selectedOrder.createdAt}</span>
                      </div>
                    </div>

                    {/* Inline Status Auditor transition select */}
                    <div className="bg-slate-50/40 border border-gray-150 p-4 rounded-3xl space-y-2.5">
                      <span className="text-[9px] font-black text-indigo-900 uppercase block tracking-wider flex items-center gap-1">
                        <AlertCircle size={12} /> Cập nhật trạng thái đơn hàng
                      </span>
                      
                      <div className="flex gap-2">
                        <select 
                          className="form-input text-xs py-2 px-3 rounded-xl bg-white focus:border-indigo-500 flex-1 border-gray-200"
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value as OrderStatus)}
                        >
                          {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => (
                            <option key={status} value={status}>{label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id)}
                          className="btn-primary py-2 px-4 text-xs font-black rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white shadow-sm transition-all"
                        >
                          Cập nhật
                        </button>
                      </div>
                    </div>

                  </div>

                  <div className="flex gap-2 pt-3 border-t shrink-0">
                    <button 
                      onClick={() => setShowOrderInvoice(true)}
                      className="flex-1 btn-primary py-2.5 text-xs font-black justify-center rounded-2xl bg-indigo-650 hover:bg-indigo-755 text-white flex items-center gap-1.5 shadow"
                    >
                      <Printer size={13} /> Hóa đơn in nhiệt
                    </button>
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="btn-secondary py-2.5 text-xs font-bold justify-center rounded-2xl"
                    >
                      Đóng bảng
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* --- DETAILED SLIDING DRAWER FOR SERVICES CHECKOUTS --- */}
        {selectedBooking && (
          <div className="w-full lg:w-[400px] shrink-0 bg-white rounded-3xl border border-gray-200 p-5 shadow-lg animate-slideIn flex flex-col justify-between space-y-4">
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
                <div>
                  <h2 className="text-sm font-black text-gray-800">
                    Quyết toán phí Dịch vụ / Phòng
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold font-mono mt-0.5">
                    Mã ca lưu trú: {selectedBooking.id}
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setSelectedBooking(null); setShowBookingInvoice(false); }} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {showBookingInvoice ? (
                /* --- THERMAL SERVICE RECEIPT PREVIEW (2.0) --- */
                <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
                  <div className="flex-1 bg-[#FAFAFA] border-2 border-gray-300 rounded-2xl p-4 overflow-y-auto font-mono text-[10px] text-gray-800 leading-normal space-y-3.5 relative shadow-inner select-all">
                    
                    {/* Thermal POS receipt header */}
                    <div className="text-center space-y-1">
                      <span className="text-xs font-black tracking-widest uppercase block text-indigo-900">🐾 PetCare Chi Nhánh {shopId}</span>
                      <p className="text-[9px] text-gray-400 font-bold">ĐC: 12 Bến Thành, Quận 1, TP.HCM</p>
                      <p className="text-[9px] text-gray-400 font-bold">SĐT: 098.765.4321</p>
                      <span className="block border-b border-dashed border-gray-300 py-0.5"></span>
                      <span className="font-bold text-xs uppercase text-gray-900 block pt-1.5 tracking-wider">BIÊN LAI QUYẾT TOÁN DỊCH VỤ</span>
                      <span className="text-[8px] text-gray-400 block font-mono">Booking ID: {selectedBooking.id}</span>
                      <span className="text-[8px] text-gray-400 block font-mono">Date: {selectedBooking.date} · {selectedBooking.startTime}</span>
                    </div>

                    <span className="block border-b border-dashed border-gray-300 py-0.5"></span>

                    {/* Customer & Pet info */}
                    <div className="space-y-0.5 text-gray-700">
                      <div>Khách hàng: <strong className="text-gray-900">{selectedBooking.customerName}</strong></div>
                      <div>SĐT: <span className="font-bold">{selectedBooking.customerPhone}</span></div>
                      <div>Thú cưng: <strong className="text-gray-900">{selectedBooking.petName}</strong> ({selectedBooking.petBreed})</div>
                      <div>KTV phụ trách: <span className="font-bold">{selectedBooking.assignedStaffName ?? 'Chưa gán'}</span></div>
                      {selectedBooking.roomName && <div>Vị trí: <span className="font-bold text-indigo-900">{selectedBooking.roomName}</span></div>}
                    </div>

                    <span className="block border-b border-dashed border-gray-300 py-0.5"></span>

                    {/* Item list table */}
                    <table className="w-full text-left table-fixed">
                      <thead>
                        <tr className="font-bold text-gray-900 border-b border-gray-200">
                          <th className="w-8/12 py-1">Hạng mục trị liệu</th>
                          <th className="w-4/12 py-1 text-right">Chi phí</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="align-top">
                          <td className="py-1 font-bold text-gray-800">{selectedBooking.serviceName}</td>
                          <td className="py-1 text-right font-black text-indigo-900">{formatPrice(selectedBooking.price)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <span className="block border-b border-dashed border-gray-300 py-0.5"></span>

                    {/* Totals */}
                    <div className="space-y-1 text-right font-bold text-gray-750 pr-1">
                      <div className="flex justify-between text-xs text-gray-900 font-black">
                        <span>TỔNG THANH TOÁN:</span>
                        <span className="text-indigo-900 text-xs font-extrabold">{formatPrice(selectedBooking.price)}</span>
                      </div>
                    </div>

                    <span className="block border-b border-dashed border-gray-300 py-0.5"></span>

                    {/* Hologram PAID STAMP */}
                    {selectedBooking.status === 'paid' && (
                      <div className="absolute right-4 top-1/2 -translate-y-12 rotate-12 border-2 border-emerald-500 text-emerald-500 font-black tracking-widest text-[9px] uppercase px-2.5 py-1 rounded bg-white/90 shadow-sm opacity-90 animate-scaleUp select-none">
                        🐾 ĐÃ QUYẾT TOÁN
                      </div>
                    )}

                    {/* Fake Barcode */}
                    <div className="text-center pt-2 space-y-1">
                      <div className="font-mono text-gray-300 text-[16px] tracking-[6px] select-none">|||||I||I||||II|II|||I</div>
                      <p className="text-[8px] text-gray-400 text-center font-mono">Quét để kiểm tra hóa đơn quầy</p>
                    </div>

                    <div className="text-center space-y-1 text-gray-400 text-[8px] pt-1">
                      <p>Cảm ơn quý khách và bé cưng đã lựa chọn dịch vụ!</p>
                      <p className="font-mono text-gray-300 block">Powered by Antigravity POS 2.0</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 shrink-0">
                    <button 
                      onClick={() => handlePrintInvoice(selectedBooking.id)}
                      className="flex-1 btn-primary py-2.5 text-xs font-black justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1"
                    >
                      <Printer size={13} /> Thực hiện In hóa đơn
                    </button>
                    <button 
                      onClick={() => setShowBookingInvoice(false)}
                      className="btn-secondary py-2.5 text-xs font-bold justify-center rounded-2xl"
                    >
                      Quay lại chi tiết
                    </button>
                  </div>
                </div>
              ) : (
                /* --- SERVICE PROFILE READOUT & PAY FORM --- */
                <div className="flex-1 flex flex-col overflow-hidden space-y-4">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                    
                    {/* Pet Profile Details card */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                      <span className="text-[9px] font-black text-indigo-500 uppercase block tracking-wider">Hồ sơ thú cưng & Chủ nuôi</span>
                      <div className="space-y-1.5 leading-normal font-semibold text-gray-650">
                        <div>Khách hàng: <strong className="text-gray-900">{selectedBooking.customerName}</strong></div>
                        <div>Điện thoại: <span className="font-mono font-bold text-gray-900">{selectedBooking.customerPhone}</span></div>
                        <span className="block border-b my-1.5 border-dashed border-gray-200"></span>
                        <div>Tên bé cưng: <strong className="text-indigo-900">{selectedBooking.petName}</strong> (<span className="text-gray-800 font-bold">{selectedBooking.petBreed}</span>)</div>
                        {selectedBooking.assignedStaffName && (
                          <div>Kỹ thuật viên chăm sóc: <strong className="text-gray-900">{selectedBooking.assignedStaffName}</strong></div>
                        )}
                        {selectedBooking.roomName && (
                          <div>Phòng / Chuồng lưu trú: <span className="text-indigo-600 font-bold">{selectedBooking.roomName}</span></div>
                        )}
                      </div>
                    </div>

                    {/* Service detail card */}
                    <div className="bg-indigo-50/20 border border-indigo-100/50 p-4 rounded-2xl space-y-2">
                      <span className="text-[9px] font-black text-indigo-950 uppercase block tracking-wider">Dịch vụ thực hiện</span>
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-gray-900 font-extrabold text-[12px]">{selectedBooking.serviceName}</strong>
                          <span className="block text-[10px] text-gray-400 font-bold font-mono mt-0.5">{selectedBooking.date} · {selectedBooking.startTime}–{selectedBooking.endTime}</span>
                        </div>
                        <span className="text-indigo-650 font-black text-sm">{formatPrice(selectedBooking.price)}</span>
                      </div>
                    </div>

                    {/* Boarding logs / Diet card for internal audit */}
                    {selectedBooking.boardingDiet && (
                      <div className="bg-emerald-50/20 border border-emerald-100/50 p-3.5 rounded-2xl space-y-1">
                        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider block">Chế độ ăn nội trú (Boarding Diet)</span>
                        <div className="space-y-0.5 leading-normal text-gray-650 font-medium">
                          <div>Thực phẩm: {selectedBooking.boardingDiet.foodType}</div>
                          <div>Khẩu phần: {selectedBooking.boardingDiet.feedTimes} bữa/ngày · {selectedBooking.boardingDiet.portionWeight}g</div>
                          {selectedBooking.boardingDiet.allergies && (
                            <div className="text-rose-600 font-bold mt-1">Dị ứng: {selectedBooking.boardingDiet.allergies}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* KTV clinical notes */}
                    {selectedBooking.serviceNote && (
                      <div className="bg-slate-50 border rounded-2xl p-3.5 space-y-1 text-slate-700">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Ghi chú từ kỹ thuật viên:</span>
                        <p className="italic">"{selectedBooking.serviceNote}"</p>
                      </div>
                    )}

                    {/* Bill Checkout Form (Only for Unpaid service bookings) */}
                    {selectedBooking.status !== 'paid' ? (
                      <div className="bg-amber-50/30 border border-amber-255/30 rounded-3xl p-4 space-y-4">
                        <span className="text-[10px] font-black text-amber-900 uppercase block tracking-wider flex items-center gap-1.5">
                          <CreditCard size={13} /> Bảng Thu tiền & Quyết toán quầy
                        </span>

                        {/* Choose Payment Method */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">Chọn hình thức thanh toán</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'cash', label: '💵 Tiền mặt' },
                              { id: 'transfer', label: '🏦 QR Bank' },
                              { id: 'momo', label: '💳 Ví MoMo' },
                              { id: 'card', label: '🏧 Quẹt thẻ POS' }
                            ].map(pm => (
                              <button
                                key={pm.id}
                                onClick={() => setSvcPayMethod(pm.id as any)}
                                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                  svcPayMethod === pm.id 
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm' 
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                {pm.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Promo Voucher input */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">Áp dụng Voucher</label>
                          <div className="flex gap-2">
                            <input
                              className="form-input text-xs py-2 px-3 rounded-xl bg-white border-gray-200 flex-1"
                              placeholder="Nhập mã voucher (PETCARE10...)"
                              value={svcVoucherCode}
                              onChange={e => setSvcVoucherCode(e.target.value)}
                            />
                            <button
                              onClick={() => applyVoucherPromo(svcVoucherCode, selectedBooking.price, 'service')}
                              className="py-2 px-4 bg-gray-800 hover:bg-gray-900 text-white text-xs font-black rounded-xl"
                            >
                              Áp dụng
                            </button>
                          </div>
                          {svcVoucherApplied && (
                            <div className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 mt-1 bg-emerald-50 p-2 rounded-lg animate-fadeIn border border-emerald-200/50">
                              <Sparkles size={11} /> Áp dụng thành công Voucher: {svcVoucherApplied.code} (Giảm {formatPrice(svcVoucherApplied.discount)})
                            </div>
                          )}
                          {svcVoucherError && (
                            <div className="text-[10px] text-rose-500 font-bold mt-1 block">
                              ⚠️ {svcVoucherError}
                            </div>
                          )}
                        </div>

                        {/* Total check bill summary */}
                        <div className="bg-white border rounded-2xl p-3 flex justify-between items-center text-xs font-extrabold">
                          <span className="text-gray-500">Phải thanh toán:</span>
                          <strong className="text-[15px] font-black text-indigo-700">
                            {formatPrice(Math.max(0, selectedBooking.price - (svcVoucherApplied?.discount ?? 0)))}
                          </strong>
                        </div>

                        {/* Complete Checkout Action */}
                        <button
                          onClick={() => handleServiceBookingPayment(selectedBooking.id)}
                          className="w-full btn-primary py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs justify-center flex items-center gap-2 shadow"
                        >
                          <CheckCircle size={14} /> Xác nhận Quyết toán hóa đơn
                        </button>
                      </div>
                    ) : null}

                  </div>

                  <div className="flex gap-2 pt-3 border-t shrink-0">
                    {selectedBooking.status === 'paid' && (
                      <button 
                        onClick={() => setShowBookingInvoice(true)}
                        className="flex-1 btn-primary py-2.5 text-xs font-black justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow"
                      >
                        <Printer size={13} /> In hóa đơn nhiệt
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedBooking(null)}
                      className="btn-secondary py-2.5 text-xs font-bold justify-center rounded-2xl"
                    >
                      Đóng bảng
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* --- PREMIUM WALK-IN POS CASH REGISTER DRAWER (SLIDING DRAWERS - NO MODALS) --- */}
      {showPOSDrawer && (
        <div className="fixed inset-y-0 right-0 w-full lg:w-[650px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col justify-between animate-slideIn">
          
          {/* POS Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50/20 shrink-0">
            <div>
              <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
                🛒 Tạo đơn hàng bán lẻ tại quầy
              </h2>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5">Đối soát và trừ kho vật lý trực tiếp khi khách thanh toán</p>
            </div>
            <button 
              onClick={() => {
                setShowPOSDrawer(false)
                setPosCart([])
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* POS Layout split (Left: SKU search, Right: Cart info) */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* POS Left: SKU Listing & Search */}
            <div className="w-full lg:w-7/12 border-r border-gray-100 p-4 overflow-y-auto space-y-4 flex flex-col h-1/2 lg:h-full">
              
              {/* SKU search */}
              <div className="relative shrink-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  className="form-input text-xs pl-9 rounded-xl py-2 w-full border-gray-200 bg-slate-50 focus:bg-white" 
                  placeholder="Gõ tên sản phẩm, thương hiệu hoặc SKU code..."
                  value={posSearchProduct}
                  onChange={e => setPosSearchProduct(e.target.value)}
                />
              </div>

              {/* SKU Grid */}
              <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Kết quả tìm kiếm sản phẩm</span>
                {filteredPOSSKUs.map(sku => {
                  const isCartItem = posCart.find(c => c.skuId === sku.uniqueId)
                  return (
                    <div 
                      key={sku.uniqueId}
                      onClick={() => handleAddSKUToCart(sku)}
                      className={`group p-2.5 rounded-xl border border-gray-100 bg-white hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer flex items-center gap-3 relative ${sku.stock === 0 ? 'opacity-60 bg-slate-50' : ''}`}
                    >
                      <img src={sku.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-extrabold text-gray-800 truncate group-hover:text-indigo-750 transition-colors">{sku.productName}</div>
                        <div className="text-[9px] text-gray-400 font-bold mt-0.5">Biến thể: {sku.variantLabel}</div>
                        <div className="text-[8px] text-indigo-500 font-mono mt-0.5">SKU: {sku.sku}</div>
                      </div>

                      <div className="text-right shrink-0">
                        <strong className="text-[11px] text-gray-800 font-black block">{formatPrice(sku.price)}</strong>
                        <span className={`text-[9px] font-bold block mt-0.5 ${sku.stock <= 5 ? 'text-rose-500 font-black' : 'text-gray-400'}`}>
                          Kho: {sku.stock}
                        </span>
                      </div>

                      {/* Cart badge index indicator */}
                      {isCartItem && (
                        <div className="absolute top-1 right-1 bg-indigo-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold">
                          {isCartItem.quantity}
                        </div>
                      )}
                    </div>
                  )
                })}

                {filteredPOSSKUs.length === 0 && (
                  <div className="p-8 text-center text-gray-400">
                    <AlertCircle size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-xs font-bold">Không tìm thấy sản phẩm/SKU tương ứng</p>
                  </div>
                )}
              </div>
            </div>

            {/* POS Right: Checkout profile and Cart lines */}
            <div className="w-full lg:w-5/12 p-4 overflow-y-auto bg-slate-50/50 flex flex-col justify-between h-1/2 lg:h-full space-y-4">
              
              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                {/* Cust Info forms */}
                <div className="bg-white border rounded-2xl p-3 space-y-2.5 shadow-sm shrink-0">
                  <span className="text-[9px] font-black text-indigo-500 uppercase block tracking-wider">Thông tin khách hàng quầy</span>
                  
                  <input
                    className="form-input text-xs py-1.5 px-3 rounded-xl border-gray-100"
                    placeholder="Tên khách hàng (Mặc định: Khách vãng lai)"
                    value={posCustomerName}
                    onChange={e => setPosCustomerName(e.target.value)}
                  />
                  
                  <input
                    className="form-input text-xs py-1.5 px-3 rounded-xl border-gray-100 font-mono"
                    placeholder="Số điện thoại khách hàng"
                    value={posCustomerPhone}
                    onChange={e => setPosCustomerPhone(e.target.value)}
                  />
                </div>

                {/* Cart Items listing */}
                <div className="flex-1 flex flex-col overflow-hidden space-y-2">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block shrink-0">Giỏ hàng thanh toán ({posCart.length})</span>
                  
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {posCart.map(line => (
                      <div key={line.skuId} className="bg-white border rounded-xl p-2.5 flex justify-between items-center shadow-xs">
                        <div className="min-w-0 flex-1">
                          <strong className="text-[10px] text-gray-805 font-extrabold truncate block">{line.productName}</strong>
                          <span className="text-[8px] text-gray-400 block mt-0.5">{line.variantLabel}</span>
                          <span className="text-[9px] text-indigo-655 font-black block mt-0.5">{formatPrice(line.price)}</span>
                        </div>

                        {/* Adjust quantities */}
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          <div className="flex items-center border border-gray-100 rounded-lg">
                            <button 
                              onClick={() => handleAdjustCartQty(line.skuId, -1)}
                              className="px-1.5 py-1 text-gray-400 hover:bg-gray-50 text-[10px]"
                            >
                              −
                            </button>
                            <span className="px-1.5 text-[9px] font-extrabold text-gray-800 font-mono">{line.quantity}</span>
                            <button 
                              onClick={() => handleAdjustCartQty(line.skuId, 1)}
                              className="px-1.5 py-1 text-gray-400 hover:bg-gray-50 text-[10px]"
                            >
                              +
                            </button>
                          </div>
                          <button 
                            onClick={() => handleAdjustCartQty(line.skuId, -line.quantity)}
                            className="text-gray-300 hover:text-rose-500 transition-colors p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {posCart.length === 0 && (
                      <div className="p-8 text-center text-gray-400 border border-dashed rounded-2xl bg-white">
                        <ShoppingBag size={24} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-xs font-bold">Chưa chọn mặt hàng nào</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkout forms */}
                <div className="bg-white border rounded-2xl p-3 space-y-3.5 shadow-sm shrink-0">
                  {/* Payment selection */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase block">Hình thức thanh toán</label>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                      {[
                        { id: 'cash', label: '💵 Tiền mặt' },
                        { id: 'transfer', label: '🏦 QR Bank' },
                        { id: 'momo', label: '💳 Ví MoMo' },
                        { id: 'card', label: '🏧 Thẻ POS' }
                      ].map(pm => (
                        <button
                          key={pm.id}
                          onClick={() => setPosPayMethod(pm.id as any)}
                          className={`py-1.5 rounded-lg border text-center transition-all ${
                            posPayMethod === pm.id 
                              ? 'bg-indigo-650 text-white border-indigo-655 shadow-xs' 
                              : 'bg-white text-gray-700 border-gray-150 hover:bg-gray-50'
                          }`}
                        >
                          {pm.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Voucher code */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase block">Voucher tại quầy</label>
                    <div className="flex gap-2">
                      <input
                        className="form-input text-xs py-1.5 px-3 rounded-lg border-gray-150 flex-1"
                        placeholder="Mã voucher..."
                        value={voucherCode}
                        onChange={e => setVoucherCode(e.target.value)}
                      />
                      <button
                        onClick={() => applyVoucherPromo(voucherCode, posSubtotal, 'retail')}
                        className="py-1.5 px-3.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-black rounded-lg"
                      >
                        Áp dụng
                      </button>
                    </div>
                    {voucherApplied && (
                      <div className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1 mt-1 bg-emerald-50 p-2 rounded-lg border border-emerald-250/20">
                        <Sparkles size={11} /> Giảm: {formatPrice(voucherApplied.discount)} (Mã: {voucherApplied.code})
                      </div>
                    )}
                    {voucherError && (
                      <div className="text-[9px] text-rose-500 font-bold mt-1 block">
                        ⚠️ {voucherError}
                      </div>
                    )}
                  </div>

                  {/* Note */}
                  <input
                    className="form-input text-xs py-1.5 px-3 rounded-lg border-gray-100"
                    placeholder="Ghi chú đơn hàng (nếu có)..."
                    value={posNote}
                    onChange={e => setPosNote(e.target.value)}
                  />
                </div>
              </div>

              {/* Aggregation pricing and Submit */}
              <div className="bg-indigo-900 text-white p-4 rounded-3xl space-y-3.5 shadow-lg shrink-0">
                <div className="space-y-1 font-bold text-[10px] text-indigo-200">
                  <div className="flex justify-between">
                    <span>Cộng tiền hàng:</span>
                    <span>{formatPrice(posSubtotal)}</span>
                  </div>
                  {posDiscountAmount > 0 && (
                    <div className="flex justify-between text-rose-300">
                      <span>Voucher giảm giá:</span>
                      <span>-{formatPrice(posDiscountAmount)}</span>
                    </div>
                  )}
                  <span className="block border-b border-indigo-800/40 my-1"></span>
                  <div className="flex justify-between text-xs text-white font-black">
                    <span>TỔNG THANH TOÁN:</span>
                    <strong className="text-emerald-400 text-sm font-extrabold">{formatPrice(posTotal)}</strong>
                  </div>
                </div>

                <button
                  onClick={handlePOSCheckout}
                  disabled={posCart.length === 0}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400/50 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow transition-all hover:scale-102"
                >
                  <CheckCircle size={13} /> Tạo & Quyết toán đơn hàng
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Background Dim overlay when POS drawer is active */}
      {showPOSDrawer && (
        <div 
          onClick={() => {
            setShowPOSDrawer(false)
            setPosCart([])
          }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 animate-fadeIn"
        />
      )}

    </div>
  )
}
