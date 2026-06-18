import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Category } from './pages/category/category';
import { authGuard } from './guard/auth-guard';
import { Product } from './product/product';
import { Master } from './master/master';
import { MasterProducts } from './pages/master-products/master-products';
import { FarmerProducts } from './pages/farmer-products/farmer-products';

export const routes: Routes = [
    { path: '', redirectTo:'home',pathMatch:'full' },
    { path :'home', component:Home},
    { path: 'login', component: Login },
    {
        path:'master',
        component:Master,
        canActivate:[authGuard]
    },
    {
        path:'product',
        component:Product,
        canActivate:[authGuard]
    },
    {
        path:'masterproducts',
        component:MasterProducts,
        canActivate:[authGuard]
    },
    {
        path:'farmerproducts',
        component:FarmerProducts,
        canActivate:[authGuard]
    }
];
