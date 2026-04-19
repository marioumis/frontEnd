import { Routes } from '@angular/router';
import { authGuard } from './core/guard';
import { adminRoutes } from './admin/admin.routes';
import { deptAdminRoutes } from './dept-admin/dept-admin.routes';
import { userRoutes } from './user/user.routes'; 
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
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
   {
    path: 'admin',
    children: adminRoutes
  },
  {
    path: 'dept-admin',
    children: deptAdminRoutes
  },
  {
  path: 'user',
  children: userRoutes
}

];
