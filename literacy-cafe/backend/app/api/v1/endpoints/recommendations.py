from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from app.models.user import User
from app.models.book import Book
from app.api.deps import get_current_active_user
from app.services.recommendations import get_book_recommendations
from pydantic import BaseModel

router = APIRouter()

class OrderDetails(BaseModel):
    drink: str
    drink_type: str
    food: str
    food_category: str

@router.post("/books", response_model=List[Book])
async def get_recommendations(
    order_details: OrderDetails,
    current_user: User = Depends(get_current_active_user)
) -> List[Book]:
    """
    Get personalized book recommendations based on user profile and current order.
    """
    if not current_user.reading_preferences:
        raise HTTPException(
            status_code=400,
            detail="Please update your reading preferences first"
        )

    recommendations = await get_book_recommendations(
        user=current_user,
        order_details=order_details.dict()
    )

    if not recommendations:
        raise HTTPException(
            status_code=404,
            detail="No recommendations found"
        )

    return recommendations