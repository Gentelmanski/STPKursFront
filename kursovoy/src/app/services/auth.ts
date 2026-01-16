import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; 
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { User, RegisterRequest, LoginRequest, AuthResponse } from '../models/user';
import { TokenService } from './token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router, 
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.loadCurrentUser();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData)
      .pipe(
        tap(response => {
          if (this.isBrowser()) {
            this.tokenService.setToken(response.token);
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          if (this.isBrowser()) {
            this.tokenService.setToken(response.token);
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout(): void {
    if (this.isBrowser()) {
      this.tokenService.removeToken();
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap(user => {
        if (this.isBrowser()) {
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    const token = this.tokenService.getToken();
    return !!token && !this.tokenService.isTokenExpired();
  }

  hasRole(role: string): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    const currentUser = this.getCurrentUser();
    return currentUser?.role === role;
  }

  private loadCurrentUser(): void {
    if (this.isAuthenticated()) {
      this.getProfile().subscribe({
        error: () => this.logout()
      });
    }
  }
}