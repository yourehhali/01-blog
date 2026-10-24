import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AuthenticatedLayoutComponent } from './layouts/authenticated-layout/authenticated-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { authenticatedLayoutCanMatch } from './core/guards/authenticated-layout.canmatch';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canMatch: [authenticatedLayoutCanMatch],
    canActivate: [authGuard],
    children: [
      {
        path: 'feed',
        loadComponent: () => import('./posts/following-feed/following-feed.component').then((m) => m.FollowingFeedComponent),
      },
      {
        path: 'posts/new',
        loadComponent: () => import('./posts/post-create/post-create.component').then((m) => m.PostCreateComponent),
      },
      {
        path: 'posts/:id/edit',
        loadComponent: () => import('./posts/post-edit/post-edit.component').then((m) => m.PostEditComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./users/profile-edit/profile-edit.component').then((m) => m.UsersProfileEditComponent),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./notifications/notifications-list/notifications-list.component').then((m) => m.NotificationsListComponent),
      },
    ],
  },

  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./posts/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'blog',
        loadComponent: () => import('./posts/blog-list/blog-list.component').then((m) => m.BlogListComponent),
      },
      {
        path: 'posts/:id',
        loadComponent: () => import('./posts/post-detail/post-detail.component').then((m) => m.PostDetailComponent),
      },
      {
        path: 'users/:username',
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () => import('./users/profile/profile.component').then((m) => m.UsersProfileComponent),
          },
          {
            path: 'followers',
            loadComponent: () => import('./users/follow-list/follow-list.component').then((m) => m.UsersFollowListComponent),
            data: { kind: 'followers' as const },
          },
          {
            path: 'following',
            loadComponent: () => import('./users/follow-list/follow-list.component').then((m) => m.UsersFollowListComponent),
            data: { kind: 'following' as const },
          },
        ],
      },
      {
        path: 'users/:id',
        redirectTo: (_route) => '/blog',
        pathMatch: 'full',
      },
      {
        path: 'about',
        loadComponent: () => import('./misc/about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: '404',
        loadComponent: () => import('./misc/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./admin/stats/admin-stats.component').then((m) => m.AdminStatsComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/users-table/admin-users-table.component').then((m) => m.AdminUsersTableComponent),
      },
      {
        path: 'posts',
        loadComponent: () => import('./admin/posts-table/admin-posts-table.component').then((m) => m.AdminPostsTableComponent),
      },
      {
        path: 'reports',
        loadComponent: () => import('./admin/reports-table/admin-reports-table.component').then((m) => m.AdminReportsTableComponent),
      },
    ],
  },

  { path: '**', redirectTo: '404', pathMatch: 'full' },
];
