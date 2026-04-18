import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDocumentResponse } from '../../models/response/user-document-response.model';
import { UserDocumentRequest } from '../../models/request/user-document-request.model';

@Injectable({
  providedIn: 'root'
})
export class UserDocumentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/v1/user-documents';

  getMyDocuments(): Observable<UserDocumentResponse[]> {
    return this.http.get<UserDocumentResponse[]>(`${this.apiUrl}/my-documents`);
  }

  generate(request: UserDocumentRequest): Observable<UserDocumentResponse> {
    return this.http.post<UserDocumentResponse>(`${this.apiUrl}/generate`, request);
  }

  download(fileName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${fileName}`, {
      responseType: 'blob'
    });
  }
}
