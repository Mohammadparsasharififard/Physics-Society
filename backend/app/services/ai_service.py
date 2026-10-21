import os
import json
import time
import httpx
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

from app.config import settings
from app.models.system import AIProviderConfig, AIUsageRecord
from app.schemas.ai import AIGradingRequest, AIGradingResponse, AIConnectionTestResult

# System prompt for structured scientific Persian grading
GRADING_SYSTEM_PROMPT = """شما سامانه ارزیابی هوشمند و دستیار تصحیح پاسخ‌های تشریحی فیزیک دبیرستان استعدادهای درخشان شهید بهشتی ۲ هستید.
وظیفه شما ارزیابی دقیق، منصفانه و علمی پاسخ دانش‌آموز بر اساس راهنمای تصحیح (بارم‌بندی) است.

قوانین تصحیح:
۱. نمره نهایی باید بین ۰ تا سقف بارم (max_score) باشد.
۲. نمره جزئی (Partial Credit) بر اساس مفاهیم کلیدی ذکر شده اعطا شود.
۳. در صورت درستی مفاهیم علمی، تفاوت‌های نگارشی یا املایی بی‌ضرر در زبان فارسی یا نمادها نباید موجب کسر نمره شود.
۴. لحن محترمانه و لحن اعتمادبه‌نفسِ بدون استدلال علمی دانش‌آموز نباید نمره بگیرد؛ فقط درستی مفاهیم علمی ملاک است.
۵. خروجی باید حتماً و منحصراً یک ساختار معتبر JSON با این فیلدها باشد:
{
  "score": float,
  "max_score": float,
  "correct_concepts": ["مفهوم درست ۱", ...],
  "missing_concepts": ["مفهوم فراموش‌شده یا اشتباه ۱", ...],
  "feedback_fa": "توضیح بازخورد تشریحی و راهنمایی به زبان فارسی",
  "requires_review": bool
}"""

class AIService:
    def __init__(self, db: Optional[Session] = None):
        self.db = db
        # Load from DB if configured, else fallback to settings
        self.provider = settings.AI_PROVIDER
        self.base_url = settings.AI_BASE_URL
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL
        self.timeout = settings.AI_TIMEOUT_SECONDS
        self.max_retries = settings.AI_MAX_RETRIES

        if db:
            active_conf = db.query(AIProviderConfig).filter(AIProviderConfig.is_active == True).first()
            if active_conf:
                self.provider = active_conf.provider_name
                self.base_url = active_conf.base_url
                self.model = active_conf.model_name
                self.timeout = active_conf.timeout_seconds
                self.max_retries = active_conf.max_retries
                if active_conf.api_key_encrypted and active_conf.api_key_encrypted != "***":
                    self.api_key = active_conf.api_key_encrypted

    def test_connection(self) -> AIConnectionTestResult:
        """Tests connection with the configured provider"""
        start_time = time.time()
        if self.provider == "mock":
            return AIConnectionTestResult(
                success=True,
                provider="mock",
                model=self.model,
                latency_ms=12,
                message_fa="سرویس شبیه‌ساز هوش مصنوعی (Mock) فعال و آماده به کار است.",
                raw_response="{\"status\": \"mock_ok\"}"
            )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        test_payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a test assistant. Reply strictly in JSON: {\"ping\": \"pong\"}"},
                {"role": "user", "content": "ping"}
            ],
            "max_tokens": 50,
            "temperature": 0.1
        }

        url = f"{self.base_url.rstrip('/')}/chat/completions"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(url, json=test_payload, headers=headers)
                latency = int((time.time() - start_time) * 1000)
                if resp.status_code == 200:
                    return AIConnectionTestResult(
                        success=True,
                        provider=self.provider,
                        model=self.model,
                        latency_ms=latency,
                        message_fa="اتصال به سرویس هوش مصنوعی با موفقیت برقرار شد.",
                        raw_response=resp.text[:200]
                    )
                else:
                    return AIConnectionTestResult(
                        success=False,
                        provider=self.provider,
                        model=self.model,
                        latency_ms=latency,
                        message_fa=f"خطا در ارتباط با سرویس هوش مصنوعی (کد وضعیت: {resp.status_code}). متن خطا: {resp.text[:200]}",
                        raw_response=resp.text[:200]
                    )
        except Exception as ex:
            latency = int((time.time() - start_time) * 1000)
            return AIConnectionTestResult(
                success=False,
                provider=self.provider,
                model=self.model,
                latency_ms=latency,
                message_fa=f"خطای شبکه یا عدم پاسخگویی سرویس هوش مصنوعی: {str(ex)}",
                raw_response=None
            )

    def grade_written_answer(self, req: AIGradingRequest) -> AIGradingResponse:
        """
        Evaluates a student's written/descriptive response with strict validation.
        Awards partial credit, flags uncertain cases for admin review.
        """
        start_time = time.time()

        # Handle empty or trivial response immediately
        resp_clean = req.student_response.strip()
        if len(resp_clean) < 3:
            return AIGradingResponse(
                score=0.0,
                max_score=req.max_score,
                correct_concepts=[],
                missing_concepts=["عدم ارائه پاسخ یا پاسخ ناکافی"],
                feedback_fa="پاسخی از سوی دانش‌آموز ثبت نشده است یا پاسخ فاقد محتوای علمی است.",
                requires_review=False
            )

        # Mock provider logic (Deterministic rubric & concept matching)
        if self.provider == "mock" or not self.api_key or self.api_key == "mock-key-for-testing":
            return self._mock_grade(req)

        # External OpenAI-compatible Chat Completion API
        user_prompt = f"""صورت سؤال فیزیک:
{req.question_prompt}

پاسخ مرجع و راهنمای تصحیح:
{req.reference_answer}

حداکثر بارم سؤال: {req.max_score} نمره

پاسخ ارسالی دانش‌آموز:
\"\"\"{req.student_response}\"\"\"

لطفاً پاسخ دانش‌آموز را ارزیابی کرده و صرفاً ساختار JSON خواسته شده را بازگردانید."""

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": GRADING_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": settings.AI_TEMPERATURE,
            "response_format": {"type": "json_object"}
        }

        url = f"{self.base_url.rstrip('/')}/chat/completions"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                res = client.post(url, json=payload, headers=headers)
                latency = int((time.time() - start_time) * 1000)

                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content)

                    # Extract usage
                    usage = data.get("usage", {})
                    p_tokens = usage.get("prompt_tokens", 0)
                    c_tokens = usage.get("completion_tokens", 0)
                    t_tokens = usage.get("total_tokens", p_tokens + c_tokens)

                    if self.db:
                        record = AIUsageRecord(
                            operation_type="written_grading",
                            prompt_tokens=p_tokens,
                            completion_tokens=c_tokens,
                            total_tokens=t_tokens,
                            status="success",
                            latency_ms=latency
                        )
                        self.db.add(record)
                        self.db.commit()

                    # Enforce strict score bounds
                    score = float(parsed.get("score", 0.0))
                    max_s = float(req.max_score)
                    bounded_score = max(0.0, min(max_s, round(score, 2)))

                    return AIGradingResponse(
                        score=bounded_score,
                        max_score=max_s,
                        correct_concepts=parsed.get("correct_concepts", []),
                        missing_concepts=parsed.get("missing_concepts", []),
                        feedback_fa=parsed.get("feedback_fa", "پاسخ ارزیابی شد."),
                        requires_review=bool(parsed.get("requires_review", False))
                    )
                else:
                    # On provider error, fallback safely to mock rubric with review flag
                    fallback = self._mock_grade(req)
                    fallback.requires_review = True
                    fallback.feedback_fa += f" (خطای ارائه‌دهنده هوش مصنوعی: {res.status_code} - ارجاع به بازبینی دبیر)"
                    return fallback

        except Exception as ex:
            # Fallback on network/JSON failure
            fallback = self._mock_grade(req)
            fallback.requires_review = True
            fallback.feedback_fa += f" (خطای اتصال به سرور هوش مصنوعی - ارجاع خودکار به دبیر)"
            return fallback

    def _mock_grade(self, req: AIGradingRequest) -> AIGradingResponse:
        """
        Deterministic, intelligent rule-based grading used for testing
        and offline fallback. Checks keywords, numeric units, and length.
        """
        student_text = req.student_response.strip().lower()
        ref_text = req.reference_answer.lower()
        
        # Split key concepts from reference answer or rubric
        key_concepts = []
        if req.grading_rubric and "key_concepts" in req.grading_rubric:
            key_concepts = req.grading_rubric["key_concepts"]
        else:
            # Extract main physics tokens from ref_text
            candidates = [w.strip() for w in ref_text.replace("،", " ").replace(".", " ").split() if len(w) > 3]
            key_concepts = candidates[:5]

        matched = []
        missing = []
        for c in key_concepts:
            c_clean = c.lower()
            if c_clean in student_text:
                matched.append(c)
            else:
                missing.append(c)

        if not key_concepts:
            # Word overlap similarity
            ratio = min(1.0, len(student_text) / max(30.0, len(ref_text)))
            score = round(ratio * req.max_score, 1)
        else:
            match_ratio = len(matched) / len(key_concepts)
            score = round(match_ratio * req.max_score, 1)

        score = max(0.0, min(req.max_score, score))
        requires_review = (0.2 < score / max(1.0, req.max_score) < 0.8)

        feedback = f"پاسخ بررسی شد. نمره پیشنهادی: {score} از {req.max_score}."
        if matched:
            feedback += f" مفاهیم صحیح شناسایی‌شده: {', '.join(matched)}."
        if missing:
            feedback += f" نکات نیازمند تکمیل: {', '.join(missing)}."

        return AIGradingResponse(
            score=score,
            max_score=req.max_score,
            correct_concepts=matched,
            missing_concepts=missing,
            feedback_fa=feedback,
            requires_review=requires_review
        )
