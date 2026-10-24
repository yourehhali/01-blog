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
import type { UserResponse } from '../../core/models/user';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { NgIconComponent } from "@ng-icons/core";

@Component({
    selector: 'app-admin-users-table',
    imports: [
        CommonModule,
        DatePipe,
        LoadingSpinnerComponent,
        NgIconComponent
    ],
    templateUrl: './admin-users-table.component.html',
    styleUrls: ['./admin-users-table.component.scss']
})
export class AdminUsersTableComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);
  private readonly confirmService = inject(ConfirmService);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = signal<UserResponse[]>([]);
  readonly loading = signal(false);
  private readonly processingIds = signal<Set<number>>(new Set());

  readonly isEmpty = computed(() => this.users().length === 0 && !this.loading());
  readonly showTable = computed(() => this.users().length > 0 || !this.loading());

  isProcessing(id: number): boolean {
    return this.processingIds().has(id);
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.adminService
      .listAllUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: UserResponse[]) => {
          this.users.set(data);
        },
        error: () => {
          this.alertService.danger('Failed to load users');
        },
      })
      .add(() => {
        this.loading.set(false);
      });
  }

  banUser(user: UserResponse): void {
    if (this.isProcessing(user.id)) return;
    this.addProcessing(user.id);

    this.adminService
      .banUser(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          user.active = false;
          this.users.update((u) => [...u]);
          this.alertService.success(`User "${user.username}" banned`);
        },
        error: () => {
          this.alertService.danger('Failed to ban user');
        },
      })
      .add(() => {
        this.removeProcessing(user.id);
      });
  }

  unbanUser(user: UserResponse): void {
    if (this.isProcessing(user.id)) return;
    this.addProcessing(user.id);

    this.adminService
      .unbanUser(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          user.active = true;
          this.users.update((u) => [...u]);
          this.alertService.success(`User "${user.username}" unbanned`);
        },
        error: () => {
          this.alertService.danger('Failed to unban user');
        },
      })
      .add(() => {
        this.removeProcessing(user.id);
      });
  }

  deleteUser(user: UserResponse): void {
    if (this.isProcessing(user.id)) return;

    this.confirmService
      .open({
        title: 'Delete User',
        message: `Are you sure you want to permanently delete user "${user.username}"? This action cannot be undone.`,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed: boolean) => {
        if (!confirmed) return;

        this.addProcessing(user.id);
        this.adminService
          .deleteUser(user.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.users.update((u) => u.filter((x) => x.id !== user.id));
              this.alertService.success(`User "${user.username}" deleted`);
            },
            error: () => {
              this.alertService.danger('Failed to delete user');
            },
          })
          .add(() => {
            this.removeProcessing(user.id);
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
