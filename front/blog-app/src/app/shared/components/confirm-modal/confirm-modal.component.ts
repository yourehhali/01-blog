import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BootstrapModal {
  show(): void;
  hide(): void;
  dispose(): void;
}

interface BootstrapWindow {
  Modal?: {
    prototype: BootstrapModal;
    new (el: Element, options: { backdrop: string; keyboard: boolean }): BootstrapModal;
  };
}

declare global {
  interface Window {
    bootstrap?: BootstrapWindow;
  }
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmModalComponent implements AfterViewInit, OnDestroy {
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Output() confirmed = new EventEmitter<boolean>();

  @ViewChild('modal', { static: true }) modalEl!: ElementRef<HTMLDivElement>;

  private modalInstance: BootstrapModal | null = null;
  private hasEmitted = false;
  private hiddenListener: (() => void) | null = null;

  ngAfterViewInit(): void {
    if (this.modalEl && typeof window.bootstrap !== 'undefined') {
      this.modalInstance = new window.bootstrap.Modal(this.modalEl.nativeElement, {
        backdrop: 'static',
        keyboard: false
      });
      this.hiddenListener = this.onHidden.bind(this);
      this.modalEl.nativeElement.addEventListener('hidden.bs.modal', this.hiddenListener);
    }
  }

  open(): void {
    if (this.modalInstance) {
      this.modalInstance.show();
    }
  }

  confirm(): void {
    this.emitAndClose(true);
  }

  cancel(): void {
    this.emitAndClose(false);
  }

  private emitAndClose(result: boolean): void {
    if (this.hasEmitted) return;
    this.hasEmitted = true;
    this.confirmed.emit(result);
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  private onHidden(): void {
    if (!this.hasEmitted) {
      this.hasEmitted = true;
      this.confirmed.emit(false);
    }
  }

  ngOnDestroy(): void {
    if (this.modalEl?.nativeElement && this.hiddenListener) {
      this.modalEl.nativeElement.removeEventListener('hidden.bs.modal', this.hiddenListener);
      this.hiddenListener = null;
    }
    if (this.modalInstance) {
      this.modalInstance.dispose();
      this.modalInstance = null;
    }
  }
}
