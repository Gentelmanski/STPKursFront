import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getCommentsForModeration(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/comments`);
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/comments/${commentId}`);
  }

  restoreComment(commentId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/comments/${commentId}/restore`, {});
  }

  getEventComments(eventId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/events/${eventId}/comments`);
  }

  addComment(eventId: number, commentData: any): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/events/${eventId}/comments`, commentData);
  }

  updateComment(commentId: number, commentData: any): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/comments/${commentId}`, commentData);
  }
}