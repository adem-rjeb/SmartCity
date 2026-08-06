import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReportService } from '../core/report.service';
import { Report, ReportStatus } from '../core/models';
import { ReportCardComponent } from '../shared/report-card.component';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-pending-reports-queue',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatSnackBarModule,
    ReportCardComponent,
  ],
  templateUrl: './pending-reports-queue.component.html',
  styleUrls: ['./pending-reports-queue.component.css'],
})
export class PendingReportsQueueComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  protected reports$!: Observable<Report[]>;
  protected isLoading = true;

  ngOnInit(): void {
    this.loadPendingReports();
  }

  private loadPendingReports(): void {
    const pendingStatuses: ReportStatus[] = ['PENDING', 'UNDER_REVIEW'];
    this.reports$ = this.reportService.getReports().pipe(
      map((reports) => reports.filter((r) => pendingStatuses.includes(r.status))),
    );
    this.reports$.subscribe({
      next: () => (this.isLoading = false),
      error: (err) => {
        console.error('Error loading reports:', err);
        this.isLoading = false;
      },
    });
  }

  assignReport(report: Report): void {
    if (report.id) {
      this.router.navigate(['/supervisor/assignments', report.id]);
    }
  }

  rejectReport(report: Report): void {
    if (!report.id) {
      return;
    }

    const reason = prompt('Please enter a reason for rejecting this report:');
    if (reason === null) {
      return; // User cancelled
    }

    this.reportService.updateStatus(report.id, 'REJECTED').subscribe({
      next: () => {
        this.snackBar.open(`Report #${report.id} rejected.`, 'Close', { duration: 3000 });
        this.loadPendingReports();
      },
      error: (err) => {
        console.error('Error rejecting report:', err);
        this.snackBar.open('Failed to reject report. Please try again.', 'Close', { duration: 5000 });
      },
    });
  }
}

