from flask import Flask
from dotenv import load_dotenv
from routes.user_routes import user_bp
from routes.article_routes import article_bp
from routes.survey_routes import survey_bp
from routes.feed_routes import feed_bp
from routes.news_routes import news_bp

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Register blueprints
app.register_blueprint(user_bp)
app.register_blueprint(article_bp)
app.register_blueprint(survey_bp)
app.register_blueprint(feed_bp)
app.register_blueprint(news_bp)

if __name__ == '__main__':
    app.run(debug=True)