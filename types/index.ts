export interface UrlItem {
  id: string;
  originalUrl: string;
  shortCode: string;
  customAlias: string | null;
  userId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  expiresAt: string | Date | null;
  isActive: boolean;
  clickCount: number;
}

export interface ClickItem {
  id: string;
  urlId: string;
  timestamp: string | Date;
  referrer: string | null;
  userAgent: string | null;
  country: string | null;
  device: string | null;
  browser: string | null;
  operatingSystem: string | null;
}

export interface AnalyticsSummary {
  totalClicks: number;
  clicksToday: number;
  clicksThisWeek: number;
  clicksThisMonth: number;
  clicksOverTime: { date: string; clicks: number }[];
  devices: { name: string; value: number }[];
  browsers: { name: string; value: number }[];
  operatingSystems: { name: string; value: number }[];
  referrers: { name: string; value: number }[];
}

export interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  expiredLinks: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
