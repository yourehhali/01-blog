import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter } from 'rxjs';

import { AuthService } from '../../core/api/auth.service';
import { NotificationService } from '../../core/api/notification.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { NgIconComponent } from '@ng-icons/core';

interface AdminNavLink {
  label: string;
  path: string;
  icon: string;
  exact?: boolean;
}

@Component({
    selector: 'app-admin-layout',
    imports: [
        CommonModule,
        RouterModule,
        MediaUrlPipe,
        NgIconComponent,
    ],
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notification = inject(NotificationService);

  readonly currentUser = toSignal(this.auth.currentUser$, {
    initialValue: null,
  });

  readonly isAdmin = toSignal(this.auth.isAdmin$, {
    initialValue: false,
  });

  readonly isAuthenticated = toSignal(this.auth.isAuthenticated$, {
    initialValue: false,
  });

  readonly activeRouteTitle = signal(
    this.titleForUrl(this.router.url),
  );

  readonly unreadCount = signal(0);
  readonly todayYear = new Date().getFullYear();

  readonly primaryLinks: AdminNavLink[] = [
    {
      label: 'Statistics',
      path: '/admin',
      icon: 'lucideLineChart',
      exact: true,
    },
    {
      label: 'Users',
      path: '/admin/users',
      icon: 'lucideUsers',
    },
    {
      label: 'Posts',
      path: '/admin/posts',
      icon: 'lucideNewspaper',
    },
    {
      label: 'Reports',
      path: '/admin/reports',
      icon: 'lucideFlag',
    },
  ];

  readonly secondaryLinks: AdminNavLink[] = [
    {
      label: 'Public Home',
      path: '/',
      icon: 'lucideHouse',
      exact: true,
    },
    {
      label: 'Following Feed',
      path: '/feed',
      icon: 'lucideSignal',
    },
    {
      label: 'All Posts',
      path: '/blog',
      icon: 'lucideFileText',
    },
  ];

  ngOnInit(): void {
    this.listenToRouteChanges();
    this.listenToAuthentication();
    this.listenToNotifications();
  }

  private listenToRouteChanges(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.activeRouteTitle.set(
          this.titleForUrl(event.urlAfterRedirects),
        );
      });
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

  private titleForUrl(url: string): string {
    if (url.startsWith('/admin/users')) {
      return 'Users';
    }

    if (url.startsWith('/admin/posts')) {
      return 'Posts';
    }

    if (url.startsWith('/admin/reports')) {
      return 'Reports';
    }

    return 'Statistics';
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
