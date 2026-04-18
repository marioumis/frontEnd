import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvitationResponse } from '../../models/response/invitation-response.model';
import { InviteUserRequest } from '../../models/request/invite-user-request.model';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {

  private apiUrl = 'http://localhost:8081/api/v1/invitations';

  constructor(private http: HttpClient) { }

  getAllInvitations(): Observable<InvitationResponse[]> {
    return this.http.get<InvitationResponse[]>(this.apiUrl);
  }

  inviteUser(request: InviteUserRequest): Observable<InvitationResponse> {
    return this.http.post<InvitationResponse>(this.apiUrl, request);
  }

  cancelInvitation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteAuditLog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/audit`);
  }
}
