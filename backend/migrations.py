"""
Database migration utilities for Simple & Sinister Tracker.
"""

from sqlalchemy import text, inspect
from database import engine
import logging

logger = logging.getLogger(__name__)

def migrate_database():
    """Run database migrations to ensure schema is up to date."""
    try:
        with engine.connect() as connection:
            # Check if the workout type columns exist
            inspector = inspect(engine)
            columns = [col['name'] for col in inspector.get_columns('workouts')]
            
            needs_migration = False
            
            # Check if workout type columns are missing
            if 'swing_workout_type' not in columns:
                logger.info("Adding swing_workout_type column...")
                connection.execute(text("""
                    ALTER TABLE workouts 
                    ADD COLUMN swing_workout_type TEXT DEFAULT 'Standard'
                """))
                needs_migration = True
            
            if 'getup_workout_type' not in columns:
                logger.info("Adding getup_workout_type column...")
                connection.execute(text("""
                    ALTER TABLE workouts 
                    ADD COLUMN getup_workout_type TEXT DEFAULT 'Standard'
                """))
                needs_migration = True
            
            if needs_migration:
                # Update existing records to have EMOM for swings and Standard for getups
                logger.info("Updating existing workouts with default workout types...")
                connection.execute(text("""
                    UPDATE workouts 
                    SET swing_workout_type = 'EMOM' 
                    WHERE swing_workout_type IS NULL OR swing_workout_type = 'Standard'
                """))
                
                connection.execute(text("""
                    UPDATE workouts 
                    SET getup_workout_type = 'Standard' 
                    WHERE getup_workout_type IS NULL
                """))
                
                connection.commit()
                logger.info("Database migration completed successfully!")
            else:
                logger.info("Database schema is up to date.")
                
    except Exception as e:
        logger.error(f"Database migration failed: {e}")
        # Don't raise the exception - let the app continue with the new schema
        pass