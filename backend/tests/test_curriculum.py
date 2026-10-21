import pytest

def test_get_grades(client):
    res = client.get("/api/curriculum/grades")
    assert res.status_code == 200
    grades = res.json()
    assert len(grades) == 3
    numbers = [g["number"] for g in grades]
    assert 7 in numbers and 8 in numbers and 9 in numbers

def test_get_books_by_grade(client):
    res = client.get("/api/curriculum/grades/1/books")
    assert res.status_code == 200
    books = res.json()
    assert len(books) >= 2
    types = [b["book_type"] for b in books]
    assert "standard" in types
    assert "sampad" in types

def test_lesson_detail_and_exercise_flow(client):
    # Login as student
    login_res = client.post("/api/auth/login", json={
        "username": "student_beheshti",
        "password": "Student1405!"
    })
    token = login_res.json()["access_token"]

    # Get lesson 1
    lesson_res = client.get("/api/curriculum/lessons/1", headers={"Authorization": f"Bearer {token}"})
    assert lesson_res.status_code == 200
    lesson = lesson_res.json()
    assert "content_blocks" in lesson
    assert len(lesson["exercises"]) >= 1

    # Submit an exercise
    first_ex = lesson["exercises"][0]
    sub_res = client.post(
        "/api/curriculum/exercises/submit",
        json={"exercise_id": first_ex["id"], "submitted_answer": 1},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert "is_correct" in sub_data
    assert "explanation_fa" in sub_data

    # Complete lesson
    comp_res = client.post(
        f"/api/curriculum/lessons/{lesson['id']}/complete",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert comp_res.status_code == 200
    assert comp_res.json()["success"] is True
