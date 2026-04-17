import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminStatsResponse } from '../../models/response/AdminStatsResponse';

@Injectable({
  providedIn: 'root'
})
export class AdminStatsService {
  private apiUrl = 'http://localhost:8081/api/v1/admin/stats';

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStatsResponse> {
    return this.http.get<AdminStatsResponse>(this.apiUrl);
  }
}