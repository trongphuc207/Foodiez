import HomePage from '../Page/HomePage/HomePage';
import OrderPage from '../Page/OrderPage/OrderPage';
import ProductPage from '../Page/productPPage/productPage';
import NotFoundPage from '../Page/NotFoundPage/NotFoundPage';
import InformationPage from '../Page/InformationPage/InformationPage';
import CustomerProfile from '../components/CustomerProfileComponent/CustomerProfile';
import ResetPasswordPage from '../Page/ResetPasswordPage/ResetPasswordPage';
import AdminPage from '../Page/AdminPage/AdminPage';
import ShopList from '../components/ShopComponent/ShopList';
import ShopDetail from '../components/ShopComponent/ShopDetail';
import ShopRegistration from '../components/ShopComponent/ShopRegistration';
import ShopDashboard from '../components/ShopComponent/ShopDashboard';
import CategoryManagement from '../components/CategoryComponent/CategoryManagement';
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
            path: '/iformation',
            component: InformationPage
        },
        {
            path: '*',
            component: NotFoundPage
        }   
    ];