import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReportPriority } from '../core/models';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './priority-badge.component.html',
  styleUrls: ['./priority-badge.component.css'],
})
export class PriorityBadgeComponent {
  @Input() priority: ReportPriority | string = 'MEDIUM';

  get priorityClass(): string {
    return (this.priority || 'MEDIUM').toLowerCase();
  }
}
