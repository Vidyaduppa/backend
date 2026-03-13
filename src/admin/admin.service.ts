import { Injectable } from '@nestjs/common';

interface AdminAnalyticsResponse {
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  averageRating: number;
  topProducts: Array<{ name: string; sales: number }>;
  revenueByCategory: Array<{ category: string; amount: number }>;
}

@Injectable()
export class AdminService {
  getAnalytics(): AdminAnalyticsResponse {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      activeUsers: 0,
      averageRating: 0,
      topProducts: [],
      revenueByCategory: [],
    };
  }
}
