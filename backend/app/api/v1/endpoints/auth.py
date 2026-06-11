from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, create_reset_token, decode_token
)
from app.schemas.user import UserCreate, UserOut, Token, ForgotPassword, ResetPassword
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.api.deps import get_current_active_user
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pw,
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Auto‑create profile for later modules
    if user_in.role == "PATIENT":
        db.add(Patient(user_id=new_user.id))
    elif user_in.role == "DOCTOR":
        db.add(Doctor(user_id=new_user.id))
    db.commit()
    
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # FastAPI will read form data if we use Form(), but for simplicity we accept query/body params
    # Using dependency injection with OAuth2PasswordRequestForm is standard; we'll keep it simple.
    # Here we accept as query parameters (or you can use Form). We'll define explicitly.
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token = create_access_token(data={"sub": user.id, "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(request: ForgotPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Return success anyway to avoid email enumeration
        return {"message": "If the email exists, a reset link has been sent."}
    
    reset_token = create_reset_token(user.id)
    user.reset_token = reset_token
    db.commit()
    
    # In a real app, send email with the token/link.
    # For development we return the token directly.
    return {"message": "Reset token generated", "reset_token": reset_token}

@router.post("/reset-password")
def reset_password(request: ResetPassword, db: Session = Depends(get_db)):
    payload = decode_token(request.token)
    if not payload or payload.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify token matches stored token (optional extra security)
    if user.reset_token != request.token:
        raise HTTPException(status_code=400, detail="Token mismatch")
    
    user.hashed_password = get_password_hash(request.new_password)
    user.reset_token = None  # clear token
    db.commit()
    return {"message": "Password reset successful"}