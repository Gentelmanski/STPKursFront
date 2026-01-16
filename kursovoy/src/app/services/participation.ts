import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParticipationService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getUserParticipations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/participations`);
  }

  updateParticipationStatus(eventId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/events/${eventId}/participation`, { status });
  }

  getEventParticipants(eventId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/events/${eventId}/participants`);
  }

  exportParticipants(eventId: number, format: string = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/events/${eventId}/participants/export`, {
      params: { format },
      responseType: 'blob'
    });
  }

  checkParticipation(eventId: number): Observable<{ isParticipating: boolean }> {
    return this.http.get<{ isParticipating: boolean }>(`${this.apiUrl}/events/${eventId}/check-participation`);
  }
}