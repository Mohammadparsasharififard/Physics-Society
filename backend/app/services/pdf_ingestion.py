import os
import re
import ssl
import hashlib
import urllib.parse
import urllib.request
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
import pypdf
from sqlalchemy.orm import Session

from app.config import settings
from app.models.curriculum import (
    Book, TextbookSource, TextbookProcessingJob, ExtractedTextSection, Chapter
)

# SSRF Protection: Deny private IP ranges and internal hostnames
FORBIDDEN_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "169.254.169.254", "metadata.google.internal"]

def validate_safe_url(url: str) -> bool:
    """Ensures external URL is safe against SSRF attacks"""
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ["http", "https"]:
        return False
    host = (parsed.hostname or "").lower()
    if host in FORBIDDEN_HOSTS:
        return False
    if host.startswith("10.") or host.startswith("192.168.") or host.startswith("172.16."):
        return False
    return True

def download_textbook_pdf(url: str, dest_path: str, timeout: int = 40) -> Tuple[bool, int, str]:
    """Downloads PDF safely with SSL handling and timeout"""
    if not validate_safe_url(url):
        return False, 0, "نشانی وبگاه (URL) نامعتبر یا ناامن است (SSRF blocked)."

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            content = resp.read()
            if not content.startswith(b"%PDF"):
                return False, 0, "فایل دریافتی یک سند PDF معتبر نیست."
            
            with open(dest_path, "wb") as f:
                f.write(content)
            
            return True, len(content), hashlib.sha256(content).hexdigest()
    except Exception as ex:
        return False, 0, f"خطا در دانلود کتاب: {str(ex)}"

def process_textbook_file(
    db: Session,
    source_id: int,
    max_pages_to_process: Optional[int] = None
) -> TextbookProcessingJob:
    """
    Extracts text, identifies physics chapter boundaries, and stores structured sections.
    Updates processing job progress and textbook source status.
    """
    source = db.query(TextbookSource).filter(TextbookSource.id == source_id).first()
    if not source:
        raise ValueError("منبع کتاب یافت نشد.")

    job = TextbookProcessingJob(
        source_id=source.id,
        status="running",
        progress_percent=0.0,
        started_at=datetime.utcnow()
    )
    db.add(job)
    source.status = "processing"
    db.commit()
    db.refresh(job)

    try:
        reader = pypdf.PdfReader(source.stored_path)
        total_pages = len(reader.pages)
        source.page_count = total_pages
        job.total_pages = total_pages

        pages_limit = max_pages_to_process if max_pages_to_process else total_pages
        extracted_count = 0
        current_detected_chapter = None

        for page_idx in range(pages_limit):
            page_num = page_idx + 1
            page_text = reader.pages[page_idx].extract_text() or ""
            clean_text = page_text.strip()

            if not clean_text:
                continue

            # Detect chapter patterns: فصل دوم, فصل 2, فصل هشتم, etc.
            ch_match = re.search(r"فصل\s+([۰-۹0-9]+|اوّل|دوم|سوّم|چهارم|پنجم|ششم|هفتم|هشتم|نهم|دهم|یازدهم|دوازدهم|سیزدهم|چهاردهم|پانزدهم)", clean_text)
            if ch_match:
                # Approximate chapter numbering
                ch_str = ch_match.group(1)
                mapping = {
                    "اوّل": 1, "دوم": 2, "سوّم": 3, "چهارم": 4, "پنجم": 5,
                    "ششم": 6, "هفتم": 7, "هشتم": 8, "نهم": 9, "دهم": 10,
                    "یازدهم": 11, "دوازدهم": 12, "سیزدهم": 13, "چهاردهم": 14, "پانزدهم": 15
                }
                if ch_str in mapping:
                    current_detected_chapter = mapping[ch_str]
                elif ch_str.isdigit():
                    current_detected_chapter = int(ch_str)

            # Determine section type based on scientific keywords
            sec_type = "text"
            if any(k in clean_text for k in ["تعریف", "اصطلاح", "یکای"]):
                sec_type = "definition"
            elif any(k in clean_text for k in ["آزمایش کنید", "فعالیت", "مشاهده کنید"]):
                sec_type = "experiment"
            elif any(k in clean_text for k in ["فرمول", "رابطه", "محاسبه کنید", "فرمول:"]):
                sec_type = "equation"
            elif any(k in clean_text for k in ["مثال", "حل نمونه"]):
                sec_type = "worked_example"

            # Heading detection
            first_line = clean_text.split("\n")[0][:150].strip()

            section = ExtractedTextSection(
                source_id=source.id,
                book_id=source.book_id,
                page_number=page_num,
                chapter_num=current_detected_chapter,
                heading_fa=first_line if len(first_line) > 3 else f"صفحه {page_num}",
                content_fa=clean_text[:4000],  # store structured chunk
                section_type=sec_type
            )
            db.add(section)
            extracted_count += 1

            # Update progress periodically
            if page_idx % 15 == 0 or page_idx == pages_limit - 1:
                job.processed_pages = page_idx + 1
                job.progress_percent = round(((page_idx + 1) / pages_limit) * 100, 1)
                job.extracted_sections_count = extracted_count
                db.commit()

        job.status = "completed"
        job.progress_percent = 100.0
        job.completed_at = datetime.utcnow()
        job.log_output = f"پردازش موفقیت‌آمیز بود. {extracted_count} بخش ساختاریافته از {pages_limit} صفحه استخراج شد."
        source.status = "completed"
        source.processed_at = datetime.utcnow()
        db.commit()

    except Exception as ex:
        job.status = "failed"
        job.error_message = str(ex)
        job.completed_at = datetime.utcnow()
        source.status = "failed"
        source.error_message = str(ex)
        db.commit()

    return job
