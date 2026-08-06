import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuditLogService } from '../core/audit-log.service';
import { AuditLog } from '../core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-audit-log-viewer',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './audit-log-viewer.component.html',
  styleUrls: ['./audit-log-viewer.component.css'],
})
export class AuditLogViewerComponent implements OnInit {
  private readonly auditLogService = inject(AuditLogService);

  protected logs$!: Observable<AuditLog[]>;
  protected isLoading = true;
  protected readonly displayedColumns = ['action', 'entityName', 'entityId', 'createdAt', 'user', 'details'];

  ngOnInit(): void {
    this.logs$ = this.auditLogService.getLogs();
    this.logs$.subscribe({
      next: () => (this.isLoading = false),
      error: (err) => {
        console.error('Error loading audit logs:', err);
        this.isLoading = false;
      },
    });
  }

  protected refId(ref: unknown): string {
    if (!ref) return '—';
    if (typeof ref === 'object' && ref !== null && 'nom' in ref) {
      return String((ref as { nom?: string }).nom ?? '—');
    }
    if (typeof ref === 'string') {
      const m = ref.match(/\/(\d+)$/);
      return m ? `#${m[1]}` : ref;
    }
    return '—';
  }
}
