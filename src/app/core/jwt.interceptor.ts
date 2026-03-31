import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './service/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const token = authService.getToken();

   // skip interceptor for requests that don't need auth
  if (req.headers.has('skipInterceptor')) {
    const cleanReq = req.clone({
      headers: req.headers.delete('skipInterceptor')
    });
    return next(cleanReq);
  }
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);

};