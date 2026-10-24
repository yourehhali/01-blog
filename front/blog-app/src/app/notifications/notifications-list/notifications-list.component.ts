
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { NotificationService } from '../../core/api/notification.service';
import { AlertService } from '../../core/api/alert.service';
import { AuthService } from '../../core/api/auth.service';

import type { NotificationResponse } from '../../core/models/notification';
import type { SpringPage } from '../../core/models/spring-page';

import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { NgIconComponent } from '@ng-icons/core';

@Component({
    selector: 'app-notifications-list',
    imports: [
        CommonModule,
        DatePipe,
        PaginationComponent,
        LoadingSpinnerComponent,
        NgIconComponent,
    ],
    templateUrl: './notifications-list.component.html',
    styleUrls: ['./notifications-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsListComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly alertService = inject(AlertService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly page = signal<SpringPage<NotificationResponse> | null>(null);
  readonly loading = signal(false);
  readonly currentPage = signal(0);
  readonly pageSize = 20;
  readonly unreadCount = signal(0);

  ngOnInit(): void {
    this.loadPage(0);

    if (this.authService.isAuthenticatedSnapshot) {
      this.notificationService.startStream();

      this.notificationService.notification$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((notification: NotificationResponse) => {
          this.handlePushNotification(notification);
        });
    }
  }

  loadPage(page: number): void {
    this.loading.set(true);
    this.currentPage.set(page);

    this.notificationService
      .list(page, this.pageSize)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (data: SpringPage<NotificationResponse>) => {
          this.page.set(data);

          this.unreadCount.set(
            data.content.filter((notification) => !notification.read).length,
          );
        },
        error: () => {
          this.alertService.danger('Failed to load notifications');
        },
      });
  }

  onPageChange(page: number): void {
    this.loadPage(page);
  }

  onRowClick(notification: NotificationResponse): void {
    if (notification.read) {
      return;
    }

    this.notificationService
      .markAsRead(notification.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadPage(this.currentPage());
        },
        error: () => {
          this.alertService.danger(
            'Failed to mark notification as read',
          );
        },
      });
  }

  markAllRead(): void {
    if (this.loading() || this.unreadCount() === 0) {
      return;
    }

    this.notificationService
      .markAllAsRead()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.alertService.success(
            'All notifications marked as read',
          );

          this.loadPage(this.currentPage());
        },
        error: () => {
          this.alertService.danger('Failed to mark all as read');
        },
      });
  }

  private handlePushNotification(
    notification: NotificationResponse,
  ): void {
    const currentPage = this.page();

    if (!currentPage) {
      return;
    }

    const newContent = [
      notification,
      ...currentPage.content,
    ].slice(0, this.pageSize);

    this.page.set({
      ...currentPage,
      content: newContent,
      totalElements: currentPage.totalElements + 1,
    });

    if (!notification.read) {
      this.unreadCount.update((count) => count + 1);
    }
  }
}
