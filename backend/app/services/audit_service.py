from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.system import AuditLog

def log_audit_event(
    db: Session,
    action: str,
    target_entity: str,
    target_id: Optional[str] = None,
    user_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    """Create an immutable audit log entry"""
    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        target_entity=target_entity,
        target_id=str(target_id) if target_id is not None else None,
        details_json=details or {},
        ip_address=ip_address
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
