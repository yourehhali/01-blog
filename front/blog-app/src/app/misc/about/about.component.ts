import { Component, ChangeDetectionStrategy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { NgIconComponent } from "@ng-icons/core";

@Component({
    selector: 'app-about',
    imports: [RouterModule, NgIconComponent],
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent {}
