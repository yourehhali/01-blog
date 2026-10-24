export interface NotificationResponse {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
  targetUrl: string;
}

export interface UnreadCountResponse {
  count: number;
}
