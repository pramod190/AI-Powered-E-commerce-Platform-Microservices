/**
 * Analytics Domain Models
 */

export interface OrderAnalytics {
  orderId: string;
  userId: string;
  totalAmount: number;
  itemCount: number;
  timestamp: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered';
}

export interface PaymentAnalytics {
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  status: 'succeeded' | 'failed';
  timestamp: number;
}

export interface UserAnalytics {
  userId: string;
  email: string;
  registeredAt: number;
  lastActivityAt: number;
}

export interface DailyMetrics {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  averageOrderValue: number;
  newUsers: number;
}
