import os
import io
import time
import json
import uuid
import hmac
import hashlib
import secrets
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple

import qrcode
from PIL import Image
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.graphics.shapes import Drawing, Rect, String, Line

from apps.api.app.database import get_connection

SECRET_KEY = os.getenv("SECRET_KEY", "raizo_production_secret_key_2026_badal_sahu")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
CERTIFICATE_MIN_SCORE = int(os.getenv("CERTIFICATE_MIN_SCORE", "70"))
STORAGE_ROOT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "storage", "users"
)


def get_role_code(role_str: str) -> str:
    role = (role_str or "").lower().replace("-", "_")
    if "data_analyst" in role:
        return "DA"
    elif "business_analyst" in role:
        return "BA"
    elif "data_scientist" in role:
        return "DS"
    elif "ai" in role or "ml" in role:
        return "AIML"
    elif "engineer" in role:
        return "DE"
    return "DA"


def format_role_title(role_str: str) -> str:
    role = (role_str or "").lower().replace("-", "_")
    if "data_analyst" in role:
        return "Data Analyst"
    elif "business_analyst" in role:
        return "Business Analyst"
    elif "data_scientist" in role:
        return "Data Scientist"
    elif "ai" in role or "ml" in role:
        return "AI / ML Engineer"
    return "Data Analyst"


def compute_verification_hash(cert_id: str, user_id: str, score: int, completion_date: str) -> str:
    data = f"{cert_id}:{user_id}:{score}:{completion_date}"
    return hmac.new(SECRET_KEY.encode("utf-8"), data.encode("utf-8"), hashlib.sha256).hexdigest()


def generate_qr_image_bytes(verification_url: str) -> bytes:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=1,
    )
    qr.add_data(verification_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#090d16", back_color="#ffffff")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.getvalue()


def generate_unique_certificate_id(target_role: str) -> str:
    role_code = get_role_code(target_role)
    year = datetime.now().year
    conn = get_connection()
    cursor = conn.cursor()

    for _ in range(10):
        rand_token = secrets.token_hex(2).upper()
        candidate_id = f"RAIZO-{year}-{role_code}-{rand_token}"
        cursor.execute("SELECT id FROM certificates WHERE certificate_id = ?", (candidate_id,))
        if not cursor.fetchone():
            conn.close()
            return candidate_id

    conn.close()
    return f"RAIZO-{year}-{role_code}-{secrets.token_hex(2).upper()}"


def check_certificate_eligibility(user_id: str) -> Dict[str, Any]:
    """
    Evaluates deterministic eligibility for the RAIZO Learning Pathway Certificate.
    Criteria:
    1. Assessment completed & passed with score >= CERTIFICATE_MIN_SCORE (70%)
    2. Roadmap milestones completed & verified
    3. No unresolved remediation requirements
    """
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Check existing issued certificate
    cursor.execute("""
        SELECT * FROM certificates 
        WHERE user_id = ? AND status = 'valid' 
        ORDER BY created_at DESC LIMIT 1
    """, (user_id,))
    existing_row = cursor.fetchone()
    existing_cert = dict(existing_row) if existing_row else None

    # 2. Check Assessment Submissions
    cursor.execute("""
        SELECT overall_score, passed, created_at, id, assessment_id 
        FROM assessment_submissions 
        WHERE user_id = ? 
        ORDER BY overall_score DESC, created_at DESC LIMIT 1
    """, (user_id,))
    sub_row = cursor.fetchone()

    assessment_completed = sub_row is not None
    assessment_score = int(sub_row["overall_score"]) if sub_row else 0
    score_passed = assessment_score >= CERTIFICATE_MIN_SCORE
    assessment_id = sub_row["assessment_id"] if sub_row else None

    # 3. Check Roadmap Progress & Remediation
    cursor.execute("SELECT data_json, completion_percentage, total_nodes, completed_nodes FROM roadmaps WHERE user_id = ?", (user_id,))
    roadmap_row = cursor.fetchone()

    milestones_completed = 0
    milestones_required = 1
    remediation_completed = True

    if roadmap_row:
        try:
            dag_data = json.loads(roadmap_row["data_json"])
            nodes = dag_data.get("nodes", [])
            completed_nodes = [
                n for n in nodes 
                if n.get("status") in ["completed", "passed", "verified"]
            ]
            milestones_completed = len(completed_nodes)

            # Check for any active unpassed remediation
            for n in nodes:
                if n.get("is_remediation") and n.get("status") in ["needs_remediation", "in_progress"]:
                    remediation_completed = False
                    break
        except Exception:
            milestones_completed = roadmap_row["completed_nodes"] or 0

    # Also check verified proficient competencies in learner_skills
    cursor.execute("""
        SELECT COUNT(*) as count 
        FROM learner_skills 
        WHERE user_id = ? AND (status = 'Proficient' OR verified_score >= 70)
    """, (user_id,))
    proficient_count = cursor.fetchone()["count"]

    milestones_passed = (milestones_completed >= 1) or (proficient_count >= 1)

    # Deterministic rule: Score >= 70% and remediation cleared and milestones met
    is_eligible = (
        assessment_completed
        and score_passed
        and remediation_completed
        and milestones_passed
    )

    conn.close()

    message = (
        "Congratulations! You have demonstrated verified competency and satisfied all certificate completion requirements."
        if is_eligible
        else f"Assessment score must be at least {CERTIFICATE_MIN_SCORE}% (current: {assessment_score}%) and required roadmap milestones must be verified."
    )

    return {
        "is_eligible": is_eligible,
        "score": assessment_score,
        "score_threshold": CERTIFICATE_MIN_SCORE,
        "assessment_completed": assessment_completed,
        "score_passed": score_passed,
        "remediation_completed": remediation_completed,
        "milestones_completed": milestones_completed,
        "milestones_required": milestones_required,
        "milestones_passed": milestones_passed,
        "assessment_id": assessment_id,
        "certificate": existing_cert,
        "message": message
    }


def draw_certificate_pdf(cert_data: Dict[str, Any], qr_bytes: bytes, output_path: str):
    """
    Generates a high-resolution, vector PDF certificate of completion.
    Layout: Landscape Letter (11 x 8.5 inches = 792 x 612 pt).
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    c = canvas.Canvas(output_path, pagesize=landscape(letter))
    width, height = landscape(letter)  # 792 x 612

    # Background color: Deep dark luxury slate
    c.setFillColor(colors.HexColor("#080c16"))
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # Outer decorative border: Deep indigo / cyan gradient effect
    c.setStrokeColor(colors.HexColor("#1e293b"))
    c.setLineWidth(6)
    c.rect(20, 20, width - 40, height - 40)

    # Inner ornate gold border
    c.setStrokeColor(colors.HexColor("#d97706"))
    c.setLineWidth(1.5)
    c.rect(28, 28, width - 56, height - 56)

    # Thin accent border
    c.setStrokeColor(colors.HexColor("#38bdf8"))
    c.setLineWidth(0.5)
    c.rect(32, 32, width - 64, height - 64)

    # Four corner accent squares (Gold / Cyan)
    corner_size = 12
    for x in [32, width - 32 - corner_size]:
        for y in [32, height - 32 - corner_size]:
            c.setFillColor(colors.HexColor("#f59e0b"))
            c.rect(x, y, corner_size, corner_size, fill=1, stroke=0)

    # 1. Brand Logo & Header
    logo_cx = width / 2
    logo_top = height - 48

    # Rounded Emblem Badge Background
    c.setFillColor(colors.HexColor("#176B5B"))
    c.setStrokeColor(colors.HexColor("#2F7D5C"))
    c.setLineWidth(1)
    c.roundRect(logo_cx - 14, logo_top - 24, 28, 28, 7, fill=1, stroke=1)

    # Precision Geometric 'R' Prism Mark inside badge
    c.setFillColor(colors.HexColor("#ffffff"))
    # Left vertical stem
    c.rect(logo_cx - 7, logo_top - 20, 3.5, 18, fill=1, stroke=0)
    # Upper loop
    c.roundRect(logo_cx - 5, logo_top - 12, 10, 10, 3, fill=1, stroke=0)
    # Cutout
    c.setFillColor(colors.HexColor("#176B5B"))
    c.rect(logo_cx - 4, logo_top - 10, 6, 6, fill=1, stroke=0)
    # Diagonal leg
    def _draw_poly(pts, fill=1, stroke=0):
        if not pts:
            return
        p = c.beginPath()
        p.moveTo(pts[0][0], pts[0][1])
        for pt in pts[1:]:
            p.lineTo(pt[0], pt[1])
        p.close()
        c.drawPath(p, fill=fill, stroke=stroke)

    _draw_poly([
        (logo_cx - 3, logo_top - 12),
        (logo_cx + 4, logo_top - 20),
        (logo_cx + 7.5, logo_top - 20),
        (logo_cx, logo_top - 12)
    ], fill=1, stroke=0)
    # Radiant Amber Apex Facet
    c.setFillColor(colors.HexColor("#d9a441"))
    _draw_poly([
        (logo_cx + 1, logo_top - 4),
        (logo_cx + 6, logo_top - 8),
        (logo_cx + 4, logo_top - 8),
        (logo_cx, logo_top - 4)
    ], fill=1, stroke=0)

    # Brand Title
    c.setFillColor(colors.HexColor("#f8fafc"))
    c.setFont("Helvetica-Bold", 15)
    c.drawCentredString(width / 2, height - 86, "RAIZO")

    c.setFillColor(colors.HexColor("#94a3b8"))
    c.setFont("Helvetica-Bold", 8.5)
    c.drawCentredString(width / 2, height - 98, "ADAPTIVE AI LEARNING & VERIFIED SKILL INTELLIGENCE")

    # Header Divider Line
    c.setStrokeColor(colors.HexColor("#334155"))
    c.setLineWidth(1)
    c.line(width / 2 - 160, height - 108, width / 2 + 160, height - 108)

    # 2. Main Title
    c.setFillColor(colors.HexColor("#f8fafc"))
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(width / 2, height - 135, "CERTIFICATE OF COMPLETION")

    # 3. Awarded to subtext
    c.setFillColor(colors.HexColor("#cbd5e1"))
    c.setFont("Helvetica-Oblique", 12)
    c.drawCentredString(width / 2, height - 165, "This certificate is officially awarded to")

    # 4. Learner Name (Hero prominence)
    c.setFillColor(colors.HexColor("#38bdf8"))
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, height - 205, cert_data["learner_name"])

    # Learner underline
    c.setStrokeColor(colors.HexColor("#0284c7"))
    c.setLineWidth(1.5)
    name_width = c.stringWidth(cert_data["learner_name"], "Helvetica-Bold", 28)
    c.line(width / 2 - name_width / 2 - 10, height - 212, width / 2 + name_width / 2 + 10, height - 212)

    # 5. Body Text
    c.setFillColor(colors.HexColor("#cbd5e1"))
    c.setFont("Helvetica", 11)
    c.drawCentredString(
        width / 2, height - 240,
        "for successfully completing the RAIZO adaptive learning and assessment pathway"
    )
    c.drawCentredString(
        width / 2, height - 256,
        "and demonstrating verified competency in the curriculum of"
    )

    # 6. Achievement Title & Target Role
    c.setFillColor(colors.HexColor("#fbbf24"))
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(
        width / 2, height - 284,
        f"{cert_data['achievement_title']} — {cert_data['target_role']}"
    )

    # 7. Achievement Metrics Box
    box_x = 100
    box_y = height - 370
    box_w = width - 200
    box_h = 60

    c.setFillColor(colors.HexColor("#0f172a"))
    c.setStrokeColor(colors.HexColor("#1e293b"))
    c.setLineWidth(1)
    c.roundRect(box_x, box_y, box_w, box_h, 8, fill=1, stroke=1)

    # Metric 1: Score
    c.setFillColor(colors.HexColor("#64748b"))
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(box_x + 90, box_y + 38, "ASSESSMENT SCORE")
    c.setFillColor(colors.HexColor("#38bdf8"))
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(box_x + 90, box_y + 16, f"{cert_data['score']}%")

    # Metric 2: Completion Date
    c.setFillColor(colors.HexColor("#64748b"))
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(box_x + 240, box_y + 38, "COMPLETION DATE")
    c.setFillColor(colors.HexColor("#f8fafc"))
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(box_x + 240, box_y + 18, cert_data["completion_date"])

    # Metric 3: Certificate ID
    c.setFillColor(colors.HexColor("#64748b"))
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(box_x + 400, box_y + 38, "CERTIFICATE ID")
    c.setFillColor(colors.HexColor("#f59e0b"))
    c.setFont("Courier-Bold", 11)
    c.drawCentredString(box_x + 400, box_y + 18, cert_data["certificate_id"])

    # Metric 4: Application Creator
    c.setFillColor(colors.HexColor("#64748b"))
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(box_x + 520, box_y + 38, "APPLICATION CREATOR")
    c.setFillColor(colors.HexColor("#38bdf8"))
    c.setFont("Helvetica-Bold", 10.5)
    c.drawCentredString(box_x + 520, box_y + 18, "Badal Kumar Sahu")

    # 8. Signatures & Issuance Details
    # Left Signature: System Architect & Creator
    sig_left_x = 110
    sig_y = height - 480

    # Draw Badal Kumar Sahu signature image (prefer white for dark background)
    sig_img_white = os.path.join(os.path.dirname(__file__), "assets", "badal_kumar_sahu_white.png")
    sig_img_path = sig_img_white if os.path.exists(sig_img_white) else os.path.join(os.path.dirname(__file__), "assets", "badal_kumar_sahu.png")
    if os.path.exists(sig_img_path):
        try:
            c.drawImage(sig_img_path, sig_left_x, sig_y + 4, width=135, height=33, mask="auto")
        except Exception:
            pass

    c.setStrokeColor(colors.HexColor("#475569"))
    c.setLineWidth(1)
    c.line(sig_left_x, sig_y, sig_left_x + 180, sig_y)

    c.setFillColor(colors.HexColor("#f8fafc"))
    c.setFont("Helvetica-Bold", 11)
    c.drawString(sig_left_x, sig_y - 15, "Badal Kumar Sahu")

    c.setFillColor(colors.HexColor("#94a3b8"))
    c.setFont("Helvetica", 8.5)
    c.drawString(sig_left_x, sig_y - 28, "Application Creator & Lead AI Architect")
    c.drawString(sig_left_x, sig_y - 39, "RAIZO Career Intelligence Platform")

    # Center: Embedded Live QR Code
    qr_img = Image.open(io.BytesIO(qr_bytes))
    qr_temp_path = output_path.replace(".pdf", "_qr.png")
    qr_img.save(qr_temp_path)
    c.drawImage(qr_temp_path, width / 2 - 40, height - 525, width=80, height=80)
    try:
        os.remove(qr_temp_path)
    except Exception:
        pass

    c.setFillColor(colors.HexColor("#64748b"))
    c.setFont("Helvetica-Bold", 7.5)
    c.drawCentredString(width / 2, height - 535, "SCAN TO VERIFY AUTHENTICITY")

    # Right Signature: RAIZO Autonomous Agent
    sig_right_x = width - 290
    c.setStrokeColor(colors.HexColor("#475569"))
    c.setLineWidth(1)
    c.line(sig_right_x, sig_y, sig_right_x + 180, sig_y)

    c.setFillColor(colors.HexColor("#f8fafc"))
    c.setFont("Helvetica-Bold", 11)
    c.drawString(sig_right_x, sig_y - 15, "RAIZO Agent Engine")

    c.setFillColor(colors.HexColor("#94a3b8"))
    c.setFont("Helvetica", 8.5)
    c.drawString(sig_right_x, sig_y - 28, "Autonomous Skill Intelligence")
    c.drawString(sig_right_x, sig_y - 39, "Evaluator & Adaptation Core")

    # 9. Footer Security Metadata
    c.setFillColor(colors.HexColor("#475569"))
    c.setFont("Helvetica", 7.5)
    footer_text = f"Verify at: {cert_data['verification_url']}  •  SHA-256 HMAC: {cert_data['verification_hash'][:24]}...  •  Issued by RAIZO by Badal Kumar Sahu"
    c.drawCentredString(width / 2, 42, footer_text)

    c.save()


def issue_certificate(
    user_id: str,
    assessment_id: Optional[str] = None,
    target_role: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generates, persists, and signs a new verified RAIZO completion certificate.
    """
    eligibility = check_certificate_eligibility(user_id)
    if not eligibility["is_eligible"]:
        raise ValueError(f"User is not eligible for certificate: {eligibility['message']}")

    conn = get_connection()
    cursor = conn.cursor()

    # Get User profile details
    cursor.execute("SELECT name, email, target_role FROM users WHERE id = ?", (user_id,))
    user_row = cursor.fetchone()
    if not user_row:
        conn.close()
        raise ValueError("User not found.")

    learner_name = user_row["name"] or user_row["email"].split("@")[0].capitalize()
    effective_role = target_role or user_row["target_role"] or "data_analyst"
    role_title = format_role_title(effective_role)
    achievement_title = f"{role_title} Foundations"
    score = eligibility["score"] or 86

    # Format date
    now_dt = datetime.now()
    completion_date = now_dt.strftime("%B %d, %Y")
    issued_at = now_dt.isoformat()
    now_str = now_dt.strftime("%Y-%m-%d %H:%M:%S")

    # Generate unique certificate ID
    certificate_id = generate_unique_certificate_id(effective_role)
    verification_hash = compute_verification_hash(certificate_id, user_id, score, completion_date)
    verification_url = f"{FRONTEND_URL}/verify/{certificate_id}"

    # Generate QR Code image bytes
    qr_bytes = generate_qr_image_bytes(verification_url)

    # PDF file path
    pdf_filename = f"{certificate_id}.pdf"
    pdf_dir = os.path.join(STORAGE_ROOT, user_id, "certificates")
    pdf_path = os.path.join(pdf_dir, pdf_filename)

    cert_data = {
        "id": f"cert_{uuid.uuid4().hex[:12]}",
        "certificate_id": certificate_id,
        "user_id": user_id,
        "assessment_id": assessment_id or eligibility.get("assessment_id"),
        "learning_path_id": f"path_{effective_role}_foundations",
        "learner_name": learner_name,
        "target_role": role_title,
        "achievement_title": achievement_title,
        "score": score,
        "completion_date": completion_date,
        "issued_at": issued_at,
        "status": "valid",
        "verification_hash": verification_hash,
        "verification_url": verification_url,
        "pdf_path": pdf_path,
        "created_at": now_str
    }

    # Render PDF with ReportLab
    draw_certificate_pdf(cert_data, qr_bytes, pdf_path)

    # Persist to `certificates` table
    cursor.execute("""
        INSERT INTO certificates (
            id, certificate_id, user_id, assessment_id, learning_path_id,
            learner_name, target_role, achievement_title, score,
            completion_date, issued_at, status, verification_hash,
            verification_url, pdf_path, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        cert_data["id"], cert_data["certificate_id"], cert_data["user_id"],
        cert_data["assessment_id"], cert_data["learning_path_id"],
        cert_data["learner_name"], cert_data["target_role"],
        cert_data["achievement_title"], cert_data["score"],
        cert_data["completion_date"], cert_data["issued_at"],
        cert_data["status"], cert_data["verification_hash"],
        cert_data["verification_url"], cert_data["pdf_path"],
        cert_data["created_at"]
    ))

    # Record in Evidence Ledger
    cursor.execute("""
        INSERT INTO evidence_ledger (
            id, user_id, skill_id, evidence_type, score, confidence,
            source_title, details_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        f"evi_{uuid.uuid4().hex[:8]}", user_id, "competency_completion",
        "Certificate", score, "high",
        f"RAIZO Verified Certificate: {achievement_title}",
        json.dumps({
            "certificate_id": certificate_id,
            "verification_url": verification_url,
            "verification_hash": verification_hash,
            "status": "Issued"
        }),
        now_str
    ))

    conn.commit()
    conn.close()

    return cert_data
