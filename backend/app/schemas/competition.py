from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class CompetitionListItem(BaseModel):
    id: int
    grade_id: Optional[int] = None
    grade_title_fa: Optional[str] = "تمامی پایه‌ها"
    title_fa: str
    description_fa: Optional[str] = None
    theme_fa: Optional[str] = None
    starts_at: datetime
    ends_at: datetime
    is_active: bool
    is_closed: bool
    solutions_published: bool
    participant_count: int = 0
    user_submitted: bool = False
    user_score: Optional[float] = None
    user_rank: Optional[int] = None

class CompetitionDetailResponse(BaseModel):
    id: int
    grade_id: Optional[int] = None
    title_fa: str
    description_fa: Optional[str] = None
    theme_fa: Optional[str] = None
    starts_at: datetime
    ends_at: datetime
    is_closed: bool
    solutions_published: bool
    official_solution_fa: Optional[str] = None
    questions: List[Dict[str, Any]] = []
    user_submission: Optional[Dict[str, Any]] = None

class CompetitionSubmitRequest(BaseModel):
    competition_id: int
    answers: Dict[str, Any]  # question_id -> answer

class CompetitionLeaderboardItem(BaseModel):
    rank: int
    user_id: int
    display_name: str
    grade_title_fa: str
    score: float
    xp_awarded: int
    submitted_at: datetime
