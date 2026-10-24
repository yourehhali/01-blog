import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { NgIconComponent } from "@ng-icons/core";

export interface Page<Item = unknown> {
  content: Item[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Component({
    selector: 'app-pagination',
    imports: [NgIconComponent],
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  @Input() page!: Page;
  @Output() pageChange = new EventEmitter<number>();

  onPageChange(pageNumber: number): void {
    if (pageNumber >= 0 && pageNumber < this.page.totalPages) {
      this.pageChange.emit(pageNumber);
    }
  }

  get pages(): (number | '...')[] {
    const totalPages = this.page.totalPages;
    const currentPage = this.page.number;
    const result: (number | '...')[] = [];

    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        result.push(i);
      }
      return result;
    }

    result.push(0);

    if (currentPage > 2) {
      result.push('...');
    }

    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    if (currentPage < totalPages - 3) {
      result.push('...');
    }

    result.push(totalPages - 1);

    return result;
  }
}
