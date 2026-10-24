
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { PostService } from '../../core/api/post.service';
import { PostResponse } from '../../core/models/post';
import { SpringPage } from '../../core/models/spring-page';
import { PostCardComponent } from '../post-card/post-card.component';
import {
  PaginationComponent,
  Page
} from '../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { NgIconComponent } from '@ng-icons/core';

@Component({
    selector: 'app-blog-list',
    imports: [
    PostCardComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    NgIconComponent
],
    templateUrl: './blog-list.component.html',
    styleUrls: ['./blog-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogListComponent implements OnInit {
  private readonly postService = inject(PostService);

  readonly page = signal<SpringPage<PostResponse> | null>(null);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly loading = signal(true);

  readonly paginationPage = computed<Page | null>(() => {
    const page = this.page();

    if (!page) {
      return null;
    }

    return {
      content: page.content,
      totalElements: page.totalElements,
      totalPages: page.totalPages,
      size: page.size,
      number: page.number,
      first: page.first,
      last: page.last,
      empty: page.empty
    };
  });

  ngOnInit(): void {
    this.loadPosts(this.currentPage());
  }

  onPageChange(pageNumber: number): void {
    this.currentPage.set(pageNumber);
    this.loadPosts(pageNumber);
  }

  trackById(_index: number, post: PostResponse): number {
    return post.id;
  }

  private loadPosts(pageNumber: number): void {
    this.loading.set(true);

    this.postService
      .listPublished(pageNumber, this.pageSize())
      .subscribe({
        next: (data) => {
          this.page.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }
}
