"""
HTTP Client for Product Service
"""

import httpx
from typing import Optional, List, Dict, Any
from config.settings import settings
from config.logger import logger


class ProductServiceClient:
    """HTTP client for Product Service"""

    def __init__(self, base_url: str = settings.PRODUCT_SERVICE_URL):
        self.base_url = base_url
        self.timeout = 10

    async def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Get product details"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/products/{product_id}")
                if response.status_code == 200:
                    return response.json()
                logger.warning(f"Product {product_id} not found")
                return None
        except Exception as e:
            logger.error(f"Failed to fetch product {product_id}: {e}")
            return None

    async def get_products(self, product_ids: List[str]) -> List[Dict[str, Any]]:
        """Get multiple products"""
        products = []
        for product_id in product_ids:
            product = await self.get_product(product_id)
            if product:
                products.append(product)
        return products

    async def get_product_categories(self) -> List[str]:
        """Get all product categories"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/products/categories")
                if response.status_code == 200:
                    return response.json().get("categories", [])
                return []
        except Exception as e:
            logger.error(f"Failed to fetch categories: {e}")
            return []

    async def health_check(self) -> bool:
        """Check if Product Service is healthy"""
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception:
            return False
