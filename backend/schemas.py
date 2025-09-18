from pydantic import BaseModel, validator
from datetime import date

class WorkoutBase(BaseModel):
    date: date
    kettlebell_swings: int = 0
    turkish_get_ups: int = 0
    swing_weight_kg: float = 16.0
    getup_weight_kg: float = 16.0
    swing_style: str = "2-handed"
    
    @validator('swing_style')
    def validate_swing_style(cls, v):
        if v not in ["1-handed", "2-handed"]:
            raise ValueError('swing_style must be either "1-handed" or "2-handed"')
        return v

class WorkoutCreate(WorkoutBase):
    pass

class Workout(WorkoutBase):
    id: int
    
    class Config:
        from_attributes = True
