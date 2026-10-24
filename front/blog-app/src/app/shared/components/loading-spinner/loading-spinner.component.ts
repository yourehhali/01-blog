import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NgIconComponent } from "@ng-icons/core";

@Component({
    selector: 'app-loading-spinner',
    imports: [NgIconComponent],
    templateUrl: './loading-spinner.component.html',
    styleUrls: ['./loading-spinner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent {}
