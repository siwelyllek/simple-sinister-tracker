from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
import schemas
import crud
import database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/workouts/", response_model=schemas.Workout)
def create_workout(workout: schemas.WorkoutCreate, db: Session = Depends(database.get_db)):
    return crud.create_workout(db, workout)

@app.get("/workouts/", response_model=list[schemas.Workout])
def read_workouts(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_workouts(db, skip=skip, limit=limit)

@app.delete("/workouts/{workout_id}")
def delete_workout(workout_id: int, db: Session = Depends(database.get_db)):
    success = crud.delete_workout(db, workout_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workout not found")
    return {"message": "Workout deleted successfully"}
