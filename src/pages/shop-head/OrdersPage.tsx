import { useState } from 'react'
import { 
  Package, X, FileText, Printer, CheckCircle, Search, Calendar, 
  User, DollarSign, Tag, ShoppingBag, Landmark, CreditCard, 
  ChevronRight, ArrowRight, ShieldCheck, BarChart3, AlertCircle
} from 'lucide-react'
import { ORDER_MOCK_LIST, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, saveOrders } from '@/data/orderMockData'
import { BOOKING_MOCK_LIST } from '@/data/bookingMockData'
import { useAuthContext } from '@/auth/AuthContext'
import { formatPrice } from '@/utils/format'
import type { Order, Booking, OrderStatus } from '@/types'

export default function ShopHeadOrdersPage() {
  const { currentUser } = useAuthContext()
  const shopId = currentUser?.shopId ?? 'SH01'

  // Reactive DB states
  const [orders, setOrders] = useState<Order[]>(() => ORDER_MOCK_LIST)
  const [tab, setTab] = useState<'orders' | 'paid_services'>('orders')

  // Search & success alert
  const [searchQuery, setSearchQuery] = useState('')
  const [successAlert, setSuccessAlert] = useState('')

  // Detailed selected drawers
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Invoice Receipt Print Preview states
  const [showOrderInvoice, setShowOrderInvoice] = useState(false)
  const [showBookingInvoice, setShowBookingInvoice] = useState(false)

  // Order status updating
  const [editStatus, setEditStatus] = useState<OrderStatus>('pending')

  // Filtered lists
  const shopOrders = orders
    .filter(o => o.shopId === shopId)
    .filter(o => 
      !searchQuery || 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery)
    )

  const paidServices = BOOKING_MOCK_LIST
    .filter(b => b.shopId === shopId && b.status === 'paid')
    .filter(b =>
      !searchQuery ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerPhone.includes(searchQuery)
    )

  // Financial Stats
  const revenueFromOrders = shopOrders.filter(o => o.status === 'paid' || o.status === 'delivered').reduce((s, o) => s + o.total, 0)
  const revenueFromServices = paidServices.reduce((s, b) => s + b.price, 0)
  const totalRevenue = revenueFromOrders + revenueFromServices

  // Handle Order Status updating
  function handleUpdateOrderStatus(orderId: string) {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: editStatus }
      }
      return o
    })

    setOrders(updated)
    saveOrders(updated)

    // Sync selectedOrder reference
    const fresh = updated.find(o => o.id === orderId)
    if (fresh) setSelectedOrder(fresh)

    setSuccessAlert(`Đã cập nhật trạng thái đơn hàng "${orderId}" thành công!`)
    setTimeout(() => setSuccessAlert(''), 3000)
  }

  // Handle Mock Invoice Printing
  function handlePrintInvoice(id: string) {
    setSuccessAlert(`🖨️ Đã gửi lệnh in nhiệt hóa đơn "${id}" đến máy in quầy thu ngân thành công!`)
    setTimeout(() => setSuccessAlert(''), 4000)
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Doanh thu & Đơn hàng quầy</h1>
          <p className="text-sm text-gray-500">Đối soát hóa đơn bán lẻ và doanh thu dịch vụ chi nhánh {shopId}</p>
        </div>
        
        {/* Total revenue banner */}
        <div className="bg-indigo-900 text-white px-5 py-3 rounded-2xl flex items-center gap-3.5 shadow-md shadow-indigo-150 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-y-2 translate-x-2 shrink-0">
            <BarChart3 size={72} />
          </div>
          <div>
            <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Tổng Doanh thu Chi nhánh</div>
            <strong className="text-lg font-black text-emerald-400">{formatPrice(totalRevenue)}</strong>
          </div>
        </div>
      </div>

      {/* Success alert banner */}
      {successAlert && (
        <div className="bg-emerald-50 border border-emerald-250/30 text-emerald-800 rounded-2xl p-4 flex items-center gap-2 text-sm font-extrabold animate-pulse">
          <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
          <span>{successAlert}</span>
        </div>
      )}

      {/* Financial stats summary blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Doanh thu sản phẩm (Bán lẻ)', value: formatPrice(revenueFromOrders), color: 'text-indigo-650' },
          { label: 'Doanh thu dịch vụ (Spa/Nội trú)', value: formatPrice(revenueFromServices), color: 'text-emerald-600' },
          { label: 'Số đơn bán lẻ', value: shopOrders.length, color: 'text-blue-600' },
          { label: 'Lịch dịch vụ đã quyết toán', value: paidServices.length, color: 'text-purple-600' }
        ].map(m => (
          <div key={m.label} className="card p-4 rounded-2xl border border-gray-150 shadow-sm bg-white">
            <div className={`text-lg font-black ${m.color}`}>{m.value}</div>
            <div className="text-xs text-gray-400 font-bold mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Filter and Tab Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/50 p-3 rounded-2xl border border-gray-150">
        
        {/* Switch tab buttons */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl shrink-0">
          <button 
            onClick={() => { setTab('orders'); setSelectedOrder(null); setSelectedBooking(null); setShowOrderInvoice(false); setShowBookingInvoice(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              tab === 'orders' ? 'bg-white shadow text-indigo-750' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShoppingBag size={13} /> Đơn hàng sản phẩm ({shopOrders.length})
          </button>
          
          <button 
            onClick={() => { setTab('paid_services'); setSelectedOrder(null); setSelectedBooking(null); setShowOrderInvoice(false); setShowBookingInvoice(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              tab === 'paid_services' ? 'bg-white shadow text-indigo-750' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Package size={13} /> Dịch vụ đã thanh toán ({paidServices.length})
          </button>
        </div>

        {/* Search Input bar */}
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            className="form-input pl-9 text-sm rounded-xl" 
            placeholder={tab === 'orders' ? "Tìm mã đơn, tên chủ, số điện thoại..." : "Tìm mã, tên thú cưng, chủ nuôi..."} 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* MAIN DATA LISTING */}
        <div className="flex-1 w-full">
          {tab === 'orders' ? (
            <div className="card overflow-x-auto rounded-3xl border border-gray-150 shadow-sm bg-white">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider select-none">
                  <tr>
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-4 py-3">Khách hàng / SĐT</th>
                    <th className="px-4 py-3">Sản phẩm</th>
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
                        <div className="text-gray-400 text-[10px] mt-0.5">Đặt lúc: {o.createdAt}</div>
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
            // Tab 2: Paid Services list
            <div className="card overflow-x-auto rounded-3xl border border-gray-150 shadow-sm bg-white">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider select-none">
                  <tr>
                    <th className="px-4 py-3">Mã lịch</th>
                    <th className="px-4 py-3">Thú cưng / Chủ</th>
                    <th className="px-4 py-3">Dịch vụ</th>
                    <th className="px-4 py-3 font-mono text-center">Thời gian</th>
                    <th className="px-4 py-3 text-center">Phục vụ</th>
                    <th className="px-4 py-3 text-right">Doanh thu</th>
                    <th className="px-4 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-650">
                  {paidServices.map(b => (
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
                      <td className="px-4 py-3.5 text-right font-black text-emerald-600 text-[13px]">{formatPrice(b.price)}</td>
                      <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => {
                            setSelectedBooking(b)
                            setShowBookingInvoice(false)
                            setSelectedOrder(null)
                          }}
                          className="text-[10px] font-black text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-xl shadow-sm"
                        >
                          Hóa đơn dịch vụ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {paidServices.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                  <Package size={36} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-bold">Chưa ghi nhận ca dịch vụ nào hoàn thành thanh toán</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- DYNAMIC SLIDING DRAWER FOR ORDER DETAIL --- */}
        {selectedOrder && (
          <div className="w-full lg:w-96 shrink-0 bg-white rounded-3xl border border-gray-200 p-5 shadow-lg animate-slideIn flex flex-col justify-between space-y-4">
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
                <div>
                  <h2 className="text-sm font-black text-gray-800">
                    Chi tiết đơn hàng
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold font-mono mt-0.5">
                    Mã đơn: {selectedOrder.id}
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
                /* --- thermal CASH RECEIPT PRINT PREVIEW --- */
                <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
                  <div className="flex-1 bg-slate-50 border border-gray-250 rounded-2xl p-4 overflow-y-auto font-mono text-[10px] text-gray-800 leading-normal space-y-3.5 relative shadow-inner">
                    
                    {/* Thermal POS receipt header */}
                    <div className="text-center space-y-1">
                      <span className="text-xs font-black tracking-widest uppercase block text-indigo-900">🐾 PetCare Chi Nhánh {shopId}</span>
                      <p className="text-[9px] text-gray-400 font-bold">ĐC: 12 Bến Thành, Quận 1, TP.HCM</p>
                      <p className="text-[9px] text-gray-400 font-bold">SĐT: 098.765.4321</p>
                      <span className="block border-b border-dashed border-gray-300 py-0.5"></span>
                      <span className="font-bold text-xs uppercase text-gray-900 block pt-1.5">HÓA ĐƠN RETAIL SẢN PHẨM</span>
                      <span className="text-[8px] text-gray-400 block font-mono">Invoice ID: {selectedOrder.id}</span>
                      <span className="text-[8px] text-gray-400 block font-mono">Date: {selectedOrder.createdAt}</span>
                    </div>

                    <span className="block border-b border-dashed border-gray-300 py-0.5"></span>

                    {/* Customer info */}
                    <div className="space-y-0.5 text-gray-700">
                      <div>Khách hàng: <strong className="text-gray-900">{selectedOrder.customerName}</strong></div>
                      <div>SĐT: <span className="font-bold">{selectedOrder.customerPhone}</span></div>
                      <div>HTTT: <span className="uppercase font-bold">{selectedOrder.paymentMethod}</span></div>
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
                        <span className="text-indigo-900 text-sm font-extrabold">{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>

                    <span className="block border-b border-dashed border-gray-300 py-0.5"></span>

                    {/* Footer receipt */}
                    <div className="text-center space-y-1 text-gray-400 text-[8px] pt-1">
                      <p>Cảm ơn quý khách và Pet cưng đã lựa chọn PetCare!</p>
                      <p>Vui lòng kiểm tra lại hóa đơn trước khi rời quầy.</p>
                      <p className="font-mono text-gray-300 mt-2 block">Powered by Antigravity POS</p>
                    </div>

                  </div>

                  <div className="flex gap-2 pt-3 shrink-0">
                    <button 
                      onClick={() => handlePrintInvoice(selectedOrder.id)}
                      className="flex-1 btn-primary py-2.5 text-xs font-black justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1"
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
                /* --- GENERAL ORDER DETAILS READOUT --- */
                <div className="flex-1 flex flex-col overflow-hidden space-y-4">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                    
                    {/* Customer Info Card */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                      <span className="text-[9px] font-black text-indigo-500 uppercase block tracking-wider">Khách hàng đặt mua</span>
                      <div className="space-y-1 leading-normal font-semibold text-gray-650">
                        <div>Họ tên: <strong className="text-gray-900">{selectedOrder.customerName}</strong></div>
                        <div>Số điện thoại: <span className="font-mono font-bold text-gray-900">{selectedOrder.customerPhone}</span></div>
                        {selectedOrder.shippingAddress && (
                          <div>Địa chỉ nhận hàng: <span className="text-gray-700 font-bold">{selectedOrder.shippingAddress}</span></div>
                        )}
                        {selectedOrder.note && (
                          <div className="text-orange-700 font-medium italic mt-1">Lưu ý: "{selectedOrder.note}"</div>
                        )}
                      </div>
                    </div>

                    {/* Purchased items list */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Các sản phẩm đã chọn</span>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="bg-white border rounded-xl p-3 flex justify-between items-center shadow-sm">
                            <div>
                              <strong className="text-gray-900 font-extrabold text-[12px]">{item.productName}</strong>
                              <span className="block text-[10px] text-gray-400 font-bold mt-0.5">{item.variantLabel}</span>
                              <span className="block text-[9px] text-gray-400 font-mono mt-0.5">Code: {item.skuCode}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-800 font-extrabold">{item.quantity} x {formatPrice(item.unitPrice)}</span>
                              <span className="block text-indigo-650 font-black text-xs mt-0.5">{formatPrice(item.subtotal)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals Invoice Box */}
                    <div className="bg-slate-50 border rounded-2xl p-4 text-[11px] font-semibold text-gray-600 space-y-1.5 shadow-sm">
                      <div className="flex justify-between">
                        <span>Cộng tiền hàng:</span>
                        <strong className="text-gray-800 font-black">{formatPrice(selectedOrder.subtotal)}</strong>
                      </div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-rose-600">
                          <span>Giảm giá Voucher:</span>
                          <strong className="font-black">-{formatPrice(selectedOrder.discountAmount)}</strong>
                        </div>
                      )}
                      <span className="block border-b border-gray-200 my-1"></span>
                      <div className="flex justify-between text-xs text-gray-950 font-black">
                        <span>TỔNG THANH TOÁN:</span>
                        <strong className="text-indigo-700 text-sm font-extrabold">{formatPrice(selectedOrder.total)}</strong>
                      </div>
                    </div>

                    {/* Payment methods and Order states */}
                    <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold text-gray-700">
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border">
                        <span className="text-[9px] font-extrabold text-gray-400 block uppercase mb-1">Phương thức</span>
                        <span className="uppercase font-black text-indigo-850 block">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border">
                        <span className="text-[9px] font-extrabold text-gray-400 block uppercase mb-1">Thời gian đặt</span>
                        <span className="font-bold text-gray-900 block font-mono text-[10px]">{selectedOrder.createdAt}</span>
                      </div>
                    </div>

                    {/* Manage Order status inline */}
                    <div className="bg-slate-50/40 border border-gray-150 p-4 rounded-3xl space-y-2">
                      <span className="text-[9px] font-black text-indigo-900 uppercase block tracking-wider flex items-center gap-1"><AlertCircle size={12} /> Cập nhật trạng thái đơn hàng</span>
                      
                      <div className="flex gap-2">
                        <select 
                          className="form-input text-xs py-1.5 px-3 rounded-xl bg-white focus:border-indigo-500 flex-1"
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value as OrderStatus)}
                        >
                          {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => (
                            <option key={status} value={status}>{label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id)}
                          className="btn-primary py-1.5 px-4 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>

                  </div>

                  <div className="flex gap-2 pt-3 border-t shrink-0">
                    <button 
                      onClick={() => setShowOrderInvoice(true)}
                      className="flex-1 btn-primary py-2.5 text-xs font-black justify-center rounded-2xl bg-indigo-650 hover:bg-indigo-750 text-white flex items-center gap-1.5 shadow"
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

        {/* --- DYNAMIC SLIDING DRAWER FOR PAID SERVICE DETAIL --- */}
        {selectedBooking && (
          <div className="w-full lg:w-96 shrink-0 bg-white rounded-3xl border border-gray-200 p-5 shadow-lg animate-slideIn flex flex-col justify-between space-y-4">
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
                <div>
                  <h2 className="text-sm font-black text-gray-800">
                    Hóa đơn quyết toán dịch vụ
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold font-mono mt-0.5">
                    Mã booking: {selectedBooking.id}
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
                /* --- thermal SERVICE CASH RECEIPT PRINT PREVIEW --- */
                <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
                  <div className="flex-1 bg-slate-50 border border-gray-250 rounded-2xl p-4 overflow-y-auto font-mono text-[10px] text-gray-800 leading-normal space-y-3.5 relative shadow-inner">
                    
                    {/* Thermal POS receipt header */}
                    <div className="text-center space-y-1">
                      <span className="text-xs font-black tracking-widest uppercase block text-indigo-900">🐾 PetCare Chi Nhánh {shopId}</span>
                      <p className="text-[9px] text-gray-400 font-bold">ĐC: 12 Bến Thành, Quận 1, TP.HCM</p>
                      <p className="text-[9px] text-gray-400 font-bold">SĐT: 098.765.4321</p>
                      <span className="block border-b border-dashed border-gray-300 py-0.5"></span>
                      <span className="font-bold text-xs uppercase text-gray-900 block pt-1.5">HÓA ĐƠN QUYẾT TOÁN DỊCH VỤ</span>
                      <span className="text-[8px] text-gray-400 block font-mono">Booking ID: {selectedBooking.id}</span>
                      <span className="text-[8px] text-gray-400 block font-mono">Date: {selectedBooking.date} · {selectedBooking.startTime}</span>
                    </div>

                    <span className="block border-b border-dashed border-gray-300 py-0.5"></span>

                    {/* Customer & Pet info */}
                    <div className="space-y-0.5 text-gray-700">
                      <div>Chủ nuôi: <strong className="text-gray-900">{selectedBooking.customerName}</strong></div>
                      <div>SĐT: <span className="font-bold">{selectedBooking.customerPhone}</span></div>
                      <div>Thú cưng: <strong className="text-gray-900">{selectedBooking.petName}</strong> ({selectedBooking.petBreed})</div>
                      <div>Phụ trách KTV: <span className="font-bold">{selectedBooking.assignedStaffName ?? '—'}</span></div>
                      {selectedBooking.roomName && <div>Vị trí phòng: <span className="font-bold">{selectedBooking.roomName}</span></div>}
                    </div>

                    <span className="block border-b border-dashed border-gray-300 py-0.5"></span>

                    {/* Item list table */}
                    <table className="w-full text-left table-fixed">
                      <thead>
                        <tr className="font-bold text-gray-900 border-b border-gray-200">
                          <th className="w-8/12 py-1">Hạng mục dịch vụ</th>
                          <th className="w-4/12 py-1 text-right">Tổng tiền</th>
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
                        <span>TỔNG CỘNG DỊCH VỤ:</span>
                        <span className="text-indigo-900 text-sm font-extrabold">{formatPrice(selectedBooking.price)}</span>
                      </div>
                    </div>

                    <span className="block border-b border-dashed border-gray-300 py-0.5"></span>

                    {/* Footer receipt */}
                    <div className="text-center space-y-1 text-gray-400 text-[8px] pt-1">
                      <p>Cảm ơn quý khách và Pet cưng đã lựa chọn PetCare!</p>
                      <p>Quy trình kiểm tra thú cưng lâm sàng hoàn tất.</p>
                      <p className="font-mono text-gray-300 mt-2 block">Powered by Antigravity POS</p>
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
                /* --- GENERAL SERVICE DETAILS READOUT --- */
                <div className="flex-1 flex flex-col overflow-hidden space-y-4">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                    
                    {/* Pet & Owner Info Card */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                      <span className="text-[9px] font-black text-indigo-500 uppercase block tracking-wider">Hồ sơ ca quyết toán</span>
                      <div className="space-y-1.5 leading-normal font-semibold text-gray-650">
                        <div>Chủ nuôi: <strong className="text-gray-900">{selectedBooking.customerName}</strong></div>
                        <div>SĐT: <span className="font-mono font-bold text-gray-900">{selectedBooking.customerPhone}</span></div>
                        <span className="block border-b my-1.5 border-dashed"></span>
                        <div>Thú cưng: <strong className="text-indigo-900">{selectedBooking.petName}</strong> (<span className="text-gray-800 font-bold">{selectedBooking.petBreed}</span>)</div>
                        {selectedBooking.assignedStaffName && (
                          <div>Kỹ thuật viên gán: <strong className="text-gray-900">{selectedBooking.assignedStaffName}</strong></div>
                        )}
                        {selectedBooking.roomName && (
                          <div>Phòng / Chuồng: <span className="text-indigo-600 font-bold">{selectedBooking.roomName}</span></div>
                        )}
                      </div>
                    </div>

                    {/* Booking timing and service detail */}
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

                    {/* Service result note if present */}
                    {selectedBooking.serviceNote && (
                      <div className="bg-slate-50 border rounded-2xl p-3.5 space-y-1 text-slate-700">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Ghi chú lâm sàng từ KTV:</span>
                        <p className="italic">"{selectedBooking.serviceNote}"</p>
                      </div>
                    )}

                    {/* Diagnostic notes during checkin */}
                    {selectedBooking.checkinNote && (
                      <div className="bg-slate-50 border rounded-2xl p-3.5 space-y-1 text-slate-700">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Ghi chú check-in tiếp đón:</span>
                        <p className="italic">"{selectedBooking.checkinNote}"</p>
                      </div>
                    )}

                  </div>

                  <div className="flex gap-2 pt-3 border-t shrink-0">
                    <button 
                      onClick={() => setShowBookingInvoice(true)}
                      className="flex-1 btn-primary py-2.5 text-xs font-black justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow"
                    >
                      <Printer size={13} /> Hóa đơn in nhiệt
                    </button>
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

    </div>
  )
}
