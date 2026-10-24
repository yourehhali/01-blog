import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent } from "@ng-icons/core";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {}
