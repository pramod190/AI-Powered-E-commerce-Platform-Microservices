"""
Application entry point
"""

import uvicorn
from config.settings import settings
from config.logger import logger
from main import app


def main():
    """Run the application"""
    logger.info(f"Starting {settings.SERVICE_NAME} on {settings.HOST}:{settings.PORT}")

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )


if __name__ == "__main__":
    main()
