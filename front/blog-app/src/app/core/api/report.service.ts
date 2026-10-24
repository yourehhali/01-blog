import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ReportRequest } from '../models/report';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/api/reports`;

  submit(request: ReportRequest): Observable<void> {
    return this.http.post<void>(this.apiBase, request);
  }
}
