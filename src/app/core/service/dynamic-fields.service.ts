import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DynamicFieldResponse } from '../../models/response/DynamicFieldResponse';
import { DynamicFieldRequest } from '../../models/request/DynamicFieldRequest';

@Injectable({ providedIn: 'root' })
export class DynamicFieldsService {

  private readonly apiUrl = 'http://localhost:8081/api/v1/dynamic-fields';

  constructor(private http: HttpClient) {}

  findByDocument(docId: number): Observable<DynamicFieldResponse[]> {
    return this.http.get<DynamicFieldResponse[]>(
      `${this.apiUrl}/by-document/${docId}`
    );
  }

  create(request: DynamicFieldRequest): Observable<DynamicFieldResponse> {
    return this.http.post<DynamicFieldResponse>(this.apiUrl, request);
  }

  update(fieldId: number, request: DynamicFieldRequest): Observable<DynamicFieldResponse> {
    return this.http.put<DynamicFieldResponse>(
      `${this.apiUrl}/${fieldId}`, request
    );
  }

  delete(fieldId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${fieldId}`);
  }
}