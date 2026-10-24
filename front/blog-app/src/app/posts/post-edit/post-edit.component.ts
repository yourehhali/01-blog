import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, catchError, finalize, switchMap, take, tap } from 'rxjs';

import { PostService } from '../../core/api/post.service';
import { AuthService } from '../../core/api/auth.service';
import { AlertService } from '../../core/api/alert.service';
import { ConfirmService } from '../../shared/services/confirm.service';

import { PostResponse } from '../../core/models/post';

import {
  PostFormComponent,
  PostFormSubmitEvent,
  PostFormInitialValues,
} from '../post-form/post-form.component';

import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { NgIconComponent } from '@ng-icons/core';

@Component({
    selector: 'app-post-edit',
    imports: [
    PostFormComponent,
    LoadingSpinnerComponent,
    NgIconComponent
],
    templateUrl: './post-edit.component.html',
    styleUrls: ['./post-edit.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postService = inject(PostService);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly confirmService = inject(ConfirmService);

  readonly post = signal<PostResponse | null>(null);
  readonly initialValues = signal<PostFormInitialValues | null>(null);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly deleting = signal(false);
  readonly postId = signal<number | null>(null);

  readonly isOwner = computed(() => {
    const username = this.authService.currentUserSnapshot?.username;
    const currentPost = this.post();

    return !!username &&
      !!currentPost &&
      username === currentPost.authorUsername;
  });

  ngOnInit(): void {
 

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || !Number.isInteger(id) || id <= 0) {
      this.loading.set(false);
      this.router.navigate(['/blog']);
      return;
    }


    this.postId.set(id);
    this.loadPost(id);
  }

  onSubmitUpdate(event: PostFormSubmitEvent): void {
    const id = this.postId();
    
    if (this.submitting() || id === null) {
      return;
    }

    this.submitting.set(true);

    const request$ = event.files.length > 0
      ? this.postService.updateWithMedia(id, event.request, event.files)
      : this.postService.update(id, event.request);

    request$
      .pipe(
        tap(),
        finalize(() => {
          this.submitting.set(false);
        }),
      )
      .subscribe({
        next: (updatedPost) => {
          this.alertService.success('Post updated successfully');
          this.router.navigate(['/posts', updatedPost.id]);
        },
        error: (err) => {
          const message =
            err?.error?.message ??
            err?.error?.error ??
            'Failed to update post';

          this.alertService.danger(message);
        },
      });
  }

  onDelete(): void {
    const id = this.postId();

    if (this.deleting() || id === null) {
      return;
    }

    this.confirmService
      .open({
        title: 'Delete Post',
        message:
          'Are you sure you want to delete this post? This action cannot be undone.',
      })
      .pipe(
        take(1),
        switchMap((confirmed) => {
          if (!confirmed) {
            return EMPTY;
          }
          this.deleting.set(true);
          return this.postService.delete(id);
        }),
        finalize(() => {
          this.deleting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.alertService.success('Post deleted');
          this.router.navigate(['/blog']);
        },
        error: (err) => {
          const message =
            err?.error?.message ??
            err?.error?.error ??
            'Failed to delete post';
          this.alertService.danger(message);
        },
      });
  }

  onCancel(): void {
    const id = this.postId();
    if (id !== null) {
      this.router.navigate(['/posts', id]);
    } else {
      this.router.navigate(['/blog']);
    }
  }

  private loadPost(id: number): void {
    this.loading.set(true);
    this.postService
      .getForEdit(id)
      .pipe(
        tap({
          next: () => {
          },
          error: () => {
          },
        }),
        catchError((err) => {
          const message =
            err?.error?.message ??
            err?.error?.error ??
            'Failed to load post for editing';

          this.alertService.danger(message);
          this.router.navigate(['/blog']);

          return EMPTY;
        }),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (post) => {

          this.post.set(post);

          this.initialValues.set({
            title: post.title,
            content: post.content,
            published: post.published,
            mediaUrls: [...(post.mediaUrls ?? [])],
          });
        },
        complete: () => {
        },
      });
  }
}
