import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged } from 'rxjs';

import { AuthService } from '../../core/api/auth.service';
import { NotificationService } from '../../core/api/notification.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MediaUrlPipe,
    NgIconComponent,
  ],
  templateUrl: './authenticated-layout.component.html',
  styleUrls: ['./authenticated-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticatedLayoutComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly currentUser = toSignal(this.auth.currentUser$, {
    initialValue: null,
  });

  readonly isAuthenticated = toSignal(this.auth.isAuthenticated$, {
    initialValue: false,
  });

  readonly isAdmin = toSignal(this.auth.isAdmin$, {
    initialValue: false,
  });

  readonly unreadCount = signal(0);
  readonly todayYear = new Date().getFullYear();

  ngOnInit(): void {
    this.listenToAuthentication();
    this.listenToNotifications();
  }

  private listenToAuthentication(): void {
    this.auth.isAuthenticated$
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((authenticated) => {
        if (authenticated) {
          this.loadUnreadCount();
          this.notification.startStream();
        } else {
          this.notification.stopStream();
          this.unreadCount.set(0);
        }
      });
  }

  private listenToNotifications(): void {
    this.notification.notification$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.isAuthenticated()) {
          this.unreadCount.update((count) => count + 1);
        }
      });
  }

  private loadUnreadCount(): void {
    this.notification
      .getUnreadCount()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.unreadCount.set(response.count);
        },
      });
  }

  markAllAsReadClick(): void {
    this.notification
      .markAllAsRead()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.unreadCount.set(0);
        },
        error: (error) => {
          console.error('Failed to mark notifications as read:', error);
        },
      });
  }

  logout(): void {
    this.auth
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.router.navigate(['/']);
        },
      });
  }
}
