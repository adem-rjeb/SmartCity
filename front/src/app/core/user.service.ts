import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, UserRole } from './models';

/** API Platform JSON-LD collection wrapper */
interface HydraCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  /** Get all users (admin only). Unwraps the Hydra collection. */
  getUsers(): Observable<User[]> {
    return this.api.get<any>('/users').pipe(
      map((res) => {
        if (Array.isArray(res)) return res as User[];
        return (res?.['hydra:member'] ?? res?.member ?? []) as User[];
      }),
    );
  }

  /** Get a specific user by ID. */
  getUser(id: number): Observable<User> {
    return this.api.get<User>(`/users/${id}`);
  }

  /**
   * Create a new user (admin only).
   * plainPassword is hashed server-side by UserStateProcessor.
   */
  createUser(payload: Omit<User, 'id'> & { plainPassword: string }): Observable<User> {
    return this.api.post<User>('/users', payload);
  }

  /**
   * Update a user (admin only).
   * Omit plainPassword to keep the existing password unchanged.
   */
  updateUser(id: number, payload: Partial<Omit<User, 'id'>> & { plainPassword?: string }): Observable<User> {
    return this.api.patch<User>(`/users/${id}`, payload);
  }

  /** Delete a user (admin only). */
  deleteUser(id: number): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }

  /**
   * Get users by role for the agent dropdown.
   * role must be the full ROLE_-prefixed value (e.g. 'ROLE_AGENT').
   * Backend filters via ApiFilter(SearchFilter).
   */
  getUsersByRole(role: UserRole): Observable<User[]> {
    return this.getUsers().pipe(
      map((users) =>
        users.filter((u) => {
          const r = String(u.role);
          return r === role || r === 'ROLE_AGENT' || r === 'AGENT';
        }),
      ),
    );
  }
}
