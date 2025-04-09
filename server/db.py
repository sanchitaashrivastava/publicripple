import psycopg2
import psycopg2.extras
from config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, PUBLIC_NEWS_API_KEY

def get_db_connection():
    """
    Create and return a connection to the PostgreSQL database
    """
    print(PUBLIC_NEWS_API_KEY)
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    return conn