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
                INSERT INTO articles (id, headline, url, source, abstract, article_date, date_added, image_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
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
                    datetime.now(),
                    article['image_url']
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
            INSERT INTO feed (email, article_id, flag, access_date, likes)
            VALUES (%s, %s, %s, %s, 0)
            """,
            (email, flag, article_id, datetime.now())
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return True
    
    @staticmethod
    def update_likes(email, article_id, flag, value):
        """
        Update the likes count for a feed item
        
        Args:
            email (str): User's Email
            article_id (str): Article ID
            flag (str): Feed type
            value (str): New likes value
            
        Returns:
            bool: True if update was successful
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            UPDATE feed
            SET likes = %s
            WHERE email = %s
            AND flag = %s
            AND article_id = %s
            """,
            (value, email, flag, article_id)
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
# Add these new functions to the DatabaseHandler class

    @staticmethod
    def get_liked_sources_by_email(email):
        """
        Get sources liked by a user
        
        Args:
            email (str): User email
            
        Returns:
            dict: Source name -> count of likes
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get sources from articles liked by the user
        cursor.execute("""
            SELECT a.source, COUNT(*) as like_count
            FROM feed f
            JOIN articles a ON f.article_id = a.id
            WHERE f.email = %s AND f.likes > 0
            GROUP BY a.source
            ORDER BY like_count DESC
        """, (email,))
        
        sources = {row[0]: row[1] for row in cursor.fetchall()}
        
        cursor.close()
        conn.close()
        
        return sources
    @staticmethod
    def get_disliked_sources_by_email(email):
        """
        Get sources liked by a user
        
        Args:
            email (str): User email
            
        Returns:
            dict: Source name -> count of likes
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get sources from articles liked by the user
        cursor.execute("""
            SELECT a.source, COUNT(*) as like_count
            FROM feed f
            JOIN articles a ON f.article_id = a.id
            WHERE f.email = %s AND f.likes < 0
            GROUP BY a.source
            ORDER BY like_count DESC
        """, (email,))
        
        sources = {row[0]: row[1] for row in cursor.fetchall()}
        
        cursor.close()
        conn.close()
        
        return sources
        
    @staticmethod
    def insert_feed_without_duplicate(email, flag, article_id):
        """
        Insert article to feed table, avoiding duplicates
        
        Args:
            email (str): User email
            flag (str): Feed flag
            article_id (str): Article ID
            
        Returns:
            bool: Success status
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Check if this email-article_id combination already exists
            cursor.execute(
                "SELECT 1 FROM feed WHERE email = %s AND article_id = %s AND flag = %s",
                (email, article_id, flag)
            )
            
            if cursor.fetchone():
                # Already exists, skip insertion
                cursor.close()
                conn.close()
                return True
            
            # print(email, article_id, flag)
            # Insert new record
            cursor.execute(
                """
                INSERT INTO feed (email, article_id, flag, access_date, likes)
                VALUES (%s, %s, %s, %s, 0)
                """,
                (email, article_id, flag, datetime.now(),)
            )
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            # Log the error
            conn.rollback()
            cursor.close()
            conn.close()
            return False