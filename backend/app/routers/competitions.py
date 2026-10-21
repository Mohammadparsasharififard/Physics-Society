from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.user import User
from app.models.competition import Competition, CompetitionQuestion, CompetitionSubmission
from app.models.exam import Question, QuestionOption
from app.schemas.competition import (
    CompetitionListItem, CompetitionDetailResponse, CompetitionSubmitRequest, CompetitionLeaderboardItem
)
from app.services.auth import get_current_user, get_optional_current_user
from app.services.gamification_service import award_xp, record_daily_streak
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/competitions", tags=["Weekly Competitions"])

@router.get("", response_model=List[CompetitionListItem])
def list_competitions(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Lists all published weekly competitions with status and user participation"""
    now = datetime.utcnow()
    competitions = db.query(Competition).filter(
        Competition.is_published == True
    ).order_by(Competition.starts_at.desc()).all()

    results = []
    for comp in competitions:
        is_active = (comp.starts_at <= now <= comp.ends_at) and not comp.is_closed
        p_count = db.query(CompetitionSubmission).filter(CompetitionSubmission.competition_id == comp.id).count()

        user_sub = None
        if current_user:
            user_sub = db.query(CompetitionSubmission).filter(
                CompetitionSubmission.competition_id == comp.id,
                CompetitionSubmission.user_id == current_user.id
            ).first()

        results.append(CompetitionListItem(
            id=comp.id,
            grade_id=comp.grade_id,
            grade_title_fa=comp.grade.title_fa if comp.grade else "تمامی پایه‌ها (عمومی)",
            title_fa=comp.title_fa,
            description_fa=comp.description_fa,
            theme_fa=comp.theme_fa,
            starts_at=comp.starts_at,
            ends_at=comp.ends_at,
            is_active=is_active,
            is_closed=comp.is_closed or (now > comp.ends_at),
            solutions_published=comp.solutions_published,
            participant_count=p_count,
            user_submitted=(user_sub is not None),
            user_score=user_sub.score if user_sub else None,
            user_rank=user_sub.final_rank if user_sub else None
        ))
    return results

@router.get("/{competition_id}", response_model=CompetitionDetailResponse)
def get_competition_details(
    competition_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Retrieves competition details.
    Protects solutions from early disclosure.
    """
    comp = db.query(Competition).filter(Competition.id == competition_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="مسابقه مورد نظر یافت نشد.")

    now = datetime.utcnow()
    is_active = (comp.starts_at <= now <= comp.ends_at) and not comp.is_closed

    user_sub = None
    if current_user:
        user_sub = db.query(CompetitionSubmission).filter(
            CompetitionSubmission.competition_id == comp.id,
            CompetitionSubmission.user_id == current_user.id
        ).first()

    questions_data = []
    for cq in comp.questions:
        q = cq.question
        opts = []
        for opt in q.options:
            opts.append({
                "option_key": opt.option_key,
                "text_fa": opt.text_fa
            })

        questions_data.append({
            "id": q.id,
            "question_type": q.question_type,
            "prompt_fa": q.prompt_fa,
            "points": float(cq.points),
            "options": opts
        })

    user_sub_dict = None
    if user_sub:
        user_sub_dict = {
            "submitted_at": user_sub.submitted_at,
            "score": user_sub.score,
            "final_rank": user_sub.final_rank,
            "status": user_sub.status,
            "feedback_fa": user_sub.feedback_fa
        }

    return CompetitionDetailResponse(
        id=comp.id,
        grade_id=comp.grade_id,
        title_fa=comp.title_fa,
        description_fa=comp.description_fa,
        theme_fa=comp.theme_fa,
        starts_at=comp.starts_at,
        ends_at=comp.ends_at,
        is_closed=comp.is_closed or (now > comp.ends_at),
        solutions_published=comp.solutions_published,
        official_solution_fa=comp.official_solution_fa if comp.solutions_published else None,
        questions=questions_data,
        user_submission=user_sub_dict
    )

@router.post("/{competition_id}/submit")
def submit_competition_entry(
    competition_id: int,
    req: CompetitionSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits student's response to weekly competition:
    - Enforces deadline and submission limit
    - Grades objective questions immediately
    - Awards participation XP
    """
    comp = db.query(Competition).filter(Competition.id == competition_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="مسابقه مورد نظر یافت نشد.")

    now = datetime.utcnow()
    if comp.is_closed or now > comp.ends_at:
        raise HTTPException(status_code=400, detail="مهلت شرکت در این مسابقه به پایان رسیده است.")
    if now < comp.starts_at:
        raise HTTPException(status_code=400, detail="این مسابقه هنوز آغاز نشده است.")

    # Check previous submission limit
    prev_sub_count = db.query(CompetitionSubmission).filter(
        CompetitionSubmission.competition_id == comp.id,
        CompetitionSubmission.user_id == current_user.id
    ).count()

    if prev_sub_count >= comp.max_submissions_per_student:
        raise HTTPException(
            status_code=400,
            detail=f"شما قبلاً پاسخ خود را ارسال کرده‌اید (حداکثر دفعات مجاز: {comp.max_submissions_per_student})."
        )

    # Grade objective items
    total_score = 0.0
    for cq in comp.questions:
        q = cq.question
        user_ans = req.answers.get(str(q.id))
        if q.question_type == "mcq":
            corr = db.query(QuestionOption).filter(
                QuestionOption.question_id == q.id,
                QuestionOption.is_correct == True
            ).first()
            if corr and user_ans == corr.option_key:
                total_score += float(cq.points)

    sub = CompetitionSubmission(
        competition_id=comp.id,
        user_id=current_user.id,
        answers_json=req.answers,
        submitted_at=now,
        score=total_score,
        xp_awarded=comp.xp_participation,
        status="graded",
        feedback_fa=f"پاسخ شما با موفقیت در سامانه مسابقات انجمن فیزیک ثبت شد. امتیاز کسب‌شده در سؤالات چهارگزینه‌ای: {total_score}."
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    # Award participation XP & streak
    award_xp(
        db, current_user.id,
        amount=comp.xp_participation,
        activity_type="competition_reward",
        description_fa=f"شرکت در مسابقه هفتگی: {comp.title_fa}",
        reference_id=f"comp_{comp.id}_sub_{sub.id}"
    )
    record_daily_streak(db, current_user.id)

    log_audit_event(
        db, action="competition_submission", target_entity="competitions",
        target_id=str(comp.id), user_id=current_user.id,
        details={"score": total_score}
    )

    return {
        "success": True,
        "message_fa": "پاسخ مسابقه هفتگی شما با موفقیت ثبت شد!",
        "score": total_score,
        "xp_earned": comp.xp_participation
    }

@router.get("/{competition_id}/leaderboard", response_model=List[CompetitionLeaderboardItem])
def get_competition_leaderboard(
    competition_id: int,
    db: Session = Depends(get_db)
):
    """Retrieves ranked results for a weekly competition"""
    comp = db.query(Competition).filter(Competition.id == competition_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="مسابقه یافت نشد.")

    subs = db.query(CompetitionSubmission).filter(
        CompetitionSubmission.competition_id == comp.id
    ).order_by(desc(CompetitionSubmission.score), CompetitionSubmission.submitted_at).all()

    results = []
    for rank, s in enumerate(subs, start=1):
        s.final_rank = rank
        u = s.user
        g_title = u.profile.grade.title_fa if (u.profile and u.profile.grade) else "نامشخص"
        results.append(CompetitionLeaderboardItem(
            rank=rank,
            user_id=u.id,
            display_name=u.display_name or u.full_name,
            grade_title_fa=g_title,
            score=s.score,
            xp_awarded=s.xp_awarded,
            submitted_at=s.submitted_at
        ))
    db.commit()
    return results
