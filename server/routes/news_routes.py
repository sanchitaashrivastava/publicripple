from flask import Blueprint, request, jsonify
from services.news_api import NewsAPI

news_bp = Blueprint('news', __name__, url_prefix='/api/news')

@news_bp.route('', methods=['GET'])
def get_news():
    """
    Get top news articles, optionally filtered by category
    
    Query parameters:
    - category: Category to filter news by (optional)
    """
    category = request.args.get('category')
    news = NewsAPI.get_top_news(category)
    return jsonify(news), 200