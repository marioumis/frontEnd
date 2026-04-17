export interface CategoryStat {
  categoryName: string;
  count: number;
}

export interface RecentDocument {
  id: number;
  documentName: string;
  userName: string;
  generatedAt: string;
}

export interface AdminStatsResponse {
  totalTemplates: number;
  totalCategories: number;
  totalUsers: number;
  totalGenerated: number;
  templatesByCategory: CategoryStat[];
  recentDocuments: RecentDocument[];
}