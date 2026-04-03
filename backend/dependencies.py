from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from services.security import verify_token, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from database import db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = await db.users.find_unique(where={"id": user_id})
    if user is None:
        raise credentials_exception
    return user
