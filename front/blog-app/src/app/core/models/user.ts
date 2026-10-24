export type UserRole = 'USER' | 'ADMIN';

export interface UserResponse {
  id: number;
  username: string;
  email?: string;
  profilePicture: string | null;
  role: UserRole;
  active: boolean;
  bio: string | null;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

export interface UpdateProfileRequest {
  bio: string | null;
  profilePicture?: string | null;
}
