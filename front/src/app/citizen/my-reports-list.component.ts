import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportService } from '../core/report.service';
import { Report } from '../core/models';
import { ReportCardComponent } from '../shared/report-card.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-my-reports-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatButtonModule, MatProgressSpinnerModule, ReportCardComponent],
  templateUrl: './my-reports-list.component.html',
  styleUrls: ['./my-reports-list.component.css'],
})
export class MyReportsListComponent implements OnInit {
  private readonly reportService = inject(ReportService);

  protected reports$!: Observable<Report[]>;
  protected isLoading = true;

  ngOnInit(): void {
    this.reports$ = this.reportService.getMyReports();
    this.reports$.subscribe({
      next: () => (this.isLoading = false),
      error: (err) => {
        console.error('Error loading reports:', err);
        this.isLoading = false;
      },
    });
  }
}
