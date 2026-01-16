import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  // Управление системой
  getSystemLogs(params?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/logs`, { params });
  }

  clearCache(): Observable<any> {
    return this.http.post(`${this.apiUrl}/clear-cache`, {});
  }

  backupDatabase(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/backup`, {
      responseType: 'blob'
    });
  }

  restoreDatabase(backupFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('backup', backupFile);
    return this.http.post(`${this.apiUrl}/restore`, formData);
  }

  // Настройки системы
  getSystemSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/settings`);
  }

  updateSystemSettings(settings: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/settings`, settings);
  }

  // Аналитика
  getAnalyticsReport(params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`, { params });
  }

  exportAnalytics(params: any): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/analytics/export`, {
      params,
      responseType: 'blob'
    });
  }
}