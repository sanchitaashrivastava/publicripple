from flask import Blueprint, request, jsonify
from services.database_handler import DatabaseHandler

article_bp = Blueprint('article', __name__, url_prefix='/api/article')

@article_bp.route('/feed', methods=['GET'])
def retrieve_feed():
    """
    Retrieve articles for a user's feed with personalized flags
    
    Query parameters:
    - email: User's email address
    - limit: Maximum number of articles to retrieve (optional, default 20)
    
    Returns:
        JSON: List of articles with personalized flags
    """
    email = request.args.get('email')
    limit = request.args.get('limit', default=20, type=int)
    
    if not email:
        return jsonify({'success': False, 'message': 'Email parameter is required'}), 400
    
    # Step 1: Get top articles
    articles = DatabaseHandler.get_recent_articles(limit)
    
    # Step 2: Get feed counts
    right_count, lean_right_count, center_count, lean_left_count, left_count = DatabaseHandler.get_feed_counts(email)
    
    # Step 3: Calculate average lean score
    total_articles = right_count + lean_right_count + center_count + lean_left_count + left_count
    
    if total_articles > 0:
        avg_score = (
            (right_count * -1) + 
            (lean_right_count * -0.5) + 
            (center_count * 0) + 
            (lean_left_count * 0.5) + 
            (left_count * 1)
        ) / total_articles
    else:
        avg_score = 0  # Default to center if no articles
    
    # Step 4: Add flag field based on lean score and insert into feed table
    for article in articles:
        # Convert lean to numeric score
        if article['lean'] == 'Right':
            lean_score = -1
        elif article['lean'] == 'Lean Right':
            lean_score = -0.5
        elif article['lean'] == 'Center':
            lean_score = 0
        elif article['lean'] == 'Lean Left':
            lean_score = 0.5
        elif article['lean'] == 'Left':
            lean_score = 1
        else:
            lean_score = 0  # Default
        
        # Calculate difference from average
        diff = abs(lean_score - avg_score)
        
        # Set flag based on difference
        if diff <= 0.5:
            flag = 'comfort'
        elif diff <= 1:
            flag = 'balanced'
        else:
            flag = 'challenge'
        
        # Insert article into feed table without duplicates
        DatabaseHandler.insert_feed_without_duplicate(email, flag, article['id'])
        
        # Add flag to article for response
        article['flag'] = flag
        
        # Remove lean field
        article.pop('lean', None)
    
    # Step 5: Return JSON response
    return jsonify({
        'success': True, 
        'articles': articles,
        'meta': {
            'total': len(articles),
            'avg_lean_score': avg_score,
            'feed_counts': {
                'right': right_count,
                'lean_right': lean_right_count,
                'center': center_count,
                'lean_left': lean_left_count,
                'left': left_count
            }
        }
    })