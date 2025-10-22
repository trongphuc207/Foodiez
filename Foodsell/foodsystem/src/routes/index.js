import HomePage from '../Page/HomePage/HomePage';
import { Navigate } from 'react-router-dom';
import OrderPage from '../Page/OrderPage/OrderPage';
import ProductPage from '../Page/productPPage/productPage';
import NotFoundPage from '../Page/NotFoundPage/NotFoundPage';
import InformationPage from '../Page/InformationPage/InformationPage';
import CustomerProfile from '../components/CustomerProfileComponent/CustomerProfile';
import ResetPasswordPage from '../Page/ResetPasswordPage/ResetPasswordPage';
import AdminApp from '../components/AdminComponent/AdminApp';
import ProductDetailTest from '../components/FoodProductComponent/ProductDetailTest';

import ShopList from '../components/ShopComponent/ShopList';
import ShopDetail from '../components/ShopComponent/ShopDetail';
import ShopRegistration from '../components/ShopComponent/ShopRegistration';
import ShopDashboard from '../components/ShopComponent/ShopDashboard';
import CategoryManagement from '../components/CategoryComponent/CategoryManagement';
import ShopManagement from '../components/ShopManagementComponent/ShopManagement';
import CheckoutPage from '../Page/CheckoutPage/CheckoutPage';
import PaymentSuccessPage from '../Page/PaymentSuccessPage/PaymentSuccessPage';
import PaymentCancelPage from '../Page/PaymentCancelPage/PaymentCancelPage';
import ShipperDashboardPage from '../Page/ShipperDashboardPage/ShipperDashboardPage';
import ShipperOrdersPage from '../Page/ShipperOrdersPage/ShipperOrdersPage';
import ShipperEarningsPage from '../Page/ShipperEarningsPage/ShipperEarningsPage';
import ShipperHistoryPage from '../Page/ShipperHistoryPage/ShipperHistoryPage';
import ShipperMapPage from '../Page/ShipperMapPage/ShipperMapPage';
import ShipperOverviewPage from '../Page/ShipperOverviewPage/ShipperOverviewPage';
import VoucherPage from '../Page/VoucherPage/VoucherPage';
import RouteGuard from '../components/RouteGuard/RouteGuard';
import Unauthorized from '../components/Unauthorized/Unauthorized';

export const routes = [
    {
        path: '/',
        component: HomePage,
        isShowHeader: true
    },
    {
        path: '/orders',
        component: OrderPage,
        isShowHeader: true
    },
    {
        path: '/products',
        component: ProductPage,
        isShowHeader: true
    },
    {
        path: '/profile',
        component: CustomerProfile,
        isShowHeader: true
    },
    {
        path: '/checkout',
        component: CheckoutPage,
        isShowHeader: true
    },
    {
        path: '/reset-password',
        component: ResetPasswordPage,
        isShowHeader: false
    },
    {
        path: '/admin/*',
        component: () => (
            <RouteGuard requiredRole="admin" redirectTo="/unauthorized" allowAdminBypass>
                <AdminApp />
            </RouteGuard>
        ),
        isShowHeader: false, // ẩn Header/Footer chung vì AdminApp đã có layout riêng
    },
    {
        path: '/shops',
        component: ShopList,
        isShowHeader: true
    },
    {
        path: '/shops/:id',
        component: ShopDetail,
        isShowHeader: true
    },
    {
        path: '/shops/register',
        component: ShopRegistration,
        isShowHeader: true
    },
    {
        path: '/shops/dashboard',
        component: ShopDashboard,
        isShowHeader: true
    },
    {
        path: '/categories',
        component: CategoryManagement,
        isShowHeader: true
    },
    {
        path: '/shop-management',
        component: ShopManagement,
        isShowHeader: true
    },
    {
        path: '/information',
        component: InformationPage,
        isShowHeader: true
    },
    {
        path: '/vouchers',
        component: VoucherPage,
        isShowHeader: true
    },
    {
        path: '/payment/success',
        component: PaymentSuccessPage,
        isShowHeader: false
    },
    {
        path: '/payment/cancel',
        component: PaymentCancelPage,
        isShowHeader: false
    },
    {
        path: '/shipper',
        component: () => <Navigate to="/shipper/dashboard" replace />,
        isShowHeader: false
    },
    {
        path: '/shipper/dashboard',
        component: () => (
            <RouteGuard requiredRole="shipper" redirectTo="/unauthorized">
                <ShipperDashboardPage />
            </RouteGuard>
        ),
        isShowHeader: false
    },
    {
        path: '/shipper/orders',
        component: () => (
            <RouteGuard requiredRole="shipper" redirectTo="/unauthorized">
                <ShipperOrdersPage />
            </RouteGuard>
        ),
        isShowHeader: false
    },
    {
        path: '/shipper/earnings',
        component: () => (
            <RouteGuard requiredRole="shipper" redirectTo="/unauthorized">
                <ShipperEarningsPage />
            </RouteGuard>
        ),
        isShowHeader: false
    },
    {
        path: '/shipper/history',
        component: () => (
            <RouteGuard requiredRole="shipper" redirectTo="/unauthorized">
                <ShipperHistoryPage />
            </RouteGuard>
        ),
        isShowHeader: false
    },
    {
        path: '/shipper/map',
        component: () => (
            <RouteGuard requiredRole="shipper" redirectTo="/unauthorized">
                <ShipperMapPage />
            </RouteGuard>
        ),
        isShowHeader: false
    },
    {
        path: '/shipper/overview',
        component: () => (
            <RouteGuard requiredRole="shipper" redirectTo="/unauthorized">
                <ShipperOverviewPage />
            </RouteGuard>
        ),
        isShowHeader: false
    },
    {
        path: '/test-product-detail',
        component: ProductDetailTest,
        isShowHeader: true
    },
    {
        path: '/seller',
        component: () => <Navigate to="/seller/dashboard" replace />,
        isShowHeader: false
    },
    {
        path: '/seller/dashboard',
        component: () => (
            <RouteGuard requiredRole="seller" redirectTo="/unauthorized" allowAdminBypass>
                <ShopDashboard />
            </RouteGuard>
        ),
        isShowHeader: false
    },
    {
        path: '/seller/products',
        component: () => (
            <RouteGuard requiredRole="seller" redirectTo="/unauthorized" allowAdminBypass>
                <ShopDashboard />
            </RouteGuard>
        ),
        isShowHeader: false
    },
    {
        path: '/seller/orders',
        component: () => (
            <RouteGuard requiredRole="seller" redirectTo="/unauthorized" allowAdminBypass>
                <ShopDashboard />
            </RouteGuard>
        ),
        isShowHeader: false
    },
    {
        path: '/seller/revenue',
        component: () => (
            <RouteGuard requiredRole="seller" redirectTo="/unauthorized" allowAdminBypass>
                <ShopDashboard />
            </RouteGuard>
        ),
        isShowHeader: false
    },
    {
        path: '/seller/customers',
        component: () => (
            <RouteGuard requiredRole="seller" redirectTo="/unauthorized" allowAdminBypass>
                <ShopDashboard />
            </RouteGuard>
        ),
        isShowHeader: false
    },
    {
        path: '/seller/settings',
        component: () => (
            <RouteGuard requiredRole="seller" redirectTo="/unauthorized" allowAdminBypass>
                <ShopDashboard />
            </RouteGuard>
        ),
        isShowHeader: false
    },
    {
        path: '/unauthorized',
        component: Unauthorized,
        isShowHeader: false
    },
    {
        path: '*',
        component: NotFoundPage
    }
];
