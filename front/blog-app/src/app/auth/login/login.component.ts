
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
import {
  Router,
  RouterModule,
  ActivatedRoute
} from '@angular/router';
import { AuthService, AlertService } from '../../core/api';
import { NgIconComponent } from '@ng-icons/core';

@Component({
    selector: 'app-login',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        NgIconComponent
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required]
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

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl');

        // Prevent redirects to external URLs.
        const target =
          returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
            ? returnUrl
            : '/feed';

        this.alertService.success('Login successful');
        void this.router.navigateByUrl(target);
      },
      error: (err: HttpErrorResponse) => {
        const errBody = err.error as
          | { error?: string }
          | null
          | undefined;

        const message =
          typeof errBody?.error === 'string'
            ? errBody.error
            : 'Login failed';

        this.serverError.set(message);
        this.alertService.error(message);
      }
    }).add(() => {
      this.submitting.set(false);
    });
  }
}
