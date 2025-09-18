from sqlalchemy.orm import Session
import models
import schemas

def create_workout(db: Session, workout: schemas.WorkoutCreate):
    db_workout = models.Workout(**workout.dict())
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)
    return db_workout

def get_workouts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Workout).offset(skip).limit(limit).all()

def get_workout(db: Session, workout_id: int):
    return db.query(models.Workout).filter(models.Workout.id == workout_id).first()

def delete_workout(db: Session, workout_id: int):
    db_workout = db.query(models.Workout).filter(models.Workout.id == workout_id).first()
    if db_workout:
        db.delete(db_workout)
        db.commit()
        return True
    return False
