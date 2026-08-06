import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardStats } from './models';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly api = inject(ApiService);

  /**
   * Fetch dashboard statistics for supervisors and admins.
   * Includes reports by status, reports by category, and average resolution time.
   * TODO: backend should filter data by role (e.g. agents only see their assigned tasks).
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/stats/dashboard');
  }

  /**
   * Get resolution time statistics for a specific time range.
   * TODO: add query parameters like startDate, endDate if needed.
   */
  getResolutionStats(): Observable<{ averageResolutionTimeDays: number }> {
    return this.api.get<{ averageResolutionTimeDays: number }>('/stats/resolution-time');
  }
}
