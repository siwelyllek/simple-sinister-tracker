from sqlalchemy import Column, Integer, String, Date, Float
from database import Base

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    kettlebell_swings = Column(Integer, default=0)
    turkish_get_ups = Column(Integer, default=0)
    swing_weight_kg = Column(Float, default=16.0)  # Default 16kg
    getup_weight_kg = Column(Float, default=16.0)  # Default 16kg
    swing_style = Column(String, default="2-handed")  # "1-handed" or "2-handed"
