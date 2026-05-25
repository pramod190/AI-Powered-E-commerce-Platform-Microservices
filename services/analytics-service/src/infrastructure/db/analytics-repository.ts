// @ts-nocheck
/**
 * Analytics Repository - Stores analytics data
 * Using MongoDB for storing events and metrics
 */

import { OrderAnalytics, PaymentAnalytics, UserAnalytics, DailyMetrics } from '../domain/analytics';

export interface IAnalyticsRepository {
  recordOrderAnalytics(analytics: OrderAnalytics): Promise<void>;
  recordPaymentAnalytics(analytics: PaymentAnalytics): Promise<void>;
  recordUserAnalytics(analytics: UserAnalytics): Promise<void>;
  incrementDailyMetrics(date: Date, metrics: Partial<DailyMetrics>): Promise<void>;
  getDailyMetrics(date: Date): Promise<DailyMetrics | null>;
  getMetricsRange(startDate: Date, endDate: Date): Promise<DailyMetrics[]>;
}

/**
 * In-Memory Implementation (Dev)
 * For production, replace with MongoDB implementation
 */
export class InMemoryAnalyticsRepository implements IAnalyticsRepository {
  private orderAnalytics: Map<string, OrderAnalytics> = new Map();
  private paymentAnalytics: Map<string, PaymentAnalytics> = new Map();
  private userAnalytics: Map<string, UserAnalytics> = new Map();
  private dailyMetrics: Map<string, DailyMetrics> = new Map();

  async recordOrderAnalytics(analytics: OrderAnalytics): Promise<void> {
    this.orderAnalytics.set(analytics.orderId, analytics);
  }

  async recordPaymentAnalytics(analytics: PaymentAnalytics): Promise<void> {
    this.paymentAnalytics.set(analytics.paymentId, analytics);
  }

  async recordUserAnalytics(analytics: UserAnalytics): Promise<void> {
    this.userAnalytics.set(analytics.userId, analytics);
  }

  async incrementDailyMetrics(
    date: Date,
    metrics: Partial<DailyMetrics>
  ): Promise<void> {
    const dateKey = date.toISOString().split('T')[0];
    const existing = this.dailyMetrics.get(dateKey) || {
      date: dateKey,
      totalOrders: 0,
      totalRevenue: 0,
      successfulPayments: 0,
      failedPayments: 0,
      averageOrderValue: 0,
      newUsers: 0,
    };

    const updated: DailyMetrics = {
      ...existing,
      totalOrders: existing.totalOrders + (metrics.totalOrders || 0),
      totalRevenue: existing.totalRevenue + (metrics.totalRevenue || 0),
      successfulPayments:
        existing.successfulPayments + (metrics.successfulPayments || 0),
      failedPayments: existing.failedPayments + (metrics.failedPayments || 0),
      newUsers: existing.newUsers + (metrics.newUsers || 0),
    };

    updated.averageOrderValue =
      updated.totalOrders > 0 ? updated.totalRevenue / updated.totalOrders : 0;

    this.dailyMetrics.set(dateKey, updated);
  }

  async getDailyMetrics(date: Date): Promise<DailyMetrics | null> {
    const dateKey = date.toISOString().split('T')[0];
    return this.dailyMetrics.get(dateKey) || null;
  }

  async getMetricsRange(
    startDate: Date,
    endDate: Date
  ): Promise<DailyMetrics[]> {
    const metrics: DailyMetrics[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const metric = this.dailyMetrics.get(dateKey);
      if (metric) {
        metrics.push(metric);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return metrics;
  }
}
