import pytest
from app.services.gamification_service import award_xp, record_daily_streak
from app.models.user import User, StudentProfile

def test_xp_award_and_duplicate_prevention(db_session):
    student = db_session.query(User).filter(User.username == "student_beheshti").first()
    initial_xp = student.profile.total_xp

    # First award
    tx1 = award_xp(
        db_session, student.id, 50,
        activity_type="test_award",
        description_fa="پاداش آزمایشی",
        reference_id="unique_ref_123"
    )
    assert tx1 is not None
    db_session.refresh(student.profile)
    assert student.profile.total_xp == initial_xp + 50

    # Duplicate award attempt with same reference_id
    tx2 = award_xp(
        db_session, student.id, 50,
        activity_type="test_award",
        description_fa="تلاش مجدد پاداش تکراری",
        reference_id="unique_ref_123"
    )
    assert tx2 is None
    db_session.refresh(student.profile)
    # Total XP must remain unchanged
    assert student.profile.total_xp == initial_xp + 50

def test_daily_streak_idempotency(db_session):
    student = db_session.query(User).filter(User.username == "student_beheshti").first()
    s1 = record_daily_streak(db_session, student.id)
    # Recording multiple times on the same day must not increment multiple streak days
    s2 = record_daily_streak(db_session, student.id)
    assert s1 == s2

def test_gamification_dashboard_endpoint(client):
    login_res = client.post("/api/auth/login", json={
        "username": "student_beheshti",
        "password": "Student1405!"
    })
    token = login_res.json()["access_token"]

    dash_res = client.get("/api/gamification/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert dash_res.status_code == 200
    data = dash_res.json()
    assert "student" in data
    assert data["student"]["total_xp"] >= 0
    assert data["student"]["current_level"] >= 1
    assert "recent_exams" in data
