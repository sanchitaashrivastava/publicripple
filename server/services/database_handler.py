import psycopg2
import psycopg2.extras
from datetime import datetime
from db import get_db_connection

class DatabaseHandler:
    """
    Handles all database operations
    """
    @staticmethod
    def email_exists(email):
        """
        Check if an email exists in the userdata table
        
        Args:
            email (str): Email to check
            
        Returns:
            bool: True if email exists, False otherwise
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT 1 FROM userdata WHERE email = %s", (email,))
        result = cursor.fetchone() is not None
        
        cursor.close()
        conn.close()
        
        return result
    
    @staticmethod
    def get_survey_responses(email):
        """
        Get survey responses for a specific email
        
        Args:
            email (str): Email to get survey responses for
            
        Returns:
            tuple: Survey responses or False if email doesn't exist
        """
        if not DatabaseHandler.email_exists(email):
            return False
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM survey_responses WHERE email = %s", (email,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return result
    
    @staticmethod
    def insert_articles(articles):
        """
        Insert multiple articles into the articles table
        
        Args:
            articles (list): List of article dictionaries
            
        Returns:
            bool: True if insert was successful
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        for article in articles:
            cursor.execute(
                """
                INSERT INTO articles (id, headline, url, source, abstract, article_date, date_added)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    headline = EXCLUDED.headline,
                    url = EXCLUDED.url,
                    source = EXCLUDED.source,
                    abstract = EXCLUDED.abstract,
                    article_date = EXCLUDED.article_date
                """,
                (
                    article['id'],
                    article['headline'],
                    article['url'],
                    article['source'],
                    article['abstract'],
                    article['article_date'],
                    datetime.now()
                )
            )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return True
    
    @staticmethod
    def insert_feed(email, flag, article_id):
        """
        Insert a record into the feed table
        
        Args:
            email (str): User email
            flag (str): Feed flag
            article_id (str): Article ID
            
        Returns:
            bool: True if insert was successful
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            INSERT INTO feed (email, flag, article_id, access_date, likes)
            VALUES (%s, %s, %s, %s, 0)
            """,
            (email, flag, article_id, datetime.now())
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return True
    
    @staticmethod
    def update_likes(feed_id, likes):
        """
        Update the likes count for a feed item
        
        Args:
            feed_id (int): Feed item ID
            likes (int): New likes count
            
        Returns:
            bool: True if update was successful
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            UPDATE feed
            SET likes = %s
            WHERE id = %s
            """,
            (likes, feed_id)
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return True
    
    @staticmethod
    def add_user(email, password):
        """
        Add a new user to the database
        
        Args:
            email (str): User email
            password (str): User password
            
        Returns:
            bool: True if user was added, False if email already exists
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                INSERT INTO userdata (email, password)
                VALUES (%s, %s)
                """,
                (email, password)
            )
            
            conn.commit()
            result = True
        except psycopg2.IntegrityError:
            # Email already exists
            conn.rollback()
            result = False
        
        cursor.close()
        conn.close()
        
        return result
    
    @staticmethod
    def insert_survey_responses(email, q1, q2, q3, q4, q5):
        """
        Insert survey responses for a user
        
        Args:
            email (str): User email
            q1-q5 (bool): Survey responses
            
        Returns:
            bool: True if insert was successful, False if responses already exist
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                INSERT INTO survey_responses (email, q1, q2, q3, q4, q5)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (email, q1, q2, q3, q4, q5)
            )
            
            conn.commit()
            result = True
        except psycopg2.IntegrityError:
            # Email already exists in survey responses
            conn.rollback()
            result = False
        
        cursor.close()
        conn.close()
        
        return result
    
    @staticmethod
    def update_survey_responses(email, q1, q2, q3, q4, q5):
        """
        Update survey responses for a user
        
        Args:
            email (str): User email
            q1-q5 (bool): Survey responses
            
        Returns:
            bool: True if update was successful, False if no responses exist
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            UPDATE survey_responses
            SET q1 = %s, q2 = %s, q3 = %s, q4 = %s, q5 = %s
            WHERE email = %s
            """,
            (q1, q2, q3, q4, q5, email)
        )
        
        rows_updated = cursor.rowcount
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return rows_updated > 0
    
    @staticmethod
    def get_today_articles(categories=None):
        """
        Get articles added today, optionally filtered by categories
        
        Args:
            categories (list, optional): List of categories to filter by
            
        Returns:
            list: List of article dictionaries
        """
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        today = datetime.now().date()
        
        if categories:
            # Assuming articles table has a 'category' column
            placeholders = ', '.join(['%s'] * len(categories))
            query = f"""
                SELECT * FROM articles 
                WHERE DATE(date_added) = %s 
                AND category IN ({placeholders})
            """
            params = [today] + categories
        else:
            query = "SELECT * FROM articles WHERE DATE(date_added) = %s"
            params = [today]
            
        cursor.execute(query, params)
        result = [dict(row) for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        
        return result