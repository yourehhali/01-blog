import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  DestroyRef,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  switchMap,
  tap,
  finalize,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserService } from '../../core/api/user.service';
import { PostService } from '../../core/api/post.service';
import { AuthService } from '../../core/api/auth.service';
import { SubscriptionService } from '../../core/api/subscription.service';
import { ReportService } from '../../core/api/report.service';
import { AlertService } from '../../core/api/alert.service';

import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { ReportComponent } from '../../shared/components/report/report.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { PostCardComponent } from '../../posts/post-card/post-card.component';
import { NgIconComponent } from '@ng-icons/core';

import type { UserResponse } from '../../core/models/user';
import type { PostResponse } from '../../core/models/post';
import type { SubscriptionStatus } from '../../core/models/subscription';

@Component({
    selector: 'app-users-profile',
    imports: [
        CommonModule,
        RouterModule,
        DatePipe,
        MediaUrlPipe,
        ReportComponent,
        LoadingSpinnerComponent,
        PostCardComponent,
        NgIconComponent,
    ],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly postService = inject(PostService);
  private readonly authService = inject(AuthService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly reportService = inject(ReportService);
  private readonly alertService = inject(AlertService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly userSubject =
    new BehaviorSubject<UserResponse | null>(null);

  private readonly postsSubject =
    new BehaviorSubject<PostResponse[]>([]);

  private readonly loadingUserSubject =
    new BehaviorSubject<boolean>(true);

  private readonly loadingPostsSubject =
    new BehaviorSubject<boolean>(true);

  private readonly subStatusSubject =
    new BehaviorSubject<SubscriptionStatus | null>(null);

  private readonly subActionLoadingSubject =
    new BehaviorSubject<boolean>(false);

  readonly user$: Observable<UserResponse | null> =
    this.userSubject.asObservable();

  readonly posts$: Observable<PostResponse[]> =
    this.postsSubject.asObservable();

  readonly loadingUser$: Observable<boolean> =
    this.loadingUserSubject.asObservable();

  readonly loadingPosts$: Observable<boolean> =
    this.loadingPostsSubject.asObservable();

  readonly subStatus$: Observable<SubscriptionStatus | null> =
    this.subStatusSubject.asObservable();

  readonly subActionLoading$: Observable<boolean> =
    this.subActionLoadingSubject.asObservable();

  readonly auth$ = combineLatest({
    isAuthenticated: this.authService.isAuthenticated$,
    currentUser: this.authService.currentUser$,
  });

  // Report modal state
  readonly showReportModal = signal(false);
  readonly selectedReportUser = signal<UserResponse | null>(null);
  readonly reportSubmitting = signal(false);

  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const username = params['username'];

          if (!username) {
            this.loadingUserSubject.next(false);
            this.loadingPostsSubject.next(false);
            return of(null);
          }

          this.loadingUserSubject.next(true);
          this.loadingPostsSubject.next(true);
          this.userSubject.next(null);
          this.postsSubject.next([]);
          this.subStatusSubject.next(null);

          return this.userService.getByUsername(username).pipe(
            tap((user: UserResponse) => {
              this.userSubject.next(user);
              this.loadingUserSubject.next(false);

              this.postService.getByUser(user.id).subscribe({
                next: (posts: PostResponse[]) => {
                  this.postsSubject.next(posts);
                  this.loadingPostsSubject.next(false);
                },
                error: () => {
                  this.loadingPostsSubject.next(false);
                },
              });

              this.refreshSubStatus(user.id);
            })
          );
        })
      )
      .subscribe({
        error: () => {
          this.loadingUserSubject.next(false);
          this.loadingPostsSubject.next(false);
        },
      });
  }

  private refreshSubStatus(targetUserId: number): void {
    if (!this.authService.isAuthenticatedSnapshot) return;

    this.subscriptionService
      .getSubscriptionStatus(targetUserId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (status: SubscriptionStatus) => {
          this.subStatusSubject.next(status);
        },
        error: () => {},
      });
  }

  onToggleFollow(targetUser: UserResponse): void {
    if (this.subActionLoadingSubject.value) return;

    const currentUser = this.authService.currentUserSnapshot;

    if (!currentUser || targetUser.id === currentUser.id) return;

    const isSubscribed = !!this.subStatusSubject.value?.subscribed;

    this.subActionLoadingSubject.next(true);

    const action$: Observable<void> = isSubscribed
      ? this.subscriptionService.unsubscribe(targetUser.id)
      : this.subscriptionService.subscribe(targetUser.id);

    action$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const previous = this.subStatusSubject.value;
          const newSubscribed = !isSubscribed;
          const delta = newSubscribed ? 1 : -1;

          this.subStatusSubject.next({
            subscribed: newSubscribed,
            followersCount:
              (previous?.followersCount ?? targetUser.followersCount) + delta,
            followingCount:
              previous?.followingCount ?? targetUser.followingCount,
          });

          const existing = this.userSubject.value;

          if (existing) {
            this.userSubject.next({
              ...existing,
              followersCount: existing.followersCount + delta,
            });
          }

          this.alertService.success(
            newSubscribed ? 'Followed user' : 'Unfollowed user'
          );
        },
        error: () => {
          this.alertService.danger('Action failed');
        },
      })
      .add(() => {
        this.subActionLoadingSubject.next(false);
      });
  }

  // Open the report modal
  onReportUser(targetUser: UserResponse): void {
    if (this.reportSubmitting()) return;

    this.selectedReportUser.set(targetUser);
    this.showReportModal.set(true);
  }

  // Submit the report through the existing API service
  onSubmitUserReport(reason: string): void {
    const targetUser = this.selectedReportUser();
    const trimmedReason = reason.trim();

    if (
      !targetUser ||
      !trimmedReason ||
      this.reportSubmitting()
    ) {
      return;
    }

    this.reportSubmitting.set(true);

    this.reportService
      .submit({
        reportType: 'USER',
        targetId: targetUser.id,
        reason: trimmedReason,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.reportSubmitting.set(false))
      )
      .subscribe({
        next: () => {
          this.alertService.success('Report submitted');

          // Close the modal even while the request is still finalizing.
          this.resetReportModal();
        },
        error: () => {
          // Keep the modal open so the user can retry.
          this.alertService.danger('Failed to submit report');
        },
      });
  }

  // Close the modal after a successful submission or an allowed cancellation.
  private resetReportModal(): void {
    this.showReportModal.set(false);
    this.selectedReportUser.set(null);
  }

  closeReportModal(): void {
    if (this.reportSubmitting()) return;

    this.resetReportModal();
  }
}