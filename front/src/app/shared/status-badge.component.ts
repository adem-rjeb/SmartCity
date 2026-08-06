import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReportStatus } from '../core/models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.css'],
})
export class StatusBadgeComponent {
  @Input() status: ReportStatus | string = 'PENDING';

  get statusClass(): string {
    return (this.status || 'PENDING').toLowerCase().replace(/_/g, '-');
  }
}
