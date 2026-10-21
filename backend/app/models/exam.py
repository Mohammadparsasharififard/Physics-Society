from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    grade_id = Column(Integer, ForeignKey("grades.id", ondelete="CASCADE"), nullable=False, index=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False, index=True)
    question_type = Column(String(32), nullable=False, index=True)  # 'mcq' or 'written'
    difficulty = Column(String(16), default="medium", index=True)  # 'easy', 'medium', 'hard'
    prompt_fa = Column(Text, nullable=False)
    points = Column(Float, default=1.0)
    time_limit_seconds = Column(Integer, default=90)
    source_ref = Column(String(128), nullable=True)  # e.g., "کتاب درسی ص ۱۴ - شکل ۲"
    is_published = Column(Boolean, default=True, index=True)
    is_ai_generated = Column(Boolean, default=False)
    review_status = Column(String(32), default="approved", index=True)  # 'approved', 'pending_review', 'rejected'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    grade = relationship("Grade", back_populates="questions")
    book = relationship("Book", back_populates="questions")
    chapter = relationship("Chapter", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")
    rubric = relationship("GradingRubric", back_populates="question", uselist=False, cascade="all, delete-orphan")
    exam_questions = relationship("ExaminationQuestion", back_populates="question", cascade="all, delete-orphan")
    student_answers = relationship("StudentAnswer", back_populates="question", cascade="all, delete-orphan")
    competition_questions = relationship("CompetitionQuestion", back_populates="question", cascade="all, delete-orphan")


class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    option_key = Column(String(8), nullable=False)  # 'A', 'B', 'C', 'D' or '1', '2', '3', '4'
    text_fa = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)
    explanation_fa = Column(Text, nullable=True)

    # Relationships
    question = relationship("Question", back_populates="options")


class GradingRubric(Base):
    __tablename__ = "grading_rubrics"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), unique=True, nullable=False)
    reference_answer_fa = Column(Text, nullable=False)
    max_points = Column(Float, default=5.0, nullable=False)
    key_concepts = Column(JSON, default=list)  # list of key concepts required
    partial_credit_rules = Column(JSON, default=dict)  # concept -> points map
    tolerances = Column(JSON, default=dict)  # numeric tolerance / units rules

    # Relationships
    question = relationship("Question", back_populates="rubric")


class Examination(Base):
    __tablename__ = "examinations"

    id = Column(Integer, primary_key=True, index=True)
    grade_id = Column(Integer, ForeignKey("grades.id", ondelete="CASCADE"), nullable=False, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id", ondelete="SET NULL"), nullable=True, index=True)
    title_fa = Column(String(128), nullable=False)
    description_fa = Column(Text, nullable=True)
    exam_mode = Column(String(32), default="practice", index=True)  # 'practice', 'assessment', 'mixed'
    duration_minutes = Column(Integer, default=30)
    total_points = Column(Float, default=20.0)
    passing_score = Column(Float, default=12.0)
    is_active = Column(Boolean, default=True, index=True)
    randomize_questions = Column(Boolean, default=True)
    show_immediate_feedback = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    grade = relationship("Grade", back_populates="examinations")
    chapter = relationship("Chapter", back_populates="examinations")
    questions = relationship("ExaminationQuestion", back_populates="examination", cascade="all, delete-orphan")
    attempts = relationship("ExaminationAttempt", back_populates="examination", cascade="all, delete-orphan")


class ExaminationQuestion(Base):
    __tablename__ = "examination_questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, default=1)
    points = Column(Float, default=1.0)

    # Relationships
    examination = relationship("Examination", back_populates="questions")
    question = relationship("Question", back_populates="exam_questions")


class ExaminationAttempt(Base):
    __tablename__ = "examination_attempts"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    attempt_number = Column(Integer, default=1)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    submitted_at = Column(DateTime, nullable=True)
    auto_graded_score = Column(Float, default=0.0)
    ai_proposed_score = Column(Float, default=0.0)
    final_score = Column(Float, default=0.0)
    total_possible_points = Column(Float, default=0.0)
    percentage = Column(Float, default=0.0)
    is_passed = Column(Boolean, default=False)
    status = Column(String(32), default="in_progress", index=True)  # 'in_progress', 'submitted', 'grading', 'graded', 'reviewed'
    feedback_fa = Column(Text, nullable=True)

    # Relationships
    examination = relationship("Examination", back_populates="attempts")
    user = relationship("User", back_populates="exam_attempts")
    answers = relationship("StudentAnswer", back_populates="attempt", cascade="all, delete-orphan")


class StudentAnswer(Base):
    __tablename__ = "student_answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("examination_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option_key = Column(String(8), nullable=True)
    written_response_text = Column(Text, nullable=True)
    auto_score = Column(Float, default=0.0)
    ai_score = Column(Float, nullable=True)
    final_score = Column(Float, default=0.0)
    max_score = Column(Float, default=1.0)
    is_correct = Column(Boolean, nullable=True)
    feedback_fa = Column(Text, nullable=True)
    ai_analysis_json = Column(JSON, nullable=True)  # correct_concepts, missing_concepts, etc.
    review_status = Column(String(32), default="auto", index=True)  # 'auto', 'pending_review', 'approved', 'overridden'

    # Relationships
    attempt = relationship("ExaminationAttempt", back_populates="answers")
    question = relationship("Question", back_populates="student_answers")
    reviews = relationship("GradingReview", back_populates="answer", cascade="all, delete-orphan")


class GradingReview(Base):
    __tablename__ = "grading_reviews"

    id = Column(Integer, primary_key=True, index=True)
    student_answer_id = Column(Integer, ForeignKey("student_answers.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    previous_score = Column(Float, nullable=False)
    new_score = Column(Float, nullable=False)
    review_reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    answer = relationship("StudentAnswer", back_populates="reviews")
    reviewer = relationship("User")
