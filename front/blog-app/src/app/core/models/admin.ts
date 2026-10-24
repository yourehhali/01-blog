import type { ReportType } from './report';

export interface ReportAdminResponse {
  id: number;
  reportType: ReportType;
  targetId: number;
  targetUsername: string;
  reason: string;
  reporterUsername: string;
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalReports: number;
}
