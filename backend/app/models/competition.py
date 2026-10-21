from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Competition(Base):
    __tablename__ = "competitions"

    id = Column(Integer, primary_key=True, index=True)
    grade_id = Column(Integer, ForeignKey("grades.id", ondelete="SET NULL"), nullable=True, index=True)  # Nullable for all grades
    title_fa = Column(String(128), nullable=False)
    description_fa = Column(Text, nullable=True)
    theme_fa = Column(String(128), nullable=True)  # e.g. "چالش فیزیک نیوتونی و انرژی"
    starts_at = Column(DateTime, nullable=False, index=True)
    ends_at = Column(DateTime, nullable=False, index=True)
    is_published = Column(Boolean, default=True, index=True)
    is_closed = Column(Boolean, default=False, index=True)
    solutions_published = Column(Boolean, default=False)
    official_solution_fa = Column(Text, nullable=True)
    max_submissions_per_student = Column(Integer, default=1)
    xp_first_place = Column(Integer, default=150)
    xp_second_place = Column(Integer, default=100)
    xp_third_place = Column(Integer, default=70)
    xp_participation = Column(Integer, default=20)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    grade = relationship("Grade", back_populates="competitions")
    questions = relationship("CompetitionQuestion", back_populates="competition", cascade="all, delete-orphan")
    submissions = relationship("CompetitionSubmission", back_populates="competition", cascade="all, delete-orphan")


class CompetitionQuestion(Base):
    __tablename__ = "competition_questions"

    id = Column(Integer, primary_key=True, index=True)
    competition_id = Column(Integer, ForeignKey("competitions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, default=1)
    points = Column(Float, default=10.0)

    # Relationships
    competition = relationship("Competition", back_populates="questions")
    question = relationship("Question", back_populates="competition_questions")


class CompetitionSubmission(Base):
    __tablename__ = "competition_submissions"

    id = Column(Integer, primary_key=True, index=True)
    competition_id = Column(Integer, ForeignKey("competitions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    answers_json = Column(JSON, nullable=False, default=dict)  # question_id -> response
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    score = Column(Float, default=0.0)
    final_rank = Column(Integer, nullable=True, index=True)
    xp_awarded = Column(Integer, default=0)
    status = Column(String(32), default="submitted", index=True)  # 'submitted', 'graded', 'reviewed'
    feedback_fa = Column(Text, nullable=True)

    # Relationships
    competition = relationship("Competition", back_populates="submissions")
    user = relationship("User", back_populates="competition_submissions")
