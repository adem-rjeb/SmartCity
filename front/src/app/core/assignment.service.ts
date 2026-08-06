import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Assignment, AssignmentStatus } from './models';

/** API Platform JSON-LD collection wrapper */
interface HydraCollection<T> {
  'hydra:member': T[];
}

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private readonly api = inject(ApiService);

  /** Get all assignments for the current user (role-filtered server-side). */
  getAssignments(): Observable<Assignment[]> {
    return this.api.get<HydraCollection<Assignment> | Assignment[]>('/assignments').pipe(
      map((res) => {
        if (Array.isArray(res)) return res;
        return res?.['hydra:member'] ?? (res as any)?.member ?? [];
      }),
    );
  }

  /** Get a specific assignment by ID. */
  getAssignment(id: number): Observable<Assignment> {
    return this.api.get<Assignment>(`/assignments/${id}`);
  }

  /**
   * Create a new assignment (supervisor/admin only).
   *
   * API Platform expects IRIs for relation fields:
   *   report      → "/api/reports/{reportId}"
   *   assignedAgent → "/api/users/{agentId}"
   *
   * `assignedBy` and updating Report.status are handled server-side
   * by AssignmentStateProcessor.
   */
  createAssignment(reportId: number, agentId: number, commentaire?: string): Observable<Assignment> {
    return this.api.post<Assignment>('/assignments', {
      report: `/api/reports/${reportId}`,
      assignedAgent: `/api/users/${agentId}`,
      status: 'ASSIGNED' as AssignmentStatus,
      commentaire: commentaire ?? null,
    });
  }

  /**
   * Update assignment status (agent accepts/completes, supervisor overrides).
   * Uses PATCH so only provided fields are updated (existing fields preserved).
   */
  updateAssignmentStatus(
    id: number,
    status: AssignmentStatus,
    commentaire?: string,
  ): Observable<Assignment> {
    return this.api.patch<Assignment>(`/assignments/${id}`, {
      status,
      ...(commentaire !== undefined ? { commentaire } : {}),
    });
  }

  /** Cancel an assignment (supervisor action). */
  cancelAssignment(id: number, reason?: string): Observable<Assignment> {
    return this.api.patch<Assignment>(`/assignments/${id}`, {
      status: 'CANCELLED' as AssignmentStatus,
      ...(reason !== undefined ? { commentaire: reason } : {}),
    });
  }
}
