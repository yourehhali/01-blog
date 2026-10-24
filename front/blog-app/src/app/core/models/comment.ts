export interface CommentResponse {
  id: number;
  postId: number;
  content: string;
  authorUsername: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  content: string;
}
