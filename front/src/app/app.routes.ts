import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';
import { LoginComponent } from './core/login.component';
import { RegisterComponent } from './core/register.component';

export const routes: Routes = [
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'citizen',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_CITIZEN'] },
    loadChildren: () => import('./citizen/citizen.routes').then((m) => m.citizenRoutes),
  },
  {
    path: 'agent',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_AGENT'] },
    loadChildren: () => import('./agent/agent.routes').then((m) => m.agentRoutes),
  },
  {
    path: 'supervisor',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    loadChildren: () => import('./supervisor/supervisor.routes').then((m) => m.supervisorRoutes),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];

