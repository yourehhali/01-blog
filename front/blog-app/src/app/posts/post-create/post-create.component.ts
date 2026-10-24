import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Router } from '@angular/router';
import { PostService } from '../../core/api/post.service';
import { AlertService } from '../../core/api/alert.service';
import { PostResponse } from '../../core/models/post';
import {
  PostFormComponent,
  PostFormSubmitEvent
} from '../post-form/post-form.component';
import { NgIconComponent } from "@ng-icons/core";

@Component({
    selector: 'app-post-create',
    imports: [PostFormComponent, NgIconComponent],
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostCreateComponent {
  private readonly postService = inject(PostService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  submitting = false;

  onSubmitCreate(event: PostFormSubmitEvent): void {
    if (this.submitting) return;

    this.submitting = true;
    const hasFiles = event.files.length > 0;

    const request$ = hasFiles
      ? this.postService.createWithMedia(event.request, event.files)
      : this.postService.create(event.request);

    request$.subscribe({
      next: (post: PostResponse) => {
        this.alertService.success('Post created successfully');
        this.router.navigate(['/posts', post.id]);
      },
      error: (err) => {
        const message = err?.error?.error ?? 'Failed to create post';
        this.alertService.danger(message + '. Please try again.');
      }
    }).add(() => {
      this.submitting = false;
    });
  }

  onCancel(): void {
    this.router.navigate(['/blog']);
  }
}
