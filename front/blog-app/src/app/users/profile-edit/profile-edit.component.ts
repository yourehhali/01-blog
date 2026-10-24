
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserService } from '../../core/api/user.service';
import { AlertService } from '../../core/api/alert.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import type {
  UserResponse,
  UpdateProfileRequest,
} from '../../core/models/user';
import { NgIconComponent } from '@ng-icons/core';

@Component({
    selector: 'app-users-profile-edit',
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        MediaUrlPipe,
        LoadingSpinnerComponent,
        NgIconComponent,
    ],
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersProfileEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly currentUserSubject =
    new BehaviorSubject<UserResponse | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(true);
  private readonly submittingSubject = new BehaviorSubject<boolean>(false);
  private readonly selectedFileSubject = new BehaviorSubject<File | null>(null);
  private readonly previewUrlSubject =
    new BehaviorSubject<string | null>(null);

  readonly currentUser$: Observable<UserResponse | null> =
    this.currentUserSubject.asObservable();
  readonly loading$: Observable<boolean> =
    this.loadingSubject.asObservable();
  readonly submitting$: Observable<boolean> =
    this.submittingSubject.asObservable();
  readonly selectedFile$: Observable<File | null> =
    this.selectedFileSubject.asObservable();
  readonly previewUrl$: Observable<string | null> =
    this.previewUrlSubject.asObservable();

  readonly form: FormGroup<{ bio: FormControl<string> }> =
    this.fb.nonNullable.group({
      bio: ['', [Validators.maxLength(2000)]],
    });

  ngOnInit(): void {
    // Manage the bio control's disabled state through Angular Forms.
    this.submitting$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((submitting) => {
        const bioControl = this.form.controls.bio;

        if (submitting && bioControl.enabled) {
          bioControl.disable({ emitEvent: false });
        } else if (!submitting && bioControl.disabled) {
          bioControl.enable({ emitEvent: false });
        }
      });

    this.userService
      .getMe()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user: UserResponse) => {
          this.currentUserSubject.next(user);
          this.form.controls.bio.setValue(user.bio ?? '');
          this.loadingSubject.next(false);
        },
        error: () => {
          this.alertService.danger('Failed to load profile');
          this.loadingSubject.next(false);
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file: File | undefined = input.files?.[0];

    if (!file) {
      this.clearFile();
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.alertService.danger('Please select an image file');
      input.value = '';
      return;
    }

    const maxSizeMb = 50;

    if (file.size > maxSizeMb * 1024 * 1024) {
      this.alertService.danger(`File size must be under ${maxSizeMb}MB`);
      input.value = '';
      return;
    }

    this.selectedFileSubject.next(file);

    if (this.previewUrlSubject.value) {
      URL.revokeObjectURL(this.previewUrlSubject.value);
    }

    const url = URL.createObjectURL(file);
    this.previewUrlSubject.next(url);
  }

  clearFile(): void {
    if (this.previewUrlSubject.value) {
      URL.revokeObjectURL(this.previewUrlSubject.value);
    }

    this.selectedFileSubject.next(null);
    this.previewUrlSubject.next(null);

    const fileInput = document.getElementById(
      'profilePicture',
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.submittingSubject.value) {
      return;
    }

    const user = this.currentUserSubject.value;

    if (!user) {
      this.alertService.danger('No user loaded');
      return;
    }

    this.submittingSubject.next(true);

    const rawBio = this.form.getRawValue().bio;
    const normalizedBio: string | null =
      rawBio.trim().length === 0 ? null : rawBio.trim();

    const selectedFile = this.selectedFileSubject.value;

    const request: UpdateProfileRequest = {
      bio: normalizedBio,
    };

    if (selectedFile) {
      request.profilePicture = null;

      this.userService
        .updateMeWithProfilePicture(request, selectedFile)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updated: UserResponse) => {
            this.handleSuccess(updated, 'Profile updated with new picture');
          },
          error: (err: { error?: { error?: string } }) => {
            this.handleError(err);
          },
        })
        .add(() => {
          this.submittingSubject.next(false);
        });
    } else {
      request.profilePicture = user.profilePicture ?? null;

      this.userService
        .updateMe(request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updated: UserResponse) => {
            this.handleSuccess(updated, 'Profile updated');
          },
          error: (err: { error?: { error?: string } }) => {
            this.handleError(err);
          },
        })
        .add(() => {
          this.submittingSubject.next(false);
        });
    }
  }

  private handleSuccess(updated: UserResponse, message: string): void {
    this.alertService.success(message);
    this.router.navigate(['/users/', updated.username]);
  }

  private handleError(err: { error?: { error?: string } }): void {
    const message = err?.error?.error ?? 'Update failed';
    this.alertService.danger(message);
  }
}
