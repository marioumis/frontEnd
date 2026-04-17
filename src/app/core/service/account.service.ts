import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UpdateProfileRequest } from '../../models/request/UpdateProfileRequest';
import { ChangePasswordRequest } from '../../models/request/ChangePasswordRequest';
import { CurrentUserResponse } from '../../models/response/current-user-response.model';
@Injectable({ providedIn: 'root' })
export class AccountService {
  private baseUrl = 'http://localhost:8081/api/v1/users';

  constructor(private http: HttpClient) {}

  getMe(): Observable<CurrentUserResponse> {
    return this.http.get<CurrentUserResponse>(`${this.baseUrl}/me`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<CurrentUserResponse> {
    return this.http.put<CurrentUserResponse>(`${this.baseUrl}/me`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/me/change-password`, request);
  }
}