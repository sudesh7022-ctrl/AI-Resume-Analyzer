from fastapi import APIRouter, Depends, HTTPException, status, Request
from rate_limit import limiter
from pydantic import BaseModel
from typing import List, Optional
from database import db
from dependencies import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])

class JobCreate(BaseModel):
    title: str
    company: str
    description: str
    required_skills: str

@router.get("/")
@limiter.limit("10/minute")
async def get_jobs(request: Request):
    jobs = await db.jobs.find_many(where={"is_active": True})
    return jobs

@router.post("/", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def create_job(request: Request, job_in: JobCreate, current_user = Depends(get_current_user)):
    # Assuming any authenticated user can create a job for now, or check role
    new_job = await db.jobs.create(
        data={
            "title": job_in.title,
            "company": job_in.company,
            "description": job_in.description,
            "required_skills": job_in.required_skills,
            "admin_id": current_user.id
        }
    )
    return new_job
