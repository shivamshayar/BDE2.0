from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# BDE Machine Schemas
class BDEMachineCreate(BaseModel):
    machine_id: str
    password: str

class BDEMachineLogin(BaseModel):
    machine_id: str
    password: str

class BDEMachineResponse(BaseModel):
    id: int
    machine_id: str
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True

class BDEMachinePasswordReset(BaseModel):
    new_password: str

# User Schemas
class UserCreate(BaseModel):
    name: str
    role: str
    image_url: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    image_url: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    role: str
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Part Number Schemas
class PartNumberCreate(BaseModel):
    part_number: str
    description: Optional[str] = None

class PartNumberResponse(BaseModel):
    id: int
    part_number: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Order Number Schemas
class OrderNumberCreate(BaseModel):
    order_number: str
    description: Optional[str] = None

class OrderNumberResponse(BaseModel):
    id: int
    order_number: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Performance ID Schemas
class PerformanceIDCreate(BaseModel):
    performance_id: str
    description: Optional[str] = None

class PerformanceIDResponse(BaseModel):
    id: int
    performance_id: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Work Session Schemas
class WorkSessionCreate(BaseModel):
    user_id: int
    part_number: str
    order_number: str
    performance_id: str
    duration_seconds: int
    start_time: datetime
    end_time: datetime
    # machine_id will be injected from authenticated machine

class WorkSessionResponse(BaseModel):
    id: int
    user_id: int
    machine_id: int
    part_number: str
    order_number: str
    performance_id: str
    duration_seconds: int
    start_time: datetime
    end_time: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    machine_id: str

class TokenData(BaseModel):
    machine_id: Optional[str] = None
