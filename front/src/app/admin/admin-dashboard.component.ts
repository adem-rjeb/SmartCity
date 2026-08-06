import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { UserManagementComponent } from './user-management.component';
import { CategoryManagementComponent } from './category-management.component';
import { AuditLogViewerComponent } from './audit-log-viewer.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    UserManagementComponent,
    CategoryManagementComponent,
    AuditLogViewerComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],

})
export class AdminDashboardComponent {}
