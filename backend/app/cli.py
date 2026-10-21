import sys
import getpass
from app.database import SessionLocal, Base, engine
import app.models
from app.models.user import User
from app.services.auth import hash_password
from app.seed.curriculum_seed import seed_base_system
from app.seed.question_bank import seed_complete_curriculum_and_questions, validate_all_chapters_content

def create_admin():
    """Interactive CLI command to create the initial administrator securely"""
    print("==================================================")
    print("سامانه جامع انجمن فیزیک دبیرستان شهید بهشتی ۲")
    print("ایجاد حساب کاربری مدیر ارشد سامانه (Super Admin)")
    print("==================================================")

    db = SessionLocal()
    Base.metadata.create_all(bind=engine)

    username = input("نام کاربری مدیر (پیش‌فرض: admin): ").strip() or "admin"
    email = input("آدرس ایمیل مدیر: ").strip() or "admin@beheshti2-physics.ir"
    full_name = input("نام و نام خانوادگی مدیر: ").strip() or "مدیر ارشد انجمن فیزیک"

    existing = db.query(User).filter(User.username == username).first()
    if existing:
        print(f"خطا: کاربری با نام «{username}» قبلاً در سامانه ثبت شده است.")
        db.close()
        return

    password = getpass.getpass("رمز عبور مدیر (حداقل ۸ کاراکتر): ")
    if len(password) < 8:
        print("خطا: رمز عبور باید حداقل ۸ کاراکتر باشد.")
        db.close()
        return

    confirm_password = getpass.getpass("تکرار رمز عبور مدیر: ")
    if password != confirm_password:
        print("خطا: رمزهای عبور وارد شده یکسان نیستند.")
        db.close()
        return

    admin = User(
        username=username,
        email=email,
        full_name=full_name,
        display_name="مدیر انجمن فیزیک",
        hashed_password=hash_password(password),
        role="admin",
        is_active=True
    )
    db.add(admin)
    db.commit()
    print("حساب کاربری مدیر با موفقیت ایجاد شد.")
    db.close()

def seed_database():
    """Seeds base system, curriculum, and all 360 questions"""
    print("شروع مقداردهی اولیه پایگاه داده انجمن فیزیک...")
    db = SessionLocal()
    Base.metadata.create_all(bind=engine)
    seed_base_system(db)
    stats = seed_complete_curriculum_and_questions(db)
    print("نتیجه مقداردهی پایگاه داده:", stats)
    db.close()

def run_validation():
    """Runs automated chapter question compliance validation"""
    print("شروع ارزیابی جامع انطباق سؤالات فصل‌های آموزشی...")
    db = SessionLocal()
    reports = validate_all_chapters_content(db)
    all_ok = True
    for r in reports:
        status_str = "منطبق (OK)" if r.is_fully_compliant else "ناقص (FAILED)"
        print(f"پایه {r.grade_number} فصل {r.chapter_number} [{r.chapter_title_fa}]: "
              f"چهارگزینه‌ای: {r.actual_valid_mcq_count}/20 - تشریحی: {r.actual_valid_written_count}/10 - وضعیت: {status_str}")
        if not r.is_fully_compliant:
            all_ok = False

    print("==================================================")
    print(f"نتیجه نهایی اعتبارسنجی: {'تأیید کامل (PASS)' if all_ok else 'رد شد (FAIL)'}")
    db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1].lower()
        if cmd == "create-admin":
            create_admin()
        elif cmd == "seed":
            seed_database()
        elif cmd in ("validate", "validate-content", "validate_content"):
            run_validation()
        else:
            print("دستور نامعتبر. دستورات مجاز: create-admin, seed, validate")
    else:
        print("استفاده: python -m app.cli [create-admin | seed | validate]")
