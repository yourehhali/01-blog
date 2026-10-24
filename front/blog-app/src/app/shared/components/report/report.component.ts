
import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
})
export class ReportComponent {
  readonly targetType = input<'user' | 'post'>('user');
  readonly targetUsername = input('');
  readonly targetTitle = input('');
  readonly submitting = input(false);

  readonly submitReport = output<string>();
  readonly cancel = output<void>();

  readonly reason = signal('');

  submit(): void {
    if (this.submitting()) return;

    const trimmedReason = this.reason().trim();

    if (!trimmedReason) return;

    this.submitReport.emit(trimmedReason);
  }

  onCancel(): void {
    if (this.submitting()) return;

    this.cancel.emit();
  }
}
