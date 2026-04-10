"""
Logging configuration for Recommendation Service
"""

import logging
import sys
from config.settings import settings


def get_logger(name: str) -> logging.Logger:
    """Configure and return logger instance"""
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, settings.LOG_LEVEL))

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, settings.LOG_LEVEL))

    # Formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    console_handler.setFormatter(formatter)

    # Add handler
    if not logger.handlers:
        logger.addHandler(console_handler)

    return logger


logger = get_logger(__name__)
