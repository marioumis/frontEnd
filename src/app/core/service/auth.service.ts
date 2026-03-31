import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse } from '../../models/response/auth-response.model';
import { RegisterRequest } from '../../models/request/register-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8081/api/v1';

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('jwt', response.authenticationToken);
          localStorage.setItem('role', response.role);

        })
      );
  }

  register(request: RegisterRequest) {
    return this.http.post<string>(`${this.apiUrl}/register`, request , { responseType: 'text' as 'json' });
  }

  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  getRole(): string | null {
  return localStorage.getItem('role');
}

isAdmin(): boolean {
  return this.getRole() === 'ADMIN';
}

}