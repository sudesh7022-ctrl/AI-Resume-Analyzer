from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from rate_limit import limiter
from database import db
from services.security import create_access_token
import os
from firebase_admin import auth as firebase_auth

router = APIRouter(prefix="/auth", tags=["auth"])

class GoogleLogin(BaseModel):
    token: str

@router.post("/google")
@limiter.limit("10/minute")
async def google_auth(login_in: GoogleLogin, request: Request):
    try:
        # Verify the ID token sent by the frontend (works for both Google and Email/Password users)
        decoded_token = firebase_auth.verify_id_token(login_in.token)
        email = decoded_token.get('email')
        name = decoded_token.get('name', 'Firebase User')
        
        if not email:
            raise HTTPException(status_code=400, detail="Token missing email")

        # Check if user exists in our local database
        user = await db.users.find_unique(where={"email": email})
        
        if not user:
            # Create the local user record if it doesn't exist
            # Note: password is no longer used for auth since we use Firebase
            user = await db.users.create(
                data={
                    "name": name,
                    "email": email,
                    "password": "FIREBASE_AUTH_USER", 
                    "role": "student"
                }
            )

        # Create our own app access token for subsequent API calls
        access_token = create_access_token(
            data={"sub": user.id, "role": user.role}
        )
        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
        }
        
    except Exception as e:
        print(f"❌ [AUTH] Firebase Verification Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase token: {str(e)}",
        )
