import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Report } from '../core/models';
import { PriorityBadgeComponent } from './priority-badge.component';
import { StatusBadgeComponent } from './status-badge.component';

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, PriorityBadgeComponent, StatusBadgeComponent],
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.css'],
})
export class ReportCardComponent {
  @Input() report!: Report;
}
