from datetime import timedelta  # Tambahkan import ini
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.config import settings
from app.models.user import User, UserCreate, Token
from app.services.auth import authenticate_user, create_access_token, create_user
from app.api.deps import get_current_active_user
from typing import List

router = APIRouter()

@router.post("/register", response_model=User)
async def register(user_in: UserCreate):
    """
    Register a new user.
    """
    try:
        if not user_in.reading_preferences:
            user_in.reading_preferences = ["Fiction", "Non-Fiction"]
            
        user = await create_user(
            email=user_in.email,
            password=user_in.password,
            full_name=user_in.full_name,
            reading_preferences=user_in.reading_preferences
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    try:
        user = await authenticate_user(form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Optional: Add a test endpoint
@router.get("/test")
async def test_auth():
    return {"message": "Auth router is working"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Get current user.
    """
    return current_user

@router.put("/me/preferences", response_model=User)
async def update_reading_preferences(
    preferences: List[str],
    current_user: User = Depends(get_current_active_user)
):
    """
    Update user's reading preferences.
    """
    try:
        from app.services.auth import supabase  # Import supabase client
        
        response = supabase.table('users').update({
            "reading_preferences": preferences
        }).eq('email', current_user.email).execute()
        
        if response.data:
            return User(**response.data[0])
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))