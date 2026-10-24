export interface SortObject {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableObject {
  sort: SortObject;
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}

export interface SpringPage<T> {
  content: T[];
  pageable: PageableObject;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}
