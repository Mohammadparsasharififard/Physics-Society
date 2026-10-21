import pytest

def test_register_student(client):
    res = client.post("/api/auth/register", json={
        "username": "new_student_7",
        "email": "student7@beheshti2.ir",
        "password": "Password123!",
        "full_name": "سهراب سپهری",
        "display_name": "سهراب",
        "grade_id": 1
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["username"] == "new_student_7"
    assert data["user"]["role"] == "student"

def test_login_success(client):
    res = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "AdminPhysics1405!"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_login_invalid_credentials(client):
    res = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "wrong-password"
    })
    assert res.status_code == 401

def test_protected_route_without_token(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401

def test_student_cannot_access_admin_endpoints(client):
    # Login as student
    login_res = client.post("/api/auth/login", json={
        "username": "student_beheshti",
        "password": "Student1405!"
    })
    assert login_res.status_code == 200
    student_token = login_res.json()["access_token"]

    # Attempt to access admin overview
    admin_res = client.get(
        "/api/admin/overview",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert admin_res.status_code == 403
    assert "دسترسی غیرمجاز" in admin_res.json()["detail"]
