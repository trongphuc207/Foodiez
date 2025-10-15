import HomePage from '../Page/HomePage/HomePage';
import OrderPage from '../Page/OrderPage/OrderPage';
import ProductPage from '../Page/productPPage/productPage';
import NotFoundPage from '../Page/NotFoundPage/NotFoundPage';
import InformationPage from '../Page/InformationPage/InformationPage';
import CustomerProfile from '../components/CustomerProfileComponent/CustomerProfile';
import ResetPasswordPage from '../Page/ResetPasswordPage/ResetPasswordPage';
import AdminPage from '../Page/AdminPage/AdminPage';
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
            path: '/upload',
            component: AdminPage,
            isShowHeader: true
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
            path: '/unauthorized',
            component: Unauthorized,
            isShowHeader: false

        },
        {
            path: '/test-product-detail',
            component: ProductDetailTest,
            isShowHeader: true
        },
        {
            path: '*',
            component: NotFoundPage
        }   
    ];