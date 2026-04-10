"""
HTTP Client for Order Service
"""

import httpx
from typing import Optional, List, Dict, Any
from config.settings import settings
from config.logger import logger
from datetime import datetime, timedelta


class OrderServiceClient:
    """HTTP client for Order Service"""

    def __init__(self, base_url: str = settings.ORDER_SERVICE_URL):
        self.base_url = base_url
        self.timeout = 10

    async def get_user_orders(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all orders for a user"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/orders",
                    headers={"x-user-id": user_id},
                )
                if response.status_code == 200:
                    return response.json().get("data", [])
                logger.warning(f"No orders found for user {user_id}")
                return []
        except Exception as e:
            logger.error(f"Failed to fetch orders for user {user_id}: {e}")
            return []

    async def get_order(self, order_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get specific order details"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/orders/{order_id}",
                    headers={"x-user-id": user_id},
                )
                if response.status_code == 200:
                    return response.json().get("data")
                return None
        except Exception as e:
            logger.error(f"Failed to fetch order {order_id}: {e}")
            return None

    async def get_recent_user_orders(
        self, user_id: str, days: int = 90
    ) -> List[Dict[str, Any]]:
        """Get user orders from last N days"""
        try:
            orders = await self.get_user_orders(user_id)
            cutoff_date = datetime.utcnow() - timedelta(days=days)

            recent_orders = [
                order
                for order in orders
                if datetime.fromisoformat(order.get("createdAt", "").replace("Z", "+00:00"))
                > cutoff_date
            ]
            return recent_orders
        except Exception as e:
            logger.error(f"Failed to get recent orders for user {user_id}: {e}")
            return []

    async def health_check(self) -> bool:
        """Check if Order Service is healthy"""
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception:
            return False
