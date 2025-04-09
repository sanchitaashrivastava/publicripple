import os
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path, override=True)

# Database configuration
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')

# API keys
PUBLIC_NEWS_API_KEY = os.getenv('PUBLIC_NEWS_API_KEY')

# Log configuration status (without exposing sensitive values)
logger.info("Configuration loaded:")
logger.info(f"DB_HOST: {'Set' if DB_HOST else 'Not set'}")
logger.info(f"DB_PORT: {'Set' if DB_PORT else 'Not set'}")
logger.info(f"DB_NAME: {'Set' if DB_NAME else 'Not set'}")
logger.info(f"DB_USER: {'Set' if DB_USER else 'Not set'}")
logger.info(f"DB_PASSWORD: {'Set (value hidden)' if DB_PASSWORD else 'Not set'}")
logger.info(f"PUBLIC_NEWS_API_KEY: {'Set (value hidden)' if PUBLIC_NEWS_API_KEY else 'Not set'}")