from flask import Blueprint, request, jsonify
from services.database_handler import DatabaseHandler
from services.feed_service import get_personalized_feed
import logging

article_bp = Blueprint('article', __name__, url_prefix='/api/articles')

@article_bp.route('', methods=['GET'])
def get_articles():
    """
    Get articles from today, optionally filtered by categories
    and personalized based on the feed type flag
    
    Query parameters:
    - email: User email (required)
    - flag: Feed flag - 'comfort', 'balanced', or 'challenge' (optional, defaults to 'balanced')
    - categories: List of categories to filter by (optional)
    """
    email = request.args.get('email')
    flag = request.args.get('flag', 'balanced')
    categories = request.args.getlist('categories')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    # Check if user exists
    if not DatabaseHandler.email_exists(email):
        return jsonify({'error': 'User not found'}), 404
    
    # Then get personalized feed based on flag
    sorted_articles = get_personalized_feed(email, flag, categories if categories else None)

    print(sorted_articles)
    # Store all articles in feed first (without duplicates)
    for article in sorted_articles:
        result = DatabaseHandler.insert_feed_without_duplicate(email, flag, article['id'])
        logging.info(f"Inserted article {article['id']} into feed: {result}")

    # Log the number of articles being processed
    logging.info(f"Processing {len(sorted_articles)} articles for storage in feed")
    
    return jsonify(sorted_articles), 200

@article_bp.route('/refresh', methods=['POST'])
def refresh_articles():
    """
    Fetch top articles from News API and store them in the database
    
    Query parameters:
    - category: Category to filter articles by (optional)
    """
    from services.article_service import fetch_and_store_top_articles
    
    category = request.args.get('category')
    result = fetch_and_store_top_articles(category)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 500