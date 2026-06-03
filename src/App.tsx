import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'

import CustomerLayout from './layouts/CustomerLayout'
import OperationLayout from './layouts/OperationLayout'
import PetCareLayout from './layouts/PetCareLayout'
import ShopHeadLayout from './layouts/ShopHeadLayout'
import AdminLayout from './layouts/AdminLayout'
import WarehouseLayout from './layouts/WarehouseLayout'

import LoginPage from './pages/auth/LoginPage'

// Customer
import CustomerHomePage from './pages/customer/HomePage'
import ProductListPage from './pages/customer/ProductListPage'
import ProductDetailPage from './pages/customer/ProductDetailPage'
import ServiceListPage from './pages/customer/ServiceListPage'
import ServiceDetailPage from './pages/customer/ServiceDetailPage'
import BookingWizardPage from './pages/customer/BookingWizardPage'
import MyBookingsPage from './pages/customer/MyBookingsPage'
import BookingDetailPage from './pages/customer/BookingDetailPage'
import PetProfilePage from './pages/customer/PetProfilePage'
import CartPage from './pages/customer/CartPage'
import OrderListPage from './pages/customer/OrderListPage'
import OrderDetailPage from './pages/customer/OrderDetailPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import NotificationsPage from './pages/customer/NotificationsPage'
import ProfilePage from './pages/customer/ProfilePage'

// Operation
import OperationDashboardPage from './pages/operation/DashboardPage'
import QueuePage from './pages/operation/QueuePage'
import CalendarPage from './pages/operation/CalendarPage'
import OperationMySchedulePage from './pages/operation/MySchedulePage'
import CheckinPage from './pages/operation/CheckinPage'
import CheckoutCounterPage from './pages/operation/CheckoutCounterPage'
import WalkInOrdersPage from './pages/operation/WalkInOrdersPage'

// PetCare
import PetCareTodayPage from './pages/petcare/TodayPage'
import BookingWorkPage from './pages/petcare/BookingWorkPage'
import PetCareMySchedulePage from './pages/petcare/MySchedulePage'
import PetHistoryPage from './pages/petcare/PetHistoryPage'

// Shop Head
import ShopHeadDashboardPage from './pages/shop-head/DashboardPage'
import StaffPage from './pages/shop-head/StaffPage'
import ShopHeadStaffFormPage from './pages/shop-head/StaffFormPage'
import SchedulePage from './pages/shop-head/SchedulePage'
import LeaveRequestsPage from './pages/shop-head/LeaveRequestsPage'
import RoomsPage from './pages/shop-head/RoomsPage'
import ShopHeadReportsPage from './pages/shop-head/ReportsPage'
import ShopHeadBookingsPage from './pages/shop-head/BookingsPage'
import ShopHeadProductsPage from './pages/shop-head/ProductsPage'
import ShopHeadOrdersPage from './pages/shop-head/OrdersPage'
import ShopHeadVouchersPage from './pages/shop-head/VouchersPage'
import ShopHeadBookingDetailPage from './pages/shop-head/BookingDetailPage'
import ShopHeadVoucherFormPage from './pages/shop-head/VoucherFormPage'

// Admin
import AdminDashboardPage from './pages/admin/DashboardPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import RolesPage from './pages/admin/RolesPage'
import AdminProductManagementPage from './pages/admin/ProductManagementPage'
import AdminProductFormPage from './pages/admin/ProductFormPage'
import CategoryManagementPage from './pages/admin/CategoryManagementPage'
import AdminReportsPage from './pages/admin/ReportsPage'
import ServiceManagementPage from './pages/admin/ServiceManagementPage'
import ServiceFormPage from './pages/admin/ServiceFormPage'
import ShopsPage from './pages/admin/ShopsPage'
import BookingManagementPage from './pages/admin/BookingManagementPage'
import AdminBookingDetailPage from './pages/admin/BookingDetailPage'
import BookingFormPage from './pages/admin/BookingFormPage'
import AdminInventoryPage from './pages/admin/InventoryPage'
import InventoryAdjustmentPage from './pages/admin/InventoryAdjustmentPage'
import AdminVouchersPage from './pages/admin/VouchersPage'
import VoucherFormPage from './pages/admin/VoucherFormPage'
import PromotionsPage from './pages/admin/PromotionsPage'
import AIBreedPage from './pages/admin/AIBreedPage'
import AIChatbotPage from './pages/admin/AIChatbotPage'
import SystemSettingsPage from './pages/admin/SettingsPage'

// Warehouse
import WarehouseDashboardPage from './pages/warehouse/DashboardPage'
import StockInPage from './pages/warehouse/StockInPage'
import StockOutPage from './pages/warehouse/StockOutPage'
import TransfersPage from './pages/warehouse/TransfersPage'
import TransferDetailPage from './pages/warehouse/TransferDetailPage'
import HistoryPage from './pages/warehouse/HistoryPage'
import SuppliersPage from './pages/warehouse/SuppliersPage'
import WarehouseReportsPage from './pages/warehouse/WarehouseReportsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ── Customer Portal ── */}
        <Route path="/customer" element={
          <ProtectedRoute allowedRole="customer"><CustomerLayout /></ProtectedRoute>
        }>
          <Route index element={<CustomerHomePage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="services" element={<ServiceListPage />} />
          <Route path="services/:id" element={<ServiceDetailPage />} />
          <Route path="booking" element={<BookingWizardPage />} />
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="my-pets" element={<PetProfilePage />} />
          <Route path="my-pets/:id" element={<PetProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* ── Operation Staff Portal ── */}
        <Route path="/operation" element={
          <ProtectedRoute allowedRole="operation_staff"><OperationLayout /></ProtectedRoute>
        }>
          <Route index element={<OperationDashboardPage />} />
          <Route path="queue" element={<QueuePage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="checkin" element={<CheckinPage />} />
          <Route path="checkout" element={<CheckoutCounterPage />} />
          <Route path="orders" element={<WalkInOrdersPage />} />
          <Route path="my-schedule" element={<OperationMySchedulePage />} />
        </Route>

        {/* ── Pet Care Staff Portal ── */}
        <Route path="/petcare" element={
          <ProtectedRoute allowedRole="petcare_staff"><PetCareLayout /></ProtectedRoute>
        }>
          <Route index element={<PetCareTodayPage />} />
          <Route path="bookings/:id" element={<BookingWorkPage />} />
          <Route path="pets/:id" element={<PetHistoryPage />} />
          <Route path="my-schedule" element={<PetCareMySchedulePage />} />
        </Route>

        {/* ── Shop Head Portal ── */}
        <Route path="/shop-head" element={
          <ProtectedRoute allowedRole="shop_head"><ShopHeadLayout /></ProtectedRoute>
        }>
          <Route index element={<ShopHeadDashboardPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="staff/new" element={<ShopHeadStaffFormPage />} />
          <Route path="staff/:id/edit" element={<ShopHeadStaffFormPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="leave-requests" element={<LeaveRequestsPage />} />
          <Route path="bookings" element={<ShopHeadBookingsPage />} />
          <Route path="bookings/:id" element={<ShopHeadBookingDetailPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="products" element={<ShopHeadProductsPage />} />
          <Route path="orders" element={<ShopHeadOrdersPage />} />
          <Route path="vouchers" element={<ShopHeadVouchersPage />} />
          <Route path="vouchers/new" element={<ShopHeadVoucherFormPage />} />
          <Route path="reports" element={<ShopHeadReportsPage />} />
        </Route>

        {/* ── Admin Portal ── */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>
        }>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route path="products" element={<AdminProductManagementPage />} />
          <Route path="products/new" element={<AdminProductFormPage />} />
          <Route path="products/:id/edit" element={<AdminProductFormPage />} />
          <Route path="product-categories" element={<CategoryManagementPage />} />
          <Route path="services" element={<ServiceManagementPage />} />
          <Route path="services/new" element={<ServiceFormPage />} />
          <Route path="services/:id/edit" element={<ServiceFormPage />} />
          <Route path="bookings" element={<BookingManagementPage />} />
          <Route path="bookings/new" element={<BookingFormPage />} />
          <Route path="bookings/:id" element={<AdminBookingDetailPage />} />
          <Route path="bookings/:id/edit" element={<BookingFormPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="inventory/adjust" element={<InventoryAdjustmentPage />} />
          <Route path="vouchers" element={<AdminVouchersPage />} />
          <Route path="vouchers/new" element={<VoucherFormPage />} />
          <Route path="vouchers/:id/edit" element={<VoucherFormPage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="ai/breed" element={<AIBreedPage />} />
          <Route path="ai/chatbot" element={<AIChatbotPage />} />
          <Route path="settings" element={<SystemSettingsPage />} />
        </Route>

        {/* ── Warehouse Manager Portal ── */}
        <Route path="/warehouse" element={
          <ProtectedRoute allowedRole="warehouse_manager"><WarehouseLayout /></ProtectedRoute>
        }>
          <Route index element={<WarehouseDashboardPage />} />
          <Route path="stock-in" element={<StockInPage />} />
          <Route path="stock-out" element={<StockOutPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="transfers/:id" element={<TransferDetailPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="reports" element={<WarehouseReportsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
