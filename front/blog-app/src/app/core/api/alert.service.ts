import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AlertType = 'success' | 'danger' | 'warning' | 'info';

export interface Alert {
  id: number;
  type: AlertType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly alertsSubject = new BehaviorSubject<Alert[]>([]);
  private nextId = 0;

  get alerts$(): Observable<Alert[]> {
    return this.alertsSubject.asObservable();
  }

  success(message: string): void {
    this.add('success', message);
  }

  danger(message: string): void {
    this.add('danger', message);
  }

  warning(message: string): void {
    this.add('warning', message);
  }

  info(message: string): void {
    this.add('info', message);
  }

  error(message: string): void {
    this.add('danger', message);
  }

  dismiss(id: number): void {
    const current = this.alertsSubject.value;
    this.alertsSubject.next(current.filter(a => a.id !== id));
  }

  clear(): void {
    this.alertsSubject.next([]);
  }

  private add(type: AlertType, message: string): void {
    const id = ++this.nextId;
    const current = this.alertsSubject.value;
    this.alertsSubject.next([...current, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
