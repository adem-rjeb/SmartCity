import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { ReportService } from '../core/report.service';
import { Report } from '../core/models';
import { ReportCardComponent } from '../shared/report-card.component';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-my-reports-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
    ReportCardComponent,
  ],
  templateUrl: './my-reports-list.component.html',
  styleUrls: ['./my-reports-list.component.css'],
})
export class MyReportsListComponent implements OnInit {
  private readonly reportService = inject(ReportService);

  private readonly reportsSubject = new BehaviorSubject<Report[]>([]);
  protected readonly filterSubject = new BehaviorSubject<string>('ALL');
  protected readonly searchSubject = new BehaviorSubject<string>('');

  protected isLoading = true;
  protected activeFilter = 'ALL';
  protected searchQuery = '';
  protected filteredReports$!: Observable<Report[]>;

  protected stats = {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rate: 0,
  };

  ngOnInit(): void {
    this.loadReports();

    this.filteredReports$ = combineLatest([
      this.reportsSubject,
      this.filterSubject,
      this.searchSubject,
    ]).pipe(
      map(([reports, filter, search]) => {
        const query = search.toLowerCase().trim();

        return reports.filter((r) => {
          let matchesStatus = true;
          if (filter === 'PENDING') {
            matchesStatus = r.status === 'PENDING' || r.status === 'UNDER_REVIEW';
          } else if (filter === 'IN_PROGRESS') {
            matchesStatus = r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS';
          } else if (filter === 'RESOLVED') {
            matchesStatus = r.status === 'RESOLVED' || r.status === 'CLOSED';
          }

          let matchesSearch = true;
          if (query) {
            const title = r.titre?.toLowerCase() ?? '';
            const address = r.adresse?.toLowerCase() ?? '';
            const category = (r.category as any)?.nom?.toLowerCase() ?? '';
            matchesSearch = title.includes(query) || address.includes(query) || category.includes(query);
          }

          return matchesStatus && matchesSearch;
        });
      }),
    );
  }

  loadReports(): void {
    this.isLoading = true;
    this.reportService.getMyReports().subscribe({
      next: (list) => {
        this.reportsSubject.next(list);
        this.computeStats(list);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        this.isLoading = false;
      },
    });
  }

  private computeStats(list: Report[]): void {
    this.stats.total = list.length;
    this.stats.pending = list.filter((r) => r.status === 'PENDING' || r.status === 'UNDER_REVIEW').length;
    this.stats.inProgress = list.filter((r) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length;
    this.stats.resolved = list.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length;
    this.stats.rate = this.stats.total > 0 ? Math.round((this.stats.resolved / this.stats.total) * 100) : 0;
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterSubject.next(filter);
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }
}
