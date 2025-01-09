from typing import List, Dict, Optional
from datetime import datetime
import json
from app.models.book import Book
from app.models.user import User
from app.services.auth import supabase

class LiteraryCafeRecommender:
    def __init__(self):
        # Mapping mood berdasarkan minuman
        self.drink_mood_mapping = {
            "Coffee": {
                "Espresso": ["Mystery", "Thriller", "Business"],
                "Latte": ["Romance", "Contemporary Fiction", "Self-Help"],
                "Cappuccino": ["Literary Fiction", "Biography", "Arts"],
                "Americano": ["Philosophy", "Politics", "Academic"],
                "Mocha": ["Young Adult", "Fantasy", "Comics"]
            },
            "Tea": {
                "Green Tea": ["Mindfulness", "Self-Help", "Eastern Philosophy"],
                "Earl Grey": ["Classic Literature", "Historical Fiction", "Mystery"],
                "Chamomile": ["Poetry", "Spirituality", "Personal Growth"],
                "Black Tea": ["Business", "History", "Biography"]
            },
            "Others": {
                "Hot Chocolate": ["Young Adult", "Fantasy", "Children's Books"],
                "Smoothie": ["Health", "Lifestyle", "Cookbooks"],
                "Fresh Juice": ["Self-Help", "Health", "Motivation"]
            }
        }

        # Mapping mood berdasarkan makanan
        self.food_mood_mapping = {
            "Light": {
                "Salad": ["Health", "Lifestyle", "Mindfulness"],
                "Sandwich": ["Contemporary Fiction", "Business", "Self-Help"],
                "Croissant": ["Romance", "Travel", "Arts"]
            },
            "Heavy": {
                "Pasta": ["Family Saga", "Cooking", "Travel"],
                "Rice Bowl": ["Cultural", "Contemporary", "Biography"],
                "Burger": ["Adventure", "Science Fiction", "Action"]
            },
            "Dessert": {
                "Cake": ["Romance", "Feel-Good", "Young Adult"],
                "Cookie": ["Children's Books", "Comics", "Light Fiction"],
                "Ice Cream": ["Fantasy", "Adventure", "Young Adult"]
            }
        }

        # Reading environment preferences
        self.environment_factors = {
            "time_of_day": {
                "morning": ["Motivation", "Business", "Self-Help", "News"],
                "afternoon": ["Fiction", "Mystery", "Travel", "Magazine"],
                "evening": ["Fantasy", "Poetry", "Philosophy", "Romance"]
            },
            "weather": {
                "sunny": ["Adventure", "Travel", "Outdoor", "Light Reading"],
                "rainy": ["Mystery", "Horror", "Philosophy", "Classic"],
                "cloudy": ["Contemporary", "Literary Fiction", "Poetry"]
            }
        }

        # Base weights untuk different factors
        self.weights = {
            "user_preference": 3.0,
            "drink_mood": 2.0,
            "food_mood": 2.0,
            "environment": 1.5,
            "reading_time": 1.0,
            "popularity": 1.0
        }

    async def get_recommendations(
        self,
        user_profile: Dict,
        order_details: Dict,
        available_books: List[Book],
        current_time: Optional[datetime] = None,
        weather: Optional[str] = None,
        max_recommendations: int = 5
    ) -> List[Book]:
        """
        Generate book recommendations based on user profile and cafe order.
        """
        current_time = current_time or datetime.now()
        scored_books = []

        for book in available_books:
            score = 0.0
            
            # 1. User Preference Score
            user_genre_match = len(
                set(book.genres) & set(user_profile['preferred_genres'])
            )
            score += user_genre_match * self.weights['user_preference']

            # 2. Drink Mood Score
            if order_details['drink'] and order_details['drink_type']:
                drink_genres = self.drink_mood_mapping.get(
                    order_details['drink'], {}
                ).get(order_details['drink_type'], [])
                drink_match = len(set(book.genres) & set(drink_genres))
                score += drink_match * self.weights['drink_mood']

            # 3. Food Mood Score
            if order_details['food'] and order_details['food_category']:
                food_genres = self.food_mood_mapping.get(
                    order_details['food_category'], {}
                ).get(order_details['food'], [])
                food_match = len(set(book.genres) & set(food_genres))
                score += food_match * self.weights['food_mood']

            # 4. Time of Day Score
            hour = current_time.hour
            time_period = (
                "morning" if 5 <= hour < 12
                else "afternoon" if 12 <= hour < 18
                else "evening"
            )
            time_genres = self.environment_factors['time_of_day'][time_period]
            time_match = len(set(book.genres) & set(time_genres))
            score += time_match * self.weights['environment']

            # 5. Weather Score (if provided)
            if weather and weather in self.environment_factors['weather']:
                weather_genres = self.environment_factors['weather'][weather]
                weather_match = len(set(book.genres) & set(weather_genres))
                score += weather_match * self.weights['environment']

            # 6. Reading Time Score
            if hasattr(book, 'estimated_reading_time'):
                if book.estimated_reading_time > 120:  # More than 2 hours
                    score -= self.weights['reading_time']
                elif 30 <= book.estimated_reading_time <= 90:  # Ideal cafe reading time
                    score += self.weights['reading_time']

            # 7. Popularity and Rating Score
            if hasattr(book, 'rating') and hasattr(book, 'popularity'):
                popularity_score = (book.rating * book.popularity) / 10
                score += popularity_score * self.weights['popularity']

            # Avoid recently read books
            if book.id in user_profile.get('reading_history', []):
                score *= 0.3  # Significantly reduce score for recently read books

            scored_books.append({
                "book": book,
                "score": score
            })

        # Sort by score and return top recommendations
        scored_books.sort(key=lambda x: x["score"], reverse=True)
        return [item["book"] for item in scored_books[:max_recommendations]]

    def update_mappings(self, new_mappings: Dict):
        """Update or add new mood mappings for drinks/foods"""
        if 'drinks' in new_mappings:
            self.drink_mood_mapping.update(new_mappings['drinks'])
        if 'foods' in new_mappings:
            self.food_mood_mapping.update(new_mappings['foods'])

    def adjust_weights(self, new_weights: Dict):
        """Adjust the importance of different factors"""
        self.weights.update(new_weights)

    def export_configuration(self, filepath: str):
        """Export all mappings and weights to JSON file"""
        config = {
            "drink_mood_mapping": self.drink_mood_mapping,
            "food_mood_mapping": self.food_mood_mapping,
            "environment_factors": self.environment_factors,
            "weights": self.weights
        }
        with open(filepath, 'w') as f:
            json.dump(config, f, indent=4)

recommender = LiteraryCafeRecommender()

async def get_available_books() -> List[Book]:
    """
    Get all available books from database
    """
    try:
        response = await supabase.table('books').select("*").execute()
        return [Book.model_validate(book) for book in response.data]
    except Exception as e:
        print(f"Error fetching books: {e}")
        return []

async def get_book_recommendations(
    user: User,
    order_details: Dict,
    max_recommendations: int = 5
) -> List[Book]:
    """
    Get personalized book recommendations for a user based on their profile and order
    """
    try:
        print(f"User preferences: {user.reading_preferences}")  # Debug log
        print(f"Order details: {order_details}")  # Debug log
        
        # Get user's complete profile including reading history
        user_profile = {
            "preferred_genres": user.reading_preferences,
            "reading_level": "Intermediate",
            "reading_history": []
        }

        # Get available books
        available_books = await get_available_books()
        print(f"Available books: {len(available_books)}")  # Debug log

        if not available_books:
            print("No books found in database!")  # Debug log
            return []

        # Get recommendations
        recommendations = await recommender.get_recommendations(
            user_profile=user_profile,
            order_details=order_details,
            available_books=available_books,
            current_time=datetime.now(),
            max_recommendations=max_recommendations
        )
        
        print(f"Found recommendations: {len(recommendations)}")  # Debug log
        return recommendations
        
    except Exception as e:
        print(f"Error generating recommendations: {e}")  # Debug log
        raise  # Re-raise exception for proper error handling

async def get_available_books() -> List[Book]:
    """
    Get all available books from database
    """
    try:
        # Hapus await karena supabase.table().select() tidak async
        response = supabase.table('books').select("*").execute()
        
        if not response.data:
            print("No data returned from Supabase")
            return []
            
        print(f"Raw response data: {response.data[:2]}")  # Debug first 2 books
        
        books = []
        for book_data in response.data:
            try:
                book = Book.model_validate(book_data)
                books.append(book)
            except Exception as validation_error:
                print(f"Error validating book data: {validation_error}")
                print(f"Problematic book data: {book_data}")
                continue
                
        return books
    except Exception as e:
        print(f"Error fetching books: {e}")
        print(f"Full error details: {str(e.__class__.__name__)}")
        return []