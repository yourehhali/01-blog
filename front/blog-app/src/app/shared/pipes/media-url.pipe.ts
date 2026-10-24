import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'mediaUrl',
  standalone: true,
  pure: true
})
export class MediaUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    const trimmed = value.startsWith('/') ? value.slice(1) : value;
    return `${environment.apiUrl}/media/${trimmed}`;
  }
}
