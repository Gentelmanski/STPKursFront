import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, AdminUser } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Пользовательские операции
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateProfile(profileData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, profileData);
  }

  changePassword(passwordData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, passwordData);
  }

  getUserEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/events`);
  }

  getUserParticipations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/participated`);
  }

  getUserDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/dashboard`);
  }

  // Административные операции
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/admin/users`);
  }

  toggleUserBlock(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${userId}/toggle-block`, {});
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/users/${userId}`);
  }

  getUserStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/user-stats`);
  }
}