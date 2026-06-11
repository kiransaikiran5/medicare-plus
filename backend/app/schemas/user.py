from enum import Enum
from pydantic import BaseModel, EmailStr

class UserRole(str, Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"

# Registration schema
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    
# Response schema
class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    is_active: int
    
    class Config:
        from_attributes = True
        
# Login schema(from data)
class LoginForm(BaseModel):
    email: EmailStr
    password: str
    
# Token response schema
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
# Password reset request schema
class ForgotPassword(BaseModel):
    email: EmailStr
    
# Password reset schema
class ResetPassword(BaseModel):
    token: str
    new_password: str