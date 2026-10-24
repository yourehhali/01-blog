import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostResponse } from '../../core/models/post';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { NgIconComponent } from "@ng-icons/core";

@Component({
    selector: 'app-post-card',
    imports: [CommonModule, RouterModule, MediaUrlPipe, NgIconComponent],
    templateUrl: './post-card.component.html',
    styleUrls: ['./post-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostCardComponent {
  @Input({ required: true }) post!: PostResponse;
  @Output() likeToggled = new EventEmitter<number>();

  onLikeClick(): void {
    this.likeToggled.emit(this.post.id);
  }

  get firstMediaUrl(): string | null {
    return this.post.mediaUrls && this.post.mediaUrls.length > 0 ? this.post.mediaUrls[0] : null;
  }
}
