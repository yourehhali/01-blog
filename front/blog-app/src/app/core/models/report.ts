export type ReportType = 'POST' | 'USER';

export interface ReportRequest {
  reportType: ReportType;
  targetId: number;
  reason: string;
}
