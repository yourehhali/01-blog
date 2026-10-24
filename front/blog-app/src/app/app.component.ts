import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertListComponent } from './shared/components/alert-list/alert-list.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, AlertListComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'blog-app';
}
