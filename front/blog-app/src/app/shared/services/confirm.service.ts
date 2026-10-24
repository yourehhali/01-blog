import { Injectable, ApplicationRef, ComponentRef, EnvironmentInjector, inject, createComponent } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { ConfirmModalComponent } from '../components/confirm-modal/confirm-modal.component';

export interface ConfirmOptions {
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  open(options: ConfirmOptions): Observable<boolean> {
    const result$ = new ReplaySubject<boolean>(1);

    const componentRef: ComponentRef<ConfirmModalComponent> = createComponent(ConfirmModalComponent, {
      environmentInjector: this.injector
    });

    componentRef.instance.title = options.title;
    componentRef.instance.message = options.message;

    componentRef.instance.confirmed.subscribe((confirmed: boolean) => {
      result$.next(confirmed);
      result$.complete();
      setTimeout(() => {
        componentRef.destroy();
        this.appRef.detachView(componentRef.hostView);
      }, 300);
    });

    this.appRef.attachView(componentRef.hostView);
    const view = componentRef.hostView as unknown as { rootNodes: readonly Node[] };
    const domElem = view.rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    componentRef.instance.open();

    return result$.asObservable();
  }
}
