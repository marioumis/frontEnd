import { Routes } from '@angular/router';
import { authGuard } from './core/guard';
import { adminRoutes } from './admin/admin.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent)
  },
 {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
  path: 'activate',
  loadComponent: () =>
    import('./auth/activateAccount/activate.component').then(m => m.ActivateComponent)
  },
   {
    path: 'admin',
    children: adminRoutes
  },
  /* {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  }*/
];
