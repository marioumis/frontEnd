import { Routes } from '@angular/router';

export const userRoutes: Routes = [
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
];