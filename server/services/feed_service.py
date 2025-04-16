import logging
from services.database_handler import DatabaseHandler
from services.source_bias_service import SourceBiasService

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_personalized_feed(email, flag, categories=None):
    """
    Get a personalized feed of articles based on user preferences, 
    political stance, and the feed type flag
    
    Args:
        email (str): User email
        flag (str): Feed type - 'comfort', 'balanced', or 'challenge'
        categories (list, optional): List of categories to filter articles by
    
    Returns:
        list: List of article dictionaries sorted according to the feed type
    """
    # Get today's articles, optionally filtered by categories
    articles = DatabaseHandler.get_today_articles(categories)
    
    # If no articles or no valid flag, return the default articles
    if not articles or flag not in ['comfort', 'balanced', 'challenge']:
        return articles
    
    # Get the user's survey responses
    survey_responses = DatabaseHandler.get_survey_responses(email)
    
    # Get combined political profile using both survey and likes
    user_profile = SourceBiasService.get_combined_political_profile(email, survey_responses)
    
    # If we couldn't determine a profile, return default articles
    if not user_profile:
        return articles
    
    # Get the user's numeric stance
    user_stance = user_profile['numeric_stance']
    
    # Score and sort articles based on feed type and user stance
    scored_articles = []
    
    for article in articles:
        source = article.get('source', '')
        source_bias, confidence = SourceBiasService.get_source_bias(source)
        
        # Default score - used if we can't determine bias
        score = 0.5
        
        # If we have source bias with good confidence
        if source_bias and confidence >= 0.5:
            # Get numeric value for the source bias
            source_stance = SourceBiasService.BIAS_VALUES.get(source_bias, 0)
            
            # Calculate distance between user and source stance (-4 to +4 range)
            stance_distance = user_stance - source_stance
            
            # Normalize to 0-1 alignment score
            # 1 = perfect alignment, 0 = maximum opposition
            alignment = 1 - abs(stance_distance) / 4
            
            if flag == 'comfort':
                # For comfort feed, higher alignment is better
                score = alignment
            elif flag == 'challenge':
                # For challenge feed, lower alignment is better
                score = 1 - alignment
            else:  # balanced
                # For balanced feed, middling alignment is better (prioritize varied views)
                score = 1 - abs(0.5 - alignment)
        
        scored_articles.append((article, score))
    
    # Sort by score (descending)
    sorted_articles = [article for article, score in 
                       sorted(scored_articles, key=lambda x: x[1], reverse=True)]
    
    return sorted_articles

def get_labeled_articles(email, limit=20, categories=None):
    """
    Get recent articles with comfort/balanced/challenge labels based on 
    user preferences from both survey and liked articles
    
    Args:
        email (str): User email
        limit (int): Maximum number of articles to return
        categories (list, optional): List of categories to filter by
        
    Returns:
        list: List of article dictionaries with added 'type' field
    """
    # Get recent articles, optionally filtered by categories
    articles = DatabaseHandler.get_recent_articles(limit, categories)
    
    if not articles:
        return []
    
    # Get the user's survey responses
    survey_responses = DatabaseHandler.get_survey_responses(email)
    
    # Get combined political profile using both survey and likes
    user_profile = SourceBiasService.get_combined_political_profile(email, survey_responses)
    
    # Default to neutral stance if no profile available
    user_stance = 0
    if user_profile:
        user_stance = user_profile['numeric_stance']
    
    # Calculate scores and assign labels
    labeled_articles = []
    
    for article in articles:
        # Store in feed table (without duplicates)
        DatabaseHandler.insert_feed_without_duplicate(email, "all", article['id'])
        
        # Get source bias
        source = article.get('source', '')
        source_bias, confidence = SourceBiasService.get_source_bias(source)
        
        # Default to balanced type
        article_type = "balanced"
        
        # If we have source bias with good confidence
        if source_bias and confidence >= 0.5:
            # Get numeric value for the source bias
            source_stance = SourceBiasService.BIAS_VALUES.get(source_bias, 0)
            
            # Calculate distance between user and source stance (-4 to +4 range)
            stance_distance = user_stance - source_stance
            
            # Normalize to 0-1 alignment score (1 = perfect alignment)
            alignment = 1 - abs(stance_distance) / 4
            
            # Assign type based on alignment
            if alignment > 0.7:  # High alignment
                article_type = "comfort"
            elif alignment < 0.3:  # Low alignment
                article_type = "challenge"
            else:  # Medium alignment
                article_type = "balanced"
        
        # Add the type to the article
        article_with_type = dict(article)
        article_with_type['type'] = article_type
        
        labeled_articles.append(article_with_type)
    
    return labeled_articles