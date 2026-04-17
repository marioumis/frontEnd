import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeDocumentRequest } from '../../models/request/type-document-request.model';
import { TypeDocumentResponse } from '../../models/response/type-document-response.model';

@Injectable({
  providedIn: 'root'
})
export class TypeDocumentService {
  private apiUrl = 'http://localhost:8081/api/v1/type-documents';

  constructor(private http: HttpClient) {}

  getTypeDocuments(): Observable<TypeDocumentResponse[]> {
    return this.http.get<TypeDocumentResponse[]>(this.apiUrl);
  }

  getTypeDocumentById(id: number): Observable<TypeDocumentResponse> {
    return this.http.get<TypeDocumentResponse>(`${this.apiUrl}/${id}`);
  }

  createTypeDocument(payload: TypeDocumentRequest): Observable<TypeDocumentResponse> {
    return this.http.post<TypeDocumentResponse>(this.apiUrl, payload);
  }

  updateTypeDocument(id: number, payload: TypeDocumentRequest): Observable<TypeDocumentResponse> {
    return this.http.put<TypeDocumentResponse>(`${this.apiUrl}/${id}`, payload);
  }

  deleteTypeDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}