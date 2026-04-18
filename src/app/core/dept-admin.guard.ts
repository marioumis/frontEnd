import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './service/auth.service';

export const deptAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getRole() === 'DEPT_ADMIN') {
    return true;
  }

  return router.createUrlTree(['/login']);
};
