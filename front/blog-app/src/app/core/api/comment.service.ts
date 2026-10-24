import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CommentResponse, CreateCommentRequest } from '../models/comment';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/api/posts`;

  listByPost(postId: number): Observable<CommentResponse[]> {
    return this.http.get<CommentResponse[]>(`${this.apiBase}/${postId}/comments`);
  }

  add(postId: number, request: CreateCommentRequest): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`${this.apiBase}/${postId}/comments`, request);
  }

  delete(postId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/${postId}/comments/${commentId}`);
  }
}
