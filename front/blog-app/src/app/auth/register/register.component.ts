
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, AlertService } from '../../core/api';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgIconComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]
    ],
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128)
      ]
    ]
  });

  readonly serverError = signal<string | null>(null);
  readonly submitting = signal(false);

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.serverError.set(null);

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.alertService.success('Registration successful');
        void this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        const errBody = err.error as
          | { error?: string }
          | null
          | undefined;

        const message =
          typeof errBody?.error === 'string'
            ? errBody.error
            : 'Registration failed';

        this.serverError.set(message);
        this.alertService.error(message);
      }
    }).add(() => {
      this.submitting.set(false);
    });
  }
}
