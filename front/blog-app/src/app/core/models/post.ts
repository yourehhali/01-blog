export interface PostResponse {
  id: number;
  authorUsername: string;
  title: string;
  content: string;
  published: boolean;
  hiddenByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  likes: number;
  commentsCount: number;
  likedByRequester: boolean;
  mediaUrls: string[];
}

export interface CreatePostRequest {
  title: string;
  content: string;
  published: boolean;
  mediaUrls?: string[];
}
