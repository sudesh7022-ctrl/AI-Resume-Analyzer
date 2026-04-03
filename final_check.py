
import asyncio
import os
import sys
from dotenv import load_dotenv
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from database import db

async def check():
    load_dotenv(os.path.join('backend', '.env'))
    await db.connect()
    r = await db.resumes.count()
    m = await db.matches.count()
    j = await db.jobs.count()
    print(f"Jobs: {j}, Resumes: {r}, Matches: {m}")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(check())
