from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import models
import schemas
import crud
import database
from crud import WorkoutNotFoundError, WorkoutDatabaseError

models.Base.metadata.create_all(bind=database.engine)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Custom exception handlers
@app.exception_handler(WorkoutNotFoundError)
async def workout_not_found_handler(request: Request, exc: WorkoutNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"detail": "Workout not found"}
    )

@app.exception_handler(WorkoutDatabaseError)
async def workout_database_error_handler(request: Request, exc: WorkoutDatabaseError):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Global exception handler to prevent info leakage
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://0.0.0.0:3000",    # Docker networking
        "http://localhost:3122",  # New frontend port
        "http://127.0.0.1:3122",  # Alternative localhost for new port
        "http://0.0.0.0:3122",    # Docker networking for new port
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],  # Only needed methods
    allow_headers=["*"],
)

@app.post("/workouts/", response_model=schemas.Workout)
@limiter.limit("10/minute")  # Allow 10 workout creations per minute
def create_workout(request: Request, workout: schemas.WorkoutCreate, db: Session = Depends(database.get_db)):
    # Exceptions are now handled by global exception handlers
    return crud.create_workout(db, workout)

@app.get("/workouts/", response_model=list[schemas.Workout])
@limiter.limit("30/minute")  # Allow 30 reads per minute  
def read_workouts(request: Request, skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    # Exceptions are now handled by global exception handlers
    return crud.get_workouts(db, skip=skip, limit=limit)

@app.delete("/workouts/{workout_id}")
@limiter.limit("20/minute")  # Allow 20 deletes per minute
def delete_workout(request: Request, workout_id: int, db: Session = Depends(database.get_db)):
    # Exceptions are now handled by global exception handlers
    crud.delete_workout(db, workout_id)
    return {"message": "Workout deleted successfully"}
