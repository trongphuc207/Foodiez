import HomePage from '../Page/HomePage/HomePage';
import OrderPage from '../Page/OrderPage/OrderPage';
import ProductPage from '../Page/productPPage/productPage';
import NotFoundPage from '../Page/NotFoundPage/NotFoundPage';
import InformationPage from '../Page/InformationPage/InformationPage';
import CustomerProfile from '../components/CustomerProfileComponent/CustomerProfile';
import ResetPasswordPage from '../Page/ResetPasswordPage/ResetPasswordPage';
import AdminPage from '../Page/AdminPage/AdminPage';
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
            path: '/iformation',
            component: InformationPage
        },
        {
            path: '*',
            component: NotFoundPage
        }   
    ];