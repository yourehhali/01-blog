import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../api/auth.service';
import { AlertService } from '../api/alert.service';

export const adminGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const alertService = inject(AlertService);
  const router = inject(Router);
  return authService.isAdmin$.pipe(
    take(1),
    map((isAdmin: boolean): boolean | UrlTree => {
      if (isAdmin) return true;
      alertService.danger('Admin access required');
      return router.createUrlTree(['/']);
    })
  );
};
