from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class XPTransaction(Base):
    __tablename__ = "xp_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    activity_type = Column(String(64), nullable=False, index=True)  # 'lesson_completed', 'exam_passed', 'streak_bonus', 'competition_reward', 'admin_adjustment'
    reference_id = Column(String(64), nullable=True, index=True)  # Unique id to prevent duplicate awards
    description_fa = Column(String(256), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="xp_transactions")

    __table_args__ = (
        UniqueConstraint('user_id', 'activity_type', 'reference_id', name='uq_user_activity_reference'),
    )


class Level(Base):
    __tablename__ = "levels"

    id = Column(Integer, primary_key=True, index=True)
    level_number = Column(Integer, unique=True, nullable=False, index=True)
    title_fa = Column(String(64), nullable=False)  # e.g., "دانش‌پژوه مبتدی", "محقق فیزیک", "استاد نیرو و انرژی"
    min_xp = Column(Integer, nullable=False)
    badge_icon = Column(String(64), nullable=True)


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(64), unique=True, nullable=False, index=True)
    title_fa = Column(String(128), nullable=False)
    description_fa = Column(Text, nullable=False)
    icon = Column(String(64), nullable=False)  # lucide icon name or emoji
    category = Column(String(32), default="general")  # 'general', 'curriculum', 'streak', 'competition'
    xp_bonus = Column(Integer, default=50)
    criteria_type = Column(String(64), nullable=False)  # 'first_lesson', 'perfect_practice', 'chapter_master', 'streak_7', 'competition_participant'
    criteria_threshold = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)

    # Relationships
    awarded_students = relationship("StudentBadge", back_populates="badge", cascade="all, delete-orphan")


class StudentBadge(Base):
    __tablename__ = "student_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    badge_id = Column(Integer, ForeignKey("badges.id", ondelete="CASCADE"), nullable=False, index=True)
    awarded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="badges")
    badge = relationship("Badge", back_populates="awarded_students")

    __table_args__ = (
        UniqueConstraint('user_id', 'badge_id', name='uq_user_badge'),
    )


class LearningStreak(Base):
    __tablename__ = "learning_streaks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_date = Column(String(16), nullable=False, index=True)  # YYYY-MM-DD Jalali / Gregorian
    activity_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="streaks")

    __table_args__ = (
        UniqueConstraint('user_id', 'activity_date', name='uq_user_activity_date'),
    )


class StudentProgress(Base):
    __tablename__ = "student_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False, index=True)
    is_completed = Column(Boolean, default=False, nullable=False, index=True)
    score_percent = Column(Integer, default=0)
    attempts_count = Column(Integer, default=1)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="progress")
    lesson = relationship("Lesson", back_populates="student_progress")
    chapter = relationship("Chapter", back_populates="student_progress")

    __table_args__ = (
        UniqueConstraint('user_id', 'lesson_id', name='uq_user_lesson_progress'),
    )
