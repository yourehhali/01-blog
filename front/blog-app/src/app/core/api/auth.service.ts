import { Injectable, APP_INITIALIZER, inject, Provider } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  AuthResponse,
  LogoutRequest,
  MessageResponse,
} from '../models/auth';
import type { UserResponse } from '../models/user';
import { UserService } from './user.service';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export function provideAuthInitializer(): Provider {
  return {
    provide: APP_INITIALIZER,
    useFactory: (authService: AuthService) => () => authService.restoreFromStorage().toPromise().then(() => undefined),
    deps: [AuthService],
    multi: true,
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  private readonly apiBase = `${environment.apiUrl}/api/auth`;

  private readonly currentUserSubject = new BehaviorSubject<UserResponse | null>(null);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private readonly isAdminSubject = new BehaviorSubject<boolean>(false);
  private readonly accessTokenSubject = new BehaviorSubject<string | null>(null);
  private readonly refreshTokenSubject = new BehaviorSubject<string | null>(null);

  readonly currentUser$: Observable<UserResponse | null> = this.currentUserSubject.asObservable();
  readonly isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();
  readonly isAdmin$: Observable<boolean> = this.isAdminSubject.asObservable();

  get currentUserSnapshot(): UserResponse | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticatedSnapshot(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get isAdminSnapshot(): boolean {
    return this.isAdminSubject.value;
  }

  get accessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }



  register(request: RegisterRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiBase}/register`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBase}/login`, request).pipe(
      tap((response: AuthResponse) => {
        this.storeTokens(response.accessToken, response.refreshToken);
        this.fetchCurrentUser().subscribe();
      })
    );
  }

  refresh(request: RefreshTokenRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBase}/refresh`, request).pipe(
      tap((response: AuthResponse) => {
        this.storeTokens(response.accessToken, response.refreshToken);
      })
    );
  }

  logout(): Observable<MessageResponse> {
    const refreshToken = this.refreshTokenSubject.value;
    const body: LogoutRequest = { refreshToken: refreshToken ?? '' };
    return this.http.post<MessageResponse>(`${this.apiBase}/logout`, body).pipe(
      tap(() => this.clearAuthState()),
      catchError(() => {
        this.clearAuthState();
        return of({ message: 'Logged out' });
      })
    );
  }

  restoreFromStorage(): Observable<UserResponse | null> {
    const storedAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!storedAccess || !storedRefresh) {
      this.clearAuthState();
      return of(null);
    }

    this.accessTokenSubject.next(storedAccess);
    this.refreshTokenSubject.next(storedRefresh);
    this.isAuthenticatedSubject.next(true);

    return this.fetchCurrentUser().pipe(
      catchError(() => {
        this.clearAuthState();
        return of(null);
      })
    );
  }

  private fetchCurrentUser(): Observable<UserResponse | null> {
    return this.userService.getMe().pipe(
      take(1),
      tap((user: UserResponse) => {
        this.currentUserSubject.next(user);
        this.isAdminSubject.next(user.role === 'ADMIN');
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
        this.isAdminSubject.next(false);
        return of(null);
      })
    );
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this.accessTokenSubject.next(accessToken);
    this.refreshTokenSubject.next(refreshToken);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuthState(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.accessTokenSubject.next(null);
    this.refreshTokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.isAdminSubject.next(false);
  }
}
