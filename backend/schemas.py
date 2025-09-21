from pydantic import BaseModel, validator, Field
from datetime import date as date_type
from typing import Optional

class WorkoutBase(BaseModel):
    date: date_type = Field(..., description="Workout date")
    kettlebell_swings: int = Field(0, ge=0, le=10000, description="Number of kettlebell swings")
    turkish_get_ups: int = Field(0, ge=0, le=100, description="Total Turkish get-ups")
    swing_weight_kg: float = Field(16.0, gt=0, le=200, description="Swing weight in kilograms")
    # Dual get-up weight system
    getup_weight_1_kg: float = Field(16.0, gt=0, le=200, description="Primary get-up weight in kilograms")
    getup_reps_1: int = Field(0, ge=0, le=100, description="Reps for primary weight")
    getup_weight_2_kg: Optional[float] = Field(None, gt=0, le=200, description="Secondary get-up weight in kilograms")
    getup_reps_2: int = Field(0, ge=0, le=100, description="Reps for secondary weight")
    swing_style: str = Field("2-handed", description="Swing style")
    # Workout type tracking
    swing_workout_type: str = Field("Standard", description="Type of swing workout")
    getup_workout_type: str = Field("Standard", description="Type of get-up workout")
    
    @validator('swing_style')
    def validate_swing_style(cls, v):
        if v not in ["1-handed", "2-handed"]:
            raise ValueError('swing_style must be either "1-handed" or "2-handed"')
        return v
    
    @validator('swing_workout_type')
    def validate_swing_workout_type(cls, v):
        allowed_types = ["Standard", "EMOM", "Ladders", "Clusters", "Descending", "Pyramid"]
        if v not in allowed_types:
            raise ValueError(f'swing_workout_type must be one of: {", ".join(allowed_types)}')
        return v
    
    @validator('getup_workout_type')
    def validate_getup_workout_type(cls, v):
        allowed_types = ["Standard", "EMOM", "Complex", "Heavy Single", "Alternating"]
        if v not in allowed_types:
            raise ValueError(f'getup_workout_type must be one of: {", ".join(allowed_types)}')
        return v
    
    @validator('date')
    def validate_date(cls, v):
        from datetime import date, timedelta
        # Don't allow dates more than 10 years in the past or future
        today = date.today()
        min_date = today - timedelta(days=3650)  # 10 years ago
        max_date = today + timedelta(days=365)   # 1 year future
        
        if v < min_date or v > max_date:
            raise ValueError('Date must be within reasonable range (10 years past to 1 year future)')
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
