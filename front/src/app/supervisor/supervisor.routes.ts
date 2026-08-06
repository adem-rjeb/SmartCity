import { Routes } from '@angular/router';
import { SupervisorDashboardComponent } from './supervisor-dashboard.component';
import { PendingReportsQueueComponent } from './pending-reports-queue.component';
import { AssignmentInterfaceComponent } from './assignment-interface.component';

export const supervisorRoutes: Routes = [
  {
    path: '',
    component: SupervisorDashboardComponent,
  },
  {
    path: 'pending-reports',
    component: PendingReportsQueueComponent,
  },
  {
    path: 'assignments/:reportId',
    component: AssignmentInterfaceComponent,
  },
];
