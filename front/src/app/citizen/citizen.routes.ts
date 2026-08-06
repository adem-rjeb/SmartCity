import { Routes } from '@angular/router';
import { CitizenDashboardComponent } from './citizen-dashboard.component';
import { ReportCreationFormComponent } from './report-creation-form.component';
import { MyReportsListComponent } from './my-reports-list.component';

export const citizenRoutes: Routes = [
  {
    path: '',
    component: CitizenDashboardComponent,
  },
  {
    path: 'create',
    component: ReportCreationFormComponent,
  },
  {
    path: 'my-reports',
    component: MyReportsListComponent,
  },
];
