from . import crud
from app.database import SessionLocal
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import io
import mimetypes
from ..minio import get_minio_client, create_bucket


ALGORITHM = "HS256"
secret_key = "d7e7e7"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

async def validate_user(token:str = Depends(oauth2_scheme)):
    if not token:
        return None

    payload = jwt.decode(token, secret_key, algorithms=["HS256"])
    uid =  payload.get("sub")
    if uid is None:
        return None
    return uid

async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)


async def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


async def authenticate_user(db: Session, username: str, password: str):
    user = await crud.get_user_by_username(db, username)
    if not user:
        return False
    if not (await verify_password(password, user.password)):
        return False
    return user

async def get_email_from_token(token: str):
    payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
    email: str = payload.get("sub")
    return email

async def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        uid: str = payload.get("sub")
        if uid is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        user = await crud.get_user_by_id(db, uid)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
async def upload_media_to_minio(
    file_content: bytes, 
    filename: str, 
    bucket_name: str = "media"
) -> Optional[str]:
    try:
        # Get MinIO client
        minio_client = get_minio_client()
        
        # Ensure bucket exists
        create_bucket(minio_client, bucket_name)
        
        # Prepare file-like object
        file_like_object = io.BytesIO(file_content)
        
        # Detect content type
        content_type, _ = mimetypes.guess_type(filename)
        if content_type is None:
            # Fallback to smart content type detection
            if filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
                content_type = 'video/mp4'
            elif filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                content_type = 'image/jpeg'
            elif filename.lower().endswith(('.mp3', '.wav', '.flac')):
                content_type = 'audio/mpeg'
            else:
                content_type = 'application/octet-stream'
        
        # Upload to MinIO
        minio_client.put_object(
            bucket_name, 
            filename, 
            file_like_object, 
            length=len(file_content),
            content_type=content_type
        )
        
        # Generate and return public URL
        return f"http://minio:9000/{bucket_name}/{filename}"
    
    except Exception as e:
        print(f"Error uploading to MinIO: {e}")
        return None
