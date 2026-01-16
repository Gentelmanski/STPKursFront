import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications`);
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/mark-all-read`, {});
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/notifications/unread-count`);
  }

  createNotification(notificationData: any): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/notifications`, notificationData);
  }
}