import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  computed,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { NgIconComponent } from '@ng-icons/core';

import { CommentService } from '../../core/api/comment.service';
import { AuthService } from '../../core/api/auth.service';
import { AlertService } from '../../core/api/alert.service';
import { CommentResponse } from '../../core/models/comment';

@Component({
  selector: 'app-comments-section',
  standalone: true,
  imports: [
    DatePipe,
    RouterModule,
    ReactiveFormsModule,
    NgIconComponent,
  ],
  templateUrl: './comments-section.component.html',
  styleUrls: ['./comments-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsSectionComponent implements OnChanges {
  @Input({ required: true }) postId!: number;

  private readonly commentService = inject(CommentService);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly comments = signal<CommentResponse[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly deletingId = signal<number | null>(null);

  readonly MAX_CONTENT_LENGTH = 1000;

  readonly form = this.fb.nonNullable.group({
    content: [
      '',
      [
        Validators.required,
        Validators.maxLength(this.MAX_CONTENT_LENGTH),
      ],
    ],
  });

  readonly isAuthenticated = computed(
    () => this.authService.isAuthenticatedSnapshot,
  );

  readonly currentUserUsername = computed(
    () => this.authService.currentUserSnapshot?.username ?? null,
  );

  readonly contentRemaining = computed(
    () =>
      this.MAX_CONTENT_LENGTH -
      this.form.controls.content.value.length,
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['postId'] && this.postId != null) {
      this.comments.set([]);
      this.loadComments();
    }
  }

  onSubmit(): void {
    if (
      this.form.invalid ||
      this.submitting() ||
      !this.isAuthenticated()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.form.controls.content.disable();

    this.commentService
      .add(this.postId, this.form.getRawValue())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.form.controls.content.enable();
          this.submitting.set(false);
        }),
      )
      .subscribe({
        next: (comment) => {
          this.comments.update((comments) => [...comments, comment]);
          this.form.reset({ content: '' });
          this.alertService.success('Comment added');
        },
        error: (err) => {
          const message =
            err?.error?.error ?? 'Failed to add comment';
          this.alertService.danger(message);
        },
      });
  }

  onDelete(commentId: number): void {
    if (this.deletingId() !== null) {
      return;
    }

    this.deletingId.set(commentId);

    this.commentService
      .delete(this.postId, commentId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deletingId.set(null)),
      )
      .subscribe({
        next: () => {
          this.comments.update((comments) =>
            comments.filter((comment) => comment.id !== commentId),
          );
          this.alertService.success('Comment deleted');
        },
        error: (err) => {
          const message =
            err?.error?.error ?? 'Failed to delete comment';
          this.alertService.danger(message);
        },
      });
  }

  canDelete(comment: CommentResponse): boolean {
    const username = this.currentUserUsername();

    return (
      username !== null &&
      comment.authorUsername === username
    );
  }

  private loadComments(): void {
    this.loading.set(true);

    this.commentService
      .listByPost(this.postId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (comments) => this.comments.set(comments),
        error: () => {
          this.comments.set([]);
          this.alertService.danger('Failed to load comments');
        },
      });
  }
}
