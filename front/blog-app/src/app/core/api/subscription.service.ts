import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { SubscriptionStatus } from '../models/subscription';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/api/users`;

  subscribe(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/${userId}/subscribe`, {});
  }

  unsubscribe(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/${userId}/subscribe`);
  }

  getSubscriptionStatus(userId: number): Observable<SubscriptionStatus> {
    return this.http.get<SubscriptionStatus>(`${this.apiBase}/${userId}/subscription-status`);
  }
}
