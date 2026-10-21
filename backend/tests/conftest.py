import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test DB
os.environ["DATABASE_URL"] = "sqlite:///./test_physics.db"
os.environ["AI_PROVIDER"] = "mock"

from app.database import Base, get_db
from app.main import app
from app.seed.curriculum_seed import seed_base_system
from app.seed.question_bank import seed_complete_curriculum_and_questions

test_engine = create_engine("sqlite:///./test_physics.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_base_system(db)
    seed_complete_curriculum_and_questions(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_physics.db"):
        try:
            os.remove("./test_physics.db")
        except Exception:
            pass

@pytest.fixture()
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
