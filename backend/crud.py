from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
import models
import schemas
import logging

# Configure logging to avoid exposing sensitive errors
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WorkoutError(Exception):
    """Base exception for workout operations"""
    pass

class WorkoutNotFoundError(WorkoutError):
    """Raised when a workout is not found"""
    pass

class WorkoutDatabaseError(WorkoutError):
    """Raised when database operation fails"""
    pass

def create_workout(db: Session, workout: schemas.WorkoutCreate):
    try:
        db_workout = models.Workout(**workout.dict())
        db.add(db_workout)
        db.commit()
        db.refresh(db_workout)
        return db_workout
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error creating workout: {str(e)}")
        raise WorkoutDatabaseError("Failed to create workout due to data constraint violation")
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error creating workout: {str(e)}")
        raise WorkoutDatabaseError("Failed to create workout due to database error")
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error creating workout: {str(e)}")
        raise WorkoutDatabaseError("Failed to create workout")

def get_workouts(db: Session, skip: int = 0, limit: int = 100):
    try:
        # Validate parameters
        if skip < 0:
            skip = 0
        if limit < 1 or limit > 1000:  # Prevent excessive queries
            limit = 100
            
        return db.query(models.Workout).offset(skip).limit(limit).all()
    except SQLAlchemyError as e:
        logger.error(f"Database error retrieving workouts: {str(e)}")
        raise WorkoutDatabaseError("Failed to retrieve workouts")
    except Exception as e:
        logger.error(f"Unexpected error retrieving workouts: {str(e)}")
        raise WorkoutDatabaseError("Failed to retrieve workouts")

def get_workout(db: Session, workout_id: int):
    try:
        if workout_id <= 0:
            raise WorkoutNotFoundError("Invalid workout ID")
            
        workout = db.query(models.Workout).filter(models.Workout.id == workout_id).first()
        if not workout:
            raise WorkoutNotFoundError("Workout not found")
        return workout
    except WorkoutNotFoundError:
        raise  # Re-raise our custom exception
    except SQLAlchemyError as e:
        logger.error(f"Database error retrieving workout {workout_id}: {str(e)}")
        raise WorkoutDatabaseError("Failed to retrieve workout")
    except Exception as e:
        logger.error(f"Unexpected error retrieving workout {workout_id}: {str(e)}")
        raise WorkoutDatabaseError("Failed to retrieve workout")

def delete_workout(db: Session, workout_id: int):
    try:
        if workout_id <= 0:
            raise WorkoutNotFoundError("Invalid workout ID")
            
        db_workout = db.query(models.Workout).filter(models.Workout.id == workout_id).first()
        if not db_workout:
            raise WorkoutNotFoundError("Workout not found")
            
        db.delete(db_workout)
        db.commit()
        return True
    except WorkoutNotFoundError:
        raise  # Re-raise our custom exception
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error deleting workout {workout_id}: {str(e)}")
        raise WorkoutDatabaseError("Failed to delete workout")
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error deleting workout {workout_id}: {str(e)}")
        raise WorkoutDatabaseError("Failed to delete workout")
