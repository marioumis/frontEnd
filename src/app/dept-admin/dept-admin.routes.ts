import { Routes } from '@angular/router';
import { authGuard } from '../core/guard';
import { deptAdminGuard } from '../core/dept-admin.guard';

export const deptAdminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/dept-admin-layout.component').then(m => m.DeptAdminLayoutComponent),
    canActivate: [authGuard, deptAdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./users/dept-admin-users-page.component').then(m => m.DeptAdminUsersPageComponent)
      },
      {
        path: 'invitations',
        loadComponent: () =>
          import('./invitations/dept-admin-invitation-page.component').then(m => m.DeptAdminInvitationPageComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./categories/dept-admin-category-page.component').then(m => m.DeptAdminCategoryPageComponent)
      },
      {
        path: 'templates',
        loadComponent: () =>
          import('./templates/dept-admin-template-page.component').then(m => m.DeptAdminTemplatePageComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/dept-admin-profile.component').then(m => m.DeptAdminProfileComponent)
      }
    ]
  }
];
