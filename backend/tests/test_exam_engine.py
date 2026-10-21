import pytest

def test_exam_engine_deterministic_scoring(client):
    # Login as student
    login_res = client.post("/api/auth/login", json={
        "username": "student_beheshti",
        "password": "Student1405!"
    })
    token = login_res.json()["access_token"]

    # Start exam 1
    start_res = client.post("/api/exams/1/start", headers={"Authorization": f"Bearer {token}"})
    assert start_res.status_code == 200
    exam_data = start_res.json()
    attempt_id = exam_data["attempt_id"]
    questions = exam_data["questions"]
    assert len(questions) > 0

    # Build answers
    answers_payload = []
    for q in questions:
        if q["question_type"] == "mcq":
            answers_payload.append({
                "question_id": q["id"],
                "selected_option_key": "B",  # Submit answer B
                "written_response_text": None
            })
        elif q["question_type"] == "written":
            answers_payload.append({
                "question_id": q["id"],
                "selected_option_key": None,
                "written_response_text": "جرم مقدار ماده تشکیل‌دهنده جسم است و با ترازو اندازه گرفته می‌شود. اما وزن نیروی گرانش زمین به جسم است."
            })

    # Submit exam
    submit_res = client.post(
        "/api/exams/submit",
        json={"attempt_id": attempt_id, "answers": answers_payload},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert submit_res.status_code == 200
    res_data = submit_res.json()
    assert "final_score" in res_data
    assert "percentage" in res_data
    assert res_data["total_possible_points"] > 0

def test_admin_grade_override_workflow(client):
    # Admin login
    admin_login = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "AdminPhysics1405!"
    })
    admin_token = admin_login.json()["access_token"]

    # Get written queue
    queue_res = client.get(
        "/api/admin/reviews/written-queue",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert queue_res.status_code == 200
    queue_items = queue_res.json()

    if len(queue_items) > 0:
        target_answer = queue_items[0]
        # Override score
        override_res = client.post(
            "/api/admin/reviews/override",
            json={
                "student_answer_id": target_answer["student_answer_id"],
                "new_score": 4.5,
                "reason": "استدلال علمی دانش‌آموز با وجود نگارش متفاوت صحیح تشخیص داده شد."
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert override_res.status_code == 200
        assert override_res.json()["new_score"] == 4.5
