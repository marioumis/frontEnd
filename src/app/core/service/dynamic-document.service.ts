import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DynamicDocumentRequest } from '../../models/request/DynamicDocumentRequest';
import { DynamicDocumentResponse } from '../../models/response/DynamicDocumentResponse';
@Injectable({ providedIn: 'root' })
export class DynamicDocumentService {

  // Match your project's base URL pattern
  private readonly apiUrl = 'http://localhost:8081/api/v1/dynamic-documents';

  constructor(private http: HttpClient) {}

  /** GET /api/v1/dynamic-documents */
  findAll(): Observable<DynamicDocumentResponse[]> {
    return this.http.get<DynamicDocumentResponse[]>(this.apiUrl);
  }

  /** GET /api/v1/dynamic-documents/:id */
  findById(id: number): Observable<DynamicDocumentResponse> {
    return this.http.get<DynamicDocumentResponse>(`${this.apiUrl}/${id}`);
  }

  /** GET /api/v1/dynamic-documents/by-type/:typeDocumentId */
  findByType(typeDocumentId: number): Observable<DynamicDocumentResponse[]> {
    return this.http.get<DynamicDocumentResponse[]>(`${this.apiUrl}/by-type/${typeDocumentId}`);
  }

  /**
   * POST /api/v1/dynamic-documents
   * Spring expects: @RequestPart("data") + @RequestPart("file")
   */
  create(request: DynamicDocumentRequest, file: File): Observable<DynamicDocumentResponse> {
    return this.http.post<DynamicDocumentResponse>(this.apiUrl, this.toFormData(request, file));
  }

  /**
   * PUT /api/v1/dynamic-documents/:id
   * file is optional — omit to keep the existing template file
   */
  update(id: number, request: DynamicDocumentRequest, file?: File): Observable<DynamicDocumentResponse> {
    return this.http.put<DynamicDocumentResponse>(`${this.apiUrl}/${id}`, this.toFormData(request, file));
  }

  /** DELETE /api/v1/dynamic-documents/:id */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  /** GET /api/v1/dynamic-documents/:id/preview */
preview(id: number): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/${id}/preview`, {
    responseType: 'blob'
  });
}
validate(id: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/${id}/validate`);
}

  // ── private ───────────────────────────────────────────────────────────────

  private toFormData(request: DynamicDocumentRequest, file?: File): FormData {
    const fd = new FormData();
    // Spring @RequestPart("data") requires an application/json Blob
    fd.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (file) {
      fd.append('file', file, file.name);
    }
    return fd;
  }
}