import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService } from '../../core/api/admin.service';
import { AlertService } from '../../core/api/alert.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import type { ReportAdminResponse } from '../../core/models/admin';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { NgIconComponent } from "@ng-icons/core";

@Component({
    selector: 'app-admin-reports-table',
    imports: [
        CommonModule,
        DatePipe,
        LoadingSpinnerComponent,
        NgIconComponent
    ],
    templateUrl: './admin-reports-table.component.html',
    styleUrls: ['./admin-reports-table.component.scss']
})
export class AdminReportsTableComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);
  private readonly confirmService = inject(ConfirmService);
  private readonly destroyRef = inject(DestroyRef);

  readonly reports = signal<ReportAdminResponse[]>([]);
  readonly loading = signal(false);
  private readonly processingIds = signal<Set<number>>(new Set());

  readonly isEmpty = computed(() => this.reports().length === 0 && !this.loading());
  readonly showTable = computed(() => this.reports().length > 0 || !this.loading());

  isProcessing(id: number): boolean {
    return this.processingIds().has(id);
  }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading.set(true);
    this.adminService
      .listAllReports()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: ReportAdminResponse[]) => {
          this.reports.set(data);
        },
        error: () => {
          this.alertService.danger('Failed to load reports');
        },
      })
      .add(() => {
        this.loading.set(false);
      });
  }

  dismissReport(report: ReportAdminResponse): void {
    if (this.isProcessing(report.id)) return;

    this.confirmService
      .open({
        title: 'Dismiss Report',
        message: `Are you sure you want to dismiss this ${report.reportType.toLowerCase()} report from @${report.reporterUsername} against @${report.targetUsername}? This action cannot be undone.`,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed: boolean) => {
        if (!confirmed) return;

        this.addProcessing(report.id);
        this.adminService
          .deleteReport(report.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.reports.update((r) => r.filter((x) => x.id !== report.id));
              this.alertService.success(`Report #${report.id} dismissed`);
            },
            error: () => {
              this.alertService.danger('Failed to dismiss report');
            },
          })
          .add(() => {
            this.removeProcessing(report.id);
          });
      });
  }

  private addProcessing(id: number): void {
    this.processingIds.update((set) => new Set(set).add(id));
  }

  private removeProcessing(id: number): void {
    this.processingIds.update((set) => {
      const next = new Set(set);
      next.delete(id);
      return next;
    });
  }
}
