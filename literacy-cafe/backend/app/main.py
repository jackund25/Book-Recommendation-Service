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

# Update CORS middleware configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://literacy-cafe-production.up.railway.app",
    # Tambahkan origin lain jika diperlukan
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
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

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
async def welcome():
    return {"Welcome to Literacy Cafe backend"}