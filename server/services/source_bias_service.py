import os
import csv
import re
import logging
import difflib
from services.database_handler import DatabaseHandler

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SourceBiasService:
    """Service for handling source bias data and operations"""
    
    # Cache for source bias data
    _source_bias_data = None
    _normalized_to_original = None
    
    # Mapping of bias labels to numeric values
    BIAS_VALUES = {
        'left': -2,
        'left-center': -1,
        'center': 0,
        'right-center': 1,
        'right': 2
    }
    
    # Reverse mapping from numeric values to bias labels
    BIAS_LABELS = {
        -2: 'left',
        -1: 'left-center',
        0: 'center',
        1: 'right-center',
        2: 'right'
    }
    
    @staticmethod
    def _normalize_source_name(source_name):
        """
        Normalize a source name for comparison
        
        Args:
            source_name (str): The source name to normalize
            
        Returns:
            str: Normalized source name
        """
        if not source_name:
            return ""
            
        # Convert to lowercase
        name = source_name.lower()
        
        # Remove common TLDs
        name = re.sub(r'\.com$|\.org$|\.net$|\.co\.uk$|\.co$|\.news$', '', name)
        
        # Remove "the" prefix
        name = re.sub(r'^the\s+', '', name)
        
        # Remove spaces and special characters
        name = re.sub(r'[^a-z0-9]', '', name)
        
        return name
    
    @staticmethod
    def load_source_bias_data(refresh=False):
        """
        Load source bias data from CSV
        
        Args:
            refresh (bool): Whether to refresh the cache
            
        Returns:
            dict: Normalized source name -> (bias, confidence)
        """
        # Use cached data if available and refresh not requested
        if SourceBiasService._source_bias_data is not None and not refresh:
            return SourceBiasService._source_bias_data
            
        # Path to the CSV file (adjust as needed)
        csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                               'data', 'source_bias.csv')
        
        bias_data = {}
        normalized_to_original = {}
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    original_name = row['source']
                    normalized_name = SourceBiasService._normalize_source_name(original_name)
                    
                    if normalized_name:
                        bias_data[normalized_name] = (
                            row['bias'],
                            float(row['confidence'])
                        )
                        # Keep track of the mapping from normalized to original names
                        normalized_to_original[normalized_name] = original_name
            
            logger.info(f"Loaded {len(bias_data)} sources from bias database")
            SourceBiasService._source_bias_data = bias_data
            SourceBiasService._normalized_to_original = normalized_to_original
            return bias_data
            
        except Exception as e:
            logger.error(f"Error loading source bias data: {e}")
            # Return empty dict in case of error
            return {}
    
    @staticmethod
    def get_source_bias(source):
        """
        Get bias information for a source using improved matching
        
        Args:
            source (str): Source name
            
        Returns:
            tuple: (bias, confidence) or (None, None) if not found
        """
        bias_data = SourceBiasService.load_source_bias_data()
        normalized_source = SourceBiasService._normalize_source_name(source)
        
        # Try direct match
        if normalized_source in bias_data:
            logger.debug(f"Direct match for '{source}': {SourceBiasService._normalized_to_original.get(normalized_source)}")
            return bias_data[normalized_source]
            
        # Try substring matching
        for known_source, bias_info in bias_data.items():
            # Check if one is substring of the other
            if normalized_source in known_source or known_source in normalized_source:
                logger.info(f"Substring matched '{source}' to '{SourceBiasService._normalized_to_original.get(known_source)}'")
                return bias_info
        
        # Try fuzzy matching with difflib
        if len(normalized_source) > 3:  # Only try fuzzy matching for names of reasonable length
            matches = difflib.get_close_matches(normalized_source, bias_data.keys(), n=1, cutoff=0.6)
            if matches:
                best_match = matches[0]
                logger.info(f"Fuzzy matched '{source}' to '{SourceBiasService._normalized_to_original.get(best_match)}' (score: {difflib.SequenceMatcher(None, normalized_source, best_match).ratio():.2f})")
                return bias_data[best_match]
        
        logger.warning(f"No bias data found for source: {source}")
        return (None, None)
        
    @staticmethod
    def find_closest_source_matches(source, n=3):
        """
        Find the closest matches in the source bias database
        
        Args:
            source (str): Source name to match
            n (int): Number of matches to return
            
        Returns:
            list: List of (original_source_name, similarity_score) tuples
        """
        bias_data = SourceBiasService.load_source_bias_data()
        normalized_source = SourceBiasService._normalize_source_name(source)
        
        if not normalized_source or len(normalized_source) < 3:
            return []
            
        # Calculate similarity scores
        similarity_scores = []
        for known_source in bias_data.keys():
            # Use difflib's SequenceMatcher for string similarity
            score = difflib.SequenceMatcher(None, normalized_source, known_source).ratio()
            original_name = SourceBiasService._normalized_to_original.get(known_source, known_source)
            similarity_scores.append((original_name, score))
        
        # Sort by score (highest first) and take top n
        return sorted(similarity_scores, key=lambda x: x[1], reverse=True)[:n]
    
    @staticmethod
    def get_user_liked_sources(email):
        """
        Get sources liked by a user
        
        Args:
            email (str): User email
            
        Returns:
            dict: Source name -> count of likes
        """
        # First check if the user exists
        if not DatabaseHandler.email_exists(email):
            return {}
            
        # Implement a custom function in DatabaseHandler to get liked sources
        # This is a placeholder; the actual implementation would be in DatabaseHandler
        return DatabaseHandler.get_liked_sources_by_email(email)
    @staticmethod
    def get_user_disliked_sources(email):
        """
        Get sources disliked by a user
        
        Args:
            email (str): User email
            
        Returns:
            dict: Source name -> like value
        """
        # First check if the user exists
        if not DatabaseHandler.email_exists(email):
            return {}
            
        # Implement a custom function in DatabaseHandler to get liked sources
        # This is a placeholder; the actual implementation would be in DatabaseHandler
        return DatabaseHandler.get_disliked_sources_by_email(email)
    
    @staticmethod
    def get_user_political_profile_from_likes(email):
        """
        Calculate a user's political profile based on their liked and disliked sources
        
        Args:
            email (str): User email
            
        Returns:
            dict: Political profile with bias scores and numeric stance
        """
        # Get the sources liked and disliked by the user
        liked_sources = SourceBiasService.get_user_liked_sources(email)
        disliked_sources = SourceBiasService.get_user_disliked_sources(email)
        
        if not liked_sources and not disliked_sources:
            return None
            
        # Map of bias categories and their count
        bias_counts = {}
        # Total weight to use (sources with confidence)
        total_weight = 0
        # Running sum for calculating the weighted average stance
        weighted_stance_sum = 0
        
        # Process liked sources - positive contribution to stance
        for source, like_count in liked_sources.items():
            bias, confidence = SourceBiasService.get_source_bias(source)
            
            # Skip sources with no bias data or low confidence
            if not bias or confidence < 0.35:
                continue
                
            # Get numeric value for this bias
            if bias in SourceBiasService.BIAS_VALUES:
                bias_value = SourceBiasService.BIAS_VALUES[bias]
                
                # Weight by like count and confidence
                weight = like_count * confidence
                bias_counts[bias] = bias_counts.get(bias, 0) + weight
                weighted_stance_sum += bias_value * weight
                total_weight += weight

        # Process disliked sources - negative contribution to stance
        for source, dislike_count in disliked_sources.items():
            bias, confidence = SourceBiasService.get_source_bias(source)
            
            # Skip sources with no bias data or low confidence
            if not bias or confidence < 0.35:
                continue
                
            # Get numeric value for this bias
            if bias in SourceBiasService.BIAS_VALUES:
                bias_value = SourceBiasService.BIAS_VALUES[bias]
                
                # Weight by dislike count and confidence
                # For disliked sources, we consider the opposite bias value
                weight = dislike_count * confidence
                # We don't add disliked sources to bias_counts as they represent sources the user rejects
                # But we do use them to adjust the numeric stance in the opposite direction
                weighted_stance_sum -= bias_value * weight  # Subtract for disliked sources
                total_weight += weight
        
        # If no bias data with sufficient confidence found
        if total_weight == 0:
            return None
            
        # Calculate the weighted average stance
        numeric_stance = weighted_stance_sum / total_weight
        
        # Find the closest bias label
        closest_bias = min(SourceBiasService.BIAS_VALUES.items(), 
                        key=lambda x: abs(x[1] - numeric_stance))[0]
        
        # Calculate percentages and build profile
        profile = {
            'bias_distribution': {
                bias: count / total_weight 
                for bias, count in bias_counts.items()
            },
            'dominant_bias': closest_bias,
            'numeric_stance': numeric_stance,
            'confidence': min(1.0, total_weight / (5 * (sum(liked_sources.values()) + sum(disliked_sources.values()))) 
                            if (sum(liked_sources.values()) + sum(disliked_sources.values())) > 0 else 0)
        }
        
        return profile
    
    @staticmethod
    def get_political_stance_from_survey(survey_responses):
        """
        Calculate political stance based on survey responses
        
        Args:
            survey_responses (tuple): Survey responses (email, q1, q2, q3, q4, q5)
            
        Returns:
            dict: Political stance information including numeric_stance and dominant_bias
        """
        # This will be implemented once the survey questions are defined
        
        numeric_stance = 0
        for i in range(len(survey_responses)):
            if survey_responses[i] != 0:
                if survey_responses[i]:
                    numeric_stance += 2
                else:
                    numeric_stance -= 2
        numeric_stance /= 5
        
        # Find the closest bias label
        closest_bias = min(SourceBiasService.BIAS_VALUES.items(), 
                          key=lambda x: abs(x[1] - numeric_stance))[0]
        
        return {
            'dominant_bias': closest_bias,
            'numeric_stance': numeric_stance,
            'confidence': 0.7  # Moderate confidence in the default value
        }
        
    @staticmethod
    def get_combined_political_profile(email, survey_responses=None):
        """
        Get a combined political profile using both survey responses and liked sources
        
        Args:
            email (str): User email
            survey_responses (tuple, optional): Survey responses if already retrieved
            
        Returns:
            dict: Combined political profile
        """
        # Get profile based on likes
        likes_profile = SourceBiasService.get_user_political_profile_from_likes(email)
        
        # Get or fetch survey responses
        if not survey_responses:
            survey_responses = DatabaseHandler.get_survey_responses(email)
        # print(survey_responses)
        
        # Get profile based on survey
        survey_profile = None
        if survey_responses:
            survey_profile = SourceBiasService.get_political_stance_from_survey(survey_responses)
        
        # If we don't have either profile, return None
        if not likes_profile and not survey_profile:
            return None
            
        # If we only have one profile, return that
        if not likes_profile:
            return survey_profile
        if not survey_profile:
            return likes_profile
            
        # Combine the two profiles with equal weight (50/50)
        likes_weight = 0.3
        survey_weight = 0.7
        
        # Adjust weights based on confidence if available
        if 'confidence' in likes_profile and 'confidence' in survey_profile:
            total_confidence = likes_profile['confidence'] + survey_profile['confidence']
            if total_confidence > 0:
                likes_weight = likes_profile['confidence'] / total_confidence
                survey_weight = survey_profile['confidence'] / total_confidence
        
        # Calculate combined numeric stance
        combined_stance = (
            likes_profile['numeric_stance'] * likes_weight + 
            survey_profile['numeric_stance'] * survey_weight
        )
        
        # Find the closest bias label
        closest_bias = min(SourceBiasService.BIAS_VALUES.items(), 
                          key=lambda x: abs(x[1] - combined_stance))[0]
        
        # Create combined profile
        combined_profile = {
            'dominant_bias': closest_bias,
            'numeric_stance': combined_stance,
            'confidence': (likes_profile.get('confidence', 0.5) * likes_weight + 
                          survey_profile.get('confidence', 0.5) * survey_weight),
            'sources': {
                'likes': likes_weight,
                'survey': survey_weight
            }
        }
        
        # If likes profile has bias distribution, include it
        if 'bias_distribution' in likes_profile:
            combined_profile['bias_distribution'] = likes_profile['bias_distribution']
        
        return combined_profile