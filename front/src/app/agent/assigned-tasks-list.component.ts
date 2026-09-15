import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { AssignmentService } from '../core/assignment.service';
import { Assignment, AssignmentStatus } from '../core/models';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-assigned-tasks-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './assigned-tasks-list.component.html',
  styleUrls: ['./assigned-tasks-list.component.css'],
})
export class AssignedTasksListComponent implements OnInit {
  private readonly assignmentService = inject(AssignmentService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly assignmentsSubject = new BehaviorSubject<Assignment[]>([]);
  protected readonly filterSubject = new BehaviorSubject<string>('ACTIVE');
  protected readonly searchSubject = new BehaviorSubject<string>('');

  protected isLoading = true;
  protected activeFilter = 'ACTIVE';
  protected searchQuery = '';
  protected filteredAssignments$!: Observable<Assignment[]>;

  // Counters
  protected counts = {
    active: 0,
    assigned: 0,
    accepted: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    all: 0,
  };

  ngOnInit(): void {
    this.loadAssignments();

    this.filteredAssignments$ = combineLatest([
      this.assignmentsSubject,
      this.filterSubject,
      this.searchSubject,
    ]).pipe(
      map(([assignments, filter, search]) => {
        const query = search.toLowerCase().trim();

        return assignments.filter((a) => {
          // Status Filter
          let matchesStatus = true;
          if (filter === 'ACTIVE') {
            matchesStatus = a.status === 'ASSIGNED' || a.status === 'ACCEPTED' || a.status === 'IN_PROGRESS';
          } else if (filter !== 'ALL') {
            matchesStatus = a.status === filter;
          }

          // Search Query Filter
          let matchesSearch = true;
          if (query) {
            const title = a.report?.titre?.toLowerCase() ?? '';
            const address = a.report?.adresse?.toLowerCase() ?? '';
            const category = (a.report?.category as any)?.nom?.toLowerCase() ?? '';
            const idStr = String(a.id);
            matchesSearch = title.includes(query) || address.includes(query) || category.includes(query) || idStr.includes(query);
          }

          return matchesStatus && matchesSearch;
        });
      }),
    );
  }

  loadAssignments(): void {
    this.isLoading = true;
    this.assignmentService.getAssignments().subscribe({
      next: (list) => {
        this.assignmentsSubject.next(list);
        this.updateCounts(list);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading assignments:', err);
        this.snackBar.open('Failed to load assignments.', 'Close', { duration: 4000 });
        this.isLoading = false;
      },
    });
  }

  private updateCounts(list: Assignment[]): void {
    this.counts.all = list.length;
    this.counts.assigned = list.filter((a) => a.status === 'ASSIGNED').length;
    this.counts.accepted = list.filter((a) => a.status === 'ACCEPTED').length;
    this.counts.inProgress = list.filter((a) => a.status === 'IN_PROGRESS').length;
    this.counts.completed = list.filter((a) => a.status === 'COMPLETED').length;
    this.counts.cancelled = list.filter((a) => a.status === 'CANCELLED').length;
    this.counts.active = this.counts.assigned + this.counts.accepted + this.counts.inProgress;
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterSubject.next(filter);
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  quickUpdateStatus(assignment: Assignment, status: AssignmentStatus, event: Event): void {
    event.stopPropagation();
    if (!assignment.id) return;
    this.assignmentService.updateAssignmentStatus(assignment.id, status).subscribe({
      next: () => {
        const msg =
          status === 'ACCEPTED'
            ? 'Task accepted!'
            : status === 'IN_PROGRESS'
            ? 'Work started on task.'
            : status === 'COMPLETED'
            ? 'Task marked as completed!'
            : status === 'CANCELLED'
            ? 'Task declined.'
            : 'Status updated.';
        this.snackBar.open(msg, 'OK', { duration: 3000 });
        this.loadAssignments();
      },
      error: (err) => {
        console.error('Error updating task status:', err);
        this.snackBar.open('Failed to update status.', 'Close', { duration: 4000 });
      },
    });
  }

  getPriorityClass(priority?: string): string {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return 'priority-tag priority-urgent';
      case 'HIGH':
        return 'priority-tag priority-high';
      case 'MEDIUM':
        return 'priority-tag priority-medium';
      case 'LOW':
        return 'priority-tag priority-low';
      default:
        return 'priority-tag';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ASSIGNED':
        return 'status-pill status-assigned';
      case 'ACCEPTED':
        return 'status-pill status-accepted';
      case 'IN_PROGRESS':
        return 'status-pill status-progress';
      case 'COMPLETED':
        return 'status-pill status-completed';
      case 'CANCELLED':
        return 'status-pill status-cancelled';
      default:
        return 'status-pill';
    }
  }
}
