
import asyncio
from database import db
import os

async def check():
    await db.connect()
    users_count = await db.users.count()
    jobs_count = await db.jobs.count()
    resumes_count = await db.resumes.count()
    matches_count = await db.matches.count()
    
    print(f"Users: {users_count}")
    print(f"Jobs: {jobs_count}") 
    print(f"Resumes: {resumes_count}")
    print(f"Matches: {matches_count}")
    
    # List some jobs if they exist
    if jobs_count > 0:
        jobs = await db.jobs.find_many()
        for j in jobs:
            print(f"- Job: {j.title} at {j.company}")
            
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(check())
