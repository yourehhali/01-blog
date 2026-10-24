import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  ChangeDetectorRef,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService } from '../../core/api/admin.service';
import { AlertService } from '../../core/api/alert.service';
import type { PlatformStats } from '../../core/models/admin';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { NgIconComponent } from "@ng-icons/core";

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, NgIconComponent],
  templateUrl: './admin-stats.component.html',
  styleUrls: ['./admin-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStatsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  stats: PlatformStats | null = null;
  loading = false;

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.adminService
      .getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: PlatformStats) => {
          this.stats = data;
          this.cdr.markForCheck();
        },
        error: () => {
          this.alertService.danger('Failed to load platform stats');
        },
      })
      .add(() => {
        this.loading = false;
        this.cdr.markForCheck();
      });
  }
}
