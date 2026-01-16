import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Основные операции с событиями
  getEvents(params?: any): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events`, { params });
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`);
  }

  createEvent(eventData: any): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/events`, eventData);
  }

  updateEvent(id: number, eventData: any): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/events/${id}`, eventData);
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${id}`);
  }

  participateInEvent(eventId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${eventId}/participate`, {});
  }

  cancelParticipation(eventId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${eventId}/participate`);
  }

  // Операции для администратора
  getEventsForAdmin(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/admin/events`);
  }

  verifyEvent(eventId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/events/${eventId}/verify`, {});
  }

  rejectEvent(eventId: number, reason: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/events/${eventId}/reject`, { reason });
  }

  toggleEventVerification(eventId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/events/${eventId}/toggle-verification`, {});
  }

  toggleEventActivity(eventId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/events/${eventId}/toggle-activity`, {});
  }
}