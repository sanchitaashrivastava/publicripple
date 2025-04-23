import psycopg2
import psycopg2.extras
from config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, ARTICLES_HOST, ARTICLES_PORT, ARTICLES_NAME, ARTICLES_USER, ARTICLES_PASSWORD

def get_db_connection(type=""):
    """
    Create and return a connection to the PostgreSQL database
    """
    if type == 'articles':
        conn = psycopg2.connect(
            host=ARTICLES_HOST,
            port=ARTICLES_PORT,
            dbname=ARTICLES_NAME,
            user=ARTICLES_USER,
            password=ARTICLES_PASSWORD
        )
    else:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
    return conn