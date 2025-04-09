from flask import Blueprint, request, jsonify
from services.database_handler import DatabaseHandler
from services.article_service import fetch_and_store_top_articles

article_bp = Blueprint('article', __name__, url_prefix='/api/articles')

@article_bp.route('/refresh', methods=['POST'])
def refresh_articles():
    """
    Fetch top articles from News API and store them in the database
    
    Query parameters:
    - category: Category to filter articles by (optional)
    """
    category = request.args.get('category')
    result = fetch_and_store_top_articles(category)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@article_bp.route('', methods=['GET'])
def get_articles():
    """
    Get articles from today, optionally filtered by categories
    
    Query parameters:
    - email: User email (required)
    - flag: Feed flag (optional)
    - categories: List of categories to filter by (optional)
    """
    email = request.args.get('email')
    flag = request.args.get('flag')
    categories = request.args.getlist('categories')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    # Check if user exists
    if not DatabaseHandler.email_exists(email):
        return jsonify({'error': 'User not found'}), 404
    
    # Get articles based on categories (if provided)
    articles = DatabaseHandler.get_today_articles(categories if categories else None)
    
    # Add articles to feed for this user
    for article in articles:
        DatabaseHandler.insert_feed(email, flag, article['id'])
    
    return jsonify(articles), 200