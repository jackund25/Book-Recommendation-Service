from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.recommendations import router as recommendations_router
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:8080",
    "https://literacy-cafe-production.up.railway.app",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    auth_router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentication"]
)

app.include_router(
    recommendations_router,
    prefix=f"{settings.API_V1_STR}/recommendations",
    tags=["Recommendations"]
)

@app.get("/")
async def root():
    return {"message": "Welcome to Literacy Cafe API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}