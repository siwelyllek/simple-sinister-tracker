from sqlalchemy import Column, Integer, String, Date, Float
from database import Base

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    kettlebell_swings = Column(Integer, default=0)
    turkish_get_ups = Column(Integer, default=0)
    swing_weight_kg = Column(Float, default=16.0)  # Default 16kg
    # Get-up dual weight system
    getup_weight_1_kg = Column(Float, default=16.0)  # First weight
    getup_reps_1 = Column(Integer, default=0)        # Reps at first weight
    getup_weight_2_kg = Column(Float, nullable=True)  # Second weight (optional)
    getup_reps_2 = Column(Integer, default=0)        # Reps at second weight
    swing_style = Column(String, default="2-handed")  # "1-handed" or "2-handed"
    # Workout type tracking
    swing_workout_type = Column(String, default="Standard")  # "Standard", "EMOM", "Ladders", etc.
    getup_workout_type = Column(String, default="Standard")  # "Standard", "EMOM", "Complex", etc.
