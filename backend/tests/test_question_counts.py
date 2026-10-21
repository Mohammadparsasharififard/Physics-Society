import pytest
from app.seed.question_bank import validate_all_chapters_content

def test_chapter_question_minimums_enforced(db_session):
    """
    MASTER REQUIREMENT:
    For EVERY chapter in EVERY supported grade, provide:
    - At least 20 multiple-choice questions
    - At least 10 written-response questions
    """
    reports = validate_all_chapters_content(db_session)
    assert len(reports) == 12, "Must contain all 12 Physics chapters across Grades 7, 8, 9"

    for r in reports:
        assert r.actual_valid_mcq_count >= 20, (
            f"Chapter {r.chapter_number} ({r.chapter_title_fa}) Grade {r.grade_number} "
            f"failed MCQ minimum: has {r.actual_valid_mcq_count}, required 20"
        )
        assert r.actual_valid_written_count >= 10, (
            f"Chapter {r.chapter_number} ({r.chapter_title_fa}) Grade {r.grade_number} "
            f"failed Written minimum: has {r.actual_valid_written_count}, required 10"
        )
        assert r.is_mcq_compliant is True
        assert r.is_written_compliant is True
        assert r.is_fully_compliant is True
        assert len(r.missing_categories) == 0

def test_admin_validation_report_endpoint(client):
    # Login as admin
    login_res = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "AdminPhysics1405!"
    })
    admin_token = login_res.json()["access_token"]

    res = client.get(
        "/api/admin/validation-report",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 12
    for item in data:
        assert item["actual_valid_mcq_count"] >= 20
        assert item["actual_valid_written_count"] >= 10
        assert item["is_fully_compliant"] is True
