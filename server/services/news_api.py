import requests
from config import PUBLIC_NEWS_API_KEY

class NewsAPI:
    """
    Service for interacting with the external news API
    """
    @staticmethod
    def get_top_news(category=None):
        """
        Get top news articles, optionally filtered by category
        
        Args:
            category (str, optional): Category to filter news by
            
        Returns:
            dict: JSON response from the news API
        """
        # print(PUBLIC_NEWS_API_KEY)
        base_url = f"https://api.thenewsapi.com/v1/news/top?api_token={PUBLIC_NEWS_API_KEY}&locale=us&limit=3"
        
        if category:
            base_url += f"&categories={category}"
            
        response = requests.get(base_url)
        return response.json()