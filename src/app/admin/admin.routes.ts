import { Routes } from '@angular/router';
import { authGuard } from '../core/guard';
import { adminGuard } from '../core/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./users/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'users/edit/:id', 
        loadComponent: () => import('./user-edit/user-edit').then(m => m.UserEditComponent)
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./departments/department.component').then(m => m.DepartmentComponent)
      },
      /*{
        path: 'templates',
        loadComponent: () =>
          import('./templates/templates.component').then(m => m.TemplatesComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/settings.component').then(m => m.SettingsComponent)
      }*/
    ]
    }
];