import { ChangeDetectionStrategy, Component, inject, Input, OnInit, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../core/api/user.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import type { UserResponse } from '../../core/models/user';

export type FollowListKind = 'followers' | 'following';

@Component({
    selector: 'app-users-follow-list',
    imports: [
        CommonModule,
        RouterModule,
        DatePipe,
        MediaUrlPipe,
        LoadingSpinnerComponent
    ],
    templateUrl: './follow-list.component.html',
    styleUrls: ['./follow-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersFollowListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly usersSubject = new BehaviorSubject<UserResponse[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(true);
  private readonly errorSubject = new BehaviorSubject<boolean>(false);

  @Input() kind: FollowListKind | null = null;
  @Input() username: string | null = null;

  readonly users$: Observable<UserResponse[]> = this.usersSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly error$: Observable<boolean> = this.errorSubject.asObservable();

  ngOnInit(): void {
    const routeUsername = this.route.snapshot.params['username'];
    const routeKind = this.resolveKindFromRoute();

    const effectiveUsername = this.username ?? routeUsername;
    const effectiveKind = this.kind ?? routeKind;

    if (!effectiveUsername || !effectiveKind) {
      this.loadingSubject.next(false);
      this.errorSubject.next(true);
      return;
    }

    this.loadData(effectiveKind, effectiveUsername);
  }

  private resolveKindFromRoute(): FollowListKind | null {
    const url = this.route.snapshot.url;
    const lastSegment = url[url.length - 1]?.path;
    if (lastSegment === 'followers') return 'followers';
    if (lastSegment === 'following') return 'following';
    return null;
  }

  private loadData(kind: FollowListKind, username: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(false);
    this.usersSubject.next([]);

    const source$: Observable<UserResponse[]> = kind === 'followers'
      ? this.userService.getFollowers(username)
      : this.userService.getFollowing(username);

    source$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (users: UserResponse[]) => {
        this.usersSubject.next(users);
        this.loadingSubject.next(false);
      },
      error: () => {
        this.loadingSubject.next(false);
        this.errorSubject.next(true);
      }
    });
  }

  get displayKind(): string {
    return (this.kind ?? 'followers') === 'followers' ? 'Followers' : 'Following';
  }

  get displayUsername(): string {
    return this.username ?? this.route.snapshot.params['username'] ?? '';
  }
}
