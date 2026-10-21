import pytest
from app.services.ai_service import AIService
from app.schemas.ai import AIGradingRequest

def test_ai_connection_test(db_session):
    svc = AIService(db=db_session)
    res = svc.test_connection()
    assert res.success is True
    assert res.provider in ["mock", "openai"]

def test_ai_written_answer_grading_rubric(db_session):
    svc = AIService(db=db_session)
    req = AIGradingRequest(
        question_prompt="تفاوت جرم و وزن را توضیح دهید.",
        reference_answer="جرم مقدار ماده تشکیل‌دهنده است و با کیلوگرم سنجیده می‌شود. وزن نیروی گرانش زمین است و با نیوتون سنجیده می‌شود.",
        grading_rubric={"key_concepts": ["مقدار ماده", "کیلوگرم", "نیروی گرانش", "نیوتون"]},
        max_score=5.0,
        student_response="جرم مقدار ماده است که با کیلوگرم بیان می‌شود. اما وزن نیروی جاذبه زمین بر جسم است."
    )
    result = svc.grade_written_answer(req)
    assert 0.0 <= result.score <= 5.0
    assert result.max_score == 5.0
    assert len(result.feedback_fa) > 5

def test_ai_empty_answer_handling(db_session):
    svc = AIService(db=db_session)
    req = AIGradingRequest(
        question_prompt="قانون پایستگی انرژی را بیان کنید.",
        reference_answer="انرژی نه خلق می‌شود و نه نابود.",
        max_score=5.0,
        student_response=""
    )
    result = svc.grade_written_answer(req)
    assert result.score == 0.0
    assert "ناکافی" in result.feedback_fa or "ثبت نشده" in result.feedback_fa
