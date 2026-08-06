import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { AssignmentService } from '../core/assignment.service';
import { UserService } from '../core/user.service';
import { ReportService } from '../core/report.service';
import { User, Report, Assignment } from '../core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-assignment-interface',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './assignment-interface.component.html',
  styleUrls: ['./assignment-interface.component.css'],
})
export class AssignmentInterfaceComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly assignmentService = inject(AssignmentService);
  private readonly userService = inject(UserService);
  private readonly reportService = inject(ReportService);
  private readonly snackBar = inject(MatSnackBar);

  protected agents$!: Observable<User[]>;
  protected assignments: Assignment[] = [];
  protected selectedReport: Report | null = null;
  protected isLoading = true;
  protected isSubmitting = false;
  protected readonly displayedColumns = ['id', 'report', 'agent', 'status', 'assignedAt'];

  protected readonly form = this.fb.group({
    agentId: [null as number | null, [Validators.required]],
    commentaire: [''],
  });

  ngOnInit(): void {
    this.agents$ = this.userService.getUsersByRole('ROLE_AGENT');

    const reportId = Number(this.route.snapshot.paramMap.get('reportId'));
    if (reportId) {
      this.reportService.getReport(reportId).subscribe({
        next: (report) => {
          this.selectedReport = report;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Failed to load report.', 'Close', { duration: 4000 });
          this.isLoading = false;
        },
      });
      return;
    }

    this.loadAssignments();
  }

  private loadAssignments(): void {
    this.isLoading = true;
    this.assignmentService.getAssignments().subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading assignments:', err);
        this.snackBar.open('Failed to load assignments.', 'Close', { duration: 4000 });
        this.isLoading = false;
      },
    });
  }

  /** Extract numeric id from an IRI string or nested object. */
  protected refId(ref: unknown): string {
    if (!ref) return '—';
    if (typeof ref === 'object' && ref !== null && 'id' in ref) {
      return String((ref as { id?: number }).id ?? '—');
    }
    if (typeof ref === 'string') {
      const m = ref.match(/\/(\d+)$/);
      return m ? m[1] : ref;
    }
    return '—';
  }

  createAssignment(): void {
    if (this.form.invalid || !this.selectedReport?.id) {
      return;
    }

    this.isSubmitting = true;
    this.assignmentService
      .createAssignment(
        this.selectedReport.id,
        this.form.value.agentId!,
        this.form.value.commentaire || undefined,
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Report assigned successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/supervisor']);
        },
        error: (err) => {
          console.error('Error creating assignment:', err);
          this.snackBar.open(
            err?.error?.detail ?? 'Failed to create assignment. Please try again.',
            'Close',
            { duration: 5000 },
          );
          this.isSubmitting = false;
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/supervisor']);
  }
}
