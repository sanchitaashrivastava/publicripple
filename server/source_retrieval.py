import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env file (if it exists)
load_dotenv()

# Get database connection parameters from environment variables
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME", "postgres")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")

def connect_to_database():
    """Connect to PostgreSQL database using environment variables."""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def fetch_user_data():
    """Fetch all data from userdata table and print results."""
    conn = connect_to_database()
    if conn:
        try:
            # Create a cursor to execute queries
            cursor = conn.cursor()
            
            # Execute the query
            cursor.execute("SELECT * FROM userdata")
            
            # Fetch all rows
            rows = cursor.fetchall()
            
            # Get column names
            column_names = [desc[0] for desc in cursor.description]
            
            # Print column headers
            print("\t".join(column_names))
            print("-" * (sum(len(name) for name in column_names) + len(column_names) * 2))
            
            # Print each row
            for row in rows:
                print("\t".join(str(value) for value in row))
            
            # Print total count
            print(f"\nTotal records: {len(rows)}")
            
        except Exception as e:
            print(f"Error executing query: {e}")
        finally:
            # Close cursor and connection
            cursor.close()
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    fetch_user_data()