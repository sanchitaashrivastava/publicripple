from flask import Blueprint, request, jsonify
from services.database_handler import DatabaseHandler

user_bp = Blueprint('user', __name__, url_prefix='/api/user')

@user_bp.route('', methods=['POST'])
def add_user():
    """
    Add a new user to the database
    
    Request body:
    {
        "email": "user@example.com",
        "password": "password123"
    }
    """
    data = request.json
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400
    
    email = data['email']
    password = data['password']
    
    result = DatabaseHandler.add_user(email, password)
    
    if result:
        return jsonify({'message': 'User added successfully'}), 201
    else:
        return jsonify({'error': 'User already exists'}), 409