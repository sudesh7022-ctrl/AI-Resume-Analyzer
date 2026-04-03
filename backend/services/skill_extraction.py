from typing import List, Dict
import re

# Common skills for initial mapping (can be expanded)
COMMON_SKILLS = [
    "Python", "JavaScript", "React", "Node.js", "SQL", "PostgreSQL",
    "Docker", "AWS", "FastAPI", "Next.js", "Java", "C++", "TypeScript",
    "Machine Learning", "Data Analysis", "Project Management"
]

def extract_skills_from_text(text: str) -> List[Dict[str, any]]:
    """
    Extracts predefined skills from raw text and assigns a confidence score.
    """
    found_skills = []
    text_lower = text.lower()
    
    for skill in COMMON_SKILLS:
        # Simple regex for whole-word matching
        pattern = fr"\b{re.escape(skill.lower())}\b"
        if re.search(pattern, text_lower):
            found_skills.append({
                "skill_name": skill,
                "category": "Technical",
                "confidence": 0.95  # Placeholder confidence
            })
            
    return found_skills
