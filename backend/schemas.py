from pydantic import BaseModel, validator
from datetime import date
from typing import Optional

class WorkoutBase(BaseModel):
    date: date
    kettlebell_swings: int = 0
    turkish_get_ups: int = 0
    swing_weight_kg: float = 16.0
    # Dual get-up weight system
    getup_weight_1_kg: float = 16.0
    getup_reps_1: int = 0
    getup_weight_2_kg: Optional[float] = None
    getup_reps_2: int = 0
    swing_style: str = "2-handed"
    
    @validator('swing_style')
    def validate_swing_style(cls, v):
        if v not in ["1-handed", "2-handed"]:
            raise ValueError('swing_style must be either "1-handed" or "2-handed"')
        return v
    
    @validator('getup_reps_1', 'getup_reps_2')
    def validate_getup_reps(cls, v):
        if v < 0:
            raise ValueError('Get-up reps cannot be negative')
        return v
    
    @validator('getup_weight_2_kg')
    def validate_getup_weight_2(cls, v, values):
        # If second weight is provided, ensure it's positive
        if v is not None and v <= 0:
            raise ValueError('Get-up weight must be positive')
        return v
    
    @validator('turkish_get_ups')
    def validate_total_getups(cls, v, values):
        # Ensure total get-ups matches the sum of individual reps
        if 'getup_reps_1' in values and 'getup_reps_2' in values:
            total_reps = values['getup_reps_1'] + values['getup_reps_2']
            if v != total_reps:
                raise ValueError(f'Total get-ups ({v}) must equal sum of individual reps ({total_reps})')
        return v

class WorkoutCreate(WorkoutBase):
    pass

class Workout(WorkoutBase):
    id: int
    
    class Config:
        from_attributes = True
