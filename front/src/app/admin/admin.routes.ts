import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { UserManagementComponent } from './user-management.component';
import { CategoryManagementComponent } from './category-management.component';
import { AuditLogViewerComponent } from './audit-log-viewer.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
  },
  {
    path: 'users',
    component: UserManagementComponent,
  },
  {
    path: 'categories',
    component: CategoryManagementComponent,
  },
  {
    path: 'audit-log',
    component: AuditLogViewerComponent,
  },
];
