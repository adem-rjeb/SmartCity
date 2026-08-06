import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ReportCreationFormComponent } from './report-creation-form.component';
import { MyReportsListComponent } from './my-reports-list.component';

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    ReportCreationFormComponent,
    MyReportsListComponent,
  ],
  templateUrl: './citizen-dashboard.component.html',
  styleUrls: ['./citizen-dashboard.component.css'],
})
export class CitizenDashboardComponent {}
