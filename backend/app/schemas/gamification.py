from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class XPTransactionResponse(BaseModel):
    id: int
    amount: int
    activity_type: str
    description_fa: str
    created_at: datetime

    class Config:
        from_attributes = True

class BadgeResponse(BaseModel):
    id: int
    code: str
    title_fa: str
    description_fa: str
    icon: str
    category: str
    xp_bonus: int
    is_unlocked: bool = False
    awarded_at: Optional[datetime] = None

class LeaderboardUser(BaseModel):
    rank: int
    user_id: int
    display_name: str
    grade_title_fa: Optional[str] = None
    avatar_url: Optional[str] = None
    total_xp: int
    current_level: int
    streak: int

class LeaderboardResponse(BaseModel):
    period: str  # 'weekly', 'monthly', 'all_time'
    top_students: List[LeaderboardUser]
    user_position: Optional[LeaderboardUser] = None
