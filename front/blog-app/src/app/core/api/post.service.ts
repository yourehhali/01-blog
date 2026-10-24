import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { PostResponse, CreatePostRequest } from '../models/post';
import type { SpringPage } from '../models/spring-page';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/api/posts`;

  listPublished(page = 0, size = 10): Observable<SpringPage<PostResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<SpringPage<PostResponse>>(this.apiBase, { params });
  }

  listAllPublished(): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.apiBase}/all`);
  }

  followingFeed(page = 0, size = 10): Observable<SpringPage<PostResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<SpringPage<PostResponse>>(`${this.apiBase}/following`, { params });
  }

  getById(id: number): Observable<PostResponse> {
    return this.http.get<PostResponse>(`${this.apiBase}/${id}`);
  }

  getForEdit(id: number): Observable<PostResponse> {
    return this.http.get<PostResponse>(`${this.apiBase}/${id}/edit`);
  }

  getByUser(userId: number): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.apiBase}/users/${userId}`);
  }

  getByUserPaged(userId: number, page = 0, size = 10): Observable<SpringPage<PostResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<SpringPage<PostResponse>>(`${this.apiBase}/users/${userId}/paged`, { params });
  }

  create(request: CreatePostRequest): Observable<PostResponse> {
    return this.http.post<PostResponse>(this.apiBase, request);
  }

  createWithMedia(request: CreatePostRequest, media: File[]): Observable<PostResponse> {
    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify(request)], { type: 'application/json' })
    );
    media.forEach((file: File) => formData.append('media', file));
    return this.http.post<PostResponse>(this.apiBase, formData);
  }

  update(id: number, request: CreatePostRequest): Observable<PostResponse> {
    return this.http.put<PostResponse>(`${this.apiBase}/${id}`, request);
  }

  updateWithMedia(id: number, request: CreatePostRequest, media: File[]): Observable<PostResponse> {
    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify(request)], { type: 'application/json' })
    );
    media.forEach((file: File) => formData.append('media', file));
    return this.http.put<PostResponse>(`${this.apiBase}/${id}`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/${id}`);
  }
}
