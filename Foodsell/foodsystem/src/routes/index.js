import HomePage from '../Page/HomePage/HomePage';
import OrderPage from '../Page/OrderPage/OrderPage';
import ProductPage from '../Page/productPPage/productPage';
import NotFoundPage from '../Page/NotFoundPage/NotFoundPage';
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
            path: '*',
            component: NotFoundPage
        }        
    ];