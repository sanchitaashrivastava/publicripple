from flask import Blueprint, request, jsonify
from services.database_handler import DatabaseHandler

user_bp = Blueprint('user', __name__, url_prefix='/api/user')

@user_bp.route('/add', methods=['POST'])
def add_user():
    """
    Add a new user to the database
    
    Request JSON:
    {
        "email": "user@example.com",
        "password": "hashed_password"
    }
    
    Returns:
        JSON: Success status
    """
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    email = data['email']
    password = data['password']
    
    result = DatabaseHandler.add_user(email, password)
    
    if result:
        return jsonify({'success': True, 'message': 'User added successfully'})
    else:
        return jsonify({'success': False, 'message': 'Email already exists'}), 409

@user_bp.route('/survey', methods=['POST'])
def update_survey_responses():
    """
    Add or update survey responses for a user
    
    Request JSON:
    {
        "email": "user@example.com",
        "q1": true,
        "q2": false,
        "q3": true,
        "q4": false,
        "q5": true
    }
    
    Returns:
        JSON: Success status
    """
    data = request.get_json()
    
    if not data or 'email' not in data or 'q1' not in data or 'q2' not in data or 'q3' not in data or 'q4' not in data or 'q5' not in data:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    email = data['email']
    q1 = data['q1']
    q2 = data['q2']
    q3 = data['q3']
    q4 = data['q4']
    q5 = data['q5']
    
    # Check if survey responses exist for this email
    if DatabaseHandler.check_survey_responses(email):
        # Update existing responses
        result = DatabaseHandler.update_survey_responses(email, q1, q2, q3, q4, q5)
        message = 'Survey responses updated successfully'
    else:
        # Insert new responses
        result = DatabaseHandler.insert_survey_responses(email, q1, q2, q3, q4, q5)
        message = 'Survey responses added successfully'
    
    if result:
        return jsonify({'success': True, 'message': message})
    else:
        return jsonify({'success': False, 'message': 'Failed to save survey responses'}), 500