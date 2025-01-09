from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BookBase(BaseModel):
    title: str
    author: str
    genres: List[str]
    description: Optional[str] = None
    difficulty: str
    page_count: int
    estimated_reading_time: int
    rating: float
    popularity: float

class BookCreate(BookBase):
    pass

class BookInDB(BookBase):
    id: str
    created_at: datetime

class Book(BookBase):
    id: str

    class Config:
        from_attributes = True