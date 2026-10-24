import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PostService } from '../../core/api/post.service';
import { PostResponse } from '../../core/models/post';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { NgIconComponent } from "@ng-icons/core";

@Component({
    selector: 'app-post-sidebar',
    imports: [CommonModule, RouterModule, FormsModule, MediaUrlPipe, NgIconComponent],
    templateUrl: './post-sidebar.component.html',
    styleUrls: ['./post-sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostSidebarComponent implements OnInit {
  private readonly postService = inject(PostService);
  private readonly router = inject(Router);

  recentPosts: PostResponse[] = [];
  popularPosts: PostResponse[] = [];
  searchQuery = '';
  loaded = false;

  ngOnInit(): void {
    this.postService.listPublished(0, 3).subscribe({
      next: (page) => {
        this.recentPosts = page.content;
        this.popularPosts = page.content;
        this.loaded = true;
      }
    });
  }

  onSearchSubmit(): void {
    const query = this.searchQuery.trim();
    if (query) {
      this.router.navigate(['/users'], { queryParams: { search: query } });
    }
  }

  getFirstMediaUrl(post: PostResponse): string | null {
    return post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : null;
  }

  trackById(_index: number, post: PostResponse): number {
    return post.id;
  }
}
