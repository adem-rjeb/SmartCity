import { Routes } from '@angular/router';
import { AgentDashboardComponent } from './agent-dashboard.component';
import { AssignedTasksListComponent } from './assigned-tasks-list.component';
import { TaskDetailComponent } from './task-detail.component';

export const agentRoutes: Routes = [
  {
    path: '',
    component: AgentDashboardComponent,
  },
  {
    path: 'tasks',
    component: AssignedTasksListComponent,
  },
  {
    path: 'task/:id',
    component: TaskDetailComponent,
  },
];
