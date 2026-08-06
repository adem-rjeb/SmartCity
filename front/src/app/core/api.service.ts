import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    const httpParams = params ? new HttpParams({ fromObject: params as Record<string, string> }) : undefined;
    const headers = { Accept: 'application/json' };
    return this.http.get<T>(`${this.apiUrl}${path}`, { params: httpParams, headers });
  }

  post<T>(path: string, body: unknown, headers?: Record<string, string>): Observable<T> {
    const defaultHeaders: Record<string, string> = { Accept: 'application/json' };
    const merged = headers ? { ...defaultHeaders, ...headers } : defaultHeaders;
    return this.http.post<T>(`${this.apiUrl}${path}`, body, { headers: merged });
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${path}`, body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${path}`, body, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${path}`);
  }
}
