import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = (route.data['roles'] as string[] | undefined) ?? [];
  const userRole = auth.getUserRole();

  if (!userRole) {
    return router.createUrlTree(['/login']);
  }

  if (requiredRoles.length === 0 || requiredRoles.includes(userRole)) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
