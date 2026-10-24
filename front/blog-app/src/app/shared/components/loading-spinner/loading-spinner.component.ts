import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from "@ng-icons/core";

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent {}
