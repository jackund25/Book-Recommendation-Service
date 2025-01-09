from datetime import datetime, timedelta
from typing import Optional, List  # Tambahkan import List
from jose import JWTError, jwt
from passlib.context import CryptContext
from supabase import create_client
from app.config import settings
from app.models.user import UserInDB, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def authenticate_user(email: str, password: str) -> Optional[User]:
    try:
        # Query user from Supabase
        response = supabase.table('users').select("*").eq('email', email).execute()
        if not response.data:
            return None
        
        user_dict = response.data[0]
        if not verify_password(password, user_dict['password']):
            return None
        
        return User(**user_dict)
    except Exception as e:
        print(f"Authentication error: {e}")
        return None

async def get_user(email: str) -> Optional[User]:
    try:
        response = supabase.table('users').select("*").eq('email', email).execute()
        if not response.data:
            return None
        return User(**response.data[0])
    except Exception as e:
        print(f"Error fetching user: {e}")
        return None

async def create_user(
    email: str, 
    password: str, 
    full_name: Optional[str] = None,
    reading_preferences: Optional[List[str]] = None
) -> Optional[User]:
    try:
        hashed_password = get_password_hash(password)
        user_data = {
            "email": email,
            "password": hashed_password,
            "full_name": full_name,
            "reading_preferences": reading_preferences or ["Fiction", "Non-Fiction"],
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True
        }
        
        response = supabase.table('users').insert(user_data).execute()
        if not response.data:
            return None
            
        return User(**response.data[0])
    except Exception as e:
        print(f"Error creating user: {e}")
        return None