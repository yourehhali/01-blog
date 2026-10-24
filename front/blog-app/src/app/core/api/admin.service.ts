import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { PlatformStats, ReportAdminResponse } from '../models/admin';
import type { UserResponse } from '../models/user';
import type { PostResponse } from '../models/post';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/api/admin`;

  getStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${this.apiBase}/stats`);
  }

  listAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiBase}/users`);
  }

  listAllPosts(): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.apiBase}/posts`);
  }

  banUser(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiBase}/users/${id}/ban`, {});
  }

  unbanUser(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiBase}/users/${id}/unban`, {});
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/users/${id}`);
  }

  listAllReports(): Observable<ReportAdminResponse[]> {
    return this.http.get<ReportAdminResponse[]>(`${this.apiBase}/reports`);
  }

  deleteReport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/reports/${id}`);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/posts/${id}`);
  }

  hidePost(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiBase}/posts/${id}/hide`, {});
  }

  unhidePost(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiBase}/posts/${id}/unhide`, {});
  }
}
