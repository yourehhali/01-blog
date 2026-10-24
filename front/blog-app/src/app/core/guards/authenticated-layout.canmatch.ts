import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../api/auth.service';

const AUTHED_EXACT_SEGMENTS = new Set<string>(['feed', 'profile', 'notifications']);

export const authenticatedLayoutCanMatch: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (segments.length === 0) {
    return false;
  }
  const first = segments[0].path;
  const isKnownAuthedPath: boolean =
    AUTHED_EXACT_SEGMENTS.has(first) ||
    (first === 'posts' &&
      (segments.length === 2 && segments[1].path === 'new' ||
        segments.length === 3 && segments[2].path === 'edit'));

  if (!isKnownAuthedPath) {
    return false;
  }

  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuth: boolean): boolean | UrlTree => {
      if (isAuth) return true;
      const returnUrl = '/' + segments.map((s) => s.path).join('/');
      return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
    })
  );
};
