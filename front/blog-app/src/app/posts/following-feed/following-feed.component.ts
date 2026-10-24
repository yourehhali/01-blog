import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../../core/api/post.service';
import { PostResponse } from '../../core/models/post';
import { SpringPage } from '../../core/models/spring-page';
import { PostCardComponent } from '../post-card/post-card.component';
import { PaginationComponent, Page } from '../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { NgIconComponent } from "@ng-icons/core";

@Component({
  selector: 'app-following-feed',
  standalone: true,
  imports: [CommonModule, PostCardComponent, PaginationComponent, LoadingSpinnerComponent, NgIconComponent],
  templateUrl: './following-feed.component.html',
  styleUrls: ['./following-feed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowingFeedComponent implements OnInit {
  private readonly postService = inject(PostService);
  private readonly cdr = inject(ChangeDetectorRef);

  page: SpringPage<PostResponse> | null = null;
  currentPage = 0;
  pageSize = 10;
  loading = true;

  ngOnInit(): void {
    this.loadPosts(this.currentPage);
  }

  onPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.loadPosts(pageNumber);
  }

  get paginationPage(): Page | null {
    if (!this.page) return null;
    return {
      content: this.page.content,
      totalElements: this.page.totalElements,
      totalPages: this.page.totalPages,
      size: this.page.size,
      number: this.page.number,
      first: this.page.first,
      last: this.page.last,
      empty: this.page.empty
    };
  }

  trackById(_index: number, post: PostResponse): number {
    return post.id;
  }

  private loadPosts(pageNumber: number): void {
    this.loading = true;

    this.postService.followingFeed(pageNumber, this.pageSize)
      .subscribe({
        next: (data) => {
          this.page = data;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }
}
