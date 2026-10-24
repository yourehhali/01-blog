import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { LikeResponse } from '../models/like';

@Injectable({ providedIn: 'root' })
export class LikeService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/api/posts`;

  like(postId: number): Observable<LikeResponse> {
    return this.http.post<LikeResponse>(`${this.apiBase}/${postId}/like`, {});
  }

  unlike(postId: number): Observable<LikeResponse> {
    return this.http.delete<LikeResponse>(`${this.apiBase}/${postId}/like`);
  }

  getStatus(postId: number): Observable<LikeResponse> {
    return this.http.get<LikeResponse>(`${this.apiBase}/${postId}/like`);
  }
}
