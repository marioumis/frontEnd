import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChangePasswordRequest } from '../../models/request/ChangePasswordRequest';
import { DynamicDocumentRequest } from '../../models/request/DynamicDocumentRequest';
import { TypeDocumentRequest } from '../../models/request/type-document-request.model';
import { CurrentUserResponse } from '../../models/response/current-user-response.model';
import { DeptAdminInviteRequest } from '../../models/request/dept-admin-invite-request.model';
import { DeptAdminProfileUpdateRequest } from '../../models/request/dept-admin-profile-update-request.model';
import { DeptAdminInvitationResponse } from '../../models/response/dept-admin-invitation-response.model';
import { DeptAdminDepartmentUserResponse } from '../../models/response/dept-admin-department-user-response.model';
import { DeptAdminTypeDocumentResponse } from '../../models/response/dept-admin-type-document-response.model';
import { DynamicDocumentResponse } from '../../models/response/DynamicDocumentResponse';

@Injectable({
  providedIn: 'root'
})
export class DeptAdminService {
  private apiUrl = 'http://localhost:8081/api/v1/dept-admin';

  constructor(private http: HttpClient) {}

  getInvitations(): Observable<DeptAdminInvitationResponse[]> {
    return this.http.get<DeptAdminInvitationResponse[]>(`${this.apiUrl}/invitations`);
  }

  inviteUser(request: DeptAdminInviteRequest): Observable<DeptAdminInvitationResponse> {
    return this.http.post<DeptAdminInvitationResponse>(`${this.apiUrl}/invitations`, request);
  }

  getDepartmentUsers(): Observable<DeptAdminDepartmentUserResponse[]> {
    return this.http.get<DeptAdminDepartmentUserResponse[]>(`${this.apiUrl}/users`);
  }

  updateProfile(request: DeptAdminProfileUpdateRequest): Observable<CurrentUserResponse> {
    return this.http.put<CurrentUserResponse>(`${this.apiUrl}/me/profile`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/me/password`, request);
  }

  getCategories(): Observable<DeptAdminTypeDocumentResponse[]> {
    return this.http.get<DeptAdminTypeDocumentResponse[]>(`${this.apiUrl}/type-documents`);
  }

  createCategory(request: TypeDocumentRequest): Observable<DeptAdminTypeDocumentResponse> {
    return this.http.post<DeptAdminTypeDocumentResponse>(`${this.apiUrl}/type-documents`, request);
  }

  updateCategory(id: number, request: TypeDocumentRequest): Observable<DeptAdminTypeDocumentResponse> {
    return this.http.put<DeptAdminTypeDocumentResponse>(`${this.apiUrl}/type-documents/${id}`, request);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/type-documents/${id}`);
  }

  getTemplates(): Observable<DynamicDocumentResponse[]> {
    return this.http.get<DynamicDocumentResponse[]>(`${this.apiUrl}/templates`);
  }

  createTemplate(request: DynamicDocumentRequest, file: File): Observable<DynamicDocumentResponse> {
    return this.http.post<DynamicDocumentResponse>(`${this.apiUrl}/templates`, this.toFormData(request, file));
  }

  updateTemplate(id: number, request: DynamicDocumentRequest, file?: File): Observable<DynamicDocumentResponse> {
    return this.http.put<DynamicDocumentResponse>(`${this.apiUrl}/templates/${id}`, this.toFormData(request, file));
  }

  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/templates/${id}`);
  }

  private toFormData(request: DynamicDocumentRequest, file?: File): FormData {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }));

    if (file) {
      formData.append('file', file, file.name);
    }

    return formData;
  }
}
