import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Statistics } from '../models/statistics';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getAdminStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/statistics`);
  }

  getUserStatistics(userId?: number): Observable<any> {
    const url = userId 
      ? `${this.apiUrl}/admin/users/${userId}/stats`
      : `${this.apiUrl}/user/stats`;
    return this.http.get<any>(url);
  }

  getSystemStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.apiUrl}/admin/system-stats`);
  }

  getEventStatistics(eventId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/events/${eventId}/stats`);
  }

  getTopEvents(limit: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/events/top?limit=${limit}`);
  }
}