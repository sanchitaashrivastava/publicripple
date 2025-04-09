from services.news_api import NewsAPI
from services.database_handler import DatabaseHandler
from datetime import datetime

def fetch_and_store_top_articles(category=None):
    """
    Fetches top articles from News API and stores them in the database
    
    Args:
        category (str, optional): Category to filter articles by
        
    Returns:
        dict: Summary of the operation with counts
    """
    # Fetch articles from the news API
    news_response = NewsAPI.get_top_news(category)
    
    # Check if the API request was successful
    if 'data' not in news_response:
        return {
            'success': False,
            'error': 'Failed to fetch articles from News API',
            'api_response': news_response
        }
    
    articles_data = news_response['data']
    
    # Transform news API data to match our database schema
    articles_for_db = []
    for article in articles_data:
        transformed_article = {
            'id': article['uuid'],
            'headline': article['title'],
            'url': article['url'],
            'source': article['source'],
            'abstract': article['description'] or article['snippet'],
            'article_date': article['published_at'],
            'image_url': article['image_url']
            # date_added will be automatically set in the insert function
        }
        articles_for_db.append(transformed_article)
    
    # Store articles in the database
    if articles_for_db:
        result = DatabaseHandler.insert_articles(articles_for_db)
        
        return {
            'success': result,
            'articles_fetched': len(articles_data),
            'articles_inserted': len(articles_for_db),
            'timestamp': datetime.now().isoformat(),
            'category': category or 'all'
        }
    else:
        return {
            'success': False,
            'error': 'No articles found to insert',
            'articles_fetched': len(articles_data),
            'timestamp': datetime.now().isoformat(),
            'category': category or 'all'
        }