import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Report } from '../core/models';
import { PriorityBadgeComponent } from './priority-badge.component';
import { StatusBadgeComponent } from './status-badge.component';
import { ReportDetailDialogComponent } from './report-detail-dialog.component';

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDialogModule, PriorityBadgeComponent, StatusBadgeComponent],
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.css'],
})
export class ReportCardComponent {
  @Input() report!: Report;
  private readonly dialog = inject(MatDialog);

  openDetails(): void {
    this.dialog.open(ReportDetailDialogComponent, {
      data: { report: this.report },
      width: '680px',
      maxWidth: '92vw',
    });
  }
}
