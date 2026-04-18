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
          import('./dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./users/admin-user-list-page.component').then(m => m.AdminUserListPageComponent)
      },
      {
        path: 'users/edit/:id', 
        loadComponent: () =>
          import('./user-edit/admin-user-edit-page.component').then(m => m.AdminUserEditPageComponent)
      },
      {
        path: 'invitations',
        loadComponent: () =>
          import('./invitations/admin-invitation-page.component').then(m => m.AdminInvitationPageComponent)
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./departments/department.component').then(m => m.DepartmentComponent)
      },
  {
  path: 'categories',
  loadComponent: () =>
    import('./categories/admin-category-page.component').then(m => m.AdminCategoryPageComponent)
},
 {
      path: 'templates',
      loadComponent: () =>
        import('./templates/Dynamic document.component').then(m => m.DynamicDocumentComponent)
    },
    {
  path: 'templates/:id',
  loadComponent: () =>
    import('./fields/template-detail.component')
      .then(m => m.TemplateDetailComponent)
},
{
  path: 'templates/:id/test',
  loadComponent: () =>
    import('./templates/template-test/template-test.component')
      .then(m => m.TemplateTestComponent)
},
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/admin-profile.component').then(m => m.AdminProfileComponent)
  }
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
