import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService } from '../../core/api/admin.service';
import { AlertService } from '../../core/api/alert.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import type { PostResponse } from '../../core/models/post';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { NgIconComponent } from "@ng-icons/core";

@Component({
  selector: 'app-admin-posts-table',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    LoadingSpinnerComponent,
    NgIconComponent
  ],
  templateUrl: './admin-posts-table.component.html',
  styleUrls: ['./admin-posts-table.component.scss'],
})
export class AdminPostsTableComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);
  private readonly confirmService = inject(ConfirmService);
  private readonly destroyRef = inject(DestroyRef);

  readonly posts = signal<PostResponse[]>([]);
  readonly loading = signal(false);
  private readonly processingIds = signal<Set<number>>(new Set());

  readonly isEmpty = computed(() => this.posts().length === 0 && !this.loading());
  readonly showTable = computed(() => this.posts().length > 0 || !this.loading());

  isProcessing(id: number): boolean {
    return this.processingIds().has(id);
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading.set(true);
    this.adminService
      .listAllPosts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: PostResponse[]) => {
          this.posts.set(data);
        },
        error: () => {
          this.alertService.danger('Failed to load posts');
        },
      })
      .add(() => {
        this.loading.set(false);
      });
  }

  hidePost(post: PostResponse): void {
    if (this.isProcessing(post.id)) return;
    this.addProcessing(post.id);

    this.adminService
      .hidePost(post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          post.hiddenByAdmin = true;
          this.posts.update((p) => [...p]);
          this.alertService.success(`Post #${post.id} hidden`);
        },
        error: () => {
          this.alertService.danger('Failed to hide post');
        },
      })
      .add(() => {
        this.removeProcessing(post.id);
      });
  }

  unhidePost(post: PostResponse): void {
    if (this.isProcessing(post.id)) return;
    this.addProcessing(post.id);

    this.adminService
      .unhidePost(post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          post.hiddenByAdmin = false;
          this.posts.update((p) => [...p]);
          this.alertService.success(`Post #${post.id} unhidden`);
        },
        error: () => {
          this.alertService.danger('Failed to unhide post');
        },
      })
      .add(() => {
        this.removeProcessing(post.id);
      });
  }

  deletePost(post: PostResponse): void {
    if (this.isProcessing(post.id)) return;

    this.confirmService
      .open({
        title: 'Delete Post',
        message: `Are you sure you want to permanently delete post #${post.id} "${post.title}"? This action cannot be undone.`,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed: boolean) => {
        if (!confirmed) return;

        this.addProcessing(post.id);
        this.adminService
          .deletePost(post.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.posts.update((p) => p.filter((x) => x.id !== post.id));
              this.alertService.success(`Post #${post.id} deleted`);
            },
            error: () => {
              this.alertService.danger('Failed to delete post');
            },
          })
          .add(() => {
            this.removeProcessing(post.id);
          });
      });
  }

  private addProcessing(id: number): void {
    this.processingIds.update((set) => new Set(set).add(id));
  }

  private removeProcessing(id: number): void {
    this.processingIds.update((set) => {
      const next = new Set(set);
      next.delete(id);
      return next;
    });
  }
}
