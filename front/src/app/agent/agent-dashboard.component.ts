import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AssignedTasksListComponent } from './assigned-tasks-list.component';
import { AssignmentService } from '../core/assignment.service';
import { Assignment } from '../core/models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
    AssignedTasksListComponent,
  ],
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.css'],
})
export class AgentDashboardComponent implements OnInit {
  private readonly assignmentService = inject(AssignmentService);

  protected completedAssignments$!: Observable<Assignment[]>;

  ngOnInit(): void {
    this.completedAssignments$ = this.assignmentService
      .getAssignments()
      .pipe(map((assignments) => assignments.filter((a) => a.status === 'COMPLETED')));
  }
}

