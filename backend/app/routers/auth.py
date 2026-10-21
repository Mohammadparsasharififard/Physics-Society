from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, StudentProfile
from app.models.curriculum import Grade
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse, StudentProfileUpdate
from app.services.auth import hash_password, verify_password, create_access_token, get_current_user
from app.services.gamification_service import record_daily_streak
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication"])

def format_user_response(user: User) -> UserResponse:
    grade_id = None
    grade_title = None
    total_xp = 0
    current_level = 1
    current_streak = 0
    avatar_url = None

    if user.profile:
        grade_id = user.profile.grade_id
        if user.profile.grade:
            grade_title = user.profile.grade.title_fa
        total_xp = user.profile.total_xp
        current_level = user.profile.current_level
        current_streak = user.profile.current_streak
        avatar_url = user.profile.avatar_url

    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        display_name=user.display_name or user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        grade_id=grade_id,
        grade_title_fa=grade_title,
        total_xp=total_xp,
        current_level=current_level,
        current_streak=current_streak,
        avatar_url=avatar_url
    )

@router.post("/register", response_model=TokenResponse)
def register_student(user_data: UserCreate, db: Session = Depends(get_db)):
    """Registers a new student account"""
    # Check username uniqueness
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="این نام کاربری قبلاً ثبت شده است. لطفاً نام کاربری دیگری انتخاب کنید."
        )

    # Check email uniqueness if provided
    if user_data.email and db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="این آدرس ایمیل قبلاً ثبت شده است."
        )

    # Verify grade exists
    if user_data.grade_id:
        grade = db.query(Grade).filter(Grade.id == user_data.grade_id).first()
        if not grade:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="پایه تحصیلی انتخاب شده نامعتبر است."
            )

    # Create user
    user = User(
        username=user_data.username.strip(),
        email=user_data.email.strip() if user_data.email else None,
        hashed_password=hash_password(user_data.password),
        role="student",
        full_name=user_data.full_name.strip(),
        display_name=user_data.display_name.strip() if user_data.display_name else user_data.full_name.strip(),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create student profile
    profile = StudentProfile(
        user_id=user.id,
        grade_id=user_data.grade_id,
        student_number=user_data.student_number,
        total_xp=0,
        current_level=1,
        current_streak=1
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    # Record streak
    record_daily_streak(db, user.id)

    log_audit_event(
        db, action="register", target_entity="users",
        target_id=str(user.id), user_id=user.id,
        details={"username": user.username, "grade_id": user_data.grade_id}
    )

    token = create_access_token({"sub": user.username, "role": user.role})
    return TokenResponse(access_token=token, user=format_user_response(user))

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticates user and returns JWT access token"""
    user = db.query(User).filter(User.username == credentials.username.strip()).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نام کاربری یا رمز عبور اشتباه است."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="حساب کاربری شما غیرفعال شده است."
        )

    # Record streak if student
    if user.role == "student":
        record_daily_streak(db, user.id)

    token = create_access_token({"sub": user.username, "role": user.role})
    return TokenResponse(access_token=token, user=format_user_response(user))

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns profile of currently logged-in user"""
    return format_user_response(current_user)

@router.put("/profile", response_model=UserResponse)
def update_profile(
    data: StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates permitted profile information"""
    if data.display_name:
        current_user.display_name = data.display_name.strip()

    if current_user.profile:
        if data.bio is not None:
            current_user.profile.bio = data.bio.strip()
        if data.avatar_url is not None:
            current_user.profile.avatar_url = data.avatar_url.strip()
        if data.grade_id is not None:
            grade = db.query(Grade).filter(Grade.id == data.grade_id).first()
            if grade:
                current_user.profile.grade_id = grade.id

    db.commit()
    db.refresh(current_user)
    return format_user_response(current_user)
