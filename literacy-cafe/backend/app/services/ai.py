from typing import List, Optional
from openai import OpenAI
from app.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

async def generate_book_recommendations(
    user_preferences: List[str],
    reading_history: Optional[List[str]] = None,
    max_recommendations: int = 5
) -> List[dict]:
    """
    Generate personalized book recommendations using OpenAI.
    
    Args:
        user_preferences: List of user's preferred genres/topics
        reading_history: Optional list of books the user has already read
        max_recommendations: Maximum number of recommendations to generate
        
    Returns:
        List of dictionaries containing book recommendations
    """
    # Construct the prompt
    prompt = f"""As an AI literary expert, recommend {max_recommendations} books based on the following:
    
    User's preferences: {', '.join(user_preferences)}
    
    {f"Books already read: {', '.join(reading_history)}" if reading_history else ""}
    
    For each book, provide:
    1. Title
    2. Author
    3. Genre
    4. Brief description
    5. Why it matches the user's preferences
    
    Format each recommendation as a JSON object."""

    try:
        # Generate recommendations using OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a knowledgeable literary expert who provides detailed book recommendations."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000,
            response_format={ "type": "json_object" }
        )
        
        # Parse and format recommendations
        recommendations = response.choices[0].message.content
        return recommendations.get("recommendations", [])
        
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return []

async def analyze_reading_preferences(
    user_description: str
) -> List[str]:
    """
    Analyze user's description to extract reading preferences.
    
    Args:
        user_description: Free-form text describing user's interests
        
    Returns:
        List of identified reading preferences/genres
    """
    prompt = f"""Analyze the following user description and extract key reading preferences and genres:

    User description: "{user_description}"
    
    Return the result as a JSON array of strings representing genres and preferences."""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert at analyzing reading preferences and matching them to literary genres."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=200,
            response_format={ "type": "json_object" }
        )
        
        preferences = response.choices[0].message.content
        return preferences.get("preferences", [])
        
    except Exception as e:
        print(f"Error analyzing preferences: {e}")
        return []