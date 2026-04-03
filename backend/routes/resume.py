from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from rate_limit import limiter
from services.pdf_parser import extract_text_from_pdf
from services.skill_extraction import extract_skills_from_text
from services.matching import calculate_match_score, identify_missing_skills
from dependencies import get_current_user
from database import db
from services.storage import storage_service
import uuid
from typing import List

router = APIRouter(prefix="/resume", tags=["resume"])

import traceback

@router.post("/upload")
@limiter.limit("5/minute")
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    print(f"📂 [RESUME] Uploading file for user: {current_user.email}")
    try:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        content = await file.read()
        print(f"📄 [RESUME] Read {len(content)} bytes from {file.filename}")
        
        raw_text = extract_text_from_pdf(content)
        if not raw_text:
            print("❌ [RESUME] PDF extraction failed (empty text)")
            raise HTTPException(status_code=500, detail="Failed to extract text from PDF")
        
        print(f"✅ [RESUME] Extracted {len(raw_text)} characters")
        
        skills = extract_skills_from_text(raw_text)
        print(f"🔧 [RESUME] Extracted {len(skills)} skills")
        
        # 1. Upload to Supabase Storage
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        try:
            file_url = await storage_service.upload_file(content, unique_filename)
            print(f"☁️ [STORAGE] File uploaded to Supabase: {file_url}")
        except Exception as store_err:
            print(f"❌ [STORAGE] Error: {store_err}")
            raise HTTPException(status_code=500, detail=f"Cloud storage error: {str(store_err)}")

        # 2. Save to database
        try:
            resume = await db.resumes.create(
                data={
                    "user_id": current_user.id,
                    "file_url": file_url,
                    "raw_text": raw_text,
                    "score": 0
                }
            )
            print(f"💾 [RESUME] Created record ID: {resume.id}")
        except Exception as db_err:
            print(f"❌ [DB] Error creating resume: {db_err}")
            raise HTTPException(status_code=500, detail=f"Database error while saving resume: {str(db_err)}")
        
        # Save skills
        skill_data = []
        for skill in skills:
            await db.skills.create(
                data={
                    "resume_id": resume.id,
                    "skill_name": skill["skill_name"],
                    "category": skill.get("category", "Technical"),
                    "confidence": skill.get("confidence", 0.95)
                }
            )
            skill_data.append(skill["skill_name"])
            
        # Match with jobs
        print("🔍 [RESUME] Starting job matching...")
        active_jobs = await db.jobs.find_many(where={"is_active": True})
        print(f"ℹ️ [RESUME] Found {len(active_jobs)} active jobs")
        
        match_results = []
        for job in active_jobs:
            match_score = calculate_match_score(raw_text, job.description)
            req_skills = [s.strip() for s in job.required_skills.split(",")]
            missing = identify_missing_skills(skill_data, req_skills)
            
            await db.matches.create(
                data={
                    "resume_id": resume.id,
                    "job_id": job.id,
                    "match_score": match_score,
                    "missing_skills": missing
                }
            )
            
            match_results.append({
                "job": {
                    "id": job.id, "title": job.title, "company": job.company,
                },
                "match_score": match_score,
                "missing_skills": missing
            })
        
        print("🎉 [RESUME] Upload and matching complete!")
        return {
            "id": resume.id,
            "filename": file.filename,
            "skills": skills,
            "matches": sorted(match_results, key=lambda x: x["match_score"], reverse=True),
            "text_preview": raw_text[:500] + "..." if len(raw_text) > 500 else raw_text
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"🔥 [RESUME] FATAL ERROR: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/history")
async def get_history(current_user = Depends(get_current_user)):
    """
    Fetches all past resumes, skills, and matches for the logged-in user.
    """
    print(f"📜 [RESUME] Fetching history for user: {current_user.email}")
    try:
        history = await db.resumes.find_many(
            where={"user_id": current_user.id},
            include={
                "skills": True,
                "matches": {
                    "include": {
                        "job": True
                    }
                }
            },
            order={"uploaded_at": "desc"}
        )
        return history
    except Exception as e:
        print(f"❌ [DB] Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
