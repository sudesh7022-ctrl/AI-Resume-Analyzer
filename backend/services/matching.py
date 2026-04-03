from sentence_transformers import SentenceTransformer, util
import torch

# Initialize model (BERT-based)
# Note: This model is relatively small and good for similarity tasks
model = SentenceTransformer('all-MiniLM-L6-v2')

def calculate_match_score(resume_text: str, job_description: str) -> float:
    """
    Calculates a semantic match score (0-100) between a resume and a job description.
    """
    if not resume_text or not job_description:
        return 0.0

    # Encode texts into embeddings
    resume_embedding = model.encode(resume_text, convert_to_tensor=True)
    job_embedding = model.encode(job_description, convert_to_tensor=True)

    # Compute cosine similarity
    similarity = util.cos_sim(resume_embedding, job_embedding)
    
    # Return as percentage
    score = float(similarity[0][0]) * 100
    return round(max(0, min(100, score)), 2)

def identify_missing_skills(resume_skills: list, required_skills: list) -> str:
    """
    Identifies which required skills are missing from the resume.
    """
    resume_set = {s.lower() for s in resume_skills}
    required_set = {s.lower() for s in required_skills}
    
    missing = required_set - resume_set
    return ", ".join(list(missing))
