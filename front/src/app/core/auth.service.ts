import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';
import { AuthResponse, UserRole } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly jwtHelper = inject(JwtHelperService);
  private readonly storageKey = 'smartcity.jwt';
  private readonly apiUrl = environment.apiUrl;

  /**
   * Backend custom login at POST /api/login (not Lexik /api/login_check).
   * Expects JSON { email, password } and returns { token }.
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => this.storeToken(response.token)),
    );
  }

  register(payload: { nom: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap((response) => this.storeToken(response.token)),
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  getUserRole(): UserRole | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const claims = this.jwtHelper.decodeToken(token) as Record<string, unknown> | null;
    if (!claims) {
      return null;
    }

    const roles = (claims['roles'] ?? []) as string[];
    // Find the highest-priority ROLE_ claim (skip ROLE_USER which every user has)
    return (
      (roles.find((role) =>
        (['ROLE_CITIZEN', 'ROLE_AGENT', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] as string[]).includes(role),
      ) as UserRole | undefined) ?? null
    );
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    const claims = this.jwtHelper.decodeToken(token) as Record<string, unknown> | null;
    if (!claims) return null;
    const sub = claims['sub'] ?? claims['related_to'] ?? claims['relatedTo'] ?? claims['userId'];
    if (!sub) return null;
    const id = Number(sub);
    return Number.isNaN(id) ? null : id;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.storageKey, token);
  }
}
