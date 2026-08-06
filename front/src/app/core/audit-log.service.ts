import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { AuditLog } from './models';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly api = inject(ApiService);

  /** Get audit logs (admin only). Unwraps Hydra or plain JSON arrays. */
  getLogs(): Observable<AuditLog[]> {
    return this.api.get<any>('/audit_logs').pipe(
      map((res) => {
        if (Array.isArray(res)) return res as AuditLog[];
        return (res?.['hydra:member'] ?? res?.member ?? []) as AuditLog[];
      }),
    );
  }

  getEntityLogs(entityName: string, entityId: string): Observable<AuditLog[]> {
    return this.api.get<any>('/audit_logs', { entityName, entityId }).pipe(
      map((res) => {
        if (Array.isArray(res)) return res as AuditLog[];
        return (res?.['hydra:member'] ?? res?.member ?? []) as AuditLog[];
      }),
    );
  }
}
