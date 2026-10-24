import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../core/api/alert.service';
import { NgIconComponent } from "@ng-icons/core";

@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './alert-list.component.html',
  styleUrls: ['./alert-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertListComponent {
  private readonly alertService = inject(AlertService);
  readonly alerts$ = this.alertService.alerts$;

  dismiss(id: number): void {
    this.alertService.dismiss(id);
  }

  clear(): void {
    this.alertService.clear();
  }

  getClass(type: string): string {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'danger':
      case 'error':
        return 'alert-danger';
      case 'info':
        return 'alert-info';
      case 'warning':
        return 'alert-warning';
      default:
        return 'alert-secondary';
    }
  }

}
