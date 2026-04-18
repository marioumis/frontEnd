import { Routes } from '@angular/router';
import { authGuard } from '../core/guard';

export const userRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./home/user-home.component').then(m => m.UserHomeComponent)
      },
      {
        path: 'templates/:id',
        loadComponent: () =>
          import('../admin/templates/template-test/template-test.component')
            .then(m => m.TemplateTestComponent)
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./history/user-history.component').then(m => m.UserHistoryComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/user-settings.component').then(m => m.UserSettingsComponent)
      }
    ]
  }
];