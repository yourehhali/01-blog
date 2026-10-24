import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../api/auth.service';

export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuth: boolean): boolean | UrlTree => {
      if (isAuth) return true;
      const returnUrl = state.url && state.url.length > 0 ? state.url : undefined;
      if (returnUrl) {
        return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
      }
      return router.createUrlTree(['/login']);
    })
  );
};
