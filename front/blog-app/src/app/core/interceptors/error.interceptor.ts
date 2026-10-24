import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, catchError, filter, take, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../api/auth.service';
import { AlertService } from '../api/alert.service';
import type { ErrorResponse, AuthResponse } from '../models/auth';
import { environment } from '../../../environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  private refreshInProgress = false;
  private readonly refreshSubject = new BehaviorSubject<string | null>(null);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: unknown) => {
        if (!(error instanceof HttpErrorResponse)) {
          return throwError(() => error);
        }

        const authBase = `${environment.apiUrl}/api/auth`;
        const isAuthRefreshEndpoint = req.url === `${authBase}/refresh`;
        const isAuthLoginEndpoint = req.url === `${authBase}/login`;

        if (error.status === 401 && !isAuthRefreshEndpoint && !isAuthLoginEndpoint) {
          return this.handle401(req, next, error);
        }

        if (error.status === 403) {
          this.alertService.danger('Access denied');
          this.router.navigate(['/']);
          return throwError(() => error);
        }

        this.surfaceErrorAlert(error);
        return throwError(() => error);
      })
    );
  }

  private handle401(
    req: HttpRequest<unknown>,
    next: HttpHandler,
    originalError: HttpErrorResponse
  ): Observable<HttpEvent<unknown>> {
    if (this.refreshInProgress) {
      return this.refreshSubject.pipe(
        filter((token: string | null): token is string => token !== null),
        take(1),
        switchMap((newToken: string) => next.handle(this.cloneWithToken(req, newToken))),
        catchError(() => this.logoutAndRedirect(originalError))
      );
    }

    const refreshToken = this.authService.refreshToken;
    if (!refreshToken) {
      return this.logoutAndRedirect(originalError);
    }

    this.refreshInProgress = true;
    this.refreshSubject.next(null);

    return this.authService.refresh({ refreshToken }).pipe(
      catchError((refreshErr: unknown) => {
        this.refreshInProgress = false;
        this.refreshSubject.next(null);
        this.alertService.danger('Session expired. Please log in again.');
        return this.logoutAndRedirect(originalError);
      }),
      switchMap((response: AuthResponse) => {
        this.refreshInProgress = false;
        this.refreshSubject.next(response.accessToken);
        return next.handle(this.cloneWithToken(req, response.accessToken));
      })
    );
  }

  private cloneWithToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  private logoutAndRedirect(error: HttpErrorResponse): Observable<never> {
    this.authService.logout().subscribe({
      complete: () => {
        const returnUrl = this.router.url !== '/login' ? this.router.url : undefined;
        if (returnUrl && returnUrl.length > 0) {
          this.router.navigate(['/login'], { queryParams: { returnUrl } });
        } else {
          this.router.navigate(['/login']);
        }
      },
    });
    return throwError(() => error);
  }

  private surfaceErrorAlert(error: HttpErrorResponse): void {
    if (error.status !== 400 && error.status !== 401 && error.status !== 404 && error.status < 500) {
      return;
    }

    const body = error.error as ErrorResponse | null;
    const message = body && typeof body.error === 'string' ? body.error : this.defaultMessageForStatus(error.status);
    if (!message) {
      return;
    }

    if (error.status >= 500) {
      this.alertService.danger(message);
    } else if (error.status === 400) {
      this.alertService.warning(message);
    } else if (error.status === 401) {
      this.alertService.danger(message);
    } else {
      this.alertService.warning(message);
    }
  }

  private defaultMessageForStatus(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request';
      case 401:
        return 'Unauthorized';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Server error';
      default:
        return status >= 500 ? 'Server error' : 'Request failed';
    }
  }
}
