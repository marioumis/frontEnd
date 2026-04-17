import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminUserResponse } from '../../models/response/AdminUserResponse';
import { UpdateUserRequest } from '../../models/request/UpdateUserRequest';
@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private apiUrl = 'http://localhost:8081/api/v1/admin/users';

  constructor(private http: HttpClient) {}

  // GET: List all users
  getUsers(): Observable<AdminUserResponse[]> {
    return this.http.get<AdminUserResponse[]>(this.apiUrl);
  }

  // GET: Single user by ID
  getUserById(id: number): Observable<AdminUserResponse> {
    return this.http.get<AdminUserResponse>(`${this.apiUrl}/${id}`);
  }

  // GET: Search users by name
  searchUsers(name: string): Observable<AdminUserResponse[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<AdminUserResponse[]>(`${this.apiUrl}/search`, { params });
  }

  // PUT: Update user
  updateUser(id: number, request: UpdateUserRequest): Observable<AdminUserResponse> {
    return this.http.put<AdminUserResponse>(`${this.apiUrl}/${id}`, request);
  }

  // DELETE: Remove user
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleUserStatus(id: number): Observable<any> {
  // Use .patch because we are only changing one field (activated)
  return this.http.patch(`http://localhost:8081/api/v1/admin/users/${id}/toggle`, {});
}

// PUT: Assign DEPT_ADMIN role
makeDeptAdmin(id: number): Observable<AdminUserResponse> {
  return this.http.put<AdminUserResponse>(`${this.apiUrl}/${id}/make-dept-admin`, {});
}

// POST: Invite user by email
inviteUser(email: string): Observable<AdminUserResponse> {
  return this.http.post<AdminUserResponse>(`${this.apiUrl}/invite`, { email });
}
}