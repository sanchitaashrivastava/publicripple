from flask import Blueprint, request, jsonify
from services.database_handler import DatabaseHandler

feed_bp = Blueprint('feed', __name__, url_prefix='/api/feed')

@feed_bp.route('/likes', methods=['PUT'])
def update_likes():
    """
    Update likes for a feed item
    
    Request body:
    {
        "feed_id": 123,
        "likes": 5
    }
    """
    data = request.json
    
    if not data or 'feed_id' not in data or 'likes' not in data:
        return jsonify({'error': 'Feed ID and likes are required'}), 400
    
    feed_id = data['feed_id']
    likes = data['likes']
    
    result = DatabaseHandler.update_likes(feed_id, likes)
    
    if result:
        return jsonify({'message': 'Likes updated successfully'}), 200
    else:
        return jsonify({'error': 'Failed to update likes'}), 500