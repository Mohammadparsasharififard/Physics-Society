import pytest
from datetime import datetime, timedelta
from app.models.competition import Competition, CompetitionQuestion
from app.models.exam import Question

def test_weekly_competition_flow(client, db_session):
    # Create an active competition
    comp = Competition(
        title_fa="مسابقه هفتگی فیزیک نیوتونی و نیروها",
        description_fa="مسابقه هفته چهارم مهرماه انجمن فیزیک",
        theme_fa="قوانین حرکت نیوتون",
        starts_at=datetime.utcnow() - timedelta(days=1),
        ends_at=datetime.utcnow() + timedelta(days=5),
        is_published=True,
        is_closed=False,
        max_submissions_per_student=1,
        xp_participation=25
    )
    db_session.add(comp)
    db_session.commit()
    db_session.refresh(comp)

    # Attach a question
    q = db_session.query(Question).filter(Question.question_type == "mcq").first()
    if q:
        cq = CompetitionQuestion(competition_id=comp.id, question_id=q.id, order_index=1, points=10.0)
        db_session.add(cq)
        db_session.commit()

    # Student login
    login_res = client.post("/api/auth/login", json={
        "username": "student_beheshti",
        "password": "Student1405!"
    })
    token = login_res.json()["access_token"]

    # List competitions
    list_res = client.get("/api/competitions", headers={"Authorization": f"Bearer {token}"})
    assert list_res.status_code == 200
    comps = list_res.json()
    assert len(comps) >= 1

    # Submit answers
    sub_res = client.post(
        f"/api/competitions/{comp.id}/submit",
        json={"competition_id": comp.id, "answers": {str(q.id): "B"}},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert sub_res.status_code == 200
    assert sub_res.json()["success"] is True

    # Duplicate submission should fail
    dup_res = client.post(
        f"/api/competitions/{comp.id}/submit",
        json={"competition_id": comp.id, "answers": {str(q.id): "B"}},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert dup_res.status_code == 400
    assert "حداکثر دفعات مجاز" in dup_res.json()["detail"]

    # Leaderboard
    lead_res = client.get(f"/api/competitions/{comp.id}/leaderboard")
    assert lead_res.status_code == 200
    board = lead_res.json()
    assert len(board) >= 1
    assert board[0]["display_name"] is not None
