import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  NotificationResponse,
  UnreadCountResponse,
} from '../models/notification';
import type { SpringPage } from '../models/spring-page';
import { AuthService } from './auth.service';

interface SessionInvalidatedResponse {
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly apiBase = `${environment.apiUrl}/api/notifications`;

  private readonly notificationSubject =
    new Subject<NotificationResponse>();

  private readonly connectedSubject =
    new BehaviorSubject<boolean>(false);

  private readonly sessionInvalidatedSubject =
    new Subject<SessionInvalidatedResponse>();

  private eventSource: EventSource | null = null;

  readonly notification$: Observable<NotificationResponse> =
    this.notificationSubject.asObservable();

  readonly connected$: Observable<boolean> =
    this.connectedSubject.asObservable();

  readonly sessionInvalidated$: Observable<SessionInvalidatedResponse> =
    this.sessionInvalidatedSubject.asObservable();

  list(
    page = 0,
    size = 20,
  ): Observable<SpringPage<NotificationResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<SpringPage<NotificationResponse>>(
      this.apiBase,
      { params },
    );
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(
      `${this.apiBase}/unread-count`,
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiBase}/${id}/read`,
      {},
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(
      `${this.apiBase}/read-all`,
      {},
    );
  }

  startStream(): void {
    if (this.eventSource) {
      return;
    }

    const token = this.authService.accessToken;

    if (!token) {
      return;
    }

    const url =
      `${this.apiBase}/stream?token=${encodeURIComponent(token)}`;

    const source = new EventSource(url);
    this.eventSource = source;

    source.onopen = (): void => {
      this.connectedSubject.next(true);
    };

    source.addEventListener(
      'notification',
      (event: MessageEvent<string>): void => {
        try {
          const notification =
            JSON.parse(event.data) as NotificationResponse;

          this.notificationSubject.next(notification);
        } catch (error) {
          console.error(
            'Failed to parse SSE notification:',
            error,
          );
        }
      },
    );

    source.addEventListener('init', (): void => {
      this.connectedSubject.next(true);
    });

    source.addEventListener(
      'session-invalidated',
      (event: MessageEvent<string>): void => {
        try {
          const data =
            JSON.parse(event.data) as SessionInvalidatedResponse;

          this.sessionInvalidatedSubject.next(data);
        } catch {
          // Ignore malformed session events.
        }

        this.stopStream();
      },
    );

    source.onerror = (): void => {
      this.connectedSubject.next(false);

      // Do not close the source here.
      // EventSource handles reconnection automatically.
    };
  }

  stopStream(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.connectedSubject.next(false);
  }

  ngOnDestroy(): void {
    this.stopStream();
    this.notificationSubject.complete();
    this.connectedSubject.complete();
    this.sessionInvalidatedSubject.complete();
  }
}