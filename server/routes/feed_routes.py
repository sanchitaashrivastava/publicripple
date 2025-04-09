from flask import Blueprint, request, jsonify
from services.database_handler import DatabaseHandler
from services.source_bias_service import SourceBiasService

feed_bp = Blueprint('feed', __name__, url_prefix='/api/feed')

@feed_bp.route('/likes', methods=['PUT'])
def update_likes():
    """
    Update likes for a feed item
    
    Request body:
    {
        "email": "user@example.com",
        "article_id": "fd907023-7734-433b-b233-ead4f375653b",
        "flag": "comfort",
        "value": 1
    }
    """
    data = request.json
    
    if not data or 'email' not in data or 'article_id' not in data or 'flag' not in data or 'value' not in data:
        return jsonify({'error': 'email, article_id, flag and value are required'}), 400
    
    email = data['email']
    article_id = data['article_id']
    flag = data['flag']
    value = data['value']
    
    result = DatabaseHandler.update_likes(email, article_id, flag, value)
    
    if result:
        return jsonify({'message': 'Likes updated successfully'}), 200
    else:
        return jsonify({'error': 'Failed to update likes'}), 500

@feed_bp.route('/political-profile', methods=['GET'])
def get_political_profile():
    """
    Get a user's political profile based on their liked articles and survey responses
    
    Query parameters:
    - email: User email (required)
    """
    email = request.args.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    # Check if user exists
    if not DatabaseHandler.email_exists(email):
        return jsonify({'error': 'User not found'}), 404
    
    # Get survey responses
    survey_responses = DatabaseHandler.get_survey_responses(email)
    
    # Get combined political profile
    profile = SourceBiasService.get_combined_political_profile(email, survey_responses)
    
    if not profile:
        return jsonify({'message': 'Not enough data to determine political profile'}), 200
    
    return jsonify(profile), 200

@feed_bp.route('/source-matching', methods=['GET'])
def test_source_matching():
    """
    Test the source name matching algorithm
    
    Query parameters:
    - source: Source name to test matching for (required)
    - n: Number of matches to return (optional, default 5)
    """
    source = request.args.get('source')
    n = request.args.get('n', default=5, type=int)
    
    if not source:
        return jsonify({'error': 'Source name is required'}), 400
    
    # Get the best matches
    matches = SourceBiasService.find_closest_source_matches(source, n)
    
    # Get direct bias info
    bias, confidence = SourceBiasService.get_source_bias(source)
    
    result = {
        'source': source,
        'normalized': SourceBiasService._normalize_source_name(source),
        'bias': bias,
        'confidence': confidence,
        'matches': [
            {
                'source': match[0],
                'similarity': match[1],
                'normalized': SourceBiasService._normalize_source_name(match[0])
            }
            for match in matches
        ]
    }
    
    return jsonify(result), 200