
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  catchError,
  finalize,
  switchMap,
  tap,
} from 'rxjs';
import { NgIconComponent } from '@ng-icons/core';

import { PostService } from '../../core/api/post.service';
import { AuthService } from '../../core/api/auth.service';
import { LikeService } from '../../core/api/like.service';
import { ReportService } from '../../core/api/report.service';
import { AlertService } from '../../core/api/alert.service';

import { PostResponse } from '../../core/models/post';
import { LikeResponse } from '../../core/models/like';
import { SpringPage } from '../../core/models/spring-page';

import { MediaGalleryComponent } from '../../shared/components/media-gallery/media-gallery.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ReportComponent } from '../../shared/components/report/report.component';
import { CommentsSectionComponent } from '../comments-section/comments-section.component';
import { PostCardComponent } from '../post-card/post-card.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    DatePipe,
    RouterModule,
    MediaGalleryComponent,
    LoadingSpinnerComponent,
    ReportComponent,
    CommentsSectionComponent,
    PostCardComponent,
    NgIconComponent,
  ],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postService = inject(PostService);
  private readonly authService = inject(AuthService);
  private readonly likeService = inject(LikeService);
  private readonly reportService = inject(ReportService);
  private readonly alertService = inject(AlertService);
  private readonly destroyRef = inject(DestroyRef);

  readonly post = signal<PostResponse | null>(null);
  readonly loading = signal(true);
  readonly likeLoading = signal(false);
  readonly reportLoading = signal(false);
  readonly showReportForm = signal(false);

  readonly likes = signal(0);
  readonly likedByRequester = signal(false);
  readonly recentPosts = signal<PostResponse[]>([]);

  readonly isAuthenticated = computed(
    () => this.authService.isAuthenticatedSnapshot,
  );

  readonly canEdit = computed(() => {
    const username = this.authService.currentUserSnapshot?.username;
    const currentPost = this.post();

    return (
      !!username &&
      !!currentPost &&
      username === currentPost.authorUsername
    );
  });

  readonly postId = computed(() => this.post()?.id ?? null);

  constructor() {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const idParam = params.get('id');
          const id = Number(idParam);

          if (!idParam || !Number.isInteger(id) || id <= 0) {
            this.loading.set(false);
            this.router.navigate(['/blog']);
            return EMPTY;
          }

          this.loading.set(true);
          this.post.set(null);
          this.likes.set(0);
          this.likedByRequester.set(false);
          this.recentPosts.set([]);
          this.showReportForm.set(false);

          this.loadLikeStatus(id);
          this.loadRecentPosts(id);

          return this.postService.getById(id).pipe(
            tap((post) => {
              this.post.set(post);
              this.likes.set(post.likes);
              this.likedByRequester.set(post.likedByRequester);
            }),
            catchError((error) => {
              if (error?.status === 404) {
                this.router.navigate(['/not-found']);
              } else {
                this.alertService.danger('Failed to load post.');
                this.router.navigate(['/blog']);
              }

              return EMPTY;
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
      )
      .subscribe();
  }

  private loadRecentPosts(currentId: number): void {
    this.postService
      .listPublished(0, 6)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page: SpringPage<PostResponse>) => {
          this.recentPosts.set(
            page.content
              .filter((post) => post.id !== currentId)
              .slice(0, 3),
          );
        },
        error: () => {
          this.recentPosts.set([]);
        },
      });
  }

  private loadLikeStatus(id: number): void {
    this.likeService
      .getStatus(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: LikeResponse) => {
          this.likes.set(response.likes);
          this.likedByRequester.set(response.likedByRequester);
        },
        error: () => {
          // Keep the post usable if loading like status fails.
        },
      });
  }

  onToggleLike(): void {
    const currentPost = this.post();

    if (
      this.likeLoading() ||
      !this.isAuthenticated() ||
      !currentPost
    ) {
      return;
    }

    this.likeLoading.set(true);

    const request$ = this.likedByRequester()
      ? this.likeService.unlike(currentPost.id)
      : this.likeService.like(currentPost.id);

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.likeLoading.set(false)),
      )
      .subscribe({
        next: (response: LikeResponse) => {
          this.likes.set(response.likes);
          this.likedByRequester.set(response.likedByRequester);
        },
        error: (err) => {
          const message =
            err?.error?.error ?? 'Failed to update like';

          this.alertService.danger(message);
        },
      });
  }

  onOpenReport(): void {
    if (!this.isAuthenticated() || this.reportLoading()) {
      return;
    }

    this.showReportForm.set(true);
  }

  onCancelReport(): void {
    if (this.reportLoading()) {
      return;
    }

    this.showReportForm.set(false);
  }

  onSubmitReport(reason: string): void {
    const currentPost = this.post();
    const trimmedReason = reason.trim();

    if (
      this.reportLoading() ||
      !this.isAuthenticated() ||
      !currentPost
    ) {
      return;
    }

    if (!trimmedReason || trimmedReason.length > 1000) {
      return;
    }

    this.reportLoading.set(true);

    this.reportService
      .submit({
        reportType: 'POST',
        targetId: currentPost.id,
        reason: trimmedReason,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.reportLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.alertService.success(
            'Report submitted successfully.',
          );
          this.showReportForm.set(false);
        },
        error: (err) => {
          const message =
            err?.error?.error ??
            err?.error?.message ??
            'Failed to submit report. Please try again.';

          this.alertService.danger(message);
        },
      });
  }
}
