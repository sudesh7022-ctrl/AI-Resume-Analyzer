
import asyncio
import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import db

async def check():
    load_dotenv(os.path.join('backend', '.env'))
    await db.connect()
    count = await db.jobs.count()
    print(f"Job count: {count}")
    
    users = await db.users.find_many()
    print(f"User count: {len(users)}")
    for u in users:
        print(f"User: {u.email} ({u.id})")
        
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(check())
