import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaUrlPipe } from '../../pipes/media-url.pipe';

@Component({
    selector: 'app-media-gallery',
    imports: [CommonModule, MediaUrlPipe],
    templateUrl: './media-gallery.component.html',
    styleUrls: ['./media-gallery.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaGalleryComponent {
  @Input() mediaUrls: string[] = [];
}
