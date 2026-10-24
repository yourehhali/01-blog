import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { UserResponse, UpdateProfileRequest } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/api/users`;

  getMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiBase}/me`);
  }

  updateMe(request: UpdateProfileRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiBase}/me`, request);
  }

  updateMeWithProfilePicture(request: UpdateProfileRequest, profilePicture: File): Observable<UserResponse> {
    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify(request)], { type: 'application/json' })
    );
    formData.append('profilePicture', profilePicture);
    return this.http.put<UserResponse>(`${this.apiBase}/me`, formData);
  }

  getByUsername(username: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiBase}/username/${encodeURIComponent(username)}`);
  }

  getById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiBase}/${id}`);
  }

  getFollowers(username: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiBase}/username/${encodeURIComponent(username)}/followers`);
  }

  getFollowing(username: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiBase}/username/${encodeURIComponent(username)}/following`);
  }

  listUsers(search?: string): Observable<UserResponse[]> {
    let params = new HttpParams();
    if (search !== undefined && search !== null && search.length > 0) {
      params = params.set('search', search);
    }
    return this.http.get<UserResponse[]>(this.apiBase, { params });
  }
}
