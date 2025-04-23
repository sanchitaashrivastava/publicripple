from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.user_routes import user_bp
from routes.article_routes import article_bp

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Register blueprints
app.register_blueprint(user_bp)
app.register_blueprint(article_bp)

if __name__ == '__main__':
    app.run(debug=True)