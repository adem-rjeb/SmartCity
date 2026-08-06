import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
 
import { MatTabsModule } from '@angular/material/tabs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { StatsService } from '../core/stats.service';
import { DashboardStats } from '../core/models';
import { PendingReportsQueueComponent } from './pending-reports-queue.component';
import { AssignmentInterfaceComponent } from './assignment-interface.component';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatTabsModule,
    NgxChartsModule,
    PendingReportsQueueComponent,
    AssignmentInterfaceComponent,
  ],
  templateUrl: './supervisor-dashboard.component.html',
  styleUrls: ['./supervisor-dashboard.component.css'],
})
export class SupervisorDashboardComponent implements OnInit {
  private readonly statsService = inject(StatsService);

  protected stats?: DashboardStats;

  ngOnInit(): void {
    this.statsService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
      },
    });
  }

  protected statusCount(status: string): number {
    return this.stats?.reportsByStatus?.find((s) => s.name === status)?.value ?? 0;
  }

  protected get avgResolutionDays(): string {
    const days = this.stats?.averageResolutionTimeDays ?? 0;
    return days.toFixed(1);
  }
}
