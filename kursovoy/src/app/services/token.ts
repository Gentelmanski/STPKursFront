import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';
  private jwtHelper = new JwtHelperService();

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  setToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  removeToken(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decoded = this.jwtHelper.decodeToken(token);
      return decoded?.role || null;
    } catch (error) {
      return null;
    }
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decoded = this.jwtHelper.decodeToken(token);
      return decoded?.user_id || null;
    } catch (error) {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      return true;
    }
  }
}