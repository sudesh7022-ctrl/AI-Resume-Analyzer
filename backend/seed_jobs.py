
import asyncio
from database import db
import os

async def seed():
    await db.connect()
    
    # 1. Ensure we have an admin user to own the jobs
    admin = await db.users.find_first()
    if not admin:
        print("No users found. Please register first.")
        await db.disconnect()
        return
        
    # 2. Add some sample jobs
    jobs_to_add = [
        {
            "title": "Senior Software Engineer (React/Node)",
            "company": "TechFlow Solution",
            "description": "We are looking for a Senior Software Engineer with strong experience in React, TypeScript, and Node.js. Experience with PostgreSQL and cloud infrastructure is a plus.",
            "required_skills": "React, TypeScript, Node.js, JavaScript, SQL, backend, frontend"
        },
        {
            "title": "Python Backend Developer",
            "company": "Innovate AI",
            "description": "Join our AI team to build robust FastAPI services. Proficiency in Python and data processing is required.",
            "required_skills": "Python, FastAPI, SQL, Docker, APIs"
        },
        {
            "title": "Embedded Systems Engineer (ECE)",
            "company": "SmartCircuits Labs",
            "description": "Design and develop firmware for microcontroller-based systems. Proficiency in C/C++, RTOS, and debugging hardware is essential.",
            "required_skills": "C, C++, RTOS, Microcontrollers, STM32, Embedded, IOT"
        },
        {
            "title": "VLSI Design Engineer (EEE/Semiconductor)",
            "company": "MicroChip Tech",
            "description": "Design and verify complex digital circuits. Experience with Verilog, VHDL, and ASIC design flow is required.",
            "required_skills": "Verilog, VHDL, ASIC, VLSI, Analog, Digital Circuits"
        },
        {
            "title": "Mechanical Design Engineer (ME)",
            "company": "AutoDrive Systems",
            "description": "Develop mechanical components for automotive systems using CAD tools. Knowledge of thermodynamics and material science is a plus.",
            "required_skills": "AutoCAD, SolidWorks, Thermodynamics, Robotics, CAD, Manufacturing"
        },
        {
            "title": "Structural Engineer (Civil)",
            "company": "BuildRight Infra",
            "description": "Design and analyze structural components for large-scale infrastructure projects. Proficiency in STAAD.Pro or Revit is required.",
            "required_skills": "STAAD.Pro, Revit, Structural Analysis, Civil Engineering, Construction"
        },
        {
            "title": "Process Engineer (Chemical)",
            "company": "PureChem Industries",
            "description": "Optimize chemical manufacturing processes for efficiency and safety. Proficiency in process simulation software is required.",
            "required_skills": "Aspen Plus, Chemical Engineering, Process Safety, Manufacturing, Simulation"
        },
        {
            "title": "Product Designer",
            "company": "Creative Hub",
            "description": "Looking for a designer who loves creating beautiful user experiences. Experience with Figma and UI/UX best practices.",
            "required_skills": "Figma, UI/UX, Design, Prototyping"
        }
    ]
    
    for job_data in jobs_to_add:
        # Check if job already exists to avoid duplicates
        existing = await db.jobs.find_first(where={"title": job_data["title"]})
        if not existing:
            await db.jobs.create(
                data={
                    "admin_id": admin.id,
                    **job_data
                }
            )
            print(f"Created job: {job_data['title']}")
    
    print("Seeding completed.")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(seed())
