import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { AssignmentService } from '../core/assignment.service';
import { Assignment } from '../core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-assigned-tasks-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './assigned-tasks-list.component.html',
  styleUrls: ['./assigned-tasks-list.component.css'],
})
export class AssignedTasksListComponent implements OnInit {
  private readonly assignmentService = inject(AssignmentService);

  protected assignments$!: Observable<Assignment[]>;
  protected isLoading = true;

  ngOnInit(): void {
    this.assignments$ = this.assignmentService.getAssignments();
    this.assignments$.subscribe({
      next: () => (this.isLoading = false),
      error: (err) => {
        console.error('Error loading assignments:', err);
        this.isLoading = false;
      },
    });
  }
}
