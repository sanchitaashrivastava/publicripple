from flask import Blueprint, request, jsonify
from services.database_handler import DatabaseHandler

survey_bp = Blueprint('survey', __name__, url_prefix='/api/survey')

@survey_bp.route('', methods=['GET'])
def get_survey_responses():
    """
    Get survey responses for a specific user
    
    Query parameters:
    - email: User email (required)
    """
    email = request.args.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
        
    # Check if user exists
    if not DatabaseHandler.email_exists(email):
        return jsonify({'error': 'User not found'}), 404
        
    responses = DatabaseHandler.get_survey_responses(email)
    
    if not responses:
        return jsonify({'error': 'No survey responses found for this user'}), 404
        
    # Convert database response to a dictionary
    # Assuming responses structure is (email, q1, q2, q3, q4, q5)
    response_data = {
        'email': responses[0],
        'q1': responses[1],
        'q2': responses[2],
        'q3': responses[3],
        'q4': responses[4],
        'q5': responses[5]
    }
    
    return jsonify(response_data), 200

@survey_bp.route('', methods=['POST'])
def add_survey_responses():
    """
    Add survey responses for a user
    
    Request body:
    {
        "email": "user@example.com",
        "q1": true,
        "q2": false,
        "q3": true,
        "q4": false,
        "q5": true
    }
    """
    data = request.json
    
    if not data or 'email' not in data or not all(f'q{i}' in data for i in range(1, 6)):
        return jsonify({'error': 'Email and all survey questions (q1-q5) are required'}), 400
    
    email = data['email']
    q1 = data['q1']
    q2 = data['q2']
    q3 = data['q3']
    q4 = data['q4']
    q5 = data['q5']
    
    # Check if user exists
    if not DatabaseHandler.email_exists(email):
        return jsonify({'error': 'User not found'}), 404
    
    result = DatabaseHandler.insert_survey_responses(email, q1, q2, q3, q4, q5)
    
    if result:
        return jsonify({'message': 'Survey responses added successfully'}), 201
    else:
        return jsonify({'error': 'Survey responses already exist for this user'}), 409

@survey_bp.route('', methods=['PUT'])
def update_survey_responses():
    """
    Update survey responses for a user
    
    Request body:
    {
        "email": "user@example.com",
        "q1": true,
        "q2": false,
        "q3": true,
        "q4": false,
        "q5": true
    }
    """
    data = request.json
    
    if not data or 'email' not in data or not all(f'q{i}' in data for i in range(1, 6)):
        return jsonify({'error': 'Email and all survey questions (q1-q5) are required'}), 400
    
    email = data['email']
    q1 = data['q1']
    q2 = data['q2']
    q3 = data['q3']
    q4 = data['q4']
    q5 = data['q5']
    
    # Check if user exists
    if not DatabaseHandler.email_exists(email):
        return jsonify({'error': 'User not found'}), 404
    
    result = DatabaseHandler.update_survey_responses(email, q1, q2, q3, q4, q5)
    
    if result:
        return jsonify({'message': 'Survey responses updated successfully'}), 200
    else:
        return jsonify({'error': 'No survey responses found for this user'}), 404